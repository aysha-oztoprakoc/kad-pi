# 0001. Notification-Oriented Causality over Polling

## Status
Accepted

## Context
Traditional agent and state architectures rely on continuous polling loops or untyped broadcast events to detect state mutations. In large simulation environments and agent networks, continuous polling wastes compute, creates nondeterministic race conditions, and obscures causal provenance.

## Decision
We adopt the Notification-Oriented Paradigm (PON) as the foundational causal activation mechanism:
1. Fact changes immediately notify only their causally affected premises.
2. Premise evaluation selectively triggers condition evaluation.
3. Rules fire only when guarding conditions become satisfied.
4. Rules emit pure, typed `ActionIntent` data payloads rather than executing ambient side-effects.
5. All polling loops across reactive components are strictly prohibited.
