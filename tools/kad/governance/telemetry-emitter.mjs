/**
 * KAD Governance Telemetry Emitter
 *
 * Emits audit and friction telemetry for governance preflight evaluations.
 *
 * Invariant: TELEMETRY OBSERVES != TELEMETRY AUTHORIZES
 */

import fs from 'node:fs';
import path from 'node:path';

export function resolveDefaultGovernanceTelemetryDir(cwd = process.cwd()) {
  return path.join(cwd, '.agents', 'telemetry', 'governance');
}

export class GovernanceTelemetryEmitter {
  constructor({ telemetryDir = null, cwd = process.cwd() } = {}) {
    this.cwd = cwd;
    this.telemetryDir = telemetryDir || resolveDefaultGovernanceTelemetryDir(cwd);
    this.decisionsFile = path.join(this.telemetryDir, 'decisions.jsonl');
    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!fs.existsSync(this.telemetryDir)) {
      fs.mkdirSync(this.telemetryDir, { recursive: true });
    }
  }

  recordDecision(decision, context = {}) {
    const record = {
      schema_version: 'KAD_GOVERNANCE_TELEMETRY_RECORD_V1',
      decision_hash: decision.decision_hash,
      decision: decision.decision,
      reason_codes: decision.reason_codes || [],
      authority_level: decision.authority_level,
      human_gate_required: decision.human_gate_required,
      operation_class: context.operation_class || 'UNKNOWN',
      workpackage_id: context.workpackage_id || 'UNKNOWN',
      latency_ms: context.latency_ms || 0,
      timestamp: new Date().toISOString(),
    };

    const line = JSON.stringify(record) + '\n';
    fs.appendFileSync(this.decisionsFile, line, 'utf8');
    return record;
  }

  getDecisionStats() {
    if (!fs.existsSync(this.decisionsFile)) {
      return {
        total_evaluations: 0,
        allow_count: 0,
        deny_count: 0,
        require_human_count: 0,
        blocked_count: 0,
        reason_code_distribution: {},
      };
    }

    const content = fs.readFileSync(this.decisionsFile, 'utf8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);

    let allow = 0;
    let deny = 0;
    let reqHuman = 0;
    let blocked = 0;
    const reasonCodes = {};

    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.decision === 'ALLOW') allow++;
        else if (item.decision === 'DENY') deny++;
        else if (item.decision === 'REQUIRE_HUMAN') reqHuman++;
        else if (item.decision === 'BLOCKED') blocked++;

        if (Array.isArray(item.reason_codes)) {
          for (const code of item.reason_codes) {
            reasonCodes[code] = (reasonCodes[code] || 0) + 1;
          }
        }
      } catch {}
    }

    return {
      total_evaluations: lines.length,
      allow_count: allow,
      deny_count: deny,
      require_human_count: reqHuman,
      blocked_count: blocked,
      reason_code_distribution: reasonCodes,
    };
  }
}
