#!/usr/bin/env node
/**
 * tools/kad/research-rag-query.mjs
 * 
 * Local, zero-token-cost RAG query engine and context manager for KAD research vault.
 * 
 * Capabilities:
 * 1. Progressive Hierarchical Retrieval (L0 -> L1 -> L2):
 *    - L0: Macro relevance match (Paper metadata, tags, question mapping).
 *    - L1: Structural outline filtering (Theorems, Invariants, Limitations).
 *    - L2: Granular excerpt extraction (Targeted formal definitions).
 * 2. Hybrid Lexical & Invariant Matching (BM25 token scoring + Epistemic Status boosting).
 * 3. Compact Context Compression: Fits within small local SLM context windows (2k - 4k tokens).
 * 4. Local Model Connectors: Generates formatted prompt or queries local llama-server / Ollama.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseMarkdownResearchNote } from './research-dataset-compiler.mjs';

/**
 * Tokenizes text for deterministic BM25 lexical matching
 * @param {string} text 
 * @returns {string[]}
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Computes BM25-style lexical relevance score between query terms and document text
 * @param {string[]} queryTokens 
 * @param {string} documentText 
 * @param {object} options 
 * @returns {number}
 */
export function scoreDocumentRelevance(queryTokens, documentText, options = {}) {
  const docTokens = tokenizeText(documentText);
  if (docTokens.length === 0 || queryTokens.length === 0) return 0;

  const docFreq = new Map();
  for (const t of docTokens) {
    docFreq.set(t, (docFreq.get(t) || 0) + 1);
  }

  let score = 0;
  const k1 = options.k1 || 1.2;
  const b = options.b || 0.75;
  const avgdl = options.avgdl || 300;
  const dl = docTokens.length;

  for (const q of queryTokens) {
    const f = docFreq.get(q) || 0;
    if (f > 0) {
      const termScore = (f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgdl)));
      score += termScore;
    }
  }

  return score;
}

/**
 * Searches vault/40_Research/ for top relevant papers and claims using hierarchical RAG
 * @param {string} query 
 * @param {object} options 
 * @returns {Array<{ citekey: string, title: string, score: number, l0: object, l1: string[], l2: string }>}
 */
export function queryResearchRag(query, options = {}) {
  const vaultDir = options.vaultDir || resolve(process.cwd(), 'vault');
  const papersDir = join(vaultDir, '40_Research', 'Papers');
  const claimsDir = join(vaultDir, '40_Research', 'Claims');

  const queryTokens = tokenizeText(query);
  const results = [];

  if (existsSync(papersDir)) {
    const files = readdirSync(papersDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = readFileSync(join(papersDir, file), 'utf8');
      const { frontmatter, sections } = parseMarkdownResearchNote(content);

      // Score L0 (Metadata + Abstract)
      const l0Text = `${frontmatter.title || ''} ${frontmatter.citekey || ''} ${frontmatter.tags || ''} ${frontmatter.abstract || ''}`;
      let l0Score = scoreDocumentRelevance(queryTokens, l0Text);

      // Score L1 & L2 (Body sections)
      let bestSectionTitle = '';
      let bestSectionContent = '';
      let bestSectionScore = 0;

      for (const [title, sectionText] of sections.entries()) {
        const secScore = scoreDocumentRelevance(queryTokens, `${title} ${sectionText}`);
        if (secScore > bestSectionScore) {
          bestSectionScore = secScore;
          bestSectionTitle = title;
          bestSectionContent = sectionText;
        }
      }

      // Epistemic status boost
      let epistemicBoost = 1.0;
      if (frontmatter.evidence_status === 'source_derived') epistemicBoost = 1.3;
      if (frontmatter.evidence_status === 'contested') epistemicBoost = 1.1;

      const totalScore = (l0Score * 0.4 + bestSectionScore * 0.6) * epistemicBoost;

      if (totalScore > 0.1) {
        results.push({
          citekey: frontmatter.citekey || file.replace('.md', ''),
          title: frontmatter.title || 'Untitled',
          evidence_status: frontmatter.evidence_status || 'hypothesis',
          score: totalScore,
          l0: {
            title: frontmatter.title,
            year: frontmatter.year,
            question_id: frontmatter.question_id,
            evidence_status: frontmatter.evidence_status
          },
          l1_headings: Array.from(sections.keys()),
          best_section: bestSectionTitle,
          l2_content: bestSectionContent.slice(0, 1200) // Compact bounded slice
        });
      }
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, options.topK || 3);
}

/**
 * Builds a compressed, token-efficient prompt for a local LLM (Qwen / Llama)
 * @param {string} query 
 * @param {Array} ragResults 
 * @returns {string} Formatted prompt string
 */
export function buildLocalRagPrompt(query, ragResults) {
  let contextBlock = '';

  for (const r of ragResults) {
    contextBlock += `[SOURCE: ${r.citekey} | Status: ${r.evidence_status} | Section: ${r.best_section}]\n`;
    contextBlock += `${r.l2_content}\n\n`;
  }

  return `<|im_start|>system
You are a formal research assistant for the KAD-PI harness. Answer the question using ONLY the provided verified research context. Strictly uphold inductive invariants and boundary conditions. If an empirical limitation or contrasting claim exists, state it explicitly.<|im_end|>
<|im_start|>user
Context:
${contextBlock.trim()}

Question:
${query}<|im_end|>
<|im_start|>assistant
`;
}

// CLI runner
if (process.argv[1] && process.argv[1].endsWith('research-rag-query.mjs')) {
  const query = process.argv.slice(2).join(' ') || 'Project Sid PIANO parallel cognitive architecture and emergence';
  const matches = queryResearchRag(query);
  console.log(`\n=== KAD LOCAL RAG RETRIEVAL (Top ${matches.length} Matches) ===\n`);
  for (const m of matches) {
    console.log(`• [${m.citekey}] Score: ${m.score.toFixed(2)} | Status: [${m.evidence_status}]`);
    console.log(`  Title: ${m.title}`);
    console.log(`  Best Section: #${m.best_section}`);
    console.log(`  Preview: ${m.l2_content.slice(0, 160)}...\n`);
  }

  console.log('=== COMPILED LOCAL MODEL PROMPT ===\n');
  console.log(buildLocalRagPrompt(query, matches));
}
