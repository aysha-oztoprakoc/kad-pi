#!/usr/bin/env node
/**
 * `make verify` entrypoint for the OMP orchestration preflight.
 *
 * `omp-orchestration-preflight.mjs` classifies a checkout as READY / DEGRADED / BLOCKED and exits
 * 0 / 2 / 1. That code cannot be used directly in a gate: DEGRADED is the *normal* state of a
 * machine whose local retrieval is not running, and a gate that is permanently red stops being
 * read — the failure mode ADR 0016 and ADR 0017 were written to undo. So the gate fails on the
 * blocking causes only, and prints everything else so it stays visible.
 *
 * `KAD_PREFLIGHT_ROOT` overrides the checkout under test; it exists so the gate's own contract can
 * be exercised against a fixture instead of the live repository.
 */
import { inspectPreflight, canonicalReceipt } from './omp-orchestration-preflight.mjs';

const receipt = canonicalReceipt(inspectPreflight({ root: process.env.KAD_PREFLIGHT_ROOT ?? process.cwd() }));

if (receipt.status === 'BLOCKED') {
  process.stderr.write(`OMP PREFLIGHT BLOCKED: ${receipt.failures.join(', ')}\n`);
  process.stderr.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exitCode = 1;
} else {
  const reasons = [
    ...(receipt.omp.provenance_failures ?? []),
    ...(receipt.omp.path_shadow ? [`OMP_PATH_SHADOW:${receipt.omp.path_shadow.path}`] : []),
    ...(receipt.unknowns ?? [])
  ];
  const detail = reasons.length ? ` — ${reasons.join(', ')}` : '';
  process.stdout.write(`OMP PREFLIGHT ${receipt.status}: omp ${receipt.omp.version} (${receipt.omp.source})${detail}\n`);
  process.exitCode = 0;
}
