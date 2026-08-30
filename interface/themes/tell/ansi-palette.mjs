/**
 * Pure 16-Color ANSI and 24-Bit TrueColor Palette Adapter
 * Surface Profile: surface.tell.server (ISA-KAD-AESTHETIC-001)
 *
 * Invariants:
 * 1. Monospace ANSI 16-color baseline with 24-bit TrueColor enhancement.
 * 2. Graceful fallback to pure plain text (0-color) when terminal formatting is unsupported.
 * 3. 0ms rendering latency with zero GUI/audio dependencies.
 */

export const ANSI_16_PALETTE = Object.freeze({
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97
});

export const TRUECOLOR_PALETTE = Object.freeze({
  canvas: { r: 7, g: 9, b: 14, hex: '#07090e' },
  panel: { r: 21, g: 25, b: 35, hex: '#151923' },
  crimson: { r: 26, g: 8, b: 10, hex: '#1a080a' },
  cyan: { r: 104, g: 213, b: 232, hex: '#68d5e8' },
  bone: { r: 231, g: 232, b: 230, hex: '#e7e8e6' },
  gold: { r: 231, g: 186, b: 114, hex: '#e7ba72' },
  green: { r: 121, g: 214, b: 154, hex: '#79d69a' },
  red: { r: 240, g: 82, b: 82, hex: '#f05252' },
  purple: { r: 192, g: 132, b: 252, hex: '#c084fc' },
  border: { r: 48, g: 55, b: 70, hex: '#303746' }
});

const ANSI_COLOR_MAP = {
  cyan: 36,
  brightCyan: 96,
  gold: 33,
  yellow: 33,
  brightYellow: 93,
  green: 32,
  brightGreen: 92,
  red: 31,
  brightRed: 91,
  purple: 35,
  magenta: 35,
  bone: 37,
  white: 37,
  panel: 30,
  black: 30,
  border: 90,
  brightBlack: 90
};

export function formatAnsi(text, { color = null, bg = null, bold = false, dim = false, mode = 'ansi16' } = {}) {
  if (!text) return '';
  if (mode === 'plain') return String(text);

  const prefix = [];
  if (bold) prefix.push('1');
  if (dim) prefix.push('2');

  if (mode === 'truecolor' && color && TRUECOLOR_PALETTE[color]) {
    const { r, g, b } = TRUECOLOR_PALETTE[color];
    prefix.push(`38;2;${r};${g};${b}`);
  } else if (color && ANSI_COLOR_MAP[color]) {
    prefix.push(String(ANSI_COLOR_MAP[color]));
  }

  if (mode === 'truecolor' && bg && TRUECOLOR_PALETTE[bg]) {
    const { r, g, b } = TRUECOLOR_PALETTE[bg];
    prefix.push(`48;2;${r};${g};${b}`);
  }

  if (prefix.length === 0) return String(text);
  return `\x1b[${prefix.join(';')}m${text}\x1b[0m`;
}
