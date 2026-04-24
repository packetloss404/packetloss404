#!/usr/bin/env node
/**
 * Orchestrate one daily refresh:
 *   1. Fetch external data (YouTube, commits, repo stats). Failures are
 *      tolerated — a stub is written and the pipeline continues.
 *   2. Pick today's scene + theme from data/config.json, rotated by
 *      day-of-year so the cycle is deterministic.
 *   3. Regenerate pixel-packet.svg, project cards, and README.md.
 *
 * The GitHub Action calls this script directly. Running locally is safe.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function trySoftly(cmd) {
  try { run(cmd); } catch (e) {
    console.error(`soft-fail: ${cmd}  →  ${e.message.split('\n')[0]}`);
  }
}

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function main() {
  const cfg = loadJson(path.join(ROOT, 'data/config.json'), {});
  const scenes = Array.isArray(cfg.scenes) && cfg.scenes.length
    ? cfg.scenes : ['battle-station'];
  const themes = Array.isArray(cfg.themes) && cfg.themes.length
    ? cfg.themes : ['matrix'];

  const doy = dayOfYear();
  // Scene advances every 3 days, theme every 4 days → 12-day combo cycle
  // (assuming 3 scenes × 4 themes). Seed is day-of-year for per-day variety.
  const scene = scenes[Math.floor(doy / 3) % scenes.length];
  const theme = themes[Math.floor(doy / 4) % themes.length];
  console.log(`=== day ${doy}: scene=${scene}  theme=${theme} ===`);

  trySoftly(`node scripts/fetch-youtube.js`);
  trySoftly(`node scripts/fetch-commits.js`);
  trySoftly(`node scripts/fetch-stars.js`);

  // Feed recent commit messages as code-line content for the battle-station
  // scene so the banner's "monitors" display real shipments.
  let dataArg = '';
  if (scene === 'battle-station') {
    const commits = loadJson(path.join(ROOT, 'data/recent-commits.json'), []);
    const codeLines = Array.isArray(commits)
      ? commits.map(c => c.message).filter(Boolean)
      : [];
    if (codeLines.length) {
      const p = path.join(ROOT, 'data/scene-data.json');
      fs.writeFileSync(p, JSON.stringify({ codeLines }, null, 2));
      dataArg = ` --data=data/scene-data.json`;
    }
  }

  run(`node generate-packet.js --scene=${scene} --theme=${theme} --seed=${doy}${dataArg}`);
  run(`node cards/generate-cards.js --theme=${theme}`);
  run(`node scripts/build-readme.js`);

  console.log('=== done ===');
}

main();
