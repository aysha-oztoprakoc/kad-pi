/**
 * KAD Outcome & Cognitive Telemetry CLI Implementation
 *
 * Provides operator CLI subcommands:
 * - status
 * - validate
 * - record
 * - summarize
 * - complexity
 * - backfill
 * - baseline
 */

import fs from 'node:fs';
import path from 'node:path';
import { OutcomeTelemetryStorage } from './storage.mjs';
import { OutcomeTelemetryCollector } from './collector.mjs';
import { validateOutcomeTelemetryRecord, TELEMETRY_OUTCOME_SCHEMA_VERSION } from './outcome-cost-schema.mjs';
import { computeSummaryProfile } from './aggregator.mjs';
import { analyzeArchitectureComplexity } from './complexity-analyzer.mjs';
import { backfillWorkspaceHistoricalTelemetry, reconstructHistoricalTelemetry } from './historical-backfill.mjs';
import { compileBaselineReport, formatBaselineReportMarkdown } from './baseline-reporter.mjs';

export async function runTelemetryCli(argv = process.argv.slice(2), { cwd = process.cwd() } = {}) {
  const isJson = argv.includes('--json') || argv.includes('-j');
  const filteredArgs = argv.filter((a) => a !== '--json' && a !== '-j');
  const subcommand = filteredArgs[0] || 'status';

  const storage = new OutcomeTelemetryStorage({ cwd });
  const collector = new OutcomeTelemetryCollector({ cwd, storage });

  switch (subcommand) {
    case 'status': {
      const records = storage.listRecords();
      const summary = computeSummaryProfile(records);
      const integrity = storage.verifyAllRecords();

      const result = {
        schema_version: TELEMETRY_OUTCOME_SCHEMA_VERSION,
        storage_dir: path.relative(cwd, storage.storageDir),
        total_records: records.length,
        accepted_outcomes: summary.vectors.quality.accepted,
        clean_outcome_rate_percent: summary.vectors.quality.clean_outcome_rate,
        total_interventions: summary.vectors.human_friction.total_interventions,
        low_leverage_friction_ratio: summary.vectors.human_friction.low_leverage_friction_ratio,
        stratification: summary.stratification,
        integrity: {
          total: integrity.total,
          valid: integrity.valid,
          corrupted: integrity.corrupted,
        },
      };

      if (isJson) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(`=== KAD COGNITIVE & OUTCOME TELEMETRY STATUS ===\n\n`);
        process.stdout.write(`Storage Directory:     ${result.storage_dir}\n`);
        process.stdout.write(`Total Records:         ${result.total_records}\n`);
        process.stdout.write(`Accepted Outcomes:     ${result.accepted_outcomes}\n`);
        process.stdout.write(`Clean Outcome Rate:    ${result.clean_outcome_rate_percent.toFixed(1)}%\n`);
        process.stdout.write(`Recorded Interventions:${result.total_interventions}\n`);
        process.stdout.write(`Friction Ratio:        ${(result.low_leverage_friction_ratio * 100).toFixed(1)}%\n`);
        process.stdout.write(`Record Integrity:      ${integrity.valid}/${integrity.total} valid (${integrity.corrupted} corrupted)\n\n`);

        process.stdout.write(`Work Class Breakdown:\n`);
        for (const [cls, count] of Object.entries(summary.stratification.work_classes)) {
          process.stdout.write(`  - ${cls.padEnd(20)}: ${count}\n`);
        }
        process.stdout.write(`\nEpistemic Origin Breakdown:\n`);
        for (const [orig, count] of Object.entries(summary.stratification.origin_classes)) {
          process.stdout.write(`  - ${orig.padEnd(22)}: ${count}\n`);
        }
        process.stdout.write(`\n`);
      }
      return 0;
    }

    case 'validate': {
      const targetPath = filteredArgs[1];
      let recordsToValidate = [];

      if (targetPath) {
        const fullPath = path.resolve(cwd, targetPath);
        if (fs.existsSync(fullPath)) {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.json'));
            for (const f of files) {
              try {
                recordsToValidate.push(JSON.parse(fs.readFileSync(path.join(fullPath, f), 'utf8')));
              } catch {}
            }
          } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (fullPath.endsWith('.jsonl')) {
              const lines = content.split('\n').filter((l) => l.trim().length > 0);
              for (const l of lines) {
                try { recordsToValidate.push(JSON.parse(l)); } catch {}
              }
            } else {
              recordsToValidate.push(JSON.parse(content));
            }
          }
        } else {
          process.stderr.write(`Error: file or directory not found: ${targetPath}\n`);
          return 1;
        }
      } else {
        recordsToValidate = storage.listRecords();
      }

      let validCount = 0;
      let invalidCount = 0;
      const validationResults = [];

      for (let i = 0; i < recordsToValidate.length; i++) {
        const rec = recordsToValidate[i];
        const val = validateOutcomeTelemetryRecord(rec, { checkWorkspaceReferences: true, cwd });
        const itemResult = {
          workpackage_id: rec.work?.workpackage_id || `record-${i + 1}`,
          valid: val.valid,
          errors: val.errors,
          warnings: val.warnings,
        };
        validationResults.push(itemResult);
        if (val.valid) validCount++;
        else invalidCount++;
      }

      const result = {
        total: recordsToValidate.length,
        valid: validCount,
        invalid: invalidCount,
        details: validationResults,
      };

      if (isJson) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(`=== KAD TELEMETRY VALIDATION ===\n\n`);
        process.stdout.write(`Validated ${result.total} records: ${result.valid} valid, ${result.invalid} invalid\n\n`);
        for (const item of validationResults) {
          const icon = item.valid ? '✓' : '✗';
          process.stdout.write(`  [${icon}] ${item.workpackage_id}\n`);
          if (!item.valid && item.errors.length > 0) {
            for (const err of item.errors) {
              process.stdout.write(`      Error: ${err}\n`);
            }
          }
        }
        process.stdout.write('\n');
      }
      return invalidCount > 0 ? 1 : 0;
    }

    case 'summarize': {
      const records = storage.listRecords();
      const profile = computeSummaryProfile(records);

      if (isJson) {
        process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
      } else {
        process.stdout.write(`=== KAD MULTI-DIMENSIONAL VECTOR PROFILE ===\n\n`);
        process.stdout.write(`Total Evaluated Records: ${profile.total_records}\n`);
        process.stdout.write(`Total Normalized Value:  ${profile.total_normalized_value}\n`);
        process.stdout.write(`Acceptance Rate:         ${profile.acceptance_rate_percent.toFixed(1)}%\n\n`);

        process.stdout.write(`Human Attention & Friction Vector:\n`);
        process.stdout.write(`  - Total Interventions:         ${profile.vectors.human_friction.total_interventions}\n`);
        process.stdout.write(`  - Low-Leverage Friction:       ${profile.vectors.human_friction.friction_interventions}\n`);
        process.stdout.write(`  - Strategic Guidance:          ${profile.vectors.human_friction.strategic_interventions}\n`);
        process.stdout.write(`  - Friction Ratio:              ${(profile.vectors.human_friction.low_leverage_friction_ratio * 100).toFixed(1)}%\n`);
        process.stdout.write(`  - Manual Retries:              ${profile.vectors.human_friction.manual_retries}\n`);
        process.stdout.write(`  - Minutes Coverage:            ${profile.vectors.human_friction.minutes_coverage_percent.toFixed(1)}%\n\n`);

        process.stdout.write(`Quality Vector:\n`);
        process.stdout.write(`  - Clean Outcome Rate:          ${profile.vectors.quality.clean_outcome_rate.toFixed(1)}%\n`);
        process.stdout.write(`  - Escaped Regressions:         ${profile.vectors.quality.escaped_regressions}\n`);
        process.stdout.write(`  - Rollback Events:             ${profile.vectors.quality.rollback_count}\n\n`);

        process.stdout.write(`Execution Vector:\n`);
        process.stdout.write(`  - Failed Run Rate:             ${profile.vectors.execution_efficiency.failed_run_rate_percent.toFixed(1)}%\n`);
        process.stdout.write(`  - Total Retries:               ${profile.vectors.execution_efficiency.retries}\n\n`);

        process.stdout.write(`Economic & Context Vector:\n`);
        process.stdout.write(`  - Cost Data Coverage:          ${profile.vectors.economic_coverage.coverage_percent.toFixed(1)}%\n`);
        process.stdout.write(`  - Token Data Coverage:         ${profile.vectors.context_coverage.coverage_percent.toFixed(1)}%\n\n`);
      }
      return 0;
    }

    case 'complexity': {
      const complexity = analyzeArchitectureComplexity(cwd);
      if (isJson) {
        process.stdout.write(`${JSON.stringify(complexity, null, 2)}\n`);
      } else {
        process.stdout.write(`=== KAD ARCHITECTURE COMPLEXITY SNAPSHOT ===\n\n`);
        process.stdout.write(`Authoritative Stores:    ${complexity.authoritative_store_count}\n`);
        process.stdout.write(`Persistent Daemons:      ${complexity.persistent_daemon_count}\n`);
        process.stdout.write(`Persistent Databases:    ${complexity.persistent_database_count}\n`);
        process.stdout.write(`Provider Adapters:       ${complexity.provider_adapter_count}\n`);
        process.stdout.write(`Active Schemas:          ${complexity.schema_count}\n`);
        process.stdout.write(`Mandatory CLI Surfaces:  ${complexity.mandatory_cli_surface_count}\n`);
        process.stdout.write(`Manual Sync Edges:       ${complexity.manual_sync_edge_count}\n\n`);

        process.stdout.write(`Stores:\n`);
        for (const s of complexity.details.stores) process.stdout.write(`  - ${s.name} (${s.path})\n`);
        process.stdout.write(`\nCLI Surfaces:\n`);
        for (const c of complexity.details.cli_surfaces) process.stdout.write(`  - ${c.command}\n`);
        process.stdout.write('\n');
      }
      return 0;
    }

    case 'backfill': {
      const dryRun = filteredArgs.includes('--dry-run');
      const reconstructed = backfillWorkspaceHistoricalTelemetry(cwd);

      let storedCount = 0;
      if (!dryRun) {
        for (const rec of reconstructed) {
          try {
            storage.appendRecord(rec);
            storedCount++;
          } catch (err) {
            // Already stored or duplicate
          }
        }
      }

      const result = {
        reconstructed_count: reconstructed.length,
        stored_count: dryRun ? 0 : storedCount,
        dry_run: dryRun,
        origin_class: 'RECONSTRUCTED',
      };

      if (isJson) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } else {
        process.stdout.write(`=== KAD HISTORICAL TELEMETRY BACKFILL ===\n\n`);
        process.stdout.write(`Reconstructed: ${result.reconstructed_count} historical records\n`);
        process.stdout.write(`Stored:        ${result.stored_count} records\n`);
        process.stdout.write(`Mode:          ${dryRun ? 'DRY RUN' : 'COMMITTED TO STORAGE'}\n`);
        process.stdout.write(`Origin Class:  RECONSTRUCTED (no fabricated metrics)\n\n`);
      }
      return 0;
    }

    case 'baseline': {
      const records = storage.listRecords();
      let effectiveRecords = records;
      if (effectiveRecords.length === 0) {
        // Run historical backfill if storage is empty
        effectiveRecords = backfillWorkspaceHistoricalTelemetry(cwd);
      }

      const report = compileBaselineReport(effectiveRecords, { cwd });

      const markdownArgIndex = filteredArgs.indexOf('--markdown');
      const mdOutputFile = markdownArgIndex !== -1 && filteredArgs[markdownArgIndex + 1]
        ? path.resolve(cwd, filteredArgs[markdownArgIndex + 1])
        : null;

      if (mdOutputFile) {
        const mdContent = formatBaselineReportMarkdown(report);
        fs.mkdirSync(path.dirname(mdOutputFile), { recursive: true });
        fs.writeFileSync(mdOutputFile, mdContent, 'utf8');
      }

      if (isJson) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      } else {
        process.stdout.write(formatBaselineReportMarkdown(report));
      }
      return 0;
    }

    case 'record': {
      const wpId = filteredArgs[1];
      if (!wpId) {
        process.stderr.write(`Usage: bin/kad-telemetry record <WP-ID> [--intervention <category>:<desc>]\n`);
        return 1;
      }

      const interventions = [];
      for (let i = 0; i < filteredArgs.length; i++) {
        if (filteredArgs[i] === '--intervention' && filteredArgs[i + 1]) {
          const spec = filteredArgs[i + 1];
          const colonIndex = spec.indexOf(':');
          if (colonIndex !== -1) {
            const category = spec.slice(0, colonIndex);
            const description = spec.slice(colonIndex + 1);
            interventions.push({ category, description, timestamp: new Date().toISOString() });
          } else {
            interventions.push({ category: spec, description: '', timestamp: new Date().toISOString() });
          }
          i++;
        }
      }

      const recordOptions = {};
      if (interventions.length > 0) {
        recordOptions.interventions = interventions;
      }

      const recordResult = collector.recordOutcome(wpId, recordOptions);
      if (isJson) {
        process.stdout.write(`${JSON.stringify(recordResult, null, 2)}\n`);
      } else {
        process.stdout.write(`Recorded outcome telemetry for ${wpId}: ${recordResult.record.provenance.record_hash}\n`);
      }
      return 0;
    }

    case 'help':
    case '--help':
    case '-h':
    default: {
      process.stdout.write(`KAD Outcome, Cognitive Attention & Total-Cost Telemetry CLI

Usage:
  bin/kad-telemetry status [--json]
  bin/kad-telemetry validate [path] [--json]
  bin/kad-telemetry summarize [--json]
  bin/kad-telemetry complexity [--json]
  bin/kad-telemetry backfill [--dry-run] [--json]
  bin/kad-telemetry baseline [--json] [--markdown <path>]
  bin/kad-telemetry record <WP-ID> [--json]
\n`);
      return subcommand === 'help' || subcommand === '--help' || subcommand === '-h' ? 0 : 1;
    }
  }
}
