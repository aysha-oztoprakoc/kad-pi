#!/usr/bin/env node
/**
 * tools/kad/research-elicit-pipeline.mjs
 * 
 * Pipeline bridging Consensus Pro preliminary research, Elicit Free Tier extraction,
 * and the KAD-PI Obsidian Personal Vault (vault/40_Research).
 * 
 * Key capabilities:
 * 1. Parse Consensus Pro CSV & RIS files from the preliminary research folder.
 * 2. Rank and filter top load-bearing papers per question to minimize Elicit credit usage.
 * 3. Generate ready-to-import BibTeX seed files for Elicit (Wave & Question level).
 * 4. Populate/scaffold Question Hub notes in vault/40_Research/Questions/.
 * 5. Scaffold initial candidate paper notes in vault/40_Research/Papers/.
 * 6. Ingest Elicit CSV exports with custom columns (Formal Model, Theorems/Invariants, Empirical Metrics, Assumptions/Limitations).
 * 7. Promote ingested papers to source_derived and extract formal claims to vault/40_Research/Claims/.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

export const QUESTION_METADATA = Object.freeze({
  1: {
    id: 'Q01',
    num: 1,
    wave: 1,
    title: 'Theoretical and empirical foundations of Notification-Oriented Paradigm (NOP) vs event-driven/reactive architectures',
    pillars: ['P1', 'P2'],
    noises: ['R1', 'R2'],
    lacuna: 'R1/P1: Literatura própria do PON (paradigma acadêmico brasileiro de sistemas reativos baseados em notificação)',
    decision: 'População de docs/prime-directive/PON.md com citações verificadas; rebaixar [SOURCE_DERIVED]→[DESIGN_DECISION] onde a literatura não suportar.'
  },
  2: {
    id: 'Q02',
    num: 2,
    wave: 1,
    title: 'Formal semantic frameworks for event-driven reactive systems with asynchronous notifications',
    pillars: ['P1', 'P2'],
    noises: ['R2'],
    lacuna: 'R2/P1: Semântica operacional (sistemas síncronos, cálculo de processos, atores) para o loop reativo',
    decision: 'Escolher um formalismo (LTS/traces/observação) para o loop canônico de execução e para testes de notification selectivity.'
  },
  3: {
    id: 'Q03',
    num: 3,
    wave: 1,
    title: 'Assume–guarantee (compositional) reasoning to verify component contracts in reactive systems',
    pillars: ['P2', 'P1', 'P3'],
    noises: ['R2', 'R3'],
    lacuna: 'R2–R3/P2: Ordenação de dependências e efeitos com inverso; separação de fluxo de dados vs fluxo de autorização',
    decision: 'Semântica de contrato para leases STC e para MUST NOT conflate (regra de tipagem das duas relações).'
  },
  4: {
    id: 'Q04',
    num: 4,
    wave: 1,
    title: 'Behavioral type systems and session types for component interaction and lifecycle protocols',
    pillars: ['P2'],
    noises: ['R2'],
    lacuna: 'R2/P2: Ordenação estática de ativação/desativação ("dependentes antes de dependências")',
    decision: 'Especificação tipo-comportamental dos seams de ativação/desativação (base para WP-KAD-STC-SANDBOX-HARDENING-033).'
  },
  5: {
    id: 'Q05',
    num: 5,
    wave: 1,
    title: 'Empirical evidence for test-driven development impact on defect density, code quality, and productivity',
    pillars: ['P3'],
    noises: ['R3'],
    lacuna: 'R3/P3: O loop RED→GREEN→REFACTOR como [DESIGN_DECISION]; evidência empírica calibrada',
    decision: 'Calibrar o gate de TDD; buscar contra-evidência deliberadamente conforme rigor científico da constituição.'
  },
  6: {
    id: 'Q06',
    num: 6,
    wave: 2,
    title: 'Formal properties test suites can establish: test oracle theory, mutation adequacy, metamorphic testing',
    pillars: ['P3'],
    noises: ['R3'],
    lacuna: 'R3/P3: "Testes provam comportamento semântico" exige teoria de oráculo e adequação',
    decision: 'Vocabulário de alegações verificáveis para critérios de aceite (substituir "grep zero identificadores" por equivalência observável).'
  },
  7: {
    id: 'Q07',
    num: 7,
    wave: 2,
    title: 'Formal models for graceful degradation, fail-soft behavior, and degraded modes of operation',
    pillars: ['P4'],
    noises: ['R4'],
    lacuna: 'R4/P4: Taxonomia de dependabilidade e ordem parcial de configurações degradadas ("safest useful level")',
    decision: 'Formalizar §6 como máquina de estados tipada com lattice de capacidades.'
  },
  8: {
    id: 'Q08',
    num: 8,
    wave: 2,
    title: 'Recovery blocks and runtime acceptance tests providing fault tolerance through retry with verification',
    pillars: ['P4', 'P3'],
    noises: ['R4'],
    lacuna: 'R4/P4+P3: Validade de testes em estados de falha; oráculo condicional sob assunções preservadas',
    decision: 'Padrão arquitetural para "retry justificado" (§6: retry com oráculo parcial em modos degradados).'
  },
  9: {
    id: 'Q09',
    num: 9,
    wave: 3,
    title: 'Conditions for safe or provably correct self-modifying systems (proof-based self-modification, Gödel machines)',
    pillars: ['P5', 'P8'],
    noises: ['R5'],
    lacuna: 'R5/P5+P8: Auto-modificação com portão determinístico + humano vs prova de utilidade; limites de Goodhart',
    decision: 'Justificar teoricamente "auto-learning desabilitado; KAD gates own promotion" e critério formal de promoção de skills.'
  },
  10: {
    id: 'Q10',
    num: 10,
    wave: 3,
    title: 'Belief revision and truth maintenance systems handling contradictions while preserving consistency and relevance',
    pillars: ['P5'],
    noises: ['R6'],
    lacuna: 'R6/P5: Contração AGM como remoção minimamente perdedora; TMS/ATMS para rótulos CANDIDATE/VERIFIED/CONTESTED',
    decision: 'Fundamentar WP-KAD-CONTRADICTION-JOURNAL-040 e máquina de estados do WP-KAD-KNOWLEDGE-LIFECYCLE-034.'
  },
  11: {
    id: 'Q11',
    num: 11,
    wave: 4,
    title: 'Impact of context compression, summarization, or memory pruning on LLM reasoning accuracy',
    pillars: ['P7', 'P8'],
    noises: ['R7'],
    lacuna: 'R7/P7: snapcompact@70% e compressão destrutiva do contexto; tensão L2 (lossy) vs L3 (lossless)',
    decision: 'Política de compactação com fidelidade mínima explícita; reconciliar autolearn e memória estruturada.'
  },
  12: {
    id: 'Q12',
    num: 12,
    wave: 4,
    title: 'Test-time (inference-time) computation scaling and optimal allocation between generation and verification',
    pillars: ['P9', 'P3'],
    noises: ['R8'],
    lacuna: 'R8/P9+P3: Roteador DETERMINISTIC → MODEL → HUMAN sem ancoragem formal; verifiers e scaling de compute',
    decision: 'Justificativa teórica do cascade econômico e dos bindings papel→modelo ("cognition only where required").'
  },
  13: {
    id: 'Q13',
    num: 13,
    wave: 4,
    title: 'Formal logics modeling delegation and authority attenuation in distributed and multi-agent systems',
    pillars: ['P6', 'P8'],
    noises: ['R9'],
    lacuna: 'R9/P6+P8: Atenuação de autoridade na descida da recursão de subagentes (leases STC "advisory")',
    decision: 'Semântica para leases STC em subárvores RLM — verificação estática de escopo herdado.'
  },
  14: {
    id: 'Q14',
    num: 14,
    wave: 4,
    title: 'Experimental methodologies (fault injection, dependability benchmarking) for autonomous systems under capability loss',
    pillars: ['P4', 'P9'],
    noises: ['R10'],
    lacuna: 'R10/P4+P9: Falta de instrumentação e fault injection formal para EXP-KAD-OFFLINE-SURVIVAL-001',
    decision: 'Protocolo experimental (variáveis de injeção de falha, métricas de sobrevivência) para modo offline.'
  },
  15: {
    id: 'Q15',
    num: 15,
    wave: 3,
    title: 'Temporal abstraction frameworks (options, macro-actions, hierarchical RL) for reusable skills acquisition and transfer',
    pillars: ['P5'],
    noises: ['R5'],
    lacuna: 'R5/P5: Skills como opções (SMDP); convergência de distilação de trajetórias',
    decision: 'Critério de aceite semântico para adoção de skills (substituir grep) e fundamentação de EXP-KAD-DISTILLATION-006.'
  }
});

export const WAVE_METADATA = Object.freeze({
  1: { name: 'Wave 1 — Fundações dos 4 Pilares Nativos', questions: [1, 2, 3, 4, 5] },
  2: { name: 'Wave 2 — Interface Falha/Verificação (TDD Sob Falha)', questions: [6, 7, 8] },
  3: { name: 'Wave 3 — Epistêmica e Auto-Modificação (Gödel, AGM, Options)', questions: [9, 10, 15] },
  4: { name: 'Wave 4 — Mecanismos de Agente (Compressão, Compute, Delegação, Faults)', questions: [11, 12, 13, 14] }
});

/**
 * Robust RFC 4180 CSV Parser (handles newlines inside quotes, escaped quotes)
 * @param {string} text
 * @returns {Array<Record<string, string>>}
 */
export function parseCSV(text) {
  if (!text) return [];
  const cleanText = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const c = cleanText[i];
    const next = cleanText[i + 1];

    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(cur);
        cur = '';
      } else if (c === '\r') {
        if (next === '\n') i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = '';
      } else if (c === '\n') {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = '';
      } else {
        cur += c;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
  return rows.slice(1)
    .filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''))
    .map(r => {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = r[j] !== undefined ? r[j].trim() : '';
      }
      return obj;
    });
}

/**
 * Normalizes title for citekeys and filenames
 * @param {string} title
 * @returns {string}
 */
export function slugifyTitle(title) {
  if (!title) return 'untitled';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/**
 * Extracts first author surname
 * @param {string} authorsStr
 * @returns {string}
 */
export function extractFirstAuthor(authorsStr) {
  if (!authorsStr) return 'Anonymous';
  const first = authorsStr.split(/[,;&]|\band\b/)[0].trim();
  const parts = first.replace(/\./g, ' ').trim().split(/\s+/);
  return parts[parts.length - 1] || 'Author';
}

/**
 * Generates a clean citekey (e.g. Linhares2020NOCA)
 * @param {object} paper
 * @returns {string}
 */
export function generateCitekey(paper) {
  const author = extractFirstAuthor(paper.Authors || paper.authors).replace(/[^a-zA-Z]/g, '');
  const year = paper.Year || paper.year || 'ND';
  const titleSlug = slugifyTitle(paper.Title || paper.title)
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
    .slice(0, 15);
  return `${author}${year}${titleSlug}`;
}

/**
 * Scores paper relevance based on citations, year, and question focus
 * @param {object} paper
 * @param {number} qNum
 * @returns {number}
 */
export function scorePaper(paper, qNum) {
  const cites = parseInt(paper.Citations || '0', 10) || 0;
  const year = parseInt(paper.Year || '2000', 10) || 2000;
  const title = (paper.Title || '').toLowerCase();

  // Foundational citations score + recency bonus
  let score = Math.log10(cites + 1) * 2.5 + (year - 2000) * 0.15;

  // Domain-specific boosts based on KAD-PI research questions
  // Domain-specific boosts and exclusions based on KAD-PI research questions
  if (qNum === 1) {
    if (title.includes('opioid') || title.includes('receptor') || title.includes('therapeutic') || title.includes('pharmac') || title.includes('shellcode') || title.includes('nop sled') || title.includes('mathematics teacher')) {
      return -100; // False friend exclusion
    }
    if (title.includes('notification-oriented') || title.includes('notification oriented') || title.includes('nop') || title.includes('noca')) {
      score += 25; // Critical: NOP native papers are exact R1 evidence!
    }
  } else if (qNum === 2) {
    if (title.includes('reactive') || title.includes('publish/subscribe') || title.includes('message ordering') || title.includes('lingua franca')) {
      score += 5;
    }
  } else if (qNum === 3) {
    if (title.includes('assume-guarantee') || title.includes('contract') || title.includes('compositional')) {
      score += 8;
    }
  } else if (qNum === 4) {
    if (title.includes('session type') || title.includes('behavioral type')) {
      score += 8;
    }
  } else if (qNum === 5) {
    if (title.includes('test-driven') || title.includes('tdd') || title.includes('meta-analysis')) {
      score += 8;
    }
  } else if (qNum === 6) {
    if (title.includes('oracle') || title.includes('metamorphic') || title.includes('adequacy')) {
      score += 8;
    }
  } else if (qNum === 7) {
    if (title.includes('graceful degradation') || title.includes('dependab') || title.includes('fault-tolerant')) {
      score += 8;
    }
  } else if (qNum === 8) {
    if (title.includes('recovery block') || title.includes('acceptance test')) {
      score += 15;
    }
  } else if (qNum === 9) {
    if (title.includes('godel') || title.includes('gödel') || title.includes('self-modifying') || title.includes('goodhart')) {
      score += 10;
    }
  } else if (qNum === 10) {
    if (title.includes('belief revision') || title.includes('truth maintenance') || title.includes('agm') || title.includes('contraction')) {
      score += 10;
    }
  } else if (qNum === 11) {
    if (title.includes('compression') || title.includes('pruning') || title.includes('context')) {
      score += 8;
    }
  } else if (qNum === 12) {
    if (title.includes('test-time') || title.includes('inference-time') || title.includes('verifier')) {
      score += 8;
    }
  } else if (qNum === 13) {
    if (title.includes('delegation') || title.includes('access control') || title.includes('authority')) {
      score += 8;
    }
  } else if (qNum === 14) {
    if (title.includes('fault injection') || title.includes('dependability benchmarking')) {
      score += 8;
    }
  } else if (qNum === 15) {
    if (title.includes('option') || title.includes('macro-action') || title.includes('hierarchical rl') || title.includes('temporal abstraction')) {
      score += 10;
    }
  }

  return score;
}

/**
 * Converts a paper object to BibTeX entry
 * @param {object} paper
 * @param {string} citekey
 * @returns {string}
 */
export function paperToBibTeX(paper, citekey) {
  const title = (paper.Title || '').replace(/"/g, "'");
  const authors = (paper.Authors || '').replace(/,/g, ' and');
  const year = paper.Year || '';
  const journal = paper.Journal || '';
  const doi = paper.DOI || '';
  const url = paper['Consensus Link'] || (doi ? `https://doi.org/${doi}` : '');
  const abstract = (paper.Abstract || '').replace(/[\n\r]+/g, ' ');

  let bib = `@article{${citekey},\n`;
  bib += `  title = {${title}},\n`;
  bib += `  author = {${authors}},\n`;
  if (year) bib += `  year = {${year}},\n`;
  if (journal) bib += `  journal = {${journal}},\n`;
  if (doi) bib += `  doi = {${doi}},\n`;
  if (url) bib += `  url = {${url}},\n`;
  if (abstract) bib += `  abstract = {${abstract}}\n`;
  bib += `}\n`;
  return bib;
}

/**
 * Generates an Obsidian Paper Markdown Note adhering to vault/70_Dashboards/Research.base
 * @param {object} paper
 * @param {object} options
 * @returns {string}
 */
export function generatePaperMarkdown(paper, options = {}) {
  const {
    qNum = 1,
    citekey = generateCitekey(paper),
    readStatus = 'unread',
    evidenceStatus = 'candidate',
    relevance = 'high',
    elicitExtraction = null
  } = options;

  const qMeta = QUESTION_METADATA[qNum] || {};
  const pillars = qMeta.pillars || [];
  const noises = qMeta.noises || [];

  const title = (paper.Title || '').replace(/"/g, "'");
  const authors = paper.Authors || '';
  const year = paper.Year || '';
  const doi = paper.DOI || '';
  const citations = paper.Citations || '0';
  const journal = paper.Journal || '';
  const studyType = paper['Study Type'] || '';
  const consensusLink = paper['Consensus Link'] || '';
  const takeaway = paper.Takeaway || '';
  const abstract = paper.Abstract || '';

  const tags = [
    'research',
    'paper',
    ...pillars.map(p => `pilar/${p}`),
    ...noises.map(n => `noise/${n}`)
  ];

  let md = `---
type: paper
title: "${title}"
paper: "[[${citekey}]]"
source: "${doi ? `https://doi.org/${doi}` : consensusLink}"
doi: "${doi}"
year: ${year || 'null'}
citations: ${citations}
journal: "${journal}"
study_type: "${studyType}"
read_status: ${readStatus}
evidence_status: ${evidenceStatus}
relevance: ${relevance}
pillars:
${pillars.map(p => `  - ${p}`).join('\n')}
questions:
  - ${qMeta.id || `Q${qNum}`}
noises:
${noises.map(n => `  - ${n}`).join('\n')}
tags:
${tags.map(t => `  - ${t}`).join('\n')}
---

# ${title}

## Identificação Epistêmica
- **Citekey**: \`${citekey}\`
- **Autores**: ${authors}
- **Ano**: ${year} | **Citações**: ${citations} | **Veículo**: ${journal}
- **DOI**: [${doi || 'N/A'}](https://doi.org/${doi})
- **Questão Vinculada**: [[${qMeta.id}]] — ${qMeta.title}
- **Pilares Suportados**: ${pillars.join(', ')}
- **Ruído Mitigado**: ${noises.join(', ')}

---

## Síntese Preliminar (Consensus Pro)
> **Takeaway**: ${takeaway || 'Sem takeaway catalogado.'}

### Abstract
${abstract || 'Resumo não disponível.'}

---

## Extração Estruturada (Elicit Free Tier)
${elicitExtraction ? `
### Modelo Formal & Framework
${elicitExtraction.formalModel || '*Não extraído*'}

### Teoremas, Invariantes & Garantias Formais
${elicitExtraction.theorems || '*Não extraído*'}

### Métricas & Resultados Empíricos
${elicitExtraction.metrics || '*Não extraído*'}

### Assunções & Modos de Falha / Limitações
${elicitExtraction.assumptions || '*Não extraído*'}
` : `
> [!info] Status de Extração no Elicit
> Este artigo está classificado como **${evidenceStatus}**. Para extração formal detalhada, importe este citekey (\`${citekey}\`) no Elicit Notebook correspondente à **${qMeta.id}** e exporte o CSV para ingestão.

### Modelo Formal & Framework
*Aguardando extração Elicit...*

### Teoremas, Invariantes & Garantias Formais
*Aguardando extração Elicit...*

### Métricas & Resultados Empíricos
*Aguardando extração Elicit...*

### Assunções & Modos de Falha / Limitações
*Aguardando extração Elicit...*
`}

---

## Impacto na Arquitetura KAD-PI
- **Decisão Vinculada**: ${qMeta.decision || 'Nenhuma'}
- **Lacuna no PRIME_DIRECTIVE**: ${qMeta.lacuna || 'Nenhuma'}
- **Ação Prática**: Validar se o modelo formal suporta os contratos de execução da harness e atualizar o corpus epistêmico.

`;
  return md;
}

/**
 * Generates an Obsidian Question Hub Markdown Note
 * @param {number} qNum
 * @param {Array<object>} topPapers
 * @returns {string}
 */
export function generateQuestionMarkdown(qNum, topPapers = []) {
  const meta = QUESTION_METADATA[qNum];
  if (!meta) return '';

  const wave = WAVE_METADATA[meta.wave];

  let md = `---
type: research_question
question_id: "${meta.id}"
wave: ${meta.wave}
title: "${meta.title}"
pillars:
${meta.pillars.map(p => `  - ${p}`).join('\n')}
noises:
${meta.noises.map(n => `  - ${n}`).join('\n')}
tags:
  - research
  - question
  - wave/${meta.wave}
${meta.pillars.map(p => `  - pilar/${p}`).join('\n')}
---

# ${meta.id} — ${meta.title}

> **Onda**: ${wave?.name || `Wave ${meta.wave}`}  
> **Pilares KAD**: ${meta.pillars.join(', ')}  
> **Ruídos Teóricos**: ${meta.noises.join(', ')}  

## Lacuna Epistêmica
**${meta.lacuna}**

## Decisão Arquitetural Vinculada
**${meta.decision}**

---

## Top Artigos Selecionados (Funil Consensus → Elicit)

| Citekey | Título | Ano | Citações | Status Elicit | DOI |
| :--- | :--- | :--- | :--- | :--- | :--- |
`;

  for (const p of topPapers) {
    const citekey = generateCitekey(p);
    const titleSnippet = (p.Title || '').slice(0, 50).replace(/\|/g, '-');
    const year = p.Year || '';
    const cites = p.Citations || '0';
    const doi = p.DOI ? `[${p.DOI}](https://doi.org/${p.DOI})` : 'N/A';
    md += `| [[${citekey}]] | ${titleSnippet}... | ${year} | ${cites} | ⏳ Pendente | ${doi} |\n`;
  }

  md += `
---

## Instruções para Extração no Elicit (Free Tier)
1. Crie um Notebook no Elicit com o título: \`KAD-PI - ${meta.id}\`.
2. Importe o arquivo de sementes: \`tools/kad/research/seeds/by_question/${meta.id}_seeds.bib\`.
3. Adicione as 4 colunas padrão de extração:
   - \`Formal_Model\`
   - \`Theorems_and_Invariants\`
   - \`Empirical_Results_and_Metrics\`
   - \`Assumptions_and_Limitations\`
4. Exporte como CSV e execute:
   \`\`\`bash
   node tools/kad/research-elicit-pipeline.mjs --ingest-elicit <arquivo-exportado.csv> --question ${meta.num}
   \`\`\`
`;

  return md;
}

/**
 * Main Pipeline Orchestrator Class
 */
export class ResearchElicitPipeline {
  constructor(options = {}) {
    this.rootDir = options.rootDir || resolve(process.cwd());
    this.vaultDir = options.vaultDir || join(this.rootDir, 'vault');
    this.reportsDir = options.reportsDir || '/home/amdy/Downloads/reports/plano de pesquisa';
    this.seedsDir = options.seedsDir || join(this.rootDir, 'tools', 'kad', 'research', 'seeds');
  }

  /**
   * Initializes directories
   */
  ensureDirs() {
    const dirs = [
      join(this.vaultDir, '40_Research', 'Papers'),
      join(this.vaultDir, '40_Research', 'Questions'),
      join(this.vaultDir, '40_Research', 'Claims'),
      join(this.vaultDir, '40_Research', 'Syntheses'),
      join(this.seedsDir, 'by_wave'),
      join(this.seedsDir, 'by_question')
    ];
    for (const d of dirs) {
      if (!existsSync(d)) {
        mkdirSync(d, { recursive: true });
      }
    }
  }

  /**
   * Finds the CSV file for a given question number
   * @param {number} qNum
   * @returns {string|null}
   */
  findCsvForQuestion(qNum) {
    if (!existsSync(this.reportsDir)) return null;
    const files = readdirSync(this.reportsDir).filter(f => f.endsWith('.csv'));
    const match = files.find(f => {
      const num = parseInt(f.match(/Q(\d+)/)?.[1] || '-1', 10);
      return num === qNum;
    });
    return match ? join(this.reportsDir, match) : null;
  }

  /**
   * Loads and scores papers for a question
   * @param {number} qNum
   * @returns {Array<object>}
   */
  loadQuestionPapers(qNum) {
    const csvPath = this.findCsvForQuestion(qNum);
    if (!csvPath) return [];
    const content = readFileSync(csvPath, 'utf8');
    const papers = parseCSV(content);
    return papers.map(p => ({
      ...p,
      qNum,
      score: scorePaper(p, qNum)
    })).sort((a, b) => b.score - a.score);
  }

  /**
   * Generates all Elicit BibTeX seeds and initializes Vault notes
   * @param {object} options
   * @returns {object} summary
   */
  generateSeedsAndScaffold(options = {}) {
    this.ensureDirs();
    const topLimit = options.topPerQuestion || 5;

    const summary = {
      totalQuestions: 15,
      totalPapersIngested: 0,
      totalSeedsGenerated: 0,
      waves: {}
    };

    const waveBibs = { 1: [], 2: [], 3: [], 4: [] };

    for (let q = 1; q <= 15; q++) {
      const papers = this.loadQuestionPapers(q);
      const topPapers = papers.slice(0, topLimit);
      const qMeta = QUESTION_METADATA[q];

      summary.totalPapersIngested += papers.length;
      summary.totalSeedsGenerated += topPapers.length;

      // 1. Write Question Hub Note in vault/40_Research/Questions/
      const qMd = generateQuestionMarkdown(q, topPapers);
      const qPath = join(this.vaultDir, '40_Research', 'Questions', `${qMeta.id}.md`);
      writeFileSync(qPath, qMd, 'utf8');

      // 2. Generate BibTeX for Question
      let qBib = `% BibTeX seeds for ${qMeta.id}: ${qMeta.title}\n\n`;
      for (const p of topPapers) {
        const citekey = generateCitekey(p);
        const bib = paperToBibTeX(p, citekey);
        qBib += bib + '\n';
        if (qMeta.wave && waveBibs[qMeta.wave]) {
          waveBibs[qMeta.wave].push(bib);
        }

        // 3. Write Initial Paper Note in vault/40_Research/Papers/
        const paperMd = generatePaperMarkdown(p, {
          qNum: q,
          citekey,
          readStatus: 'unread',
          evidenceStatus: 'candidate',
          relevance: 'high'
        });
        const paperPath = join(this.vaultDir, '40_Research', 'Papers', `${citekey}.md`);
        // Do not overwrite if already enriched
        if (!existsSync(paperPath)) {
          writeFileSync(paperPath, paperMd, 'utf8');
        }
      }

      const qBibPath = join(this.seedsDir, 'by_question', `${qMeta.id}_seeds.bib`);
      writeFileSync(qBibPath, qBib, 'utf8');
    }

    // 4. Write Wave BibTeX bundles
    for (const [waveNum, bibList] of Object.entries(waveBibs)) {
      const waveInfo = WAVE_METADATA[waveNum];
      let waveContent = `% ${waveInfo.name}\n\n` + bibList.join('\n');
      const wavePath = join(this.seedsDir, 'by_wave', `Wave${waveNum}_Seeds.bib`);
      writeFileSync(wavePath, waveContent, 'utf8');
      summary.waves[waveNum] = {
        name: waveInfo.name,
        seedCount: bibList.length
      };
    }

    return summary;
  }

  /**
   * Ingests an Elicit CSV export and enriches corresponding vault notes
   * @param {string} elicitCsvPath
   * @param {number} defaultQNum
   * @returns {object} ingestion result
   */
  ingestElicitCsv(elicitCsvPath, defaultQNum = null) {
    if (!existsSync(elicitCsvPath)) {
      throw new Error(`Elicit CSV not found: ${elicitCsvPath}`);
    }

    const content = readFileSync(elicitCsvPath, 'utf8');
    const rows = parseCSV(content);

    let updatedCount = 0;
    let createdClaims = 0;
    const errors = [];

    for (const row of rows) {
      const title = row['Title'] || row['title'] || '';
      const doi = (row['DOI'] || row['doi'] || '').replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase();
      const citekey = generateCitekey(row);

      // Find extracted custom columns
      let formalModel = '';
      let theorems = '';
      let metrics = '';
      let assumptions = '';

      for (const [key, val] of Object.entries(row)) {
        const k = key.toLowerCase();
        if (k.includes('formal') || k.includes('model') || k.includes('calculus')) {
          formalModel = val;
        } else if (k.includes('theorem') || k.includes('invariant') || k.includes('guarantee')) {
          theorems = val;
        } else if (k.includes('metric') || k.includes('empirical') || k.includes('result')) {
          metrics = val;
        } else if (k.includes('assumption') || k.includes('limitation') || k.includes('failure')) {
          assumptions = val;
        }
      }

      // Check if note exists in vault/40_Research/Papers/
      const paperPath = join(this.vaultDir, '40_Research', 'Papers', `${citekey}.md`);
      
      const extraction = {
        formalModel: formalModel || 'Não especificado na extração.',
        theorems: theorems || 'Não especificado na extração.',
        metrics: metrics || 'Não especificado na extração.',
        assumptions: assumptions || 'Não especificado na extração.'
      };

      const qNum = defaultQNum || 1;
      const paperMd = generatePaperMarkdown(row, {
        qNum,
        citekey,
        readStatus: 'analyzed',
        evidenceStatus: 'source_derived',
        relevance: 'high',
        elicitExtraction: extraction
      });

      writeFileSync(paperPath, paperMd, 'utf8');
      updatedCount++;

      // Create a formal claim note if invariants or theorems were extracted
      if (theorems && theorems.length > 20) {
        const claimId = `CLAIM-${citekey}-001`;
        const claimPath = join(this.vaultDir, '40_Research', 'Claims', `${claimId}.md`);
        const claimMd = `---
type: claim
claim_id: "${claimId}"
paper: "[[${citekey}]]"
epistemic_class: SOURCE_DERIVED
status: VERIFIED
tags:
  - research
  - claim
  - epistemic/source_derived
---

# ${claimId}

## Afirmação / Invariante Formal
> ${theorems}

## Fonte Comprobatória
- **Artigo**: [[${citekey}]] (${row['Title']})
- **Formalismo**: ${formalModel || 'N/A'}
- **Assunções**: ${assumptions || 'N/A'}

## Mapeamento KAD-PI
- Transfere para a fundação formal da Prime Directive com proveniência verificada.
`;
        writeFileSync(claimPath, claimMd, 'utf8');
        createdClaims++;
      }
    }

    return {
      updatedPapers: updatedCount,
      claimsCreated: createdClaims,
      errors
    };
  }
}

// CLI Execution Entrypoint
if (process.argv[1] && process.argv[1].endsWith('research-elicit-pipeline.mjs')) {
  const args = process.argv.slice(2);
  const pipeline = new ResearchElicitPipeline();

  if (args.includes('--scaffold') || args.includes('--seed') || args.length === 0) {
    console.log('Generating Elicit BibTeX seeds and scaffolding vault research structure...');
    const result = pipeline.generateSeedsAndScaffold({ topPerQuestion: 5 });
    console.log(`Completed successfully!`);
    console.log(`- Total Questions: ${result.totalQuestions}`);
    console.log(`- Total Preliminary Papers Cataloged: ${result.totalPapersIngested}`);
    console.log(`- High-Priority Elicit Seeds Generated: ${result.totalSeedsGenerated}`);
    for (const [w, info] of Object.entries(result.waves)) {
      console.log(`  Wave ${w} (${info.name}): ${info.seedCount} seeds`);
    }
  } else if (args.includes('--ingest-elicit')) {
    const fileIdx = args.indexOf('--ingest-elicit') + 1;
    const elicitCsv = args[fileIdx];
    const qIdx = args.indexOf('--question');
    const qNum = qIdx !== -1 ? parseInt(args[qIdx + 1], 10) : 1;

    if (!elicitCsv) {
      console.error('Usage: node research-elicit-pipeline.mjs --ingest-elicit <path-to-csv> [--question <num>]');
      process.exit(1);
    }

    console.log(`Ingesting Elicit CSV: ${elicitCsv} for Question Q${qNum}...`);
    const res = pipeline.ingestElicitCsv(elicitCsv, qNum);
    console.log(`Ingested: ${res.updatedPapers} papers updated, ${res.claimsCreated} claims extracted.`);
  }
}
