# Final Deterministic Validation Provenance

Validation was rerun against the final post-fix working tree identified in `11-final-snapshot-provenance.md`.

Raw combined command output is preserved as `artifact://65` and `artifact://66`.

Observed results:

- Focused governance/V2/adversarial tests: **40/40 PASS**.
- `npm test`: **781/781 PASS**.
- `bin/kad doctor`: **PASS**.
- `bin/workctl doctor`: **PASS**.
- `bin/workctl skills doctor`: healthy; existing skill `LOCAL_DELTA` warnings only.
- `bin/kad-isa check all`: PASS (aesthetic 10/10; compute fabric 12/12).
- `bin/kad-wiki lint`: PASS.
- `bin/kad-intent validate`: PASS.
- `bin/kad-intent verify-report`: PASS; alignment report 100% verified.
- `bin/kad-telemetry validate`: **37/37 valid**.
- `git diff --check`: PASS.

No implementation changes were made to obtain a green result during this validation phase. The known integration test diagnostic `INJECTED_PON_RULE_ERROR` is expected test-fixture output; the suite still reported 781/781 passing.
