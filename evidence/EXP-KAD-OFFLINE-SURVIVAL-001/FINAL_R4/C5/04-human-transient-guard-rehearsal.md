# C5-04 Human-Terminal Transient Guard Rehearsal

Authorization 1: `APPROVE EXACT TRANSIENT NM GUARD REHEARSAL`.

The first human attempt was reported as malformed and failed before execution with:

```text
Failed to find executable device: No such file or directory
```

Read-only cleanup verification immediately afterward found no timer or service unit with the experiment identity.

Authorization 2: `APPROVE CORRECTED EXACT GUARD`.

The corrected command was then executed by the human in the local terminal. The agent never requested, received, stored, echoed, or typed a sudo password.

Execution decision: `DONE — CORRECTED GUARD ARMED`.
