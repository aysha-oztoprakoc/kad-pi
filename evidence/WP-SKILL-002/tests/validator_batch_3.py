import os, sys, re, yaml

expected = {
    'tdd': {
        'deps': ['codebase-design'],
        'caps': [],
        'anchors': ['tdd', 'red-green-refactor']
    },
    'setup-ts-deep-modules': {
        'deps': ['codebase-design'],
        'caps': [],
        'anchors': ['dependency-cruiser', 'deep module']
    },
    'wait-what': {
        'deps': ['domain-modeling'],
        'caps': [],
        'anchors': ['Simplified Technical English', 'CONTEXT.md']
    },
    'writing-fragments': {
        'deps': ['grilling'],
        'caps': ['ask_user'],
        'anchors': ['explore', 'grilling']
    },
    'writing-shape': {
        'deps': ['grilling'],
        'caps': ['ask_user'],
        'anchors': ['exploit', 'grilling']
    },
    'retro': {
        'deps': ['writing-for-agents'],
        'caps': [],
        'anchors': ['retrospective', 'AGENTS.md']
    }
}

def validate_batch_3(base_dir='/home/amdy/Work/.agents/skills'):
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
    success = validate_batch_3(target_dir)
    sys.exit(0 if success else 1)
