# ISA Validation Architecture - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Safety & Security Invariant: Allowlisted Validator Registry
Per Section 10 of the WP-015 directive, the Ideal State Artifact (ISA) **MUST NOT** store or execute arbitrary shell commands embedded in Markdown.

Instead, the ISA uses an **allowlisted deterministic validator registry**:

```text
ISA Claim (Markdown)
       ↓
validator: aesthetic.tokens.no_unregistered_hex
       ↓
Validator Registry (tools/kad/isa.mjs)
       ↓
Deterministic Audited JavaScript Validator Function
       ↓
Structured Result { pass: boolean, evidence: string, checked_items: number }
```

---

## 2. Validator Registry Catalog

| Validator ID | Class | Target Surface / Files | Description & Invariant |
|---|---|---|---|
| `aesthetic.assets.local_only` | `DETERMINISTIC` | `site/`, `dashboard/`, `interface/` | Scans all HTML/JS/CSS files to verify zero external CDN, font, or script URLs (`http://`, `https://`, `fonts.googleapis.com`). |
| `aesthetic.tokens.no_unregistered_hex` | `DETERMINISTIC` | `interface/`, `site/` | Scans stylesheets to verify all colors use registered semantic `--var` tokens without arbitrary unmapped hex codes. |
| `aesthetic.contrast.text_readability` | `DETERMINISTIC` | `interface/tokens.css` | Verifies contrast ratio between `--paper` / `--cyan` text tokens and `--ink` / `--ink-panel` surfaces exceeds WCAG AAA (14:1). |
| `aesthetic.motion.no_ambient_loop` | `DETERMINISTIC` | `interface/`, `dashboard/`, `site/` | Verifies that infinite animation loops (`infinite` keyframes) are absent from core stylesheets. |
| `aesthetic.sound.no_audio_ui` | `DETERMINISTIC` | `interface/`, `dashboard/`, `site/` | Verifies zero `<audio>` elements, Web Audio API calls, or audio file imports (`.mp3`, `.wav`, `.ogg`). |
| `aesthetic.accessibility.skip_link_and_focus` | `DETERMINISTIC` | `interface/foundation.css`, `site/` | Verifies presence of `.skip-link` and `:focus-visible` focus ring definitions across all views. |
| `aesthetic.governance.zero_shell_mutation` | `DETERMINISTIC` | `technopagan-netrunner/`, `data_workspace/` | Verifies that desktop shell widgets cannot directly execute mutating canonical commands. |
| `aesthetic.identity.cyberpunk_2077_terminal` | `HUMAN_REVIEW` | AMDY / Sofia / Site | Validates subjective aesthetic coherence to Cyberpunk 2077 terminal + Occult clinical bureaucracy baseline. |
| `aesthetic.stratification.two_tier_balance` | `HUMAN_REVIEW` | Public Site / Docs | Validates that public literature remains clean and free of unexplained fictional lore jargon. |

---

## 3. CLI Interface (`bin/kad-isa`)
The tool provides 4 core commands:
- **`bin/kad-isa lint <file>`**: Validates markdown frontmatter, section structure, claim schemas, and validator IDs.
- **`bin/kad-isa check <file>`**: Executes all deterministic validators and outputs a structured execution report.
- **`bin/kad-isa status <file>`**: Emits high-level summary counts (`PASS`, `FAIL`, `HUMAN_REVIEW`, `UNKNOWN`).
- **`bin/kad-isa explain <claim-id>`**: Outputs full rationale, source human decision, validator ID, and remediation instructions.
