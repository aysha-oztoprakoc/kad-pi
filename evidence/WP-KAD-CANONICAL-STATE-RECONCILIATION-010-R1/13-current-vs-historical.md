# Current vs Historical Knowledge Audit

## Temporal and Authority Separation Policy

To prevent context poisoning and epistemic drift, all architecture and governance notes strictly classify their temporal and authority state:

```text
CURRENT: Actively binding, verified doctrine and live architectural contracts.
HISTORICAL: Past milestones, predecessor dossiers, and historical evolution records (context-eligible only when specifically requested).
SUPERSEDED: Deprecated designs, replaced policies, or retired prototypes (excluded from normal agent context).
PROPOSED: Unapproved proposals or draft workpackages under review (quarantined in 80_Review/).
EXPERIMENTAL: Exploratory prototypes and scratchpads (confined to kad-lab / tries).
UNKNOWN: Unclassified material (never context-eligible or training-eligible).
```

---

## Audit Findings by Domain

### 1. Multi-Agent & Harness Architecture
- **CURRENT**: KAD-PI governed local swarm (`tools/kad/swarm.mjs`), OMP native extension bridge (`tools/kad/telemetry/omp-usage-adapter.mjs`), pinned Fusion harness adapter (`tools/kad/fusion/`), and Workctl claim lifecycle (`tools/workspace/workctl.mjs`).
- **HISTORICAL**: DeepSeek Harness Lab research (`tries/deepseek-harness-lab`), early Pi tracer experiments (`kad-lab/exp-003-pi-tracer`).
- **SUPERSEDED / QUARANTINED**: Odysseus agent runtime (`amdy-HDD/data_rein/odysseus/`), monolithic Python agent runners.

### 2. Economic Routing & Quotas
- **CURRENT**: Side-effect-free shadow economic evaluator (`tools/kad/telemetry/economic-shadow.mjs`), normalized quota telemetry schema `kad-telemetry-v1`, append-only counterfactual observatory journal (`tools/kad/telemetry/observatory.mjs`).
- **SUPERSEDED**: Hardcoded list prices, unverified model provider percentages, automatic PAYG spend authorization.

### 3. Knowledge Plane & Obsidian Librarian
- **CURRENT**: Governed canonical Obsidian vault (`vault/`), stable `kad_id`, flat typed properties, target-bound proposal receipts (`80_Review/Receipts/`), and verified 5-source research seed plane (`tools/kad/research.mjs`).
- **SUPERSEDED**: Free-form legacy wiki editing (`wiki/`), un-governed synthetic fixtures (`wiki/synthetic/`), un-reviewed manual Markdown drops.

### 4. Desktop Environment & Shell Integration
- **CURRENT**: Omarchy 4.0.1-1 Quattro desktop with Quickshell 0.3.1, `technopagan-netrunner` cyberdeck suite, and `data_workspace` M908 input keypad mapping plugin.
- **HISTORICAL / ARCHIVED**: Legacy `bak-omarchy` backups on external HDD.
