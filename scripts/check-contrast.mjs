import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/workspace-theme.css', import.meta.url), 'utf8');
const root = css.match(/:root\s*\{([^}]+)\}/)?.[1];
const dark = css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1];
if (!root || !dark) throw new Error('Theme token blocks were not found.');

function tokens(block) {
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})\s*;/gi)].map(([, name, color]) => [name, color]));
}

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

// Representative semantic combinations; this does not audit every legacy class or state.
const pairs = [
  ['text-primary', 'surface', 4.5],
  ['text-secondary', 'surface', 4.5],
  ['text-secondary', 'surface-subtle', 4.5],
  ['action-on-primary', 'action-primary', 4.5],
  ['positive', 'positive-surface', 4.5],
  ['caution', 'caution-surface', 4.5],
  ['critical', 'critical-surface', 4.5],
  ['border-control', 'surface', 3],
  ['focus', 'surface', 3],
];

let failed = false;
for (const [mode, block] of [['light', root], ['dark', dark]]) {
  const palette = tokens(block);
  for (const [foreground, background, minimum] of pairs) {
    if (!palette[foreground] || !palette[background]) throw new Error(`Missing ${mode} token: ${foreground} or ${background}`);
    const ratio = contrast(palette[foreground], palette[background]);
    const passes = ratio >= minimum;
    if (!passes) failed = true;
    process.stdout.write(`${mode.padEnd(5)} ${foreground.padEnd(18)} / ${background.padEnd(17)} ${ratio.toFixed(2)}:1 ${passes ? 'PASS' : `FAIL (${minimum}:1)`}\n`);
  }
}
if (failed) process.exitCode = 1;
