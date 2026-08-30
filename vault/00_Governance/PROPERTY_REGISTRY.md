# Canonical property registry

Flat YAML properties only. Nested objects are invalid.

| Property | Required | Values |
|---|---:|---|
| `kad_id` | durable notes | stable `kad-` identifier |
| `title` | recommended | string |
| `type` | recommended | registered note type |
| `status` | optional | lifecycle value |
| `authority` | durable notes | `CANONICAL`, `RAW_EVIDENCE`, `PROPOSAL`, `DERIVED`, `EXTERNAL_AUTHORITY_REFERENCE`, `ARCHIVED`, `UNKNOWN` |
| `epistemic_class` | project/research | `SOURCE_FACT`, `DERIVED_SYNTHESIS`, `PROJECT_INFERENCE`, `UNKNOWN` |
| `review_status` | durable notes | `PENDING`, `APPROVED`, `REJECTED`, `UNKNOWN` |
| `visibility` | durable notes | `public`, `project`, `private` |
| `context_eligible` | durable notes | boolean |
| `train_eligible` | durable notes | boolean |
| `publish` | durable notes | boolean |
| `created` | optional | ISO date |
| `updated` | optional | ISO date |
| `verified_at` | optional | ISO date |
| `project` | optional | project ID |

`authority` and `epistemic_class` are independent dimensions. Live state remains owned by workctl, Git, telemetry, provider APIs, and hardware probes.
