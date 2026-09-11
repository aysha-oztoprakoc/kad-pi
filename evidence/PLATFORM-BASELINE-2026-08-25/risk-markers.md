# AMDY-002 — Risk Markers (databases / models / containers / secrets)

Evidence type: CONFIRMED unless marked INFERRED (directly observed)
Capture timestamp: 2026-08-25T03:56 (approx)

## DATABASE CANDIDATES

21 candidate paths (maxdepth 4), including SQLite WAL/SHM companions. Do NOT open any database. Migration: use DB-aware copies for SQLite (consistent checkpoint or copy main+wal+shm together; verify with integrity check post-copy).

| size | path | type |
|---|---|---|
| 5,615,812,608 | data_rein/knowledge_base/wiki.db | SQLite (SQLite 3.53.1, writer v2) + `wiki.db-wal` (0 B) + `wiki.db-shm` (32 KB) present → WAL mode in use |
| 521,289,728 | data_rein-dsh-foundation/knowledge_base/wiki.db | SQLite (3.53.1) |
| 131,813,376 | data_rein/.code-review-graph/graph.db | SQLite (3.53.1) |
| 765,952 | data_rein/odysseus/data/app.db | SQLite (3.46.1, counter 299) |
| 151,552 | data_rein/ComfyUI/user/comfyui.db | SQLite (3.53.1) |
| 135,168 | data_rein/odysseus/data/scheduled_emails.db | SQLite (3.46.1) |
| 98,304 | data_rein-dsh-foundation/.omo/evidence/agent_memory_authority_manual_qa.sqlite3 | SQLite (3.53.1) |
| 98,304 | data_rein-dsh-foundation/.omo/evidence/agent_memory_authority_manual_qa_verified.sqlite3 | SQLite (3.53.1) |
| 36,864 | data_rein/.gemini/antigravity-cli/conversation_summaries.db | SQLite (3.05) |
| 0 | data_rein/odysseus/data/odysseus.db | empty (0 bytes) |
| 0 | bak-omarchy/config/Bitwarden/SharedStorage-wal | Chromium shared-storage WAL |
| 0 | bak-omarchy/config/Claude/SharedStorage-wal | Chromium shared-storage WAL |
| 0 | bak-omarchy/config/obsidian/SharedStorage-wal | Chromium shared-storage WAL |
| 0 | bak-omarchy/config/Typora/SharedStorage-wal | Chromium shared-storage WAL |
| 69,632 | bak-omarchy/config/chromium/first_party_sets.db | SQLite (3.51.3) |
| 69,632 | bak-omarchy/config/google-chrome/first_party_sets.db | SQLite (3.53.1) |
| 32,768 | bak-omarchy/config/Typora/DIPS-shm | Chromium DIPS shared-mem |
| 86,552 | bak-omarchy/config/Claude/DIPS-wal | Chromium DIPS WAL |
| 90,672 | bak-omarchy/config/Typora/DIPS-wal | Chromium DIPS WAL |

`file` magic sniff was applied ONLY to the `.db`/`.sqlite`/`.sqlite3` paths above (cap 50). No database contents opened, no sqlite3 executed.

## MODEL / VM / LARGE ARTIFACTS

- Dedicated model stores (INFERRED from layout + sizes; file names not magic-checked beyond the DB sniff):
  - `data_rein/ai_models/models/` — **62 GB**, Ollama registry layout (`blobs/sha256-*` + `manifests/registry.ollama.ai`). Largest blobs 9.0G, 7.8G, 6.6G, 5.2G, 5.0G… (11 blobs > 1G).
  - `data_rein/ComfyUI/models/` — **31 GB**, includes `checkpoints/flux1-schnell.safetensors` (23,782,506,688 B), `checkpoints/sd_xl_turbo_1.0_fp16.safetensors` (4.3G), `checkpoints/v1-5-pruned-emaonly.safetensors` (4.3G), plus loras/controlnet/vae/embeddings subdirs (contents not enumerated beyond depth 2).
- No `.gguf`/VM-disk/ISO files at maxdepth 4 (the 0-count model-file probe). Model artifacts sit deeper than depth 4.
- Migration implication: ~93 GB of model artifacts (Ollama blob store is partially re-pullable; local/finetuned blobs may not be). Sizes matter for AMDY-003 capacity + copy strategy. Recommend `rsync`/`cp --reflink=auto` and NOT hashing during migration without explicit approval.

## CONTAINER MARKERS

4 files (maxdepth 4), metadata only (not read):
- data_rein/odysseus/docker-compose.yml (8,141 B)
- data_rein/odysseus/docker-compose.gpu-amd.yml (8,460 B)
- data_rein/odysseus/docker-compose.gpu-nvidia.yml (8,524 B)
- data_rein/odysseus/Dockerfile (5,226 B)

No `.docker`/`containers` dirs found at maxdepth 3. No live container state on this host (docker inactive). If containers were used against these compose files, data lives in repos/app dirs (e.g. `odysseus/data/*`), not in daemon volumes on this machine.

## SECRET CANDIDATES — METADATA ONLY (contents never read)

File-pattern probe (maxdepth 5) matched 212 entries; most are false positives (`*token*` hitting tokenizer dirs, `tokens.css`, `Trust Tokens` browser cookies, `node_modules`). Genuine candidates:

| mode | owner | size | path | class |
|---|---|---|---|---|
| -rw------- | amdy | 9,088 | data_rein/odysseus/.env | REAL .env (KNOWN) |
| -rw-r--r-- | amdy | 8,994 | data_rein/DATA/kad-1.0/odysseus/.env | REAL .env |
| -rw-r--r-- | amdy | 1,712 | data_rein/DATA/kad-1.0/.env.example | example |
| -rw-r--r-- | amdy | 9,708 | data_rein/odysseus/.env.example | example |
| -rw------- | amdy | 1,484 | data_rein/config/.secrets.enc | encrypted store |
| -rw------- | amdy | 1,484 | data_rein/config/.secrets.enc.bak | encrypted store backup |
| -rw------- | amdy | 44 | data_rein/config/.secrets.key | **decryption key** |
| -rw------- | amdy | 468 | data_rein/.secrets.env | env secrets |
| -rw------- | amdy | 100 | data_rein/config/keys/cache-priv-key.pem | private key |
| -rw------- | amdy | 387 | data_rein/ai_models/id_ed25519 | SSH private key (unusual location) |
| -rw------- | amdy | 506 | data_rein/.gemini/antigravity-cli/antigravity-oauth-token | OAuth token |
| -rw------- | amdy | 1,310,833 | bak-omarchy/config/Claude/ca-bundle.pem | CA bundle (.pem) |
| drwx------ | amdy | — | data_rein/amdy-omarchy4-handoff-v1/11_secrets | secret dir (untracked agent tree) |
| drwxr-xr-x | amdy | — | data_rein/.omo/evidence/secrets-baseline-restore | evidence dir |
| drwxr-xr-x | amdy | — | data_rein-dsh-foundation/.omo/evidence/secrets-baseline-restore | evidence dir |
| -rw-r--r-- | amdy | 51 | data_rein-migration-backups/20260823/verification/secrets-baseline-in-full-patch.txt | secret baseline patch — DO NOT READ |
| drwx------ | amdy | — | bak-omarchy/config/Bitwarden | app profile (credentials) |
| drwx------ | amdy | — | bak-omarchy/config/google-chrome | browser profile |
| drwx------ | amdy | — | bak-omarchy/config/google-chrome-for-testing | browser profile |
| drwxr-xr-x | amdy | — | bak-omarchy/config/chromium | browser profile |
| drwx------ | amdy | — | bak-omarchy/config/Claude, /Code, /Typora, /obsidian, /heroic, /hydralauncher | electron/app profiles |

Secret-bearing directories also identified (metadata only): `bak-omarchy/config/*` app/browser profiles; `data_rein/odysseus/data/` (contains `app.db`, `auth.json`, `.app_key` among untracked files of DATA repo).

### data_rein-migration-backups
- mode `700` (owner-only), size **313M**, contains `20260823/` tree including `verification/secrets-baseline-in-full-patch.txt`. Contents NOT read. Treat entire tree as Class D until human review.

### Known-secret check (required)
`data_rein/odysseus/.env` — CONFIRMED EXISTS, `-rw------- amdy amdy 9088`, content NOT read, NOT recorded.

### Secret policy confirmation
No `cat`/`head`/`file`/`strings`/grep/parse performed on any secret candidate. Only `find -printf`/`stat` metadata was collected. No secret values appear in this evidence.

## CONTAINER + DB + MODEL + SECRET MIGRATION SUMMARY
1. 3 SQLite `wiki.db` (5.6G WAL-mode) — consistent-copy + integrity check.
2. 4 compose/Dockerfile markers in odysseus — re-evaluate, do not auto-run.
3. ~93G model stores — decide copy vs re-pull (Ollama) in AMDY-003.
4. `.secrets.enc` + `.secrets.key` pair — isolate, human review; migration must NOT copy decryption material without approval.
5. Multiple `.env` + private keys + OAuth token — Class D isolation.
6. Browser/electron profiles under bak-omarchy/config — Class D, human review before any restore.
