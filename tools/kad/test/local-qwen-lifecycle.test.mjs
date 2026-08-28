import assert from 'node:assert/strict';
import test from 'node:test';
import process from 'node:process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalInferenceCapability } from '../local-inference-capability.mjs';
import { CapabilityRegistry } from '../local-router.mjs';

const port = 51327;
const endpoint = `http://127.0.0.1:${port}`;
const server = "require('node:http').createServer((q,r)=>{r.writeHead(200,{'content-type':'application/json'});r.end(JSON.stringify({result:'koboldcpp/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M'}))}).listen(" + port + ",'127.0.0.1')";

function capability({ expectedModel = 'Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M', receiptPath } = {}) {
  return new LocalInferenceCapability({
    command: process.execPath,
    args: ['-e', server],
    endpoint,
    registry: new CapabilityRegistry(),
    resource: { id: 'kad-local-retrieval-amdy', trust_domain: 'retrieval', capabilities: ['structured-extraction'], context_window: 4096 },
    expectedModel,
    receiptPath,
    startupTimeoutMs: 3000
  });
}

test('owned Qwen activation verifies identity and records a spawn receipt', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kad-qwen-lifecycle-'));
  const receiptPath = join(root, 'activation.json');
  const worker = capability({ receiptPath });
  try {
    const activation = await worker.activate();
    assert.equal(activation.ownership, 'OWNED');
    assert.equal(activation.model_identity, 'koboldcpp/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M');
    assert.equal(activation.pid > 0, true);
    assert.deepEqual(JSON.parse(await readFile(receiptPath, 'utf8')), { provider: 'kad-local-retrieval-amdy', resource_id: 'kad-local-retrieval-amdy', endpoint, pid: activation.pid, ownership: 'OWNED' });
  } finally {
    await worker.dispose();
    await rm(root, { recursive: true, force: true });
  }
});

test('identity mismatch fails closed and advertises no capability', async () => {
  const worker = capability({ expectedModel: 'Stheno-v3.2' });
  await assert.rejects(() => worker.activate(), /model identity mismatch/);
  assert.equal(worker.state, 'DISPOSED');
});
