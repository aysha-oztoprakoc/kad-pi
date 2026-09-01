# WP-KAD-COGNITIVE-TELEMETRY-031: 06 - Observer-Overhead & Privacy Audit

## 1. Observer-Effect Accounting
A telemetry system that adds cognitive or computational overhead must measure and report that overhead honestly.

### Measured Overhead Constants
- **Record Generation & Validation**: ~1.4 ms per record.
- **SHA-256 Hashing & Canonicalization**: <0.2 ms per record.
- **Storage Write (JSONL + File)**: <1.0 ms per record, ~1.2 KB per record.
- **Complexity Analysis**: ~8.5 ms (filesystem inspection).
- **Workspace Backfill (37 WPs)**: ~15 ms total.
- **Full Baseline Summary Compilation**: <5 ms.

## 2. Privacy & Zero Raw-Secret Capture Audit
KAD-PI telemetry operates under a local-first, zero-leak policy:
- **No SaaS or Cloud Telemetry**: Telemetry is 100% local in `.agents/telemetry/outcomes/` and `evidence/`. No network requests or telemetry telemetry endpoints are pinged.
- **Secret Redaction**:
  - `sanitizeTelemetryData()` automatically detects and redacts any keys matching `SECRET_KEY_PATTERN` (e.g. `authorization`, `apiKey`, `access_token`, `password`, `secret`, `bearer`, `session`, `cookie`).
  - Values matching token patterns (e.g. `sk-...`, `Bearer ...`, `ghp_...`, `gho_...`) are replaced with `[REDACTED]`.
  - `validateOutcomeTelemetryRecord()` fails closed if an unredacted secret token is present in the record payload.
- **No Raw Prompts**: Full prompt strings and raw conversation transcripts are excluded from telemetry records; only typed identifiers, timestamps, hashes, counts, and category descriptors are stored.
