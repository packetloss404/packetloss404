#!/usr/bin/env node
/**
 * Fetch star + fork counts for each repo listed in data/projects.json,
 * writing the result to data/repo-stats.json. Called before card generation
 * so stars appear on each card.
 *
 * Uses `gh api`. Projects with a null repo field are skipped (e.g. external
 * non-GitHub projects).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECTS_PATH = path.join(ROOT, 'data/projects.json');
const OUT_PATH = path.join(ROOT, 'data/repo-stats.json');

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function main() {
  const projects = loadJson(PROJECTS_PATH, []);
  if (!Array.isArray(projects) || projects.length === 0) {
    console.error('no projects configured; skipping');
    return;
  }

  const stats = loadJson(OUT_PATH, {});
  let updated = 0;
  for (const p of projects) {
    if (!p.repo) continue;
    try {
      const raw = execSync(`gh api repos/${p.repo}`, {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      });
      const info = JSON.parse(raw);
      stats[p.repo] = {
        stars: info.stargazers_count,
        forks: info.forks_count,
        description: info.description || '',
        updated: new Date().toISOString(),
      };
      updated++;
    } catch (e) {
      console.error(`failed ${p.repo}: ${e.message.split('\n')[0]}`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(stats, null, 2));
  console.log(`updated ${updated} repo(s) in ${OUT_PATH}`);
}

main();
