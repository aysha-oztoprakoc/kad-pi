import os, sys, re, yaml

expected = {
    'improve-codebase-architecture': {
        'deps': ['codebase-design', 'domain-modeling', 'grilling'],
        'caps': ['ask_user'],
        'anchors': ['deepening', 'HTML', 'grilling']
    },
    'loop-me': {
        'deps': ['grilling'],
        'caps': ['ask_user'],
        'anchors': ['loop lens', 'workflow', 'grilling']
    },
    'to-spec': {
        'deps': ['prototype', 'setup-matt-pocock-skills', 'triage'],
        'caps': [],
        'anchors': ['spec', 'issue tracker']
    },
    'to-tickets': {
        'deps': ['prototype', 'setup-matt-pocock-skills', 'triage'],
        'caps': [],
        'anchors': ['tickets', 'blocking']
    },
    'triage': {
        'deps': ['domain-modeling', 'grilling', 'setup-matt-pocock-skills'],
        'caps': ['ask_user'],
        'anchors': ['triage', 'state machine']
    },
    'implement': {
        'deps': ['tdd', 'code-review'],
        'caps': [],
        'anchors': ['tdd', 'code-review']
    },
    'implement-spec': {
        'deps': ['research', 'implement', 'code-review'],
        'caps': [],
        'anchors': ['spec', 'tickets', 'code-review']
    }
}

def validate_batch_2(base_dir='/home/amdy/Work/.agents/skills'):
    all_pass = True
    for skill_name, spec in expected.items():
        sf = os.path.join(base_dir, skill_name, 'SKILL.md')
        with open(sf, 'r', encoding='utf-8') as f:
            content = f.read()
        
        errors = []
        parts = content.split('---', 2)
        if len(parts) < 3:
            errors.append("Invalid frontmatter")
        else:
            try:
                fm = yaml.safe_load(parts[1]) or {}
                deps = fm.get('dependencies', [])
                caps = fm.get('capabilities', [])
                for d in spec['deps']:
                    if d not in deps:
                        errors.append(f"Missing dependency: {d}")
                for c in spec['caps']:
                    if c not in caps:
                        errors.append(f"Missing capability: {c}")
            except Exception as e:
                errors.append(f"YAML parsing error: {e}")
                
        for a in spec['anchors']:
            if not re.search(r'\b' + re.escape(a) + r'\b', content, re.IGNORECASE):
                errors.append(f"Missing behavioral anchor: {a}")
                
        if errors:
            all_pass = False
            print(f"[{skill_name}] STATUS: RED")
            for err in errors:
                print(f"  FAIL: {err}")
        else:
            print(f"[{skill_name}] STATUS: GREEN")
            
    return all_pass

if __name__ == '__main__':
    target_dir = sys.argv[1] if len(sys.argv) > 1 else '/home/amdy/Work/.agents/skills'
    success = validate_batch_2(target_dir)
    sys.exit(0 if success else 1)
