import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildContextCheckpoint,
  contextPolicy,
  contextStatus,
  recordCompactionReceipt,
  recordContextCheckpoint,
  repositorySnapshot,
} from '../../tools/kad/context-economy.mjs';

const runtimeReceiptName = 'compaction-receipts.jsonl';

function contextUsage(ctx) {
  try {
    return typeof ctx.getContextUsage === 'function' ? ctx.getContextUsage() : null;
  } catch {
    return null;
  }
}

function stateLabel(root) {
  const path = join(root, '.state', 'omp-kad', 'runtime', 'swarm-state.json');
  try {
    const state = JSON.parse(readFileSync(path, 'utf8'));
    return `${state.status ?? 'UNKNOWN'}; tasks=${state.tasks_completed ?? 0}/${state.tasks_total ?? 'UNKNOWN'}`;
  } catch {
    return 'UNKNOWN';
  }
}

function workState(root) {
  const path = join(root, '.state', 'omp-kad', 'runtime', 'workpackage.json');
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}

export default function kadContextEconomy(pi) {
  let automaticCompaction = null;
  let lastAutomaticReceiptAt = 0;

  pi.on('session.compacting', (event, ctx) => {
    const state = workState(ctx.cwd);
    const checkpoint = buildContextCheckpoint({
      root: ctx.cwd,
      workpackage: state.workpackage ?? 'UNKNOWN',
      gate: state.gate ?? 'UNKNOWN',
      accepted: state.accepted,
      blocked: state.blocked,
      next_action: state.next_action ?? 'Recover durable state before continuing',
      local_resources: state.local_resources,
    });
    recordContextCheckpoint(join(ctx.cwd, '.state', 'omp-kad', 'runtime', 'context-checkpoints.jsonl'), checkpoint);
    return {
      context: [checkpoint],
      preserveData: {
        kad_context_checkpoint: {
          schema_version: 'kad-context-checkpoint-v1',
          sha256: createHash('sha256').update(checkpoint, 'utf8').digest('hex'),
          source: 'deterministic-filesystem-and-git-state',
        },
      },
    };
  });

  pi.on('auto_compaction_start', (event, ctx) => {
    const usage = contextUsage(ctx);
    automaticCompaction = {
      action: event.action,
      tokens_before: usage?.tokens,
    };
  });

  pi.on('auto_compaction_end', (event, ctx) => {
    const usage = contextUsage(ctx);
    const start = automaticCompaction;
    automaticCompaction = null;
    const path = join(ctx.cwd, '.state', 'omp-kad', 'runtime', runtimeReceiptName);
    recordCompactionReceipt(path, {
      action: event.action,
      automatic: true,
      tokens_before: start?.tokens_before,
      tokens_after: usage?.tokens,
      git_head: repositorySnapshot(ctx.cwd).head,
      success: event.aborted !== true && event.errorMessage == null && event.skipped !== true,
      error: event.errorMessage ?? (event.aborted ? 'aborted' : event.skipped ? 'skipped' : undefined),
    });
    lastAutomaticReceiptAt = Date.now();
  });

  pi.on('session_compact', (event, ctx) => {
    if (Date.now() - lastAutomaticReceiptAt < 1000) return;
    const path = join(ctx.cwd, '.state', 'omp-kad', 'runtime', runtimeReceiptName);
    recordCompactionReceipt(path, {
      action: 'snapcompact',
      automatic: false,
      tokens_before: event.compactionEntry?.tokensBefore,
      git_head: repositorySnapshot(ctx.cwd).head,
      success: true,
    });
  });

  pi.registerCommand('kad-context', {
    description: 'Show deterministic KAD context and compaction state',
    handler: async (_args, ctx) => {
      const usage = contextUsage(ctx);
      const message = contextStatus({
        root: ctx.cwd,
        usage,
        swarm: stateLabel(ctx.cwd),
        receiptPath: join(ctx.cwd, '.state', 'omp-kad', 'runtime', runtimeReceiptName),
      });
      ctx.ui.notify(message, 'info');
    },
  });

  pi.on('session_start', (_event, ctx) => {
    if (!existsSync(join(ctx.cwd, '.state', 'omp-kad', 'runtime'))) return;
    ctx.ui.setStatus?.('kad-context', `local-first · ${contextPolicy.compaction.thresholdPercent}%`);
  });
}
