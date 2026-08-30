/**
 * Monospace TUI Status Meters & Observability Views
 * Surface Profile: surface.tell.server (ISA-KAD-AESTHETIC-001)
 *
 * Invariants:
 * 1. High-density text meters with 0ms transition overhead.
 * 2. Zero graphical, X11, or Wayland dependencies.
 * 3. 4-way redundant epistemic indicators (Text + Brackets + ANSI Color).
 */

import { formatAnsi } from './ansi-palette.mjs';

/**
 * Formats a numeric fraction (0.0 to 1.0) into a compact ASCII meter.
 */
export function formatMeter(fraction, { width = 10, mode = 'ansi16', color = 'cyan' } = {}) {
  const clamped = Math.max(0, Math.min(1, Number(fraction) || 0));
  const filledCount = Math.round(clamped * width);
  const emptyCount = width - filledCount;

  const filledChar = '█';
  const emptyChar = '░';

  const barText = `${filledChar.repeat(filledCount)}${emptyChar.repeat(emptyCount)}`;
  const pctText = `${(clamped * 100).toFixed(1)}%`;

  if (mode === 'plain') {
    return `[${barText}] ${pctText}`;
  }

  const meterColor = clamped > 0.9 ? 'red' : clamped > 0.75 ? 'yellow' : color;
  const coloredBar = formatAnsi(barText, { color: meterColor, mode });
  return `[${coloredBar}] ${pctText}`;
}

/**
 * Formats epistemic status into standard bracketed badge.
 */
export function formatEpistemicBadge(status, { mode = 'ansi16' } = {}) {
  const norm = String(status || '').toUpperCase();
  if (norm.includes('CANONICAL') || norm.includes('SOURCE_FACT')) {
    const text = '[CANONICAL]';
    return mode === 'plain' ? text : formatAnsi(text, { color: 'gold', bold: true, mode });
  }
  if (norm.includes('DERIVED') || norm.includes('PROJECT_INFERENCE')) {
    const text = '[DERIVED]';
    return mode === 'plain' ? text : formatAnsi(text, { color: 'cyan', mode });
  }
  const text = '[HEURISTIC]';
  return mode === 'plain' ? text : formatAnsi(text, { color: 'yellow', mode });
}

/**
 * Renders complete high-density TUI status view for headless server.
 */
export function renderServerStatusView(telemetry = {}, { mode = 'ansi16' } = {}) {
  const header = formatAnsi('=== TELL SERVER // HEADLESS OBSERVABILITY ===', { color: 'cyan', bold: true, mode });
  const sub = formatAnsi('Surface: surface.tell.server (KAD_PROFILE_SERVER, 0ms, NO_AUDIO_UI)', { color: 'border', mode });

  const cpuPct = telemetry.cpuPercent !== undefined ? telemetry.cpuPercent / 100 : 0;
  const cpuLine = `  CPU: ${formatMeter(cpuPct, { width: 15, mode, color: 'cyan' })}`;

  const ramUsed = telemetry.ramUsedBytes || 0;
  const ramTotal = telemetry.ramTotalBytes || 1;
  const ramPct = ramUsed / ramTotal;
  const ramGbUsed = (ramUsed / (1024 ** 3)).toFixed(1);
  const ramGbTotal = (ramTotal / (1024 ** 3)).toFixed(1);
  const ramLine = `  RAM: ${formatMeter(ramPct, { width: 15, mode, color: 'cyan' })} (${ramGbUsed}G / ${ramGbTotal}G)`;

  const badge = formatEpistemicBadge(telemetry.epistemicStatus || 'CANONICAL_KNOWLEDGE', { mode });
  const statusLine = `  Authority: ${badge} | Workers Active: ${telemetry.activeWorkers ?? 0}`;

  return [
    header,
    sub,
    '',
    cpuLine,
    ramLine,
    statusLine,
    ''
  ].join('\n');
}
