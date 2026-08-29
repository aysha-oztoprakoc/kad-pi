# Wayfinder KAD Overlay

- **Scope:** `project = kad-pi`, or a side project that explicitly opts in.
- **Owner:** Wayfinder owns the decision map and decision tickets; `workctl` owns claims, execution state, and handoffs.
- **Human decisions:** every genuine HITL decision goes through canonical `ask_user` with exactly five distinct generated options and one custom/write-in option.
- **Recommendation:** one generated option may be marked `RECOMMENDED`; it is never selected automatically.
- **Authority:** only an `ANSWERED` human response creates `AUTHOR_DECLARED`; unavailable interaction leaves the ticket `BLOCKED_ON_HUMAN`.
- **Map update:** store full resolution on the decision ticket; append only a pointer and gist to `Decisions so far`.
- **Isolation:** do not inject PON, STC, KAD authority taxonomy, or KAD epistemic classes into projects without explicit opt-in.
- **Evidence:** retain the offered options, response, timestamp, source ticket, consequences, and evidence inputs.
