# R1 preflight and stop record

The human receipt was generated and independently verified:

```text
receipt_id: har-exp-kad-offline-survival-001-r1
workpackage_id: EXP-KAD-OFFLINE-SURVIVAL-001-R1
operation_class: INFRASTRUCTURE_MUTATION
receipt_hash: sha256:890044174cf6eb357af6fbc55045eb483349c0cc6893503ddf3a8f74068d8aa9
verify-receipt: valid=true
```

The bound governance preflight returned `ALLOW` with reason `AUTHORIZED_BY_HUMAN_RECEIPT` and decision hash:

```text
sha256:44cf033e694578de9ade784220f33894ea560d525c20202353aeecbc1d1f2e0b
```

R1 nevertheless stopped before harness arming. The authorized route action requires privileged `/usr/bin/ip`; the current non-interactive sudo policy does not authorize `/usr/bin/ip`, and no local watchdog could execute restoration independently. No password prompt was initiated. No network mutation occurred.

Classification: `EXPERIMENT_SETUP_FAILURE`, severity P2. This is not evidence of an offline KAD failure and does not invalidate attempt 0.
