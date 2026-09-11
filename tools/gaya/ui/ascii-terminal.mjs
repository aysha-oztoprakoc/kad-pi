// Pure ASCII Terminal Renderer for Gaya: The YKT Refuge
// Follows Section 6 (ASCII interface specification) of the Technical Handoff.

import { REFUGE_ROOMS } from '../content/registry.mjs';

/**
 * Generates an ASCII fatigue meter.
 */
function renderMeter(value, maxBars = 5) {
  const filled = Math.min(maxBars, Math.max(0, Math.round(value * maxBars)));
  const empty = maxBars - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Renders a full ASCII terminal frame for the active character and simulation state.
 */
export function renderAsciiFrame(state, options = {}) {
  const controlledId = options.controlledActorId ?? 'actor.aysha';
  const actor = state.actors[controlledId] ?? Object.values(state.actors)[0];
  const currentRoom = REFUGE_ROOMS[actor.location_id];
  const roomOccupants = (state.rooms[actor.location_id]?.occupants ?? [])
    .filter((id) => id !== actor.id)
    .map((id) => state.actors[id]);

  const logLines = options.logs ?? [
    'The morning bell chimes through the YKT Refuge heartwood.',
    'Refuge larder is stocked with fresh provisions.'
  ];

  const choices = options.choices ?? [
    { id: '1', label: 'Inspect the lesson reservation' },
    { id: '2', label: 'Invite Amethysta to eat' },
    { id: '3', label: 'Walk to the kitchen' },
    { id: '4', label: 'Review today’s work priorities' },
    { id: '5', label: 'Open conversation with Douglas' },
    { id: '0', label: 'Pause / main menu' }
  ];

  const width = 85;
  const padRight = (str, len) => str + ' '.repeat(Math.max(0, len - str.length));

  const clock = state.time_str ?? 'Day 1 09:00';
  const headerLeft = `─ GAYA / YKT REFUGE ─ ${currentRoom.name.toUpperCase()} ─ ${clock} `;
  const headerRight = `─ CONTROL ─────────────`;
  const topBorder = `┌${headerLeft}${'─'.repeat(Math.max(0, 57 - headerLeft.length))}┬${headerRight}┐`;
  // Map & Control rows
  const rows = [topBorder];
  const mapLines = [
    `                                                `,
    `      ###########                 +------------+`,
    `      #   B     #                 |  KITCHEN   |`,
    `  +---#         #---+             +------------+`,
    `  |   ###########   |                           `,
    `  |       @         |       HEARTWOOD COMMONS   `,
    `  |   A        D    |       [table][hearth]     `,
    `  +-----------------+                           `,
    `                                                `
  ];

  const controlLines = [
    padRight(` ${actor.name}`, 22),
    padRight(` Loc: ${currentRoom.name.slice(0, 15)}`, 22),
    padRight(` HP: ${actor.hp_current} / ${actor.hp_max}`, 22),
    padRight(` Khan: ${actor.khan_personal ?? 0} (pers)`, 22),
    padRight(` Yorman: ${actor.yorman_personal ?? 0} (pers)`, 22),
    padRight(` Fatigue: ${renderMeter(actor.fatigue)}`, 22),
    padRight(` Hunger:  ${renderMeter(actor.hunger)}`, 22),
    `├─ PRESENT ────────────┤`,
    ...roomOccupants.map((occ) => padRight(` ${occ.name[0]}  ${occ.name.slice(0, 16)}`, 22))
  ];

  const maxRows = Math.max(mapLines.length, 9);
  for (let i = 0; i < maxRows; i++) {
    const mapPart = padRight(mapLines[i] ?? '', 57);
    const ctrlPart = controlLines[i] ? (controlLines[i].startsWith('├') ? controlLines[i] : `│${controlLines[i]}`) : `│${' '.repeat(22)}`;
    if (ctrlPart.startsWith('├')) {
      rows.push(`│${mapPart}${ctrlPart}`);
    } else {
      rows.push(`│${mapPart}${ctrlPart}│`);
    }
  }

  // Divider
  rows.push(`├─ LOG ────────────────────────────────────────────────────┴────────────────────────┤`);
  for (const log of logLines.slice(-2)) {
    rows.push(`│ ${padRight(log, width - 4)} │`);
  }

  // Choices
  rows.push(`├─ CHOICES ──────────────────────────────────────────────────────────────────────────┤`);
  for (const choice of choices) {
    const text = `[${choice.id}] ${choice.label}`;
    rows.push(`│ ${padRight(text, width - 4)} │`);
  }
  rows.push(`└────────────────────────────────────────────────────────────────────────────────────┘`);
  rows.push(`Legend: @ controlled actor, A/B/D residents, # wall, + connector, [] furniture.`);

  return rows.join('\n');
}
