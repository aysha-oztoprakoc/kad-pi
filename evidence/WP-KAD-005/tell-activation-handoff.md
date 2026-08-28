# TELL activation handoff

Status: `TELL_UNAVAILABLE`.

- Observed hostname/address: `tell` resolved to `192.168.0.4`.
- Attempt: `ssh -o BatchMode=yes -o ConnectTimeout=5 tell ...`.
- Result: `Permission denied (publickey,password,keyboard-interactive)`.
- No unchanged retry and no remote mutation.

After credentials exist, safe read-only command:

```bash
ssh tell 'hostname; uname -a; lscpu; free -h; lspci | grep -Ei "vga|3d|display"; nvidia-smi 2>/dev/null || true; ss -lntup'
```

Required contract: localhost/trusted-LAN authenticated OpenAI-compatible endpoint; health endpoint; declared `retrieval` capabilities only after deterministic extraction/retrieval tests; capability teardown on endpoint loss. Required tests: inventory provenance, health, routing, failure disappearance, no authority escalation, and regression suite.
