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

batch_4_skills = [
    'ask-matt',
    'claude-handoff',
    'code-review',
    'codebase-design',
    'diagnosing-bugs',
    'domain-modeling',
    'git-guardrails-claude-code',
    'handoff',
    'migrate-to-shoehorn',
    'prototype',
    'research',
    'resolving-merge-conflicts',
    'scaffold-exercises',
    'setup-matt-pocock-skills',
    'setup-pre-commit',
    'teach',
    'to-questionnaire',
    'wizard',
    'writing-beats',
    'writing-for-agents'
]

def validate_batch_4():
    forbidden = ['ask_question', 'ask_user_question', 'Antigravity', 'Pi', 'DSH']
    all_pass = True
    fp = {}

    for s in batch_4_skills:
        sf = os.path.join(SKILLS_ROOT, s, 'SKILL.md')
        if not os.path.exists(sf):
            print(f"[{s}] FAIL: File missing")
            all_pass = False
            continue
            
        with open(sf, 'r', encoding='utf-8') as f:
            txt = f.read()
            
        fp[s] = {'sha256': sha256_file(sf), 'tokens': count_tokens(txt), 'bytes': len(txt.encode('utf-8')), 'lines': len(txt.splitlines())}
        
        # Purity check
        found = [w for w in forbidden if re.search(r'\b' + re.escape(w) + r'\b', txt)]
        if found:
            print(f"[{s}] FAIL: Forbidden strings found: {found}")
            all_pass = False
        else:
            print(f"[{s}] PASS: Pure and intact.")

    batch_record = {
        'batch_id': 'BATCH_04',
        'skills': batch_4_skills,
        'status': 'VERIFIED_KEPT_AS_IS',
        'footprint': fp
    }
    with open(os.path.join(EVIDENCE_ROOT, 'batches', 'batch_4.json'), 'w', encoding='utf-8') as f:
        json.dump(batch_record, f, indent=2)

    return all_pass

if __name__ == '__main__':
    success = validate_batch_4()
    sys.exit(0 if success else 1)
