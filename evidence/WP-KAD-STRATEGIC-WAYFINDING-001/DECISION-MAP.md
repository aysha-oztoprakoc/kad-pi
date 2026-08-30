# KAD-PI Strategic Decision Map

Status: initial map before human direction answers. This is a decision landscape, not implementation authorization.

## Destination

Choose and sequence the next bounded KAD-PI workpackages across research, engineering, and interface tracks, ending with exactly one recommended next implementation workpackage plus two bounded alternatives. Human direction remains authoritative.

## Foundational

- Authority/evidence policy — existing and non-negotiable; **enables all**, cannot be weakened.
- Context economy and deterministic-first routing — existing partial implementation; **enables** bounded work and token accounting.
- Shared model store and lifecycle ownership — existing partial substrate; **enables** local qualification and swarm work; runtime cutover remains external/partial.
- Deterministic Librarian and source artifacts — existing fallback and authority support; **blocks semantic retrieval from becoming the sole path**.

## Infrastructure

- KnowledgePlane contract — accepted architectural boundary, not yet a complete KAD adapter contract; **blocks** governed adapter integration and is the clearest evidence-named seam.
- OpenViking adapter integration — experimental and dependent on the KAD contract, provenance, stale-state, and failure gates; high-risk if treated as authority.
- Governed ingestion/memory acceptance — dependent on provenance and acceptance-state contracts; high-leverage but must remain deterministic-first.
- Bounded context compiler — dependent on identity/role/capability/trust/authority/task/resource filters; enables agents receiving authorized context only.
- Needle qualification — dependent on frozen KAD fixtures, deterministic validation, confidence policy, and safe escalation; currently blocked by uncalibrated confidence.
- Local model qualification/runtime cutover — independent bounded track; Stheno external cutover and Qwen availability are current blockers.
- Typed dashboard backend/API — likely dependent on stable KAD status/evidence contracts; otherwise risks inventing a second authority surface.
- OMP/Pi orchestration — existing seams and partial local swarm; improvements should follow measured bottlenecks, not assumed sophistication.
- PON/STC learning loops — research/engineering track; requires accepted traces and testable hypotheses before adaptive mutation.

## Interface

- Wiki — existing human-visible projection and static knowledge artifacts; governed projection depends on provenance and acceptance state.
- Operational dashboard — independent presentation only after operational contracts are stable; daily utility is unknown.
- Public website — separate audience/product from operations; no evidence that it is the current bottleneck.
- GitHub/documentation experience — contributor/public audience; should not be conflated with an operational dashboard.

## Research

- PON/STC implementation paradigms and evaluation hypotheses.
- Local swarm qualification and token economics.
- Synthetic-world / Project-SID-style experiments.
- Research methodology and reproducible experiment infrastructure.

## Candidate directions (A–N)

| ID | Direction | Initial classification | Dependencies / concern |
|---|---|---|---|
| A | Finish KnowledgePlane + wiki integration | High-leverage, evidence-aligned | Contract, provenance, fallback, and trust gates first |
| B | Redesign GitHub/docs/public website | Independent, presentation-oriented | Audience and success criteria unknown |
| C | Build operational KAD dashboard | High-risk before contracts; interface | Needs stable status/evidence contracts and a defined daily user |
| D | Build typed dashboard backend/API | Infrastructure candidate | Should not become a second authority plane; API contract unknown |
| E | Qualify local model swarm | Bounded research/engineering | Requires runtime availability, resource measurements, validators |
| F | Complete OpenViking integration | Dependent/high-risk experiment | Must sit behind KnowledgePlane and degrade to Librarian |
| G | Qualify Needle as KAD specialist | Bounded/high-leverage experiment | Confidence calibration and malformed/ambiguous fixtures required |
| H | Improve OMP/Pi orchestration | Potentially high leverage | Need measured failure/latency/token bottleneck to avoid duplicate abstractions |
| I | Stronger PON/STC learning loops | Research/high-risk | Accepted evidence only; model proposes, deterministic policy authorizes |
| J | Synthetic-world experimentation | Research/independent | Useful only with concrete hypothesis and evidence target |
| K | Research methodology/experiment infrastructure | High leverage for scientific claims | Must solve a named reproducibility bottleneck, not add process weight |
| L | Token economics/provider routing | Existing partial capability | Further change requires observed quota/cost bottleneck; no PAYG widening |
| M | Security/authority hardening | Foundational/high-leverage | Always eligible when a concrete boundary gap is evidenced |
| N | Repository-derived alternative | Open | May emerge from human answers or new evidence |

## Dependency topology

```text
stable authority/evidence contracts
  ├── KnowledgePlane contract
  │     ├── governed OpenViking adapter
  │     ├── bounded context compiler
  │     ├── memory acceptance
  │     └── provenance-preserving wiki projection
  ├── typed operational status contracts
  │     └── dashboard/API (if daily utility is confirmed)
  ├── frozen qualification fixtures + validators
  │     ├── Needle qualification
  │     └── local model/swarm qualification
  └── accepted traces + metrics
        ├── PON/STC evaluation
        ├── learning-loop candidates
        └── token-routing improvements
```

## Blocks / enables / independent / optional / risk / leverage

- **Blocks others:** authority policy, evidence gates, KnowledgePlane contract, provenance and acceptance semantics, concrete operational status contracts.
- **Enables others:** deterministic Librarian, context economy, shared model store, lifecycle seams, bounded validators, accepted evidence receipts.
- **Independent bounded tracks:** local model qualification, Needle qualification, methodology probes, synthetic-world experiments, public documentation redesign.
- **Optional until human demand is established:** dashboard, website, GitHub redesign, richer semantic features, additional model downloads.
- **High risk:** autonomous learning/policy evolution, architecture mutation, unbounded ingestion, new framework/services, dashboard-first work, treating OpenViking/Needle inference as authority.
- **High leverage:** close the KAD contract seam, preserve deterministic fallback, qualify one specialist with measured evidence, and define the daily user outcome.

## Deferred questions

1. Exact work allocation and ceilings across the three bounded tracks.
2. First OpenViking and Needle operations after the contract is implemented.
3. Long-term dashboard status schema and public-site information architecture.
4. Whether stronger prompt/routing adaptation or distillation should later be authorized.
5. Longer-term synthetic-world and Project-SID-style research sequence.

## Decisions so far

- **Human identity:** multi-purpose research platform, daily workstation, local swarm/engineering harness, and knowledge/research assistant; public/academic project is secondary.
- **Operating model:** human review plus ChatGPT web advisory/review/steering plus OMP automation using approved model lanes.
- **Sequencing:** three parallel bounded tracks; foundation precedes user-facing delivery.
- **Near-term knowledge target:** governed wiki projection and deterministic cited project-knowledge command.
- **Experimental scope:** contract first, then independent sequential OpenViking and Needle adapter slices.
- **Research priorities:** STC lifecycle/recovery, PON notification/token selectivity, and local-first routing/escalation.
- **Boundaries:** no autonomous authority/policy mutation, no new paid APIs/PAYG, no new framework/distributed architecture, no dashboard-first build, no public website redesign yet.

These are human-shaped decisions recorded from the live interview; details and statuses are in `FINAL-DIRECTION.md`.
