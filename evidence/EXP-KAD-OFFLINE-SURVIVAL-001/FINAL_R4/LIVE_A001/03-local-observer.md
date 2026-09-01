# LIVE_A001-03 Local Observer

Observer unit: `kad-offline-survival-r4-a001-live-observer.service`
Ownership: user-owned transient systemd service; no root privilege.
Invocation ID: `9326a77820b74acbb2a4b5d9da0d9f3b`
Output: `evidence/EXP-KAD-OFFLINE-SURVIVAL-001/FINAL_R4/LIVE_A001/observer.log`
Configured duration: `90 seconds`; interval: `5 seconds`.

The observer runs independently of the chat/model and records timestamped route, interface, address, localhost/KoboldCpp, LAN, external, KAD, workctl, OMP process, Pi, and telemetry results. Its 6-second healthy-state dry run passed and terminated predictably.

The observer is longer than the authorized 30-second offline observation window so it can capture pre-mutation, mutation, and rollback states without relying on external connectivity.
