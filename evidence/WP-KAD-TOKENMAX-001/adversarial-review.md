# Adversarial review

| Attack | Result |
|---|---|
| Cheap lane bypasses trust | Rejected before economics by exact trust-domain check. |
| PAYG selected after quota exhaustion | Rejected while all paid fallback flags are false. |
| UNKNOWN quota treated as zero/high capacity | Preserved as `UNKNOWN` with null remaining/capacity. |
| Stale observation treated as fresh | Normalized as `STALE`. |
| EXPIRING exception outranks local/deterministic | Class rank keeps deterministic/local ahead; test matrix covers it. |
| Provider/model name grants authority | Provider is transport metadata; authority compatibility is explicit. |
| Stheno satisfies retrieval | WORLD mismatch rejects it. |
| Qwen capability widened | Only repository-fact-finding and structured-extraction are accepted. |
| Quota change polls every route | `quotaNotification` emits only the changed lane path. |
| Budget allows recursive retries | Task budget and router repair policy are bounded. |
| Missing token telemetry becomes zero | Missing values remain null/UNKNOWN. |
| GPU benchmark compromises Stheno | Vulkan comparison was not run; external GPU ownership and unknown VRAM are recorded. |
| Episode automatically trains | `training_eligibility.eligible` remains false. |
| Replay differs | Route output is deterministic for frozen normalized inputs. |

No acceptance-critical issue was found. Live quota data was intentionally not fabricated.
