import os, sys, re, yaml

def validate_grill_me(skill_path):
    with open(skill_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    
    # 1. Harness Purity
    forbidden = ['ask_question', 'ask_user_question', 'Antigravity', 'Pi', 'DSH']
    found_forbidden = [w for w in forbidden if re.search(r'\b' + re.escape(w) + r'\b', content)]
    if found_forbidden:
        errors.append(f'Forbidden harness strings found: {found_forbidden}')
        
    # 2. Frontmatter and Dependencies
    parts = content.split('---', 2)
    if len(parts) < 3:
        errors.append('Invalid frontmatter')
    else:
        try:
            fm = yaml.safe_load(parts[1]) or {}
            deps = fm.get('dependencies', [])
            caps = fm.get('capabilities', [])
            if 'grilling' not in deps:
                errors.append('Missing explicit grilling dependency in frontmatter')
            if 'ask_user' not in caps:
                errors.append('Missing explicit ask_user capability in frontmatter')
        except Exception as e:
            errors.append(f'YAML parsing error: {e}')
            
    # 3. Behavioral Anchors
    anchors = ['grilling', 'interview']
    for a in anchors:
        if not re.search(r'\b' + a + r'\b', content, re.IGNORECASE):
            errors.append(f'Missing behavioral anchor: {a}')
            
    if errors:
        print('STATUS: RED')
        for err in errors:
            print(f'  FAIL: {err}')
        return False
    else:
        print('STATUS: GREEN - All checks passed.')
        return True

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '/home/amdy/Work/.agents/skills/grill-me/SKILL.md'
    success = validate_grill_me(target)
    sys.exit(0 if success else 1)
