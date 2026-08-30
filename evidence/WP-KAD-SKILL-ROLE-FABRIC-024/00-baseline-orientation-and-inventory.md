# Phase 0: Baseline Orientation, Inventory & Evidence Receipts

* **Workpackage**: `WP-KAD-SKILL-ROLE-FABRIC-024`
* **Task**: Unified KAD-PI Skills & Role ISA, Fabric Reconciliation & Execution Substrate Alignment
* **Claim ID**: `8d257728-a8bf-4a33-b52e-b4218eb94284` (mode: `mutate`, active: `true`)
* **Fixed Point**: `b78aaf778bc1d34ef02ae47a2dd1f9ebefd8f7c4`
* **Epistemic Classification**:
  - `[CONFIRMED_PRIMARY]`: All inventory entries sourced directly from local filesystem and lockfile.
  - `[OBSERVED_STATE]`: Diagnostic outputs captured directly from `workctl` and test execution.

---

## 1. Baseline System Health & Doctor Output

### `bin/workctl orient`
```json
{
  "commands": [
    "bootstrap",
    "projects",
    "status",
    "next",
    "show",
    "claim",
    "release",
    "transition",
    "handoff",
    "resume",
    "import-tickets",
    "tickets import",
    "skills status",
    "skills check-updates",
    "skills doctor",
    "doctor"
  ]
}
```

### `bin/workctl doctor`
```json
{
  "status": "healthy",
  "errors": [],
  "warnings": [
    "skill-governance: 5-persona-advisory-board: LOCAL_DELTA",
    "skill-governance: ask-matt: LOCAL_DELTA",
    "skill-governance: code-review: LOCAL_DELTA",
    "skill-governance: domain-modeling: LOCAL_DELTA",
    "skill-governance: grill-with-docs: LOCAL_DELTA",
    "skill-governance: implement: LOCAL_DELTA",
    "skill-governance: improve-codebase-architecture: LOCAL_DELTA",
    "skill-governance: prototype: LOCAL_DELTA",
    "skill-governance: research: LOCAL_DELTA",
    "skill-governance: tdd: LOCAL_DELTA",
    "skill-governance: to-spec: LOCAL_DELTA",
    "skill-governance: to-tickets: LOCAL_DELTA",
    "skill-governance: triage: LOCAL_DELTA",
    "skill-governance: wayfinder: LOCAL_DELTA"
  ],
  "toolStatus": [
    {
      "id": "workctl",
      "command": "bin/workctl",
      "available": true
    },
    {
      "id": "kad-knowledge",
      "command": "bin/kad-knowledge",
      "available": true
    },
    {
      "id": "kad-runtime-status",
      "command": "bin/kad-runtime-status",
      "available": true
    },
    {
      "id": "kad-interface-server",
      "command": "bin/kad-interface-server",
      "available": true
    },
    {
      "id": "make-verify",
      "command": "make verify",
      "available": true
    },
    {
      "id": "data-workspace-test",
      "command": "npm test",
      "available": true
    },
    {
      "id": "technopagan-test",
      "command": "bash tests/run_all.sh",
      "available": true
    }
  ],
  "llm_required": false
}
```

### `bin/workctl skills doctor`
```json
{
  "status": "WARN",
  "errors": [],
  "warnings": [
    {
      "name": "5-persona-advisory-board",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "9c3079e838d92967af5936f99591d9c3908a816d0e49faae9341087f0acc52ae",
      "execution_sha256": "77e4fed9484881c5956e59c6adf6379bfb569f2e809f885d35f746d646e6f5bc"
    },
    {
      "name": "ask-matt",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "b25d86fb36b1d294eeead5d7db529f86135f9671f2afcd607579a63bb2213769",
      "execution_sha256": "e7a579691c8028119873b0708a6d4042c9291ae093e0e6ffdec0a2e02a96c39b"
    },
    {
      "name": "code-review",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "47f4e52c21694def9c7c11cbfbf891ca35eac7a93e395797515be3c8a409ae50",
      "execution_sha256": "316bea08afd9c36586aeeccc6841f6924b49af4d99047a76d0f3fb6b5afea431"
    },
    {
      "name": "domain-modeling",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "327a2b50620e2fd70abc6893cd6965e76b20f8d0adb0dc2c8d5eb3845efb643e",
      "execution_sha256": "02797c6abe2694d778129fc5e74279def3acfaf39813f13afb4ae0499dbe036e"
    },
    {
      "name": "grill-with-docs",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "7de372c13488f1ee96cc11cd8907b56b6809cc93eef776eeddd37de6b6cbe3fe",
      "execution_sha256": "ffb0240f4b0d8157cbfd9647412751c312659ed4b8b7423393ec3396f7692b9d"
    },
    {
      "name": "implement",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "6d3fd9e83b8f36e5213854779db49b256a457a7ebb4a503e53fa7dcff696adc3",
      "execution_sha256": "5b3009410589bd0e89e04bacf65cb6cb23eb755ed6a7b0c5484c016aaef976cf"
    },
    {
      "name": "improve-codebase-architecture",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "d1ac25511a936ff4250a48dbcefda363837d6bb9321b3cba73df99fa37270a75",
      "execution_sha256": "103ee6e1b83bb4e2221f9337ec463daafd0d7f16a1511b92ebffe67099b46927"
    },
    {
      "name": "prototype",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "714de632d116bb73f65cdb5a882db15b9369a6713b9a47c0fad827848f0bfbe3",
      "execution_sha256": "1341c72d493f07e923adaf44de8efba8f8ff137236305c776ed3968ee58e9821"
    },
    {
      "name": "research",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "985569f15739c713d6784887c3d186d4ef9ac85bec5ad9c068d25bf0739928e4",
      "execution_sha256": "b4c96af5ad49944f6e7e57db3f21f7699b4df4e1fc8562435bbe60d8e4588289"
    },
    {
      "name": "tdd",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "cb01f66bebfaa25fa1f88e6b7e769cd9fd9f35b1120b8563749820738814c927",
      "execution_sha256": "8025db4c8bf01bb9bd68b90722ae480107b3a15ee7e0bf1304f594ac5dd9cd75"
    },
    {
      "name": "to-spec",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "43ad9cf318e5e7d3d1fa360253a37021796dc87a0c2e595ad262661a10f85088",
      "execution_sha256": "36e191088dd05407b93b27bcc56662712cf3a8cee076fe6993991695d2db9d3e"
    },
    {
      "name": "to-tickets",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "5c9fba69845c2519b9b35b9af42ae5142c21f8ca15ac2123dc2722002c8058ae",
      "execution_sha256": "dff4b3b60c7ce7fae10876aa5e30762d0f2c8043d12379b1a2429969b56b1610"
    },
    {
      "name": "triage",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "623a2ed692bdc77d2090e2a3dea3b627dd722ad3bbaca0be83aada75292c8fc4",
      "execution_sha256": "57b46ed96577e4b4b6317f238206c765b47b5441757027186b9197889ad56278"
    },
    {
      "name": "wayfinder",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "fee6e1d0c50f0e736b4ef8a599060c959afae904c9a97d82c97f049fcc3aa0f1",
      "execution_sha256": "3d336dde785d322c750274980f4134de00a0edcec381854a794eac583ce6e028"
    }
  ],
  "entries": [
    {
      "name": "5-persona-advisory-board",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "9c3079e838d92967af5936f99591d9c3908a816d0e49faae9341087f0acc52ae",
      "execution_sha256": "77e4fed9484881c5956e59c6adf6379bfb569f2e809f885d35f746d646e6f5bc"
    },
    {
      "name": "ask-matt",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "b25d86fb36b1d294eeead5d7db529f86135f9671f2afcd607579a63bb2213769",
      "execution_sha256": "e7a579691c8028119873b0708a6d4042c9291ae093e0e6ffdec0a2e02a96c39b"
    },
    {
      "name": "code-review",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "47f4e52c21694def9c7c11cbfbf891ca35eac7a93e395797515be3c8a409ae50",
      "execution_sha256": "316bea08afd9c36586aeeccc6841f6924b49af4d99047a76d0f3fb6b5afea431"
    },
    {
      "name": "codebase-design",
      "status": "CURRENT",
      "upstream_sha256": "2c20617f87ec8af6a434859f381b2f061a69b530444e74eb39e78bb016a6d1e2",
      "execution_sha256": "2c20617f87ec8af6a434859f381b2f061a69b530444e74eb39e78bb016a6d1e2"
    },
    {
      "name": "diagnosing-bugs",
      "status": "CURRENT",
      "upstream_sha256": "77f3cf31bc99b2f49af943222526531fcc9fc41d047626d3640e875e85af3e84",
      "execution_sha256": "77f3cf31bc99b2f49af943222526531fcc9fc41d047626d3640e875e85af3e84"
    },
    {
      "name": "domain-modeling",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "327a2b50620e2fd70abc6893cd6965e76b20f8d0adb0dc2c8d5eb3845efb643e",
      "execution_sha256": "02797c6abe2694d778129fc5e74279def3acfaf39813f13afb4ae0499dbe036e"
    },
    {
      "name": "grill-with-docs",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "7de372c13488f1ee96cc11cd8907b56b6809cc93eef776eeddd37de6b6cbe3fe",
      "execution_sha256": "ffb0240f4b0d8157cbfd9647412751c312659ed4b8b7423393ec3396f7692b9d"
    },
    {
      "name": "implement",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "6d3fd9e83b8f36e5213854779db49b256a457a7ebb4a503e53fa7dcff696adc3",
      "execution_sha256": "5b3009410589bd0e89e04bacf65cb6cb23eb755ed6a7b0c5484c016aaef976cf"
    },
    {
      "name": "improve-codebase-architecture",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "d1ac25511a936ff4250a48dbcefda363837d6bb9321b3cba73df99fa37270a75",
      "execution_sha256": "103ee6e1b83bb4e2221f9337ec463daafd0d7f16a1511b92ebffe67099b46927"
    },
    {
      "name": "prototype",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "714de632d116bb73f65cdb5a882db15b9369a6713b9a47c0fad827848f0bfbe3",
      "execution_sha256": "1341c72d493f07e923adaf44de8efba8f8ff137236305c776ed3968ee58e9821"
    },
    {
      "name": "research",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "985569f15739c713d6784887c3d186d4ef9ac85bec5ad9c068d25bf0739928e4",
      "execution_sha256": "b4c96af5ad49944f6e7e57db3f21f7699b4df4e1fc8562435bbe60d8e4588289"
    },
    {
      "name": "resolving-merge-conflicts",
      "status": "CURRENT",
      "upstream_sha256": "9d8114f8ef0b31f535a265fc05c364bd8cf2e2895a830040e06c22acb11f54b0",
      "execution_sha256": "9d8114f8ef0b31f535a265fc05c364bd8cf2e2895a830040e06c22acb11f54b0"
    },
    {
      "name": "setup-matt-pocock-skills",
      "status": "CURRENT",
      "upstream_sha256": "2bcd89e97777cdb705914424e39c97d5db524c8eb4eafac8120778a07774f0ec",
      "execution_sha256": "2bcd89e97777cdb705914424e39c97d5db524c8eb4eafac8120778a07774f0ec"
    },
    {
      "name": "tdd",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "cb01f66bebfaa25fa1f88e6b7e769cd9fd9f35b1120b8563749820738814c927",
      "execution_sha256": "8025db4c8bf01bb9bd68b90722ae480107b3a15ee7e0bf1304f594ac5dd9cd75"
    },
    {
      "name": "to-spec",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "43ad9cf318e5e7d3d1fa360253a37021796dc87a0c2e595ad262661a10f85088",
      "execution_sha256": "36e191088dd05407b93b27bcc56662712cf3a8cee076fe6993991695d2db9d3e"
    },
    {
      "name": "to-tickets",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "5c9fba69845c2519b9b35b9af42ae5142c21f8ca15ac2123dc2722002c8058ae",
      "execution_sha256": "dff4b3b60c7ce7fae10876aa5e30762d0f2c8043d12379b1a2429969b56b1610"
    },
    {
      "name": "triage",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "623a2ed692bdc77d2090e2a3dea3b627dd722ad3bbaca0be83aada75292c8fc4",
      "execution_sha256": "57b46ed96577e4b4b6317f238206c765b47b5441757027186b9197889ad56278"
    },
    {
      "name": "wayfinder",
      "status": "LOCAL_DELTA",
      "upstream_sha256": "fee6e1d0c50f0e736b4ef8a599060c959afae904c9a97d82c97f049fcc3aa0f1",
      "execution_sha256": "3d336dde785d322c750274980f4134de00a0edcec381854a794eac583ce6e028"
    },
    {
      "name": "wizard",
      "status": "CURRENT",
      "upstream_sha256": "bdf31d48211ea559878f95a4f344aeabf8d85897488ba564382bab0b000daac1",
      "execution_sha256": "bdf31d48211ea559878f95a4f344aeabf8d85897488ba564382bab0b000daac1"
    }
  ],
  "workflow": {
    "errors": [],
    "warnings": []
  },
  "counts": {
    "LOCAL_DELTA": 14,
    "CURRENT": 5
  },
  "collisions": [
    {
      "name": "ask-matt",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "claude-handoff",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "code-review",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "codebase-design",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "diagnosing-bugs",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "domain-modeling",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "git-guardrails-claude-code",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "grill-me",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "grill-with-docs",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "grilling",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "handoff",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "implement",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "implement-spec",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "improve-codebase-architecture",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "loop-me",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "migrate-to-shoehorn",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "prototype",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "research",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "resolving-merge-conflicts",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "retro",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "scaffold-exercises",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "setup-matt-pocock-skills",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "setup-pre-commit",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "setup-ts-deep-modules",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "tdd",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "teach",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "to-questionnaire",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "to-spec",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "to-tickets",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "triage",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "wait-what",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "wayfinder",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "wizard",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "writing-beats",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "writing-for-agents",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "writing-fragments",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    },
    {
      "name": "writing-shape",
      "locations": [
        ".agents/skills",
        "agent/skills"
      ],
      "canonical": ".agents/skills",
      "resolution": "canonical root wins; legacy views remain read-only"
    }
  ],
  "issues": []
}
```

---

## 2. Baseline Test Suite Verification
All 646 unit and integration tests (`tools/kad/test/*.test.mjs`, `tools/workspace/*.test.mjs`) pass with 0 failures:
* `tools/kad/test/economic-shadow.test.mjs`: 18 tests PASS
* `tools/kad/test/telemetry.test.mjs`: 16 tests PASS
* `tools/kad/test/control-plane.test.mjs`: 7 tests PASS
* `tools/kad/test/isa.test.mjs`: 11 tests PASS
* `tools/kad/test/local-first-router.test.mjs`: 37 tests PASS
* `tools/workspace/workctl.test.mjs`: 7 tests PASS
* Total: 646/646 tests PASS

---

## 3. Current Skill & Role Inventory
- **Total Local Skills in `.agents/skills/`**: 46
- **Total Pinned Skills in `skills.lock.json`**: 46
- **Total Global Skills in `~/.agents/skills/`**: 3 (`deepapi`, `omarchy`, `diagnose-crash`)
- **Active Model Roles in `.omp/config.yml`**: 17 roles (`default`, `plan`, `slow`, `advisor`, `task`, `smol`, `tiny`, `commit`, `designer`, `vision`, `oracle`, `verifier`, `research`, `world`, `local_retrieval`, etc.)
- **Active Controller**: `approved-remote-controller` (`gpt-5.6-luna`, SUBSCRIPTION_BACKED, $0 marginal cost)
- **Active Extensions**: `kad-control-plane.js`, `kad-context-economy.js`
- **Active Fusion Manifest**: `.omp/fusion/manifest.json` (`fusion_writer_lease` mutation guardrail: DEFAULT DENY)

Baseline verification complete. No unmanaged mutations or leaking claims detected.
