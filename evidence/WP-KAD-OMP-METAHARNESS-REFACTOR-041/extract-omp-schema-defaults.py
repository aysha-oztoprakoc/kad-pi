#!/usr/bin/env python3
"""Deterministic extractor for OMP 18.0.11 settings-schema defaults.

Versioned against source revision b8ce33a58911c26bed1d84f0db9a5e2e727c49a2
(v18.0.11). Static-schema-extraction only: parses SETTINGS_SCHEMA, resolves
literal + constant defaults, marks unresolvable as UNKNOWN. Never infers from
the effective runtime value.

Usage: python3 extract-omp-schema-defaults.py <settings-schema.ts> <out.json>
"""
import json, re, sys

# Constant map: in-file + imported constants, resolved from the exact
# v18.0.11 source tree (values pinned here for offline reproducibility).
CONST = {
  "EMPTY_STRING_ARRAY": [], "EMPTY_STRING_RECORD": {}, "EMPTY_NUMBER_RECORD": {},
  "EMPTY_MODEL_TAGS_RECORD": {}, "DEFAULT_AGENT_MODEL_OVERRIDES": {},
  "DEFAULT_CYCLE_ORDER": ["smol", "default", "slow"],
  "DEFAULT_TOOL_CALL_LOOP_EXEMPT_TOOLS": ["hub"],
  "HINDSIGHT_RECALL_TYPES_DEFAULT": ["world", "experience"],
  "DEFAULT_COMPACTION_METHOD_ORDER": ["snapcompact"],
  "DEFAULT_BASH_INTERCEPTOR_RULES": "[non-empty object array: 5 bash interceptor rules]",
  "ONLINE_MEMORY_MODEL_KEY": "online", "ONLINE_TINY_TITLE_MODEL_KEY": "online",
  "ONLINE_AUTO_THINKING_MODEL_KEY": "online", "DEFAULT_TTS_VOICE": "af_heart",
  "DEFAULT_TTS_LOCAL_MODEL_KEY": "kokoro", "TINY_MODEL_DTYPE_DEFAULT": "default",
  "TINY_MODEL_DEVICE_DEFAULT": "default", "DEFAULT_STT_MODEL_KEY": "parakeet",
  "DEFAULT_LIVE_VOICE": "sol", "DEFAULT_RELAY_URL": "wss://my.omp.sh",
  "DEFAULT_SHARE_URL": "https://my.omp.sh/s", "DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS": 60,
}

def resolve_expr(s):
    s = s.strip()
    s = re.sub(r'\s+as\s+.*$', '', s).strip()          # strip type assertion (consume nested generics)
    s = re.sub(r',\s*//.*$', '', s).strip()
    s = re.sub(r'\s+as\s+[^,}]*$', '', s).strip()     # strip type assertion
    s = s.rstrip(',').strip()
    if s == 'undefined': return (None, 'undefined')
    if s in ('false', 'true'): return (s == 'true', 'literal')
    if s == 'null': return (None, 'literal')
    if re.fullmatch(r'-?\d+(\.\d+)?', s): return (float(s) if '.' in s else int(s), 'literal')
    if re.fullmatch(r'[\d_]+', s):                     # numeric separators e.g. 30_000
        return (int(s.replace('_', '')), 'literal')
    if re.fullmatch(r'[\d\s*+]+', s):                  # arithmetic e.g. 5 * 60 * 1000
        try: return (eval(s, {'__builtins__': {}}), 'arithmetic')
        except Exception: return (s, 'raw')
    if s.startswith('[...'):                           # spread e.g. [...CONST]
        m = re.fullmatch(r'\[\.\.\.([A-Z_]+)\]', s)
        if m and m.group(1) in CONST: return (CONST[m.group(1)], 'constant')
        return (None, 'unknown')
    if s.startswith('"') and s.endswith('"'):
        try: return (json.loads(s), 'literal')
        except Exception: return (s, 'literal')
    if s.startswith('[') and s.endswith(']'):
        try: return (json.loads(s), 'literal-array')
        except Exception: return (s, 'literal-array-raw')
    if s.startswith('{') and s.endswith('}'):
        try: return (json.loads(re.sub(r'\s+as\s+.*$', '', s)), 'literal-object')
        except Exception: return (s, 'literal-object-raw')
    if re.fullmatch(r'[A-Z][A-Z0-9_]*', s):
        if s in CONST: return (CONST[s], 'constant')
        return (None, 'unknown')                        # UNKNOWN rule: never guess
    return (s, 'raw')

def extract(src_path):
    lines = open(src_path).read().splitlines()
    schema = {}
    i = 0
    while i < len(lines):
        ln = lines[i]
        m = re.match(r'^\t(?:"([^"]+)"|([A-Za-z][\w.]*)): \{\s*type: "([^"]+)",\s*default: (.*?)\s*\}(,)?\s*$', ln)
        if m:
            key = m.group(1) or m.group(2); t = m.group(3)
            dv = re.sub(r',\s*(credential|ui|options|values|label|description|hidden):.*$', '', m.group(4)).strip().rstrip(',')
            d, k = resolve_expr(dv)
            schema[key] = {"type": t, "schema_default": d, "default_kind": k}
            i += 1; continue
        m = re.match(r'^\t(?:"([^"]+)"|([A-Za-z][\w.]*)): \{', ln)
        if m:
            key = m.group(1) or m.group(2); t = None; d = None; k = None; j = i + 1
            while j < len(lines):
                l2 = lines[j]
                tm = re.match(r'^\t\ttype: "([^"]+)"', l2)
                dm = re.match(r'^\t\tdefault: (.*)$', l2)
                if tm: t = tm.group(1)
                elif dm:
                    dv = re.sub(r',\s*//.*$', '', dm.group(1)).strip().rstrip(',')
                    d, k = resolve_expr(dv)
                elif re.match(r'^\t\S', l2) or re.match(r'^\t\}$', l2):
                    if t is not None: schema[key] = {"type": t, "schema_default": d, "default_kind": k}
                    break
                j += 1
            i = j; continue
        i += 1
    return schema

def main():
    src, out = sys.argv[1], sys.argv[2]
    doc = {
        "schema": "kad.omp-schema-defaults/v1",
        "omp_version": "18.0.11",
        "source_revision": "b8ce33a58911c26bed1d84f0db9a5e2e727c49a2",
        "source_path": "packages/coding-agent/src/config/settings-schema.ts",
        "extraction_method": "static-schema-extraction",
        "settings": extract(src),
    }
    json.dump(doc, open(out, "w"), indent=2)
    print(len(doc["settings"]), "settings extracted")

if __name__ == "__main__":
    main()
