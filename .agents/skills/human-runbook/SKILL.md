---
name: human-runbook
description: Interactive bash wizard generator for procedures only a human can perform (secrets, cloud logins, hardware provisioning).
class: CAPABILITY_FRONTEND
version: 1.0.0
triggers:
  - human runbook
  - wizard
  - manual setup
  - provision secrets
tools:
  - write
  - edit
  - ask
  - bash
disposition: KEEP
---

# `human-runbook` — Interactive Human Procedure Generator

Generates interactive Bash wizard scripts that guide a human operator through steps only a human can perform (OAuth setups, cloud credentials, hardware provisioning).

## Runbook Structure
1. **Prerequisite Check**: Validate that required tools (`curl`, `gh`, `op`) exist on the host.
2. **Step-by-Step Prompts**: Present concise instructions, prompt for required secrets, and validate inputs.
3. **Validation Probe**: Verify that the provisioning succeeded with a deterministic dry-run check.
