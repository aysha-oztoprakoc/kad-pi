import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseCSV,
  slugifyTitle,
  generateCitekey,
  scorePaper,
  paperToBibTeX,
  generatePaperMarkdown,
  generateQuestionMarkdown,
  ResearchElicitPipeline
} from '../research-elicit-pipeline.mjs';

test('RFC 4180 CSV parser correctly handles quotes, commas and multiline fields', () => {
  const sample = `Title,Authors,Year,Abstract\n"Paper A, with comma","Smith, J., Doe, A.",2021,"First line\nSecond line with ""nested quotes"""\n"Paper B","Single Author",2024,"Short abstract"`;
  const parsed = parseCSV(sample);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].Title, 'Paper A, with comma');
  assert.equal(parsed[0].Authors, 'Smith, J., Doe, A.');
  assert.equal(parsed[0].Year, '2021');
  assert.match(parsed[0].Abstract, /First line\nSecond line with "nested quotes"/);
  assert.equal(parsed[1].Title, 'Paper B');
});

test('scorePaper filters out biomedical false friends for NOP (Q1) and boosts NOP architecture', () => {
  const medicalPaper = {
    Title: 'The Nociceptin Opioid Receptor (NOP) as a Therapeutic Target',
    Citations: '200',
    Year: '2016'
  };
  const csPaper = {
    Title: 'NOCA — A Notification-Oriented Computer Architecture: Prototype and Simulator',
    Citations: '15',
    Year: '2020'
  };

  const medScore = scorePaper(medicalPaper, 1);
  const csScore = scorePaper(csPaper, 1);
  assert.ok(csScore > medScore, 'Computer science NOP paper should outrank biomedical NOP false friend');
});

test('generateCitekey produces consistent citekeys', () => {
  const paper = {
    Title: 'A Truth Maintenance System',
    Authors: 'Doyle, J.',
    Year: '1979'
  };
  const citekey = generateCitekey(paper);
  assert.equal(citekey, 'Doyle1979ATruthMaintenan');
});

test('ResearchElicitPipeline scaffolds seeds and ingests Elicit CSV properly', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-elicit-test-'));
  const vaultDir = join(tempDir, 'vault');
  const seedsDir = join(tempDir, 'seeds');

  try {
    const pipeline = new ResearchElicitPipeline({
      rootDir: tempDir,
      vaultDir,
      seedsDir,
      reportsDir: '/home/amdy/Downloads/reports/plano de pesquisa'
    });

    const scaffold = pipeline.generateSeedsAndScaffold({ topPerQuestion: 3 });
    assert.equal(scaffold.totalQuestions, 15);
    assert.ok(scaffold.totalSeedsGenerated >= 45);

    // Verify Question Note was created
    const q1Path = join(vaultDir, '40_Research', 'Questions', 'Q01.md');
    const q1Content = await readFile(q1Path, 'utf8');
    assert.match(q1Content, /Theoretical and empirical foundations/);
    assert.match(q1Content, /Wave 1/);

    // Verify Paper Note was created as candidate
    const paperFiles = await (await import('node:fs/promises')).readdir(join(vaultDir, '40_Research', 'Papers'));
    assert.ok(paperFiles.length >= 40);

    // Now simulate an Elicit CSV export with custom extracted columns
    const mockElicitCsv = `Title,Authors,Year,DOI,Formal_Model,Theorems_and_Invariants,Empirical_Results_and_Metrics,Assumptions_and_Limitations
"NOCA — A Notification-Oriented Computer Architecture: Prototype and Simulator","R. Linhares, J. M. Simão",2020,"10.1109/access.2020.2975360","Hardware-level Notification Processing Unit (NPU) with stateful factual entities","Execution ordering preserves causal dependency graph without central arbiter","15x speedup in rule evaluation latency and 40% memory bus reduction","Assumes localized notification propagation without unbounded cyclic cascades"`;

    const elicitCsvPath = join(tempDir, 'mock_elicit_q1.csv');
    await writeFile(elicitCsvPath, mockElicitCsv, 'utf8');

    const ingestResult = pipeline.ingestElicitCsv(elicitCsvPath, 1);
    assert.equal(ingestResult.updatedPapers, 1);
    assert.equal(ingestResult.claimsCreated, 1);

    // Verify paper was upgraded to source_derived with extracted fields
    const updatedPaperPath = join(vaultDir, '40_Research', 'Papers', 'Linhares2020NocaANotificati.md');
    const updatedContent = await readFile(updatedPaperPath, 'utf8');
    assert.match(updatedContent, /evidence_status: source_derived/);
    assert.match(updatedContent, /read_status: analyzed/);
    assert.match(updatedContent, /Hardware-level Notification Processing Unit/);
    assert.match(updatedContent, /Execution ordering preserves causal dependency/);

    // Verify formal claim note was created
    const claims = await (await import('node:fs/promises')).readdir(join(vaultDir, '40_Research', 'Claims'));
    assert.equal(claims.length, 1);
    const claimContent = await readFile(join(vaultDir, '40_Research', 'Claims', claims[0]), 'utf8');
    assert.match(claimContent, /epistemic_class: SOURCE_DERIVED/);
    assert.match(claimContent, /Execution ordering preserves causal dependency/);

  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
