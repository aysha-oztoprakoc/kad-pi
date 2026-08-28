# KAD-WP-002-PROBABILISTIC-INTENT-INTERPRETATION (KAD-EXPERIMENT-002)

Measure a DIRECT, TOOL-LESS probabilistic interpreter (provider opencode-go,
model deepseek-v4-pro; ONE fresh direct ctx.llm.stream() request per
InterpretationAttempt) mapping RawInput + frozen InterpretationContext C0 to
CandidateIntent-shaped JSON, with every parsed CandidateIntent passing the real,
unchanged, byte-for-byte frozen WP-001 C++ Validator (then Resolver only after
Validator acceptance).

Authoritative specification: PLANNER HAND-OFF rev 2 (binding amendments
incorporated). This tree is the frozen experiment fixed-point: every control is
SHA-256-hashed in controls/control-hashes.json; NO control may change after R01.

STATUS (this build): see results.json / REPORT.md.
