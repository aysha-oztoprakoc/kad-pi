# Harness Adapter: `ask_user` -> Antigravity

## Translation Semantics
This adapter translates the canonical `ask_user` request to the native Antigravity `ask_question` tool schema.

**Request Mapping:**
- Canonical `question` -> AGY `question`
- Canonical `options` -> AGY `options` (mapped into objects with a `label` field)
- Canonical `allowCustom` -> Inherently satisfied by AGY `ask_question`'s native write-in support.
- Canonical `requestId` -> mapped into an arbitrary metadata or tracking construct if supported by the native tool, or ignored safely if not structurally required.

**Result Mapping:**
- Native invocation offline/unsupported -> Canonical `UNAVAILABLE`
- Native invocation failure -> Canonical `FAILED`
- Unsupported canonical representation (e.g., if numeric option limits exist and are exceeded) -> Canonical `FAILED`
- Successful user interaction -> Canonical `ANSWERED` extracting the raw string value.

## Implementation Form
Currently, this adapter is a declarative mapping specification. Because the parent IDE injects the capability into the local agent context directly as a native tool, there is currently no standalone executable child-process IPC bridge.

## Reference Evidence
The deepseek-harness codebase establishes a reference pattern (`UserQuestionService`, `UserQuestionProvider`) for host-owned transport injection at the interaction layer, rather than requiring arbitrary child IPC.
