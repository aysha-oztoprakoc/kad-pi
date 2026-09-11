# AMDY-002 — Special Filesystem Features

Evidence type: CONFIRMED (directly observed on this current installation)
Capture timestamp: 2026-08-25T03:55 (approx)

## Symlinks

- Count (maxdepth 4): **248**
- Most are under `data_rein/.agents/skills/*` → `/home/amdy/data_rein/skills/core/*` (old absolute paths, now dangling on this mount).
- Sample:
  - `data-oby/Wiki -> /home/amdy/data_rein/knowledge_base/` (dangling)
  - `data_rein/.agents/skills/agentic-actions-auditor -> /home/amdy/data_rein/skills/core/agentic-actions-auditor` (dangling)
  - `data_rein/.agents/skills/agy-pon-compliance -> /home/amdy/data_rein/skills/core/agy-pon-compliance` (dangling)
  - `data_rein/.agents/skills/archify -> /home/amdy/data_rein/skills/core/archify` (dangling)
  - `data_rein/.agents/skills/ask-matt -> /home/amdy/data_rein/skills/core/ask-matt` (dangling)
  - `data_rein/.agents/skills/audit-context-building -> /home/amdy/data_rein/skills/core/audit-context-building` (dangling)
  - `data_rein/.agents/skills/handoff -> /home/amdy/data_rein/skills/core/handoff` (dangling)
  - ... (many more skills symlinks, same pattern)
  - `bak-omarchy/config/mako/config -> /home/amdy/.config/omarchy/current/theme/mako.ini` (dangling)
  - Chromium-based app singleton files (Bitwarden/Claude/google-chrome/Typora `SingletonCookie`/`SingletonLock`/`SingletonSocket`) — ephemeral lock symlinks, migration-irrelevant.
- MIGRATION IMPACT: many symlinks embed the old absolute prefix `/home/amdy/...`. A plain `cp -a`/`rsync -a` will preserve targets verbatim, leaving them dangling on the new host unless targets land at the same path or symlinks are rewritten. Requires explicit decision in AMDY-003 (rewrite targets vs preserve vs drop agent-skill symlinks).

## Hardlinks

- Count (maxdepth 4): **0** — no hardlink handling required within this depth.

## Extended attributes (xattr)

- Probe: Python `os.listxattr(p, follow_symlinks=False)` — NAMES ONLY, no values retrieved.
- Fixed path set (19 paths: all top-level entries, all repo roots, `data_rein-migration-backups`): **0 xattr names found on all probed paths.**

## ACLs

- Probe: `getfacl -cp` on same fixed set (non-recursive).
- No extended ACL entries on any probed path (no named user/group/mask entries). Plain mode bits only.
- Notable modes: `data_rein-migration-backups` = `700` (owner-only); `lost+found` = `700` root-owned.

## Sparse-file candidates

- Files >100M with apparent size > 1.25 × allocated (maxdepth 4): **0**

## Large files (>1G)

- Count (maxdepth 4): **1**
- `data_rein/knowledge_base/wiki.db` — apparent 5,615,812,608 bytes; allocated 5,615,816,704 bytes (dense, not sparse). This is a ~5.6 GB SQLite database. Requires DB-aware migration (see risk-markers.md).

## Ownership anomalies

- `-nouser`: **0** · `-nogroup`: **0** (maxdepth 5)
- All files owned by uid 1000 except expected root-owned `lost+found` and mount-point parent.

## Migration relevance summary

1. Rewrite-or-preserve decision required for ~248 symlinks with `/home/amdy/...` targets.
2. `wiki.db` (5.6G SQLite) — use consistent copy (SQLite backup or `cp` only while DB is not being written; verify integrity post-copy). Do NOT treat as plain file for `rsync` without checks.
3. No hardlinks, no xattrs, no extended ACLs, no sparse files, no orphaned owners — standard copy semantics suffice for everything else at the probed depths.
