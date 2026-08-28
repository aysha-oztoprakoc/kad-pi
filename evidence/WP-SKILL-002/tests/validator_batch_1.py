import os, sys, re, yaml

def validate_skill(name, skill_path, expected_deps, expected_caps, forbidden_strings, anchors):
    with open(skill_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    
    # 1. Purity
    found_forbidden = [w for w in forbidden_strings if re.search(r'\b' + re.escape(w) + r'\b', content)]
    if found_forbidden:
        errors.append(f"Forbidden strings found: {found_forbidden}")
        
    # 2. Frontmatter dependencies & capabilities
    parts = content.split('---', 2)
    if len(parts) < 3:
        errors.append("Invalid frontmatter")
    else:
        try:
            fm = yaml.safe_load(parts[1]) or {}
            deps = fm.get('dependencies', [])
            caps = fm.get('capabilities', [])
            for d in expected_deps:
                if d not in deps:
                    errors.append(f"Missing dependency: {d}")
            for c in expected_caps:
                if c not in caps:
                    errors.append(f"Missing capability: {c}")
        except Exception as e:
            errors.append(f"YAML parsing error: {e}")
            
    # 3. Behavioral anchors
    for a in anchors:
        if not re.search(r'\b' + re.escape(a) + r'\b', content, re.IGNORECASE):
            errors.append(f"Missing behavioral anchor: {a}")
            
    if errors:
        print(f"[{name}] STATUS: RED")
        for err in errors:
            print(f"  FAIL: {err}")
        return False
    else:
        print(f"[{name}] STATUS: GREEN")
        return True

def run_batch_1(base_dir='/home/amdy/Work/.agents/skills'):
    forbidden = ['ask_question', 'ask_user_question', 'Antigravity', 'Pi', 'DSH']
    
    # grill-with-docs
    p_gwd = os.path.join(base_dir, 'grill-with-docs', 'SKILL.md')
    v_gwd = validate_skill(
        'grill-with-docs', p_gwd,
        expected_deps=['grilling', 'domain-modeling'],
        expected_caps=['ask_user'],
        forbidden_strings=forbidden,
        anchors=['interview', 'CONTEXT.md', 'ADR']
    )
    
    # wayfinder
    p_wf = os.path.join(base_dir, 'wayfinder', 'SKILL.md')
    v_wf = validate_skill(
        'wayfinder', p_wf,
        expected_deps=['domain-modeling', 'grilling', 'prototype', 'research', 'setup-matt-pocock-skills'],
        expected_caps=['ask_user'],
        forbidden_strings=forbidden,
        anchors=['destination', 'shared map', 'decision tickets', 'frontier']
    )
    
    return v_gwd and v_wf

if __name__ == '__main__':
    target_dir = sys.argv[1] if len(sys.argv) > 1 else '/home/amdy/Work/.agents/skills'
    success = run_batch_1(target_dir)
    sys.exit(0 if success else 1)
