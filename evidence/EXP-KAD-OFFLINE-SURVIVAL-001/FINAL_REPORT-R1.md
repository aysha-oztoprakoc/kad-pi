# EXP-KAD-OFFLINE-SURVIVAL-001-R1 — Continuation Report

## Verdict

**BLOCKED.** R1 did not enter the offline phase. The original attempt 0 evidence remains intact and continues to record its earlier governance block.

## What changed from attempt 0

A specific human decision authorized only:

- host AMDY, interface `enp7s0`;
- deletion of IPv4 default route `192.168.0.1`;
- restoration of that exact route;
- intended outage maximum 90 seconds;
- local 120-second automatic restoration watchdog;
- preservation of LAN `192.168.0.0/24` and localhost;
- no persistent network, service, credential, policy, or unrelated project mutation.

The resulting `HUMAN_AUTHORIZATION_RECEIPT_V1` verified successfully. The bound infrastructure preflight returned `ALLOW`.

An experiment-only workctl item was imported and claimed with writable scope limited to this evidence directory. Its base commit was `15483b6c87757358ab046d50d94498c9fdfb1ebe`.

## Stop condition

Read-only host inspection found no alternative IPv4/IPv6 default route, VPN/WireGuard interface, or proxy environment. However, execution of the exact route mutation requires privileged `/usr/bin/ip`. The current non-interactive sudo policy does not grant `/usr/bin/ip`; it grants passwordless access only to `/usr/bin/asdcontrol`. No local privileged watchdog could therefore guarantee restoration without an interactive password or an unapproved privilege change.

The harness was not armed, the default route was not deleted, and no network mutation occurred. This satisfies the fail-safe restoration hard precondition.

## Capability status

All offline capabilities remain `NOT_TESTED`. The only newly verified controls are:

- exact fault method selected and bounded;
- no alternate egress observed at inspection time;
- scoped human receipt integrity verified;
- governance preflight accepted the receipt;
- workctl experiment scope was created and claimed;
- restoration precondition correctly prevented unsafe execution.

No PASS, PARTIAL, or FAIL claim about offline survival is justified.

## Classification

`EXPERIMENT_SETUP_FAILURE`, severity P2: authorized operation cannot be executed with a locally independently restorable privilege path. No architectural offline defect was observed. No successor workpackage is started.
## Independent verification

Independent review returned `ACCEPT_EVIDENCE`; see `independent-review-r1.md`.

The reviewer retained three audit findings: the receipt actor (`actor.project_lead`) differs from the claim actor label (`actor.experiment-lead`); the ticket path has a trailing slash while the normalized claim path does not; and claim release occurred 50.16 seconds after the receipt expiry. No mutation occurred after expiry, but a future rerun must align actor identity, normalized scope, and receipt validity across the complete claim lifecycle.

These findings do not change the `BLOCKED` verdict. They prevent this run from being treated as a clean authorization precedent.


## Evidence

See `human-authorization-receipt-r1.json`, `r1-fault-method-inspection.md`, `r1-infrastructure-preflight.json`, `r1-preflight-and-stop.md`, `r1-ticket.json`, and the preserved attempt 0 files in this directory.
