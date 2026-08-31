/**
 * KAD Governance Gates & Preflight CLI
 *
 * Operator CLI for:
 * - status
 * - preflight <request.json>
 * - explain <operation_class>
 * - verify-receipt <receipt.json>
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  OPERATION_CLASSES,
  AUTHORITY_CLASSES,
  createGovernancePreflightRequest,
  validateGovernancePreflightRequest,
  GOVERNANCE_PREFLIGHT_SCHEMA_VERSION,
} from './schema.mjs';
import { resolveOperationAuthority, CANONICAL_OPERATION_POLICIES } from './policy-resolver.mjs';
import { evaluateGovernancePreflight } from './preflight-evaluator.mjs';
import { validateHumanAuthorizationReceipt, validateHumanAuthorizationReceiptV2 } from './human-receipt.mjs';
import { GovernanceTelemetryEmitter } from './telemetry-emitter.mjs';

export async function runGovernanceCli(argv = process.argv.slice(2), { cwd = process.cwd() } = {}) {
  const isJson = argv.includes('--json') || argv.includes('-j');
  const filteredArgs = argv.filter((a) => a !== '--json' && a !== '-j');
  const subcommand = filteredArgs[0] || 'status';

  const emitter = new GovernanceTelemetryEmitter({ cwd });

  switch (subcommand) {
    case 'status': {
      const stats = emitter.getDecisionStats();
      const result = {
        schema_version: 'KAD_GOVERNANCE_STATUS_V1',
        total_evaluations: stats.total_evaluations,
        stats,
        authority_classes: AUTHORITY_CLASSES,
        operation_classes: OPERATION_CLASSES,
        policies_count: Object.keys(CANONICAL_OPERATION_POLICIES).length,
      };

      if (isJson) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(`=== KAD DETERMINISTIC GOVERNANCE GATE STATUS ===\n\n`);
        process.stdout.write(`Evaluated Decisions:   ${stats.total_evaluations}\n`);
        process.stdout.write(`  - ALLOW:             ${stats.allow_count}\n`);
        process.stdout.write(`  - DENY:              ${stats.deny_count}\n`);
        process.stdout.write(`  - REQUIRE_HUMAN:     ${stats.require_human_count}\n`);
        process.stdout.write(`  - BLOCKED:           ${stats.blocked_count}\n\n`);

        process.stdout.write(`Active Authority Classes (6):\n`);
        for (const auth of AUTHORITY_CLASSES) {
          process.stdout.write(`  - ${auth}\n`);
        }
        process.stdout.write(`\nGoverned Operation Classes (17):\n`);
        for (const op of OPERATION_CLASSES) {
          const pol = CANONICAL_OPERATION_POLICIES[op];
          process.stdout.write(`  - ${op.padEnd(30)} -> [${pol.current_authority}] (status: ${pol.enforcement_status})\n`);
        }
        process.stdout.write('\n');
      }
      return 0;
    }

    case 'explain': {
      const opClass = filteredArgs[1];
      if (!opClass) {
        process.stderr.write('Usage: kad-governance explain <OPERATION_CLASS>\n');
        return 1;
      }
      const policy = resolveOperationAuthority(opClass);
      if (isJson) {
        process.stdout.write(`${JSON.stringify(policy, null, 2)}\n`);
      } else {
        process.stdout.write(`=== GOVERNANCE POLICY EXPLANATION: ${opClass} ===\n\n`);
        process.stdout.write(`Target Authority:      ${policy.target_authority}\n`);
        process.stdout.write(`Current Authority:     ${policy.current_authority}\n`);
        process.stdout.write(`Default Risk Tier:     ${policy.default_risk_tier}\n`);
        process.stdout.write(`Enforcement Capability:${policy.enforcement_capability}\n`);
        process.stdout.write(`Enforcement Status:    ${policy.enforcement_status}\n`);
        process.stdout.write(`Requires Human Receipt:${policy.requires_human_receipt ? 'YES' : 'NO'}\n`);
        process.stdout.write(`Requires STC Lease:    ${policy.requires_stc_lease ? 'YES' : 'NO'}\n`);
        process.stdout.write(`Requires FinOps Envelope:${policy.requires_budget_envelope ? 'YES' : 'NO'}\n\n`);
      }
      return 0;
    }

    case 'preflight': {
      const requestFile = filteredArgs[1];
      let rawRequest = null;

      if (!requestFile) {
        process.stderr.write('Usage: kad-governance preflight <request.json>\n');
        return 1;
      }

      try {
        const content = fs.readFileSync(path.resolve(cwd, requestFile), 'utf8');
        rawRequest = JSON.parse(content);
      } catch (err) {
        process.stderr.write(`Failed to read preflight request file: ${err.message}\n`);
        return 1;
      }

      const request = createGovernancePreflightRequest(rawRequest);
      const startMs = Date.now();
      const decision = evaluateGovernancePreflight(request);
      const latencyMs = Date.now() - startMs;

      emitter.recordDecision(decision, {
        operation_class: request.operation.operation_class,
        workpackage_id: request.work.workpackage_id,
        latency_ms: latencyMs,
      });

      if (isJson) {
        process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
      } else {
        process.stdout.write(`=== GOVERNANCE PREFLIGHT DECISION ===\n\n`);
        process.stdout.write(`Decision:       ${decision.decision}\n`);
        process.stdout.write(`Authority Level:${decision.authority_level}\n`);
        process.stdout.write(`Valid Until:    ${decision.valid_until}\n`);
        process.stdout.write(`Decision Hash:  ${decision.decision_hash}\n\n`);
        process.stdout.write(`Reason Codes:\n`);
        for (const code of decision.reason_codes) {
          process.stdout.write(`  - ${code}\n`);
        }
        if (decision.missing_requirements.length > 0) {
          process.stdout.write(`\nMissing Requirements:\n`);
          for (const req of decision.missing_requirements) {
            process.stdout.write(`  - ${req}\n`);
          }
        }
        process.stdout.write('\n');
      }

      return decision.decision === 'ALLOW' ? 0 : 1;
    }

    case 'verify-receipt': {
      const receiptFile = filteredArgs[1];
      if (!receiptFile) {
        process.stderr.write('Usage: kad-governance verify-receipt <receipt.json>\n');
        return 1;
      }

      let receipt = null;
      try {
        const content = fs.readFileSync(path.resolve(cwd, receiptFile), 'utf8');
        receipt = JSON.parse(content);
      } catch (err) {
        process.stderr.write(`Failed to read receipt file: ${err.message}\n`);
        return 1;
      }

      const val = receipt.schema_version === 'HUMAN_AUTHORIZATION_RECEIPT_V2'
        ? validateHumanAuthorizationReceiptV2(receipt)
        : validateHumanAuthorizationReceipt(receipt);
      if (isJson) {
        process.stdout.write(`${JSON.stringify(val, null, 2)}\n`);
      } else {
        process.stdout.write(`=== HUMAN AUTHORIZATION RECEIPT VERIFICATION ===\n\n`);
        process.stdout.write(`Valid:          ${val.valid ? 'YES' : 'NO'}\n`);
        process.stdout.write(`Schema:         ${receipt.schema_version}\n`);
        if (receipt.schema_version === 'HUMAN_AUTHORIZATION_RECEIPT_V2') {
          process.stdout.write(`Issuer:         ${receipt.issuer?.subject_id}\n`);
          process.stdout.write(`Authorized:     ${receipt.authorized_subject?.subject_id}\n`);
          process.stdout.write(`Workpackage:    ${receipt.work_context?.workpackage_id}\n`);
          process.stdout.write(`Experiment:     ${receipt.work_context?.experiment_id}\n`);
          process.stdout.write(`Operation:      ${receipt.operation?.operation_class}\n`);
          process.stdout.write(`Resources:      ${(receipt.resources || []).join(', ')}\n`);
          process.stdout.write(`Scope:          ${(receipt.scope?.canonical_paths || []).join(', ')}\n`);
          process.stdout.write(`Action Until:   ${receipt.validity?.action_valid_until}\n`);
          process.stdout.write(`Rollback Until: ${receipt.rollback?.recovery_deadline}\n`);
          process.stdout.write(`Policy:         ${receipt.policy?.policy_version}\n`);
        } else {
          process.stdout.write(`Workpackage:    ${receipt.workpackage_id}\n`);
          process.stdout.write(`Operation:      ${receipt.operation_class}\n`);
          process.stdout.write(`Valid Until:    ${receipt.valid_until}\n`);
        }
        process.stdout.write(`Receipt Hash:   ${receipt.receipt_hash}\n\n`);
        if (!val.valid) {
          process.stdout.write(`Errors:\n`);
          for (const err of val.errors) process.stdout.write(`  - ${err}\n`);
          process.stdout.write(`Reason Codes:\n`);
          for (const code of val.reason_codes) process.stdout.write(`  - ${code}\n`);
          process.stdout.write('\n');
        }
      }
      return val.valid ? 0 : 1;
    }

    case 'help':
    case '--help':
    case '-h':
    default: {
      process.stdout.write(`KAD Deterministic Governance Gates & Preflight CLI

Usage:
  bin/kad-governance status [--json]
  bin/kad-governance explain <OPERATION_CLASS> [--json]
  bin/kad-governance preflight <request.json> [--json]
  bin/kad-governance verify-receipt <receipt.json> [--json]
\n`);
      return subcommand === 'help' || subcommand === '--help' || subcommand === '-h' ? 0 : 1;
    }
  }
}
