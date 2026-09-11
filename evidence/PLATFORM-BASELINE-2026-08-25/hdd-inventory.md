# AMDY-002 — HDD Top-Level Inventory

Evidence type: CONFIRMED (directly observed on this current installation)
Capture timestamp: 2026-08-25T03:52:48-03:00

## HDD identity verification

```
/dev/sda1  ext4  amdy-HDD  9d31735a-9d6b-463a-8350-f039c8ecdc02  /run/media/amdy/amdy-HDD  RO=0
```

Contractual mode for AMDY-002: READ ONLY (physical RW not used for writes).

## Top-level listing (ls -la)

```
total 288
drwx------  16 amdy amdy   4096 Aug 25 02:20 .
drwxr-x---+  5 root root    100 Aug 25 02:40 ..
drwxr-xr-x   5 amdy amdy   4096 Jul  6 18:27 bak-omarchy
-rw-r--r--   1 amdy amdy 124898 Aug 14 09:41 Confirmação de disciplinas requeridas (etapa atual_ inclusão) - 2026_2 -.pdf
drwxr-xr-x   4 amdy amdy   4096 Jul  6 19:14 context
drwxr-xr-x   2 amdy amdy  20480 Jul  3 19:09 DATA
drwxr-xr-x   5 amdy amdy   4096 Jul  6 18:01 data-oby
drwxr-xr-x  52 amdy amdy   4096 Aug 24 21:26 data_rein
drwxr-xr-x  32 amdy amdy   4096 Aug 21 00:02 data_rein-discovery-001
drwxr-xr-x  36 amdy amdy   4096 Aug 24 16:56 data_rein-dsh-foundation
drwx------   3 amdy amdy   4096 Aug 23 19:43 data_rein-migration-backups
-rw-r--r--   1 amdy amdy   1559 Jul  3 16:18 data-sofia.txt
drwxr-xr-x  17 amdy amdy   4096 Aug 22 10:25 deepseek-harness-reference-b150a551-20260823
drwxr-xr-x  12 amdy amdy  20480 Aug 25 02:09 Downloads
drwx------   2 root root  16384 Aug 25 01:22 lost+found
drwxr-xr-x   4 amdy amdy   4096 Jul  6 05:32 noelle
drwxr-xr-x   4 amdy amdy   4096 Aug 19 15:53 Pictures
-rw-r--r--   1 amdy amdy    515 Jul  3 12:25 remove_watermark.py
-rw-r--r--   1 amdy amdy   2478 Jul  2 16:29 sources for data-nexus.md
-rwxr-xr-x   1 amdy amdy   2481 Jul  6 18:36 sync_abhell.sh
-rw-r--r--   1 amdy amdy  44473 Jul  6 13:00 TODO KAD LATEST.odt
drwxr-xr-x   4 amdy amdy   4096 Jul  6 09:38 tulpas
```

## Allocated-size distribution

Command: `timeout 900 du -x -h --max-depth=1 "$H"` — exit status 1 (expected: lost+found permission denied; NOT a timeout)

```
1.5G	Downloads
21M	Pictures
137G	data_rein
811M	noelle
298M	DATA
27M	tulpas
858M	context
2.0G	data_rein-dsh-foundation
313M	data_rein-migration-backups
34G	bak-omarchy
1.5G	data_rein-discovery-001
18M	data-oby
[Permission denied] lost+found
2.0G	deepseek-harness-reference-b150a551-20260823
179G	total
```

## Apparent-size distribution

Command: `timeout 900 du -x -h --max-depth=1 --apparent-size "$H"` — exit status 1 (same expected lost+found denial)

```
1.5G	Downloads
21M	Pictures
136G	data_rein
811M	noelle
298M	DATA
26M	tulpas
855M	context
1.9G	data_rein-dsh-foundation
313M	data_rein-migration-backups
34G	bak-omarchy
1.4G	data_rein-discovery-001
18M	data-oby
[Permission denied] lost+found
1.7G	deepseek-harness-reference-b150a551-20260823
178G	total
```

## Notes

- `data_rein` is the dominant tree (137G of 179G total).
- `bak-omarchy` (34G) is a large legacy config/system backup candidate.
- Allocated vs apparent sizes are close for every top-level entry — no gross sparse-file signal at top level.
- `lost+found` is root-owned, permission-denied (expected); not escalated. Contains no readable evidence.
- No HDD content was read beyond metadata for this artifact; file names/sizes only.
