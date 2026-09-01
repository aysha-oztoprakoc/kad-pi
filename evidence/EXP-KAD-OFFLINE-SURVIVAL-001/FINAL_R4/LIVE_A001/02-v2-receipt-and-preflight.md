# LIVE_A001-02 V2 Receipt and Preflight

Receipt schema: `HUMAN_AUTHORIZATION_RECEIPT_V2`
Receipt ID: `har-v2-exp-offline-survival-r4-a001-live-001`
Receipt SHA-256: `sha256:04a5e17e3a6dff88460bf13522ab973d8c8c6eaa7cf0626deec6942a3ca939aa`
Receipt validation: `valid=true`

Actual privileged actuator: `actor.project_lead`.
Orchestrator: `role.kad-builder`.
Redelegation: forbidden.

Fresh preflight request:

```text
evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R4/LIVE_A001/02-preflight-request.json
```

Preflight request hash: `sha256:a9ae63b90a4fc3b9663b6aec123600fe2d2f915858c9fb1d07859559e826221d`
Decision: `ALLOW`
Authority: `HUMAN_PREAUTHORIZED`
Reason: `AUTHORIZED_BY_HUMAN_RECEIPT`
Missing requirements: `none`
Decision hash: `sha256:ad5db9080c218419a60905e53a62f4d2361bb348c6fe4c76d7dc20fa088dbeaf`
Decision expiry: `2026-08-31T17:21:22.210Z`

The revised authorization scope uses a 60-second rollback-guard delay and 30-second observation window.
