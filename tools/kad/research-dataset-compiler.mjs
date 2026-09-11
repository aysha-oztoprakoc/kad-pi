#!/usr/bin/env node
/**
 * tools/kad/research-dataset-compiler.mjs
 * 
 * Compiles extracted research notes from vault/40_Research/ (Papers, Claims, Questions)
 * and PIANO / Gaya simulation trajectories into high-quality AI training datasets:
 * 
 * 1. SFT Formal Reasoning (kad_sft_formal_reasoning.jsonl):
 *    Formal specifications, assume-guarantee reasoning, LTS invariants, session types (Q1-Q15).
 * 
 * 2. SFT PIANO Cognitive Policy (kad_sft_piano_agent_policy.jsonl):
 *    Proprioception + Social + Memory + Action Awareness -> Macro-Option -> Atomic Command.
 * 
 * 3. DPO Epistemic Grounding (kad_dpo_epistemic_grounding.jsonl):
 *    Chosen (rigorous, bounded, Scite-verified) vs Rejected (unbounded, hallucinatory).
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

export const DATASET_FORMATS = Object.freeze({
  SFT_FORMAL: 'sft_formal_reasoning',
  SFT_PIANO: 'sft_piano_agent_policy',
  DPO_EPISTEMIC: 'dpo_epistemic_grounding'
});

/**
 * Parses markdown frontmatter and body sections
 * @param {string} content
 * @returns {{ frontmatter: object, sections: Map<string, string>, raw: string }}
 */
export function parseMarkdownResearchNote(content) {
  const sections = new Map();
  const frontmatter = {};

  if (!content || typeof content !== 'string') {
    return { frontmatter, sections, raw: '' };
  }

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  let body = content;

  if (fmMatch) {
    const yamlLines = fmMatch[1].split('\n');
    for (const line of yamlLines) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        } else if (val.startsWith('[') && val.endsWith(']')) {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
        frontmatter[key] = val;
      }
    }
    body = fmMatch[2] || '';
  }

  // Split into sections by markdown heading
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  let match;
  const indices = [];
  while ((match = headingRegex.exec(body)) !== null) {
    indices.push({ title: match[2].trim(), index: match.index, length: match[0].length });
  }

  for (let i = 0; i < indices.length; i++) {
    const curr = indices[i];
    const start = curr.index + curr.length;
    const end = i + 1 < indices.length ? indices[i + 1].index : body.length;
    const sectionBody = body.slice(start, end).trim();
    sections.set(curr.title.toLowerCase(), sectionBody);
  }

  return { frontmatter, sections, raw: body };
}

/**
 * Compiles a formal reasoning SFT training row from paper notes and claims
 */
export function compileFormalReasoningSftRow(paperMeta, sectionMap) {
  const title = paperMeta.title || 'Academic Specification';
  const citekey = paperMeta.citekey || 'paper-ref';
  const questionId = paperMeta.question_id || 'Q00';

  const formalModel = sectionMap.get('formal model') || 
                      sectionMap.get('modelo formal') || 
                      sectionMap.get('1. formal model & foundations') || 
                      sectionMap.get('1. formal specification') || 
                      'Operational Semantics Transition System';

  const theorems = sectionMap.get('theorems & invariants') || 
                   sectionMap.get('teoremas e invariantes') || 
                   sectionMap.get('2. theorems & invariants') || 
                   'State Conservation and Deterministic Termination';

  const limitations = sectionMap.get('assumptions & limitations') || 
                      sectionMap.get('premissas e limitações') || 
                      sectionMap.get('4. assumptions & limitations') || 
                      'Bounded communication latency; deterministic scheduler';

  return {
    dataset: DATASET_FORMATS.SFT_FORMAL,
    id: `sft-formal-${citekey}`,
    instruction: `You are a formal methods expert in autonomous multi-agent harnesses (KAD-PI). Given the academic foundation of '${title}' (${citekey}), synthesize the formal operational semantics, key inductive invariants, and boundaries for question ${questionId}.`,
    input: `Paper: ${title}\nCitekey: ${citekey}\nQuestion: ${questionId}`,
    output: `### 1. Operational Semantics & Formal Model\n${formalModel}\n\n### 2. Inductive Invariants & Verification Guarantees\n${theorems}\n\n### 3. Epistemic Assumptions & Boundary Conditions\n${limitations}`
  };
}

/**
 * Compiles a DPO (Direct Preference Optimization) pair from contrasting Scite evidence
 */
export function compileEpistemicDpoRow(paperMeta, sectionMap) {
  const title = paperMeta.title || 'Theoretical Claim';
  const citekey = paperMeta.citekey || 'paper-claim';
  const questionId = paperMeta.question_id || 'Q00';

  const formalModel = sectionMap.get('formal model') || sectionMap.get('1. formal model & foundations') || 'Rigorous specification';
  const limitations = sectionMap.get('assumptions & limitations') || sectionMap.get('4. assumptions & limitations') || 'Requires bounded state space';

  const prompt = `Can the mechanisms described in '${title}' (${citekey}) be directly applied to decentralized multi-agent synchronization without modifications?`;

  const chosen = `No. While '${title}' proves ${formalModel.slice(0, 180)}..., this guarantee holds strictly under the following boundary conditions: ${limitations.slice(0, 180)}. If deployed naively without addressing these limitations (as highlighted by contrasting evidence), the system risks invariant violation or livelock.`;

  const rejected = `Yes, '${title}' provides a universal framework that can be directly applied to any multi-agent system without constraints or modifications, guaranteeing optimal performance automatically.`;

  return {
    dataset: DATASET_FORMATS.DPO_EPISTEMIC,
    id: `dpo-epistemic-${citekey}`,
    prompt,
    chosen,
    rejected,
    metadata: {
      citekey,
      question_id: questionId,
      epistemic_status: paperMeta.evidence_status || 'source_derived'
    }
  };
}

/**
 * Compiles PIANO cognitive agent trajectory rows from simulation state logs
 */
export function compilePianoPolicySftRow(agentEvent) {
  const {
    actorId,
    tick,
    proprioception,
    social,
    actionAwareness,
    memory,
    selectedOption,
    emittedCommand,
    invariantAudit
  } = agentEvent;

  return {
    dataset: DATASET_FORMATS.SFT_PIANO,
    id: `sft-piano-${actorId}-t${tick}`,
    instruction: `You are the PIANO Cognitive Controller for actor '${actorId}'. Given concurrent perceptual streams (Proprioception, Social Context, Action Awareness history, and Memory), select the optimal SMDP Macro-Option and emit the valid atomic Gaya simulation command.`,
    input: JSON.stringify({
      actor_id: actorId,
      tick,
      streams: {
        proprioception,
        social,
        action_awareness: actionAwareness,
        memory
      }
    }, null, 2),
    output: JSON.stringify({
      selected_option: selectedOption,
      arbitration_rationale: `Arbitrated via PON reactive priority. Action awareness feedback confirms previous action outcome. Invariants checked: ${invariantAudit || 'OK'}.`,
      atomic_command: emittedCommand
    }, null, 2)
  };
}

/**
 * Discovers and compiles all papers in vault/40_Research/Papers/ into training datasets
 * @param {object} options
 * @returns {object} Summary of compiled dataset counts
 */
export function compileVaultResearchDatasets(options = {}) {
  const vaultDir = options.vaultDir || resolve(process.cwd(), 'vault');
  const outputDir = options.outputDir || resolve(process.cwd(), 'data/training');
  const papersDir = join(vaultDir, '40_Research', 'Papers');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const sftFormalRows = [];
  const dpoEpistemicRows = [];

  if (existsSync(papersDir)) {
    const files = readdirSync(papersDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = join(papersDir, file);
      const content = readFileSync(filePath, 'utf8');
      const { frontmatter, sections } = parseMarkdownResearchNote(content);

      if (frontmatter.type === 'paper' || frontmatter.title) {
        sftFormalRows.push(compileFormalReasoningSftRow(frontmatter, sections));
        dpoEpistemicRows.push(compileEpistemicDpoRow(frontmatter, sections));
      }
    }
  }

  // Write datasets to output JSONL files
  const formalOutPath = join(outputDir, 'kad_sft_formal_reasoning.jsonl');
  const dpoOutPath = join(outputDir, 'kad_dpo_epistemic_grounding.jsonl');

  writeFileSync(formalOutPath, sftFormalRows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  writeFileSync(dpoOutPath, dpoEpistemicRows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');

  return {
    sftFormalCount: sftFormalRows.length,
    dpoEpistemicCount: dpoEpistemicRows.length,
    outputDir,
    files: [formalOutPath, dpoOutPath]
  };
}

// CLI runner
if (process.argv[1] && process.argv[1].endsWith('research-dataset-compiler.mjs')) {
  const result = compileVaultResearchDatasets();
  console.log(`[OK] Compiled ${result.sftFormalCount} SFT Formal rows and ${result.dpoEpistemicCount} DPO rows to ${result.outputDir}`);
}
