#!/usr/bin/env node
/**
 * Generate a particle-dot scene as an animated SVG.
 *
 * Usage:
 *   node generate-packet.js [--scene=<name>] [--theme=<name>] [--seed=<n>] [--out=<path>] [--data=<path>]
 *
 * Defaults: scene=battle-station, theme=matrix, seed=42, out=pixel-packet.svg
 * When --data points to a JSON file with { codeLines: [...] }, those strings
 * drive the monitor code-line widths (for data-driven variants of scenes that
 * support it).
 */

const fs = require('fs');
const path = require('path');
const { createRng } = require('./src/helpers');
const themes = require('./src/themes');
const { renderSvg } = require('./src/render');

function parseArgs(argv) {
  const args = { scene: 'battle-station', theme: 'matrix', seed: 42, out: 'pixel-packet.svg', data: null };
  for (const raw of argv.slice(2)) {
    const m = raw.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === 'seed') args.seed = parseInt(v, 10);
    else if (k in args) args[k] = v;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  const theme = themes[args.theme];
  if (!theme) {
    console.error(`Unknown theme: ${args.theme}. Available: ${Object.keys(themes).join(', ')}`);
    process.exit(1);
  }

  let scene;
  try {
    scene = require(`./scenes/${args.scene}`);
  } catch (e) {
    console.error(`Unknown scene: ${args.scene}. Drop a module at scenes/${args.scene}.js`);
    process.exit(1);
  }

  let sceneOptions = {};
  if (args.data) {
    const dataPath = path.resolve(args.data);
    if (!fs.existsSync(dataPath)) {
      console.error(`Data file not found: ${dataPath}`);
      process.exit(1);
    }
    sceneOptions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  const rng = createRng(args.seed);
  const points = scene.build(rng, sceneOptions);
  const svg = renderSvg(points, theme, rng);

  fs.writeFileSync(args.out, svg);
  console.log(`Generated ${points.length} particle dots`);
  console.log(`Scene: ${args.scene}  Theme: ${args.theme}  Seed: ${args.seed}`);
  console.log(`Output: ${args.out}`);
}

main();
