import re

with open("/home/amdy/Work/.agents/skills/wayfinder/SKILL.md", "r", encoding="utf-8") as f_in:
    wf = f_in.read()

parts = wf.split("---", 2)
fm_new = """
name: wayfinder
description: Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear.
disable-model-invocation: true
dependencies:
  - domain-modeling
  - grilling
  - prototype
  - research
  - setup-matt-pocock-skills
capabilities:
  - ask_user
"""

body = parts[2]
pattern = r"## UI Formatting Requirement\s+[\s\S]*?(?=
## Invocation)"
replacement = """## Capability Requirement

Whenever you or a composed discipline (such as ) requests user input to resolve a ticket or map the frontier, resolve and invoke the canonical  capability through the capability/adapter layer.
When invoking the capability, provide up to 4 specific selectable options with the top option prefixed with . Rely on the capability's native UI for custom write-ins. Do NOT output raw markdown questions like .
If the capability is unavailable, follow the graceful degradation policy defined by .
"""

new_body, count = re.subn(pattern, replacement, body)
assert count == 1, f"Expected 1 substitution, got {count}"

full_new = f"---{fm_new}---{new_body}"

with open("/home/amdy/Work/evidence/WP-SKILL-002/patches/wayfinder.md", "w", encoding="utf-8") as f_out:
    f_out.write(full_new)

print("wayfinder patch generated.")
