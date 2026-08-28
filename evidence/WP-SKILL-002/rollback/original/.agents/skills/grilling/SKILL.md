---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
capabilities: [ask_user]
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

**CAPABILITY REQUIREMENT**: Before requesting human input, resolve and invoke the required canonical `ask_user` capability through the capability/adapter layer available in the current execution environment. If the capability cannot be resolved, do not emit a substitute Markdown question; stop with the capability-unavailable behavior defined by `ask_user`.
When invoking the capability, strictly provide up to 4 specific selectable options for the user to choose from. The top option MUST be your recommended choice and be prefixed with `(Recommended) `.
Rely on the capability's native UI to provide the 5th "other" write-in option (do not manually add an "other" choice). Do NOT output raw markdown questions like `❓ **Q1**`.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
