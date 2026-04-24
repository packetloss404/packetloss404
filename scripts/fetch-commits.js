#!/usr/bin/env node
/**
 * Fetch the most recent public push events for the configured GitHub user
 * and write the 5 most recent non-bot commits to data/recent-commits.json.
 *
 * Uses `gh api` — expects the CLI to be authenticated locally, or GITHUB_TOKEN
 * to be set (as in GitHub Actions).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'data/config.json');
const OUT_PATH = path.join(ROOT, 'data/recent-commits.json');

const MAX = 5;
const BOT_PREFIXES = ['chore(auto):', 'Merge branch', 'Merge pull', 'Merge remote'];

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function isBotMessage(msg) {
  return BOT_PREFIXES.some(pfx => msg.startsWith(pfx));
}

function main() {
  const cfg = loadJson(CONFIG_PATH, {});
  const user = cfg.githubUser || process.env.GITHUB_USER || 'packetloss404';

  let events;
  try {
    const raw = execSync(`gh api "users/${user}/events/public?per_page=100"`, {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    events = JSON.parse(raw);
  } catch (e) {
    console.error(`gh api failed: ${e.message}`);
    fs.writeFileSync(OUT_PATH, JSON.stringify({ error: e.message }, null, 2));
    return;
  }

  // The public events API no longer includes per-commit messages in payload;
  // fetch each PushEvent's head commit separately.
  const commits = [];
  const seen = new Set();
  for (const ev of events) {
    if (ev.type !== 'PushEvent') continue;
    const sha = ev.payload && ev.payload.head;
    if (!sha || seen.has(sha)) continue;
    seen.add(sha);
    try {
      const raw = execSync(`gh api repos/${ev.repo.name}/commits/${sha}`, {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      });
      const info = JSON.parse(raw);
      const msg = ((info.commit && info.commit.message) || '').split('\n')[0].trim();
      if (!msg || isBotMessage(msg)) continue;
      commits.push({
        repo: ev.repo.name,
        message: msg,
        sha: sha.slice(0, 7),
        date: (info.commit && info.commit.author && info.commit.author.date) || ev.created_at,
        url: `https://github.com/${ev.repo.name}/commit/${sha}`,
      });
      if (commits.length >= MAX) break;
    } catch (e) {
      console.error(`fetch commit ${sha.slice(0, 7)} failed: ${e.message.split('\n')[0]}`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(commits, null, 2));
  console.log(`wrote ${commits.length} commits to ${OUT_PATH}`);
}

main();
