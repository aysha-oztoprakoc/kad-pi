# OMP Settings-Schema Extraction Receipt

## Input provenance (exact version identity)
- `source_revision`: `b8ce33a58911c26bed1d84f0db9a5e2e727c49a2` (= `v18.0.11` tag, verified via `git ls-remote`).
- `source_path`: `packages/coding-agent/src/config/settings-schema.ts`
- `source_sha256`: `e2646ca72f9080f1082d24adf81ced41ba7c3f2933c6adbadf0d466a41f4acf6`

## Extraction dependencies (imported constants, same commit)
| File | SHA-256 |
|---|---|
| `wire/src/index.ts` | `b8df4d9cb2f6311dc40934ab2fdf208a376f52374c87f22297af95e8cac0ffd6` |
| `coding-agent/src/web/search/types.ts` | `869735b6771e4dbff3def2d33ac6e9062a962376684afdac87e8aa303aca9753` |
| `coding-agent/src/tts/models.ts` | `d3a94e7e24d2ffcd4d2a8a45dd5877d5b8a7f32258febbd7dd021a8fa098a2ea` |
| `coding-agent/src/tiny/models.ts` | `03f669ffa5835cbae4f87167b51658b16b838f13e2416366a10e238bf077d21a` |
| `coding-agent/src/tiny/dtype.ts` | `6bd3fdf2918d43bd4ee399fe4d8343f1bffbd63afbf9287bb686f0e8ede39b14` |
| `coding-agent/src/tiny/device.ts` | `f61a3f803bb4892c282f8d46defdb37e8c688c090a24c77ab218960fd05e176a` |
| `coding-agent/src/stt/models.ts` | `317b1113d4df2fa4105d17c68442b7a353c3565be1e001587a844002188e9101` |
| `coding-agent/src/live/voices.ts` | `db16e5eae1b897a668129409e43f68526e5b8410468fdd27ac978a4326f8cfa1` |
| `coding-agent/src/session/compaction-methods.ts` | `a32063b17f3b129b0cec552e61319d8100b6152172e0b7e9cc74a0f6a9d91c6a` |

Full reconstruction reference: commit `b8ce33a5` of `github.com/can1357/oh-my-pi`.

## Extractor
`extract-omp-schema-defaults.py` (versioned, deterministic, in this directory).
Rules: parse `SETTINGS_SCHEMA` entries (single-line and multi-line); resolve `default` as
literal / constant (pinned map) / numeric-separator / arithmetic / array-spread / type-assertion-strip
(consume nested generics) / comment-strip (comma-required, never matches `://` in URLs);
UNKNOWN rule = never infer (unresolvable → `schema_default: null`, `default_kind: "unknown"`).

## Output
- `omp-schema-defaults.json` SHA-256: `61919b57b4c6713510fb340af21883fca4fab88436bd767d1bcf939c6f184709`

## Counts (machine artifact authoritative)
```
TOTAL_SETTINGS = 481
BY_DEFAULT_KIND = literal 387, constant 32, literal-array 14, literal-object 7,
                  arithmetic 3, undefined 38
RESOLVED = 443   (literal + constant + literal-array + literal-object + arithmetic)
UNDEFINED = 38
UNKNOWN = 0
sum check: 443 + 38 + 0 = 481 ✓
```

Extractor is deterministic and bit-for-bit reproducible: `extract-omp-schema-defaults.py` run twice produces identical `omp-schema-defaults.json`.
