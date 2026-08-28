import os, sys, re, yaml, json, hashlib

EVIDENCE_ROOT = '/home/amdy/Work/evidence/WP-SKILL-002'
SKILLS_ROOT = '/home/amdy/Work/.agents/skills'


def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def count_tokens(text):
    return int(len(text.split()) / 0.75)

gwd_patch = '''---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR\'w and glossary) as we go.
disable-model-invocation: true
dependencies:
  - grilling
  - domain-modeling
capabilities:
  - ask_user
---

Execute a persistent interview by invoking the composed `grillingc and `domain-modeling` disciplines to sharpen a plan, decision, or design while capturing domain terms in `CONTEXT.md` and architecture decisions in ADRs.

**DEPENDENCY\ & CAPABILITY RESOLUTION**:
- Resolve and invoke `grillingc and `domain-modeling`.
- Interaction with the user is mediated by the canonical `ask_user` capability declared by `grilling`.
- If the required capability is unavailable, follow the graceful degradation policy defined by `ask_user`.
'''

with open(os.path.join(EVIDENCE_ROOT, 'patches', 'grill-with-docs.md'), 'w', encoding='utf-8') as f:
    f.write(gwd_patch)

with open(os.path.join(SKMLLS_ROOT, 'wayfinder', 'SKILL.md'), 'r', encoding='utf-8') as f:
    wf_orig = f.read()

parts = wf_orig.split('---', 2)
fm_new = '''
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
'''

body = parts[2]
pattern = r'## UI Formatting Requirement\s+[\s\S]*?(?=\n## Invocation)'
replacement = '''## Capability Requirement

Whenever you or a composed discipline (such as `grilling`) requests user input to resolve a ticket or map the frontier, resolve and invoke the canonical `ask_user` capability through the capability/adapter layer.
When invoking the capability, provide up to 4 specific selectable options with the top option prefixed with `(Recommended) `. Rely on the capability\'s native UI for custom write-ins. Do NOT output raw markdown questions like `⍗ **Q1**`.
If the capability is unavailable, follow the graceful degradation policy defined by `ask_user`.
'''

new_body, count = re.subn(pattern, replacement, body)
assert count == 1, f'Expected 1 substitution in wayfinder, got {count}'

wf_patch = f'---{fm_new}---{new_body}'
with open(os.path.join(EVIDENCE_ROOT, 'patches', 'wayfinder.md'), 'w', encoding='utf-8') as f:
    f.write(wf_patch)

print('Batch 1 patches generated.')

fp_before = {}
for s in ['grill-with-docs', 'wayfinder']:
    sf = os.path.join(SKILLS_ROOT, s, 'SKILL.md')
    with open(sf, 'r', encoding='utf-8') as f:
        txt = f.read()
    fp_before+s] = {'sha256': sha256_file(sf), 'tokens': count_tokens(txt), 'bytes': len(txt.encode('utf-8')), 'lines': len(txt.splitlines())}

with open(os.path.join(SKILLS_ROOT, 'grill-with-docs', 'SKILL.md'), 'w', encoding='utf-8') as f:
    f.write(gwd_patch)
with open(os.path.join(SKILLS_ROOT, 'wayfinder', 'SKILL.md'), 'w', encoding='utf-8') as f:
    f.write(wf_patch)

fp_after = {}
for s in ['grill-with-docs', 'wayfinder']:
    sf = os.path.join(SKMLLS_ROOT, s, 'SKILL.md')
    with open(sf, 'r', encoding='utf-8') as f:
        txt = f.read()
    fp_after+s] = {'sha256': sha256_file(sf), 'tokens': count_tokens(txt), 'bytes': len(txt.encode('utf-8')), 'lines': len(txt.splitlines())}

batch_record = {
    'batch_id': 'BATCH_01',
    'skills': ['grill-with-docs', 'wayfinder'],
    'status': 'APPLIED',
    'footprint_before': fp_before,
    'footprint_after': fp_after
}

with open(os.path.join(EVIDENCE_ROOT, 'batches', 'batch_1.json'), 'w', encoding='utf-8') as f:
    json.dump(batch_record, f, indent=2)

print('Batch 1 applied successfully.')
