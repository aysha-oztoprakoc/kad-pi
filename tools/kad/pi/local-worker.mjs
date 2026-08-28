#!/usr/bin/env node
/** Real Pi SDK -> localhost model -> bounded result -> deterministic validator. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadPiSdk } from './sdk-loader.mjs';

export function validateLocalResult(text) {
  const normalized = String(text ?? '').trim();
  return { accepted: normalized === 'READY', value: normalized, expected: 'READY' };
}

export async function runLocalWorker({ endpoint = 'http://127.0.0.1:5001/v1', modelsPath = resolve(new URL('./local-models.json', import.meta.url).pathname), agentDir = `/tmp/kad-local-worker-${Date.now()}` } = {}) {
  if (!existsSync(modelsPath)) throw new Error(`Missing local model configuration: ${modelsPath}`);
  const { sdk } = await loadPiSdk();
  const { ModelRuntime, SessionManager } = sdk;
  const models = JSON.parse(readFileSync(modelsPath, 'utf8'));
  models.providers['kad-local-world'].baseUrl = endpoint;
  const runtimePath = `/tmp/kad-local-models-${process.pid}.json`;
  await (await import('node:fs/promises')).writeFile(runtimePath, JSON.stringify(models));
  const modelRuntime = await ModelRuntime.create({ modelsPath: runtimePath, authPath: `/tmp/kad-local-auth-${process.pid}.json`, refreshOnCreate: false });
  const model = modelRuntime.getModel('kad-local-world', 'stheno-local');
  if (!model) throw new Error('Configured kad-local-world/stheno-local model was not resolved by Pi');
  const { session } = await sdk.createAgentSession({
    model, modelRuntime, cwd: process.cwd(), agentDir,
    sessionManager: SessionManager.inMemory(),
    noTools: 'all', thinkingLevel: 'off'
  });
  let output = '';
  const unsubscribe = session.subscribe(event => {
    if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') output += event.assistantMessageEvent.delta;
  });
  const started = performance.now();
  try {
    await session.prompt('Classify this deterministic fact. Reply with exactly one token READY and nothing else. Fact: a local model endpoint is available.');
  } finally {
    unsubscribe?.(); session.dispose();
  }
  const validation = validateLocalResult(output);
  return { reality_level: 'INTEGRATION', provider: model.provider, model: model.id, endpoint, output, validation, latency_ms: Math.round(performance.now() - started) };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  runLocalWorker().then(result => { console.log(JSON.stringify(result, null, 2)); process.exit(result.validation.accepted ? 0 : 1); }).catch(error => { console.error(error.stack || error); process.exit(1); });
}
