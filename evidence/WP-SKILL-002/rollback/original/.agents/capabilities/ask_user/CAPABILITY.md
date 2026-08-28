# Capability: `ask_user`

## Canonical Contract
The `ask_user` capability allows a skill or workflow to halt and request interactive human input.

**Request Schema:**
- `question` (string): The prompt to show the user.
- `options` (array of string, optional): Mutually exclusive choices for the user.
- `allowCustom` (boolean, optional): If true, the adapter MUST provide a free-form write-in mechanism. If unsupported, the adapter MUST return `FAILED`.
- `requestId` (string, optional): A stable correlation ID.

**Result Schema:**
The adapter MUST return exactly one of these states:
- `ANSWERED`: Contains the human's string `answer`.
- `UNAVAILABLE`: Indicates the interaction channel does not exist or is offline.
- `FAILED`: Indicates the interaction channel exists but the specific invocation failed (e.g., validation error, timeout, unrepresentable request).

*(Note: `WAITING_USER` is an orchestration state within the calling workflow, not a result from the adapter itself.)*

## Graceful Degradation Policy
If the adapter returns `UNAVAILABLE`:
1. Record attributable capability-failure evidence.
2. Emit the original question exactly once through the best available user-visible channel (e.g. stdout).
3. The orchestration layer MUST enter a `BLOCKED: WAITING_USER` state.
4. Downstream continuation is strictly prohibited until resumed with new state.

If the adapter returns `FAILED`:
1. Record the distinct invocation failure.
2. No answer is fabricated.
3. No blind retry is permitted.
4. The caller receives an evidence-backed failure state.

## Adapter Constraints
- If a canonical request cannot be represented by the underlying implementation (e.g., options limits, unsupported structures), the adapter MUST explicitly return `FAILED`.
- Silent truncation or semantic rewriting of the request is strictly prohibited.
