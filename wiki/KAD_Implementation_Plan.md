# High-Level Implementation Plan — K.A.D. Local AI Experimental Platform

## 1. Objetivo

O objetivo deste plano é transformar a arquitetura conceitual do K.A.D. em uma sequência de implementação executável na máquina local, preservando a principal fronteira arquitetural do projeto:

```text
PROBABILISTIC INTERPRETATION
            ↓
      CandidateIntent
            │
    ═════════════════
     AUTHORITY BOUNDARY
    ═════════════════
            │
            ▼
        Validator
            │
            ▼
      ValidatedIntent
            │
            ▼
 Deterministic Resolver
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
   Event StateDiff GameState
```

A premissa central é que modelos probabilísticos podem **interpretar, recuperar, classificar e gerar**, mas não possuem autoridade implícita para modificar o estado canônico da simulação. Essa separação já é uma das decisões centrais do projeto.

O roadmap deve seguir uma lógica de Ciência de Dados:

```text
DEFINE
→ MEASURE
→ COLLECT
→ TRAIN
→ EVALUATE
→ OPTIMIZE
→ DEPLOY
→ LEARN FROM FAILURES
```

e não:

```text
install every AI tool
→ connect everything
→ hope it works
```

---

# 2. Princípio de implementação

Cada fase deve responder uma pergunta experimental específica.

Uma tecnologia só entra quando existir um problema mensurável que ela resolva.

Portanto:

```text
RAG
não entra porque "precisamos de RAG".

QLoRA
não entra porque "queremos treinar modelos".

Distillation
não entra porque "queremos modelo local".
```

Elas entram quando o estágio anterior produz evidência de que são necessárias.

Isso está alinhado ao objetivo já documentado de reduzir incerteza arquitetural com evidência executável antes de construir infraestrutura extensa.

---

# 3. Arquitetura-alvo de longo prazo

```text
                         WORLD / RPG DATA
                               │
                   ┌───────────┴───────────┐
                   ▼                       ▼
               GameState              Documents
               Events                 Lore
               Facts                  Research
                   │                       │
                   │                       ▼
                   │                   Embeddings
                   │                       │
                   │                       ▼
                   │                  Retriever / RAG
                   │                       │
                   └───────────┬───────────┘
                               ▼
                    InterpretationContext
                               │
RawInput ──────────────────────┤
                               ▼
                    Probabilistic Interpreter
                        Local Student
                               │
                               ▼
                         CandidateIntent
                               │
                    ═════════════════════
                      AUTHORITY BOUNDARY
                    ═════════════════════
                               │
                               ▼
                            Validator
                               │
                               ▼
                        ValidatedIntent
                               │
                               ▼
                     Deterministic Resolver
                               │
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
                Event       StateDiff    GameState
                  │
                  ▼
          deterministic projection
                  │
                  ▼
            Canonical Facts
                  │
                  ▼
             Narrative Layer
```

Em paralelo existe um segundo pipeline:

```text
Teacher Models
      ↓
Synthetic Data
      ↓
Validation
      ↓
Curated Dataset
      ↓
SFT / QLoRA
      ↓
Distilled Student
      ↓
Quantization
      ↓
Local Deployment
      ↓
Production Failures
      ↓
Active Learning
      └────────────→ Dataset v2
```

Esses dois pipelines — **simulation pipeline** e **ML/data pipeline** — devem permanecer separados.

---

# 4. PHASE 0 — Machine Capability Baseline

## Objetivo

Descobrir exatamente o que a máquina consegue executar antes de escolher modelos ou frameworks.

O planejamento anterior considera um envelope local restrito, aproximadamente na classe de **8 GB de VRAM**, portanto o roadmap deve assumir recursos limitados até que benchmarks reais provem o contrário. 

## Levantar

```text
CPU
RAM
GPU
VRAM
driver/runtime
storage disponível
throughput de SSD
capacidade ROCm/CUDA/etc.
```

Também medir:

```text
tokens/s
VRAM usage
RAM usage
model load time
context size practical
training feasibility
```

## Primeiro artefato

```text
MACHINE_CAPABILITY_PROFILE
```

Exemplo conceitual:

```text
model_3B_q4:
  works = yes
  tokens_per_second = ...
  peak_vram = ...

model_7B_q4:
  works = yes/no
  ...

qlora_3B:
  works = ...
```

## Gate

Nenhuma decisão permanente sobre modelo local antes desse perfil.

---

# 5. PHASE 1 — Deterministic Core

## EXPERIMENT-001

Essa continua sendo a primeira implementação real.

Não utilizar:

- LLM;
- RAG;
- embeddings;
- database;
- QLoRA;
- distillation;
- narrative model.

Implementar somente:

```text
CandidateIntent
      ↓
Validator
      ↓
ValidatedIntent
      ↓
Resolver
      ↓
Resolution {
    Event,
    StateDiff,
    GameState_after
}
```

Microdomínio:

```text
room_a
room_b

player
key
crate

Acquire
Move
```

## Pergunta experimental

> Dados não confiáveis podem ser confinados atrás de uma fronteira determinística antes de qualquer consequência canônica?

A própria análise anterior identifica essa fronteira como a parte arquitetural de maior risco.

## Critérios de PASS

Provar:

```text
malformed CandidateIntent
→ rejected

ambiguous CandidateIntent
→ rejected

unsupported action
→ rejected

valid but unsuccessful action
→ canonical unsuccessful Resolution

valid successful action
→ canonical successful Resolution

StateDiff(before)
→ exactly GameState_after

same explicit inputs
→ same semantic Resolution
```

---

# 6. PHASE 2 — Observability and Dataset Contract

Esta fase é fundamental do ponto de vista de Ciência de Dados.

Antes de introduzir uma LLM, definir quais observações serão coletadas.

## Registro conceitual

```text
InterpretationRecord {
    raw_input
    context_reference
    interpretation_attempt
    model
    model_version
    candidate_intent
    validation_result
    failure_type
    human_correction
    accepted_intent
}
```

Não significa implementar uma grande database.

Inicialmente pode ser:

```text
JSONL
```

ou outro formato simples.

## Objetivo

Criar desde cedo um sistema capaz de transformar interações em:

```text
evaluation data
training data
negative examples
error analysis
```

---

# 7. PHASE 3 — Teacher Interpreter Baseline

## EXPERIMENT-002

Agora introduzir uma LLM.

```text
RawInput
+
InterpretationContext
        ↓
Teacher
        ↓
CandidateIntent
        ↓
Validator
```

O teacher pode inicialmente ser um modelo remoto forte.

## Técnica utilizada

### Prompt Engineering

Primeiro resolver o problema sem treinamento.

### Structured Output

Restringir output ao schema de `CandidateIntent`.

## Não utilizar ainda

```text
fine-tuning
distillation
QLoRA
```

Primeiro medir a dificuldade real da tarefa.

## Métricas iniciais

```text
Schema Validity Rate
Validator Acceptance Rate
Reference Precision
Ambiguity Preservation Rate
Unsupported Action Detection
Authority Leakage Rate
Human Correction Rate
```

---

# 8. PHASE 4 — Evaluation Corpus

Antes de treinar um modelo, construir um **benchmark próprio**.

Separar dataset de treino de dataset de avaliação.

Categorias:

```text
simple
ambiguous
underspecified
malformed
unsupported
multi-action
adversarial
synonyms
colloquial language
implicit references
stale context
authority-leakage attempts
out-of-domain
```

Exemplo:

```text
"pego a chave"
```

com:

```text
one key
```

versus:

```text
two possible keys
```

O modelo deve se comportar diferentemente.

---

# 9. PHASE 5 — Synthetic Data Generation

Agora utilizar modelos grandes para produzir escala.

## Pipeline

```text
Seed Examples
     ↓
Teacher
     ↓
Synthetic RawInputs
     ↓
Teacher CandidateIntents
     ↓
Deterministic Validator
     ↓
automatic filters
     ↓
human review of selected cases
     ↓
Curated Dataset
```

O teacher gera **propostas**, não verdade automática.

## Tipos de synthetic augmentation

Produzir:

```text
paraphrases
slang
typos
different sentence structures
ambiguous formulations
negative examples
adversarial examples
rare action formulations
```

Isso começa a transformar K.A.D. em um projeto de Data Science propriamente dito.

---

# 10. PHASE 6 — Embeddings and RAG

RAG entra somente depois que `InterpretationContext` demonstrar necessidade de mais informação.

## Problema

Não queremos colocar:

```text
entire world
entire campaign
entire documentation
entire history
```

em cada prompt.

## Pipeline

```text
query
   ↓
embedding model
   ↓
vector search
   ↓
candidate information
   ↓
authority-aware filtering
   ↓
InterpretationContext
```

## Informação possível

```text
current entities
relevant canonical Facts
recent Events
lore
documentation
historical material
```

Mas preservar sempre:

```text
retrieved information
!=
canonical authority
```

E:

```text
retrieval similarity
!=
truth
```

---

# 11. PHASE 7 — RAG Evaluation

RAG também precisa de benchmark próprio.

Medir separadamente:

### Retrieval Recall

O documento/fato necessário foi recuperado?

### Retrieval Precision

Quanto contexto irrelevante entrou?

### Entity Retrieval Accuracy

A entidade correta apareceu entre os candidatos?

### Downstream Improvement

```text
Interpreter without RAG
vs
Interpreter with RAG
```

Essa comparação é essencial.

Se RAG não melhorar o resultado do `Validator`, ele não está resolvendo um problema real.

---

# 12. PHASE 8 — Student Model Baseline

Agora selecionar modelos pequenos compatíveis com o hardware.

Possíveis classes:

```text
1B
3B
7B
```

dependendo dos benchmarks da Phase 0.

Executar os modelos **sem fine-tuning** primeiro.

Comparar:

```text
Teacher
vs
Base Student
```

Isso estabelece o baseline.

---

# 13. PHASE 9 — Transfer Learning via SFT

Agora começa a adaptação do modelo.

Dataset:

```text
RawInput
+
InterpretationContext
        ↓
Expected CandidateIntent
```

Aplicar:

```text
Supervised Fine-Tuning
```

Essa é uma forma de:

```text
TRANSFER LEARNING
```

porque o modelo geral pré-treinado está sendo adaptado para a tarefa K.A.D.

---

# 14. PHASE 10 — QLoRA

Para hardware local restrito, utilizar:

```text
quantized frozen base model
+
trainable LoRA adapters
```

Pipeline:

```text
Base Model
   ↓
4-bit representation
   +
LoRA adapters
   ↓
QLoRA training
```

## Objetivo

Treinar apenas uma pequena fração dos parâmetros.

Monitorar:

```text
VRAM
RAM
training loss
validation loss
throughput
training time
```

O dataset deve ser processado em batches pequenos/streaming quando necessário para não saturar RAM e VRAM.

---

# 15. PHASE 11 — Knowledge Distillation

Agora o treinamento pode ser tratado explicitamente como **distillation**.

Teacher:

```text
strong remote model
```

Student:

```text
small local model
```

Task:

```text
RawInput + InterpretationContext
→ CandidateIntent
```

O objetivo não é:

```text
Student ≈ Teacher universally
```

Mas:

```text
Student(KAD_INTERPRETATION)
≈
Teacher(KAD_INTERPRETATION)
```

---

# 16. PHASE 12 — Teacher vs Student Benchmark

Criar um benchmark reproduzível.

Tabela conceitual:

| Metric | Teacher | Base Student | Fine-Tuned Student |
|---|---:|---:|---:|
| Schema validity | | | |
| Validator acceptance | | | |
| Reference precision | | | |
| Ambiguity preservation | | | |
| Authority leakage | | | |
| Human correction | | | |
| Latency | | | |
| Tokens/s | | | |
| VRAM | remote | | |
| Cost / 1000 interactions | | | |

A pergunta final:

> Quanto da qualidade do teacher foi preservada por unidade de custo computacional?

---

# 17. PHASE 13 — Quantized Local Deployment

Depois do treinamento:

```text
Student
   ↓
quantization
   ↓
local inference format/runtime
```

Por exemplo:

```text
FP16
↓
8-bit
↓
4-bit
```

Benchmarkar diferentes quantizações.

Não medir apenas velocidade.

Medir:

```text
quality degradation
vs
memory reduction
vs
latency improvement
```

Resultado desejado:

```text
QUALITY
────────────
COMPUTE COST
```

aceitável para uso contínuo.

---

# 18. PHASE 14 — Model Cascade

Depois que student e teacher estão mensurados:

```text
Local Student
      ↓
CandidateIntent
      ↓
Validator
   /       \
ACCEPT    REJECT
           │
           ▼
     escalation policy
           │
           ▼
        Teacher
```

Isso reduz chamadas caras.

Mas importante:

```text
Validator rejection
```

não deve significar automaticamente:

```text
call teacher forever
```

Retries continuam sendo novas tentativas explicitamente registradas.

---

# 19. PHASE 15 — Active Learning

A produção começa a gerar novos dados.

Selecionar automaticamente casos interessantes:

```text
Validator rejects
human correction required
teacher/student disagree
rare language
novel entity references
out-of-distribution examples
```

Esses casos entram em:

```text
ACTIVE LEARNING QUEUE
```

Pipeline:

```text
production
   ↓
interesting failures
   ↓
Teacher / Human Review
   ↓
new labeled examples
   ↓
Dataset v2
   ↓
QLoRA v2
   ↓
Student v2
```

---

# 20. PHASE 16 — Preference Optimization

Somente depois de SFT/distillation funcionarem.

Criar pares:

```text
GOOD:
preserves ambiguity

BAD:
guesses EntityId
```

ou:

```text
GOOD:
CandidateIntent only

BAD:
predicts canonical outcome
```

Isso permite experimentar posteriormente:

```text
DPO
ORPO
ou técnicas equivalentes
```

Mas não é requisito para o MVP.

---

# 21. PHASE 17 — Specialized Non-LLM Models

Nem todo problema deve ser resolvido pelo LLM.

Analisar o dataset acumulado.

Pode ser que tarefas como:

```text
action classification
unsupported detection
simple entity filtering
complexity detection
```

possam usar:

```text
logistic regression
gradient boosting
small neural network
small encoder model
```

Uma possível arquitetura:

```text
RawInput
   ↓
cheap classifier
   ↓
simple case ──────→ deterministic processing
   │
complex case
   ▼
local LLM
   │
hard case
   ▼
teacher
```

Isso aproxima ainda mais o projeto de uma plataforma de Ciência de Dados.

---

# 22. PHASE 18 — Canonical Fact Projection

Separadamente do ML:

```text
Event / GameState
       ↓
deterministic Fact Projection
       ↓
CanonicalFact
```

Essa fase deverá investigar:

```text
Fact identity
Fact lifecycle
deduplication
re-projection
historical validity
source changes
provenance
```

Nenhuma LLM cria `CanonicalFact`.

Modelos podem criar:

```text
ProposedFact
```

que permanece não canônico.

---

# 23. PHASE 19 — Narrative Model

Somente depois de:

```text
Event
Fact
State
```

estarem confiáveis.

Pipeline:

```text
Canonical information
       ↓
Narrative Context
       ↓
Narrative Model
       ↓
text
```

Esse é outro excelente candidato futuro a distillation.

Teacher:

```text
large creative model
```

gera:

```text
canonical event → desired K.A.D. prose
```

Student local aprende o estilo.

Mas:

```text
Narrative
→ NEVER directly mutates GameState
```

---

# 24. PHASE 20 — PON/STC Integration

PON e Spatiotemporal Composability entram **depois que as fronteiras básicas possuírem evidência executável**.

O estado documentado atual explicitamente não trata PON/STC como requisito do primeiro experimento.

Nesse estágio, investigar:

```text
Event propagation
reactive dependencies
dynamic components
Fact projection
state observers
agent composition
```

e comparar:

```text
baseline deterministic architecture
vs
PON/STC implementation
```

Assim PON/STC se torna uma hipótese experimental mensurável, não uma dependência assumida.

---

# 25. Roadmap resumido

```text
STAGE A — FOUNDATION
────────────────────
0  Machine Profiling
1  Deterministic Core
2  Observability/Data Contract

STAGE B — PROBABILISTIC BASELINE
────────────────────────────────
3  Teacher Interpreter
4  Evaluation Corpus
5  Synthetic Data

STAGE C — KNOWLEDGE
───────────────────
6  Embeddings/RAG
7  RAG Evaluation

STAGE D — LOCAL LEARNING
────────────────────────
8  Base Student
9  SFT / Transfer Learning
10 QLoRA
11 Distillation
12 Teacher vs Student Benchmark
13 Quantization

STAGE E — INTELLIGENT ROUTING
─────────────────────────────
14 Model Cascade
15 Active Learning
16 Preference Optimization
17 Specialized Small Models

STAGE F — WORLD INTELLIGENCE
────────────────────────────
18 Canonical Fact Projection
19 Narrative Model

STAGE G — RESEARCH ARCHITECTURE
────────────────────────────────
20 PON/STC Integration
```

---

# 26. Dependency graph

A parte mais importante do roadmap é que ele não é uma lista linear arbitrária.

```text
Machine Profile
      │
      ▼
Deterministic Core
      │
      ▼
Data Contract
      │
      ▼
Teacher Baseline
      │
      ├─────────────► Evaluation Corpus
      │                      │
      │                      ▼
      │                Synthetic Data
      │                      │
      │                      ▼
      │                  SFT / QLoRA
      │                      │
      │                      ▼
      │                 Distillation
      │                      │
      │                      ▼
      │                  Quantization
      │                      │
      │                      ▼
      │                 Local Student
      │                      │
      └──────────────┬───────┘
                     ▼
                Model Cascade
                     │
                     ▼
               Active Learning
                     │
                     └────────→ new dataset
```

Em paralelo:

```text
World Data
   │
   ▼
RAG
   │
   ▼
InterpretationContext
```

e:

```text
Resolver
   │
   ▼
Events / State
   │
   ▼
Fact Projection
   │
   ▼
Narrative
```

---

# 27. MVP acadêmico versus plataforma completa

É importante separar esses dois objetivos.

## MVP

O MVP não precisa chegar até o Stage G.

Um MVP forte poderia terminar em:

```text
RawInput
    ↓
Teacher or small local model
    ↓
CandidateIntent
    ↓
Validator
    ↓
Resolver
    ↓
Event + StateDiff + GameState
```

com:

```text
evaluation corpus
metrics
replay tests
basic dataset logging
```

Isso já demonstra uma arquitetura tecnicamente interessante.

---

# 28. MVP de Machine Learning

Uma segunda milestone poderia adicionar:

```text
Synthetic Dataset
       ↓
QLoRA
       ↓
Local Student
       ↓
Teacher vs Student Benchmark
```

Esse seria um excelente experimento de Ciência de Dados porque permitiria apresentar resultados quantitativos.

Exemplo:

```text
Teacher Acceptance Rate:
97.4%

Student Base:
71.2%

Student QLoRA:
94.1%

Student Q4:
93.6%

Teacher latency:
850 ms

Student local:
120 ms
```

Valores acima são apenas exemplos do tipo de resultado que o projeto deverá produzir, não resultados esperados.

---

# 29. Unidade central do projeto: o Dataset

Ao longo do roadmap, o ativo mais valioso provavelmente deixará de ser o código e passará a ser:

```text
KAD INTERPRETATION DATASET
```

Cada interação pode gerar:

```text
RawInput
Context
TeacherOutput
StudentOutput
ValidationResult
FailureCategory
HumanCorrection
ValidatedIntent
Resolution
ModelVersion
DatasetVersion
```

Isso permite estudar:

```text
model quality
model drift
dataset drift
error clusters
teacher/student disagreement
RAG contribution
fine-tuning contribution
quantization degradation
cost-quality tradeoffs
```

---

# 30. Princípio de versionamento experimental

Cada resultado importante deve estar associado a:

```text
model version
dataset version
prompt version
schema version
simulation version
retrieval version
```

Conceitualmente:

```text
experiment =
code
+ dataset
+ model
+ config
+ metrics
```

Sem isso, resultados de ML ficam difíceis de reproduzir.

---

# 31. Regra para adicionar tecnologia

Antes de introduzir qualquer nova técnica, responder:

```text
1. What uncertainty does this reduce?

2. What baseline exists?

3. What measurable metric should improve?

4. What is the smallest experiment?

5. What evidence would falsify the hypothesis?
```

Por exemplo:

### RAG

```text
Hypothesis:
retrieved context improves reference resolution.

Metric:
reference accuracy / Validator acceptance.

Baseline:
same interpreter without RAG.
```

### QLoRA

```text
Hypothesis:
task-specific training materially improves a base local model.

Metric:
Student Base vs Student QLoRA.
```

### Distillation

```text
Hypothesis:
small local student retains sufficient teacher task performance.

Metric:
Teacher vs Student quality/cost.
```

### Quantization

```text
Hypothesis:
Q4 substantially reduces resource usage without unacceptable quality loss.

Metric:
FP16/Q8/Q4 quality-latency-memory frontier.
```

---

# 32. Resultado final esperado

A plataforma completa deve permitir executar experimentos como:

```text
MODEL A
vs
MODEL B

RAG OFF
vs
RAG ON

BASE
vs
QLORA

TEACHER
vs
STUDENT

FP16
vs
Q8
vs
Q4

PROMPT V1
vs
PROMPT V2

DATASET V1
vs
DATASET V2
```

sempre contra:

```text
the same evaluation corpus
+
the same deterministic Validator
+
the same simulation boundary
```

Isso transforma o K.A.D. em uma plataforma experimental reprodutível, em vez de apenas um jogo conectado a uma LLM.

---

# 33. North Star

A direção de longo prazo pode ser resumida como:

```text
EXPENSIVE GENERAL INTELLIGENCE
             │
             │ produces supervision
             ▼
      STRUCTURED DATASET
             │
             ▼
     SPECIALIZED STUDENT
             │
             │ local / quantized
             ▼
  PROBABILISTIC INTERPRETATION
             │
     ═══════════════════
       AUTHORITY BOUNDARY
     ═══════════════════
             │
             ▼
  DETERMINISTIC SIMULATION
             │
             ▼
       STRUCTURED FACTS
             │
             ▼
         NARRATIVE
```

O objetivo não é substituir a simulação por IA.

É utilizar IA onde sistemas probabilísticos possuem vantagem — interpretação, recuperação, geração e representação — enquanto estado, autoridade, replay e consequências permanecem sob contratos determinísticos.

Esse desenho permite aplicar **Transfer Learning, SFT, QLoRA, Distillation, Quantization, RAG, Embeddings, Synthetic Data, Active Learning, Model Cascades e Preference Optimization** como técnicas independentes e mensuráveis dentro de uma mesma plataforma experimental.

O roadmap detalhado para a máquina deve, portanto, ser gerado a partir dessas fases, quebrando **cada stage em WorkPackages pequenos, com precondições, orçamento de recursos, critérios de PASS/FAIL, artefatos e evidências esperadas**, em vez de transformar este plano de alto nível diretamente em uma instalação monolítica.