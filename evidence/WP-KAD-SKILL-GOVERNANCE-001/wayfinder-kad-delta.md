# Wayfinder KAD delta

## Changed sections

1. Existing capability metadata continues to declare canonical `ask_user`.
2. The capability rule now branches by active project: vanilla workspaces retain the upstream up-to-four-choice interaction; `kad-pi` loads the project overlay and requires five generated options plus one custom/write-in option.
3. The KAD overlay makes ownership explicit: Wayfinder owns the decision map, while `workctl` owns execution claims, state, and handoffs.
4. Human resolution records `AUTHOR_DECLARED`, preserves exact custom text, and updates the map with a pointer/gist rather than duplicating ticket detail.

## Composition check

The decision protocol is implemented as a separate deterministic module (`tools/workspace/decision-protocol.mjs`) and the project-specific rules live in `.agents/skill-overlays/wayfinder-kad.md`. Only the routing and capability seam is patched in the vanilla skill. A wholesale fork was rejected because it would duplicate Matt's map semantics and increase drift surface.
