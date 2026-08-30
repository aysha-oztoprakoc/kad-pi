import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  RESEARCH_MANIFEST_SCHEMA,
  parseResearchManifest,
  serializeResearchManifest,
  runResearchCli
} from '../research-cli.mjs';
import { runCuratedKnowledgeCli } from '../wiki-projection.mjs';

function captureCliOutput(fn) {
  const stdout = [];
  const stderr = [];
  const code = fn({
    stdout: msg => stdout.push(msg),
    stderr: msg => stderr.push(msg)
  });
  return {
    code,
    stdout: stdout.join('\n'),
    stderr: stderr.join('\n'),
    json: () => {
      try {
        return JSON.parse(stdout.join('\n'));
      } catch (err) {
        throw new Error(`Failed to parse CLI stdout as JSON: ${stdout.join('\n')} (error: ${err.message})`);
      }
    }
  };
}

test('Research CLI routes subcommands and unknown actions fail deterministically', () => {
  const unknown = captureCliOutput(({ stdout, stderr }) =>
    runResearchCli(['unknown-subcommand'], { stdout, stderr })
  );
  assert.equal(unknown.code, 2);
  assert.match(unknown.stderr, /usage: kad-knowledge research/i);
});

test('Research CLI import handles DOI, arXiv, and direct metadata inputs', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-cli-import-'));
  const storageDir = join(tempDir, 'wiki', 'research');
  try {
    // 1. Import by DOI positional
    const doiResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '10.1145/3290605.3300852', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(doiResult.code, 0);
    const doiJson = doiResult.json();
    assert.equal(doiJson.status, 'INGESTED');
    assert.equal(doiJson.document_id, 'doc:doi:10.1145/3290605.3300852');

    // 2. Import by arXiv positional
    const arxivResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', 'arXiv:2301.12345', '--title', 'Foundations of STC', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(arxivResult.code, 0);
    const arxivJson = arxivResult.json();
    assert.equal(arxivJson.status, 'INGESTED');
    assert.equal(arxivJson.document_id, 'doc:arxiv:2301.12345');

    // 3. Repeat import is idempotent
    const repeatResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '10.1145/3290605.3300852', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(repeatResult.code, 0);
    const repeatJson = repeatResult.json();
    assert.equal(repeatJson.status, 'IDEMPOTENT_EXISTING');
    assert.equal(repeatJson.document_id, 'doc:doi:10.1145/3290605.3300852');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Research CLI import handles local source files and enforces path safety', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-cli-source-'));
  const storageDir = join(tempDir, 'wiki', 'research');
  try {
    const pdfPath = 'papers/sample.pdf';
    await mkdir(join(tempDir, 'papers'), { recursive: true });
    await writeFile(join(tempDir, pdfPath), '%PDF-1.4 Mock Paper Content\n', 'utf8');

    // Valid local file import
    const validResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '--source', pdfPath, '--doi', '10.5555/sample.pdf', '--title', 'Sample PDF Paper', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(validResult.code, 0);
    const validJson = validResult.json();
    assert.equal(validJson.document_id, 'doc:doi:10.5555/sample.pdf');
    assert.ok(validJson.source_hash);

    // Path traversal rejection
    const traversalResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '--source', '../outside.pdf', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(traversalResult.code, 1);
    assert.match(traversalResult.stderr, /escapes root/i);

    // Null byte rejection
    const nullByteResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '--source', 'papers/sample.pdf\0.bad', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(nullByteResult.code, 1);
    assert.match(nullByteResult.stderr, /null byte/i);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Research Manifest parsing, serialization, and CLI import work deterministically', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-cli-manifest-'));
  const storageDir = join(tempDir, 'wiki', 'research');
  try {
    const manifestObj = {
      schema_version: RESEARCH_MANIFEST_SCHEMA,
      candidate: {
        title: 'Manifest-Driven Research Ingestion',
        authors: ['Ada Lovelace', 'Charles Babbage'],
        year: 1843,
        abstract: 'An early conceptual framework for algorithmic computation.',
        identifiers: [
          { type: 'doi', value: '10.1098/rssl.1843.0001' },
          { type: 'internal', value: 'lovelace-1843' }
        ]
      },
      provenance: {
        method: 'manifest',
        origin: 'historical_archive',
        actor: 'curator'
      }
    };

    const manifestFile = join(tempDir, 'import-manifest.json');
    await writeFile(manifestFile, serializeResearchManifest(manifestObj), 'utf8');

    // Import manifest via CLI
    const importResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '--manifest', manifestFile, '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(importResult.code, 0);
    const importJson = importResult.json();
    assert.equal(importJson.status, 'INGESTED');
    assert.equal(importJson.document_id, 'doc:doi:10.1098/rssl.1843.0001');

    // Invalid schema version rejected
    const badSchemaFile = join(tempDir, 'bad-manifest.json');
    await writeFile(badSchemaFile, JSON.stringify({ schema_version: 'bad-v99' }), 'utf8');

    const badResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '--manifest', badSchemaFile, '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(badResult.code, 1);
    assert.match(badResult.stderr, /unsupported manifest schema/i);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Research CLI inspect, list, verify, and export work end-to-end', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-cli-ops-'));
  const storageDir = join(tempDir, 'wiki', 'research');
  try {
    const pdfPath = 'paper.pdf';
    await writeFile(join(tempDir, pdfPath), '%PDF-1.4 Verification Test\n', 'utf8');

    // 1. Ingest
    captureCliOutput(({ stdout, stderr }) =>
      runResearchCli([
        'import',
        '--source', pdfPath,
        '--doi', '10.7777/verify.test',
        '--title', 'Verification Paper',
        '--authors', 'Alice Tester, Bob Checker',
        '--year', '2025',
        '--storage-dir', storageDir,
        '--root-dir', tempDir
      ], { stdout, stderr })
    );

    // 2. Inspect
    const inspectResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['inspect', 'doc:doi:10.7777/verify.test', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(inspectResult.code, 0);
    const inspectJson = inspectResult.json();
    assert.equal(inspectJson.title, 'Verification Paper');
    assert.equal(inspectJson.year, 2025);
    assert.deepEqual(inspectJson.authors, ['Alice Tester', 'Bob Checker']);

    // Inspect non-existent ID fails with code 1
    const notFoundResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['inspect', 'doc:doi:non.existent', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(notFoundResult.code, 1);

    // 3. List
    const listResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['list', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(listResult.code, 0);
    const listJson = listResult.json();
    assert.equal(listJson.count, 1);
    assert.equal(listJson.documents[0].document_id, 'doc:doi:10.7777/verify.test');

    // 4. Verify (valid)
    const verifyResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['verify', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(verifyResult.code, 0);
    const verifyJson = verifyResult.json();
    assert.equal(verifyJson.valid, true);

    // 5. Export to manifest
    const exportResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['export', 'doc:doi:10.7777/verify.test', '--storage-dir', storageDir, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(exportResult.code, 0);
    const exportManifest = exportResult.json();
    assert.equal(exportManifest.schema_version, RESEARCH_MANIFEST_SCHEMA);
    assert.equal(exportManifest.candidate.title, 'Verification Paper');
    assert.equal(exportManifest.candidate.identifiers[0].value, '10.7777/verify.test');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('Transport equivalence: CLI import and Direct API import produce identical canonical state', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kad-cli-equivalence-'));
  const storageDirA = join(tempDir, 'storage-a');
  const storageDirB = join(tempDir, 'storage-b');
  try {
    const pdfPath = 'shared-paper.pdf';
    const pdfContent = '%PDF-1.4 Shared Equivalence Paper\nDeterministic Content\n';
    await writeFile(join(tempDir, pdfPath), pdfContent, 'utf8');

    const inputData = {
      title: 'Equivalence Theorem in Agent Systems',
      authors: ['John Von Neumann'],
      year: 1945,
      identifiers: ['10.1000/neumann.1945'],
      source_path: pdfPath,
      provenance: { method: 'fixture', actor: 'test_runner' }
    };

    // Path A: Manifest via CLI
    const manifestFile = join(tempDir, 'equiv-manifest.json');
    await writeFile(manifestFile, JSON.stringify({
      schema_version: RESEARCH_MANIFEST_SCHEMA,
      candidate: {
        title: inputData.title,
        authors: inputData.authors,
        year: inputData.year,
        identifiers: [{ type: 'doi', value: '10.1000/neumann.1945' }]
      },
      source: { source_path: pdfPath },
      provenance: inputData.provenance
    }), 'utf8');

    const cliResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli(['import', '--manifest', manifestFile, '--storage-dir', storageDirA, '--root-dir', tempDir], { stdout, stderr })
    );
    assert.equal(cliResult.code, 0);

    // Path B: Direct CLI arguments
    const directResult = captureCliOutput(({ stdout, stderr }) =>
      runResearchCli([
        'import',
        '--source', pdfPath,
        '--doi', '10.1000/neumann.1945',
        '--title', inputData.title,
        '--authors', 'John Von Neumann',
        '--year', '1945',
        '--storage-dir', storageDirB,
        '--root-dir', tempDir
      ], { stdout, stderr })
    );
    assert.equal(directResult.code, 0);

    const catalogA = JSON.parse(await readFile(join(storageDirA, 'CATALOG.json'), 'utf8'));
    const catalogB = JSON.parse(await readFile(join(storageDirB, 'CATALOG.json'), 'utf8'));

    assert.equal(catalogA.documents[0].document_id, catalogB.documents[0].document_id);
    assert.equal(catalogA.documents[0].sources[0].source_hash, catalogB.documents[0].sources[0].source_hash);
    assert.equal(catalogA.documents[0].title, catalogB.documents[0].title);
    assert.deepEqual(catalogA.documents[0].authors, catalogB.documents[0].authors);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
