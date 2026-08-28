/**
 * Pure Interpretation Layer (Untrusted).
 * Converts user natural language or structured model strings into untrusted CandidateIntent.
 *
 * Invariant: NEVER produces ValidatedIntent, StateDiff, or GameState mutations.
 * Invariant: ROLE != MODEL, ROLE != PROVIDER.
 */

/**
 * Parses user text into CandidateIntent shape:
 * {
 *   actions: [{ verb: string|null, targets: string[] }],
 *   properties: Array<[string, string]>
 * }
 * @param {string|object} input
 * @returns {object} CandidateIntent
 */
export function interpretText(input) {
  if (!input) {
    return {
      actions: [{ verb: null, targets: [] }],
      properties: []
    };
  }

  // 1. Direct structured JSON object or JSON string support (Transport)
  if (typeof input === 'object' && input !== null) {
    return sanitizeCandidateIntent(input);
  }

  const rawText = String(input).trim();
  if (rawText.startsWith('{') && rawText.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawText);
      return sanitizeCandidateIntent(parsed);
    } catch {
      // Fall through to natural language text parsing
    }
  }

  const properties = [];
  let cleanText = rawText;

  // Check for smuggled properties or authority leak attempts in natural language
  const leakMatch = cleanText.match(/\b(success\s*[:=]\s*(true|false)|state_after\s*[:=]\s*[^\s]+)/i);
  if (leakMatch) {
    const parts = leakMatch[0].split(/[:=]/).map(s => s.trim());
    properties.push([parts[0], parts[1] || 'true']);
    cleanText = cleanText.replace(leakMatch[0], '').trim();
  }

  const lower = cleanText.toLowerCase();

  // 2. Natural Language Mapping Rules to Microdomain Commands
  // Acquire key / crate
  if (/^(acquire|pick\s*up|take|get|grab)\s+(the\s+)?(brass\s+)?key$/i.test(lower)) {
    return {
      actions: [{ verb: 'Acquire', targets: ['key'] }],
      properties
    };
  }
  if (/^(acquire|pick\s*up|take|get|grab)\s+(the\s+)?crate$/i.test(lower)) {
    return {
      actions: [{ verb: 'Acquire', targets: ['crate'] }],
      properties
    };
  }

  // Move room_a / room_b
  if (/^(move|go|walk|travel)(\s+to)?\s+(the\s+)?room_?a$/i.test(lower)) {
    return {
      actions: [{ verb: 'Move', targets: ['room_a'] }],
      properties
    };
  }
  if (/^(move|go|walk|travel)(\s+to)?\s+(the\s+)?room_?b$/i.test(lower)) {
    return {
      actions: [{ verb: 'Move', targets: ['room_b'] }],
      properties
    };
  }

  // Open door (Recognized natural command that is unsupported in simulation microdomain)
  if (/^open(\s+the)?\s+door/i.test(lower)) {
    return {
      actions: [{ verb: 'Open', targets: ['door'] }],
      properties
    };
  }

  // Teleport moon (Unsupported action & unknown target)
  if (/^teleport(\s+to)?\s+(the\s+)?moon/i.test(lower)) {
    return {
      actions: [{ verb: 'Teleport', targets: ['moon'] }],
      properties
    };
  }

  // Generic two-word fallback: verb target
  const words = cleanText.split(/\s+/).filter(Boolean);
  if (words.length === 2) {
    const verb = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    const target = words[1];
    return {
      actions: [{ verb, targets: [target] }],
      properties
    };
  } else if (words.length === 1) {
    const verb = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return {
      actions: [{ verb, targets: [] }],
      properties
    };
  }

  // Default multi-word or unrecognized input
  return {
    actions: [{ verb: words[0] || null, targets: words.slice(1) }],
    properties
  };
}

/**
 * Sanitizes and normalizes candidate intent object shape
 * @param {object} obj
 * @returns {object} CandidateIntent
 */
function sanitizeCandidateIntent(obj) {
  const actions = [];
  const properties = [];

  // Check if object attempted to smuggle authority properties directly
  for (const [k, v] of Object.entries(obj)) {
    if (k !== 'actions' && k !== 'properties' && k !== 'action' && k !== 'target') {
      properties.push([String(k), String(v)]);
    }
  }

  if (Array.isArray(obj.actions)) {
    for (const a of obj.actions) {
      if (typeof a === 'object' && a !== null) {
        const verb = a.verb !== undefined && a.verb !== null ? String(a.verb) : null;
        const targets = Array.isArray(a.targets) ? a.targets.map(String) : (a.target ? [String(a.target)] : []);
        actions.push({ verb, targets });
      }
    }
  } else if (obj.action || obj.verb) {
    const verb = obj.action || obj.verb;
    const targets = Array.isArray(obj.targets)
      ? obj.targets.map(String)
      : (obj.target ? [String(obj.target)] : []);
    actions.push({ verb: String(verb), targets });
  }

  if (Array.isArray(obj.properties)) {
    for (const p of obj.properties) {
      if (Array.isArray(p) && p.length === 2) {
        properties.push([String(p[0]), String(p[1])]);
      }
    }
  }

  return { actions, properties };
}
