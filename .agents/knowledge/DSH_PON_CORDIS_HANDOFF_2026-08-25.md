# HANDOFF — DeepSeek Harness / Cordis / PON × Spatiotemporal Composability Lab
## Estado: 2026-08-25

## 0. INSTRUÇÃO CRÍTICA PARA A PRÓXIMA CONVERSA

Você é o advisor técnico em um fluxo iterativo **ChatGPT ↔ terminal Linux do usuário ↔ DeepSeek Harness/Cordis lab**.

Ao receber este handoff em uma nova conversa:

1. **NÃO continue automaticamente para um novo experimento.**
2. **AGUARDE o usuário colar o próximo output do terminal.**
3. O próximo output esperado é do probe `PON-KERNEL-008B: PRE-RELEASE TEARDOWN FAILURE`.
4. Analise o output em `CONFIRMED / DOCUMENTED / INFERRED / HYPOTHESIS / UNKNOWN`.
5. Só depois forneça **um probe limitado por vez**.
6. Não invente resultados, não assuma controle do terminal e não avance para produção.
7. O usuário quer aprender a semântica, não apenas copiar exemplos.

Resposta inicial esperada na nova conversa:
> Handoff loaded. I have the current state through PON-KERNEL-008 and the exact pending 008B probe. I’ll wait for the terminal output before continuing.

Depois disso, **pare e espere o output**.

---

# 1. AMBIENTE

- Omarchy 4 Quattro, Linux x64
- user: `amdy`
- workspace: `/home/amdy/Work`
- DSH lab: `/home/amdy/Work/tries/deepseek-harness-lab`
- tutorial scratch: `/home/amdy/Work/tries/deepseek-harness-lab/tmp/cordis-tutorial`

DeepSeek Harness:
- repo: `deepseek-ai/deepseek-harness`
- branch: `master`
- pinned commit: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- version: `0.1.1-rc.2`
- `pnpm@11.7.0`
- engine: `^22.19.0 || >=24.0.0`
- local Node: `v26.7.0`
- source typecheck previously passed

Tutorial launcher:

```bash
node --import tsx ../../vendor/cordis/bin.js
```

`tmp/` is gitignored.

---

# 2. PAPEL / METODOLOGIA

Advisor técnico, em português, com termos técnicos em inglês quando naturais.

Método:

```text
BUILD
→ PREDICT
→ RUN / OBSERVE
→ BREAK DELIBERATELY
→ MAP TO ARCHITECTURE
```

Evidence taxonomy:
- `CONFIRMED` = observado em runtime/test/source
- `DOCUMENTED` = upstream afirma
- `INFERRED` = interpretação arquitetural
- `HYPOTHESIS` = melhoria/expectativa ainda não testada
- `UNKNOWN` = não investigado

Preferir:
- conclusão primeiro;
- pequenos diagramas;
- comandos shell copy-pasteable;
- um probe bounded por vez;
- nenhuma mutação ampla.

---

# 3. OBJETIVO ARQUITETURAL

Combinar:

1. **PON — Programação Orientada a Notificações**
   - WHEN / CAUSALITY
2. **Spatiotemporal Composability / Cordis**
   - WHAT / WHERE / FOR HOW LONG
3. **PTC / Code Mode**
   - HOW bounded computation runs
4. **Deterministic control plane**
   - IS IT AUTHORIZED?
   - capabilities, WorkPackages, approvals, QC, postconditions

Visão:

```text
PON
  WHEN / CAUSALITY
       ↓
Composition Controller
  Desired State → Composition Delta
       ↓
Cordis/STC
  WHAT + WHERE + LIFETIME
       ↓
Effects
  OWNERSHIP + CLEANUP
```

Pipeline alvo:

```text
EVENT
→ FACT DELTA
→ AFFECTED PREMISES ONLY
→ CONDITION DELTA
→ RULE ACTIVATION
→ COMPOSITION DELTA
→ POLICY VALIDATION
→ EXECUTION
→ POSTCONDITION / QC
→ STATE UPDATE
→ NOTIFICATION
```

Princípios centrais:

```text
LLM output ≠ authorization
PON Rule output ≠ runtime authority
DesiredCompositionDelta ≠ effect yet
```

Rule deve produzir **dados/intenção**, nunca diretamente `ctx.plugin()`, tool calls, filesystem/network effects ou LLM calls.

---

# 4. PON / TOKEN EFFICIENCY

Hipótese:

```text
state change
→ deterministic fact delta
→ affected premises
→ affected conditions
→ rules
→ composition update
→ ONLY IF semantic uncertainty remains
→ LLM
```

Frase central:

> The cheapest model call is one that never happens.

Mapeamento arquitetural hipotético:
- PON FBE → stateful domain/capability component
- Attribute → typed Fact
- Premise → incremental predicate
- Condition → composition of Premise states
- Rule → causal transition
- Action → requested effect set
- Instigation → dispatch request
- Method → deterministic symbolic operation
- Notification → typed event
- PON notification graph → explicit incremental dependency graph
- Cordis Fiber → lifetime/ownership
- Cordis Effect → reversible registration/resource ownership

Não usar generic Cordis event listeners como motor PON. Preferir índice explícito de dependência em `pon-kernel`.

---

# 5. DESCOBERTA CRÍTICA DE SEGURANÇA PTC

**CONFIRMED bypass de sandbox via direct Node runtime.**

PTC/Code + Read Only, workspace `/home/amdy/Work`, sem tools.write/bash/subprocess/network.

Direct runtime:

```js
process.getBuiltinModule('node:fs')
```

conseguiu escrever `/tmp/dsh-ptc-direct-fs-canary`, confirmado externamente com conteúdo:

```text
DIRECT_RUNTIME_WRITE
```

Estado:

```text
PTC functionality                    PASS
PTC mediated sandbox                 PASS
PTC direct-runtime sandbox security  FAIL
PTC production use                   BLOCKED
```

Não executar mais escape tests perigosos.

Futuro PTC deve ter explicit capabilities, sem ambient Node authority, isolamento OS/process/container, budgets e filesystem/network policy.

---

# 6. CORDIS — CHAPTERS 1–6

## Chapter 1 — plugin
Normal: `hello from my first plugin`.
BREAK: `apply()` throw → loud nested loader/Fiber error. PASS.

## Chapter 2 — lifecycle/effects
Heartbeat owned by `ctx.effect()`.
Após `fiber.dispose()`:
- disposer ran;
- nenhum tick posterior;
- async cleanup awaited.

CONFIRMED:

```text
Lifetime(owned Effect) ⊆ Lifetime(owning Fiber)
```

Estados documentados:
`PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED`, com `FAILED`.

## Chapter 3 — services/inject
`inject=['greeter']`:
- reversed YAML order still worked;
- provider absent → consumer silent, exit 0;
- direct diagnostic later proved `FiberState.PENDING`;
- provider disappearance unloaded consumer and cleaned effects;
- provider return recomposed consumer automatically.

CONFIRMED:

```text
CONFIG ORDER ≠ DEPENDENCY ORDER
inject is a temporal dependency
```

## Chapter 4 — events/waterfall
Typed event demo PASS.
Waterfall observer that omitted `next()` swallowed downstream.

Rule:

```text
CP-001 — OBSERVATION MUST NOT IMPLY AUTHORITY
```

Separate Observer / Transformer / Authorizer / Executor.

## Chapter 5 — configuration
Valid config defaults applied before `apply`.
Invalid config failed before `apply`, exit 1.

Rule:

```text
CP-002 — VALIDATE BEFORE AUTHORITY
```

## Chapter 6 — composition/HMR
- `disabled:true` → plugin absent, exit 0.
- `disabled:false` → plugin present.
- live config toggle → MOUNTED → UNMOUNTED → MOUNTED.
- source-code HMR:
  `VERSION-A MOUNTED → A UNMOUNTED → VERSION-B MOUNTED`.
- direct registry diagnostic:
  `needs-timer is PENDING — a required service is missing`.

Rule:

```text
CP-003 — STABLE COMPOSITION IDENTITY
```

Logical entry identity ≠ runtime Fiber instance ≠ implementation version.

---

# 7. CHAPTER 7 — REAL DSH TOOL PIPELINE

Pinned tutorial `docs/cordis-tutorial/07-into-the-harness.md`.

Keyless, no model call.

Composition:

```yaml
- name: '@deepseek-ai/dsh-system-prompt'
- name: '@deepseek-ai/dsh-tools'
- name: './tool-logger.ts'
- name: './greet-tool.ts'
```

Observed:

```text
[tool-logger] greet -> Hello, Cordis!
tool replied: [{"type":"text","text":"Hello, Cordis!"}]
exit=0
```

Pipeline confirmed:
`register → input validation → execute → canonical output → render → tools/result → caller`.

### Invalid arguments
`{name:42}` with schema string:
- executor NOT reached;
- `isError=true`;
- normalized result;
- exit 0.

Rule:

```text
CP-004 — VALIDATE INTENT BEFORE EXECUTION
```

### Invalid output
Executor returned `42` while output schema required string:
- executor reached;
- render NOT reached;
- output validation produced normalized error.

Rule:

```text
CP-005 — VALIDATE EFFECT RESULTS
```

### tools/pre-execute deny
Valid args, policy denied:
- executor NOT reached;
- normalized `isError=true`.

Rule:

```text
CP-006 — AUTHORIZATION BEFORE EFFECT
VALID ≠ AUTHORIZED
```

### Monotonic guard
pre-policy ALLOW, `ctx.tools.guard()` DENY:
- guard wins;
- executor skipped.

Rule:

```text
CP-007 — SECURITY INVARIANTS MUST BE MONOTONIC
```

`tools/pre-execute` = cooperative/reorderable allow/deny/ask.
`ctx.tools.guard()` = final monotonic deny/abstain.

---

# 8. TEMPORAL AUTHORITY

### Temporary guard Fiber
Call 1 denied; dispose guard Fiber; call 2 succeeded.

```text
CP-008 — POLICY AUTHORITY HAS A LIFETIME
```

### Temporary tool Fiber
Call 1 succeeded; dispose owning Fiber; call 2 returned `unknown tool "greet"`.

```text
CP-009 — CAPABILITY AUTHORITY HAS A LIFETIME
```

Thus:

```text
Fiber exists
→ policy/capability may exist

Fiber disappears
→ registration disappears
```

---

# 9. PON-KERNEL-001 — FACT → PREMISE

Facts:
- `testsPassing=false`
- `unrelated=0`

Premise:
- `testsOK = testsPassing === true`

Observed:

```text
same-value:
factChanged=false
evaluatedPremises=[]
changedPremises=[]

unrelated:
factChanged=true
evaluatedPremises=[]
changedPremises=[]

relevant:
evaluatedPremises=["testsOK"]
changedPremises=["testsOK"]
```

Rule:

```text
PON-001 — INCREMENTAL FACT PROPAGATION
```

No global Premise scan.

---

# 10. PON-KERNEL-002 — PREMISE → CONDITION

Facts:
- `testsPassing`
- `planApproved`
- `unrelated`

Premises:
- `testsOK`
- `approved`

Condition:
- `acceptable = testsOK && approved`

Observed:
- same-value → zero work;
- unrelated → zero downstream;
- `testsPassing false→true`: `testsOK` changed, `acceptable` evaluated but unchanged;
- `planApproved false→true`: `approved` and `acceptable` changed.

Rule:

```text
PON-002 — INCREMENTAL CONDITION PROPAGATION
```

Important:

```text
Premise evaluated ≠ propagation
Premise state transition → propagation
```

---

# 11. PON-KERNEL-003 — CONDITION → RULE

Rule:
`request-acceptable-state` depends on `acceptable`.

Current semantic:
- Condition `false→true` → Rule activates;
- `true→false` → Rule evaluated but does not activate;
- re-rising edge activates again;
- same-value/unrelated → zero rule work.

Rule:

```text
PON-003 — CONDITION → RULE ACTIVATION
```

Rule produces intent only.

---

# 12. PON-KERNEL-004 — INTENT → DESIRED COMPOSITION DELTA

`CompositionController.plan()` validates vocabulary:

```text
type = composition/set
component = workpackage/acceptable
present = boolean
```

Known intent accepted into:

```json
{
  "kind":"component/presence",
  "component":"workpackage/acceptable",
  "present":true,
  "sourceRule":"request-acceptable-component"
}
```

Unknown component `filesystem/root` rejected.

Rule:

```text
PON-004 — INTENT IS NOT AUTHORITY
```

---

# 13. PON-KERNEL-005 — PON × CORDIS END-TO-END

Conditions:
- `acceptable`
- complementary `notAcceptable`

Rules:
- rising `acceptable` → `present:true`
- rising `notAcceptable` → `present:false`

Controller owns actual `ctx.plugin()` / `Fiber.dispose()`.

Observed:

```text
TESTS PASS
→ no reconciliation

APPROVE
→ [acceptable-component] MOUNTED
→ changed:true

APPROVE SAME VALUE
→ zero PON work
→ reconcile []

REVOKE
→ [acceptable-component] UNMOUNTED
→ changed:true

REVOKE SAME VALUE
→ zero work

REAPPROVE
→ [acceptable-component] MOUNTED
```

Rule:

```text
PON-005 — REACTIVE COMPOSITION
```

Definition:
> Domain-state transitions may request composition changes, but only a deterministic reconciler owns Cordis lifecycle effects.

---

# 14. PON-KERNEL-006 — IDEMPOTENCE

Direct reconcile:
- PRESENT #1 → mount, `changed:true`
- PRESENT #2 → no mount, `changed:false`
- ABSENT #1 → unmount, `changed:true`
- ABSENT #2 → no unmount, `changed:false`

Rule:

```text
CP-010 — RECONCILIATION IS IDEMPOTENT
CurrentState == DesiredState → zero lifecycle mutation
```

---

# 15. PON-KERNEL-007 — RACE

Async teardown 200ms.

Old controller:

```ts
const fiber = this.acceptableFiber
this.acceptableFiber = null
await fiber.dispose()
```

Observed FAIL:

```text
component 1 MOUNTED active=1
component 1 UNMOUNT START active=1
component 2 MOUNTED active=2
component 1 UNMOUNT END active=1
```

Logical absent was published before physical teardown completed.

---

# 16. PON-KERNEL-007B — SERIALIZED FIX

Controller gained single-writer lane:

```ts
private reconcileTail: Promise<void> = Promise.resolve()

reconcile(input) {
  const run =
    this.reconcileTail.then(
      () => this.reconcileNow(input),
    )

  this.reconcileTail =
    run.then(
      () => undefined,
      () => undefined,
    )

  return run
}
```

Teardown ordering:

```ts
await fiber.dispose()
this.acceptableFiber = null
```

Observed PASS:

```text
component 1 MOUNTED active=1
component 1 UNMOUNT START active=1
REQUEST REMOUNT DURING TEARDOWN
component 1 UNMOUNT END active=0
component 2 MOUNTED active=1
```

Never `active=2`.

Rule:

```text
CP-011 — RECONCILIATION MUST BE SERIALIZABLE
```

Precise meaning:
- requests may arrive concurrently;
- mutations are single-writer per composition domain;
- generation N reaches quiescence before N+1 acquires authority.

Future question: global lane vs per-component lane.

---

# 17. PON-KERNEL-008 — TEARDOWN FAILURE SEMANTICS

First failure probe used disposer that:
1. waited;
2. decremented `active`;
3. logged `UNMOUNT END`;
4. then threw.

Observed:

```text
component 1 MOUNTED active=1
UNMOUNT START active=1
UNMOUNT END active=0
DISPOSER THROW

reconcile returned:
accepted:true changed:true present:false

PRESENT AFTER FAILURE:
component 2 MOUNTED active=1

ABSENT AFTER FAILURE:
component 2 cleaned to active=0

exit=0
```

Important discovery:
- disposer threw;
- `fiber.dispose()` did **not** reject;
- controller continued;
- reference cleared;
- new generation mounted;
- lane remained usable.

Pinned Cordis source confirms deliberate behavior.

`vendor/cordis/src/fiber.ts::_unload()` catches disposer errors and logs them:

```ts
try {
  await runDisposable(dispose)
} catch (reason) {
  this.ctx.logger.error(reason)
}
```

`Fiber.dispose()` comments also say `_reload` and `_unload` swallow their own work errors via logger; `inertia` normally should not reject.

Therefore:

```text
DISPOSER THROW
→ Cordis logs/contains it
→ lifecycle teardown may still complete
```

Rule:

```text
CP-012 — LIFECYCLE COMPLETION ≠ RESOURCE CLEANUP SUCCESS
```

But 008 only threw **after** resource release simulation, so it did NOT prove the dangerous pre-release case.

---

# 18. CURRENT EXACT NEXT PROBE — WAIT FOR OUTPUT

## PON-KERNEL-008B — PRE-RELEASE TEARDOWN FAILURE

The user was instructed to change **only** `acceptable-component.ts` so the first disposer throws **before** `active--`.

Expected current file:

```ts
import type { Context } from '@deepseek-ai/cordis'

let nextId = 0
let active = 0
let failNextDispose = true

export function acceptableComponent(ctx: Context) {
  const id = ++nextId

  active++

  console.log(
    `[component ${id}] MOUNTED active=${active}`,
  )

  ctx.effect(() => {
    return async () => {
      console.log(
        `[component ${id}] UNMOUNT START active=${active}`,
      )

      await new Promise(
        resolve => setTimeout(resolve, 100),
      )

      if (failNextDispose) {
        failNextDispose = false

        console.log(
          `[component ${id}] DISPOSER THROW BEFORE RELEASE active=${active}`,
        )

        throw new Error(
          'intentional pre-release teardown failure',
        )
      }

      active--

      console.log(
        `[component ${id}] UNMOUNT END active=${active}`,
      )
    }
  })
}
```

Keep:
- serialized `composition-controller.ts` from 007B;
- failure-recovery `pon-probe.ts` from 008;
- `pon-kernel.ts` unchanged;
- `cordis.yml`:

```yaml
- name: './pon-kernel.ts'
- name: './composition-controller.ts'
- name: './pon-probe.ts'
```

Command to run:

```bash
echo '=== PON-KERNEL-008B: PRE-RELEASE TEARDOWN FAILURE ==='

set +e
node --import tsx ../../vendor/cordis/bin.js
CODE=$?
set -e

echo
echo "exit=$CODE"
```

**No output from this probe has been provided yet.**

### Hypothesis only — NOT CONFIRMED

Likely:

```text
component 1 MOUNTED active=1

failing unmount
→ THROW BEFORE RELEASE active=1
→ Cordis contains/logs error
→ reconcile still accepted:true

PRESENT AFTER FAILURE
→ controller believes absent
→ component 2 MOUNTED
→ active=2
```

If `active=2` appears, then CONFIRM:

```text
Cordis Fiber lifecycle completion
≠
external resource cleanup success
```

Likely future state model:

```text
PRESENT
ABSENT
TRANSITIONING
DEGRADED / CLEANUP_FAILED
```

instead of simple:

```text
Fiber | null
```

Critical resources may need:
- explicit teardown result;
- postcondition verification;
- quarantine/degraded state;
- retry/escalation/human review;
- block replacement generation until cleanup verified.

**Do not implement any of this before observing 008B.**

---

# 19. UPSTREAM DOCS / SOURCE USED

Pinned commit:
`b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`

Relevant files:
- `docs/cordis-tutorial/03-services.md`
- `04-events.md`
- `05-config.md`
- `06-composition-and-hmr.md`
- `07-into-the-harness.md`
- `docs/user/develop/basic/tool.md`
- `docs/cookbook/adding-a-tool.md`
- `docs/cookbook/extension-cookbook.md`
- `docs/tool-execution-pipeline.md`
- `docs/cordis-api/fiber.md`
- `vendor/cordis/src/fiber.ts`

Official tool pipeline:

```text
tools/pre-execute
→ monotonic guards
→ tools/execute
→ tool body
→ tools/post-execute
→ normalization/finalizeContent
→ tools/result
```

---

# 20. ACCUMULATED RULES

```text
CP-001 — OBSERVATION MUST NOT IMPLY AUTHORITY
CP-002 — VALIDATE BEFORE AUTHORITY
CP-003 — STABLE COMPOSITION IDENTITY
CP-004 — VALIDATE INTENT BEFORE EXECUTION
CP-005 — VALIDATE EFFECT RESULTS
CP-006 — AUTHORIZATION BEFORE EFFECT
CP-007 — SECURITY INVARIANTS MUST BE MONOTONIC
CP-008 — POLICY AUTHORITY HAS A LIFETIME
CP-009 — CAPABILITY AUTHORITY HAS A LIFETIME
CP-010 — RECONCILIATION IS IDEMPOTENT
CP-011 — RECONCILIATION MUST BE SERIALIZABLE
CP-012 — LIFECYCLE COMPLETION ≠ RESOURCE CLEANUP SUCCESS
```

```text
PON-001 — incremental Fact propagation
PON-002 — incremental Premise → Condition propagation
PON-003 — Condition transitions activate Rules
PON-004 — Intent is not authority
PON-005 — validated desired state drives Cordis composition
```

---

# 21. STRATEGIC PROJECT CONTEXT

- OpenCode remains production/control baseline.
- DSH/Cordis is architecture/research lab.
- Pi may become a future owned minimal substrate.
- Role != Model.
- Planner should be read-only.
- Builder may have bounded workspace write.
- Human approval between Planner and Builder.
- QC/postconditions deterministic where possible.
- Model-agnostic orchestration.
- Minimize token spend through deterministic propagation.

Future control plane should eventually include:
- WorkPackages;
- explicit capability grants;
- monotonic policy;
- approval;
- filesystem/network/process isolation;
- postconditions;
- QC;
- auditability.

---

# 22. DO NOT DO NEXT

Until the user provides the 008B terminal output, do **not**:
- generalize to multiple components;
- add LLM calls;
- add PTC;
- add real filesystem/network authority;
- add retries;
- change the failure state model;
- assume `active=2`;
- assume cleanup failure is harmless;
- provide a new probe.

**Wait for terminal evidence first.**
