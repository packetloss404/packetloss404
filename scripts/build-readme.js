#!/usr/bin/env node
/**
 * Build README.md from templates/README.template.md by substituting {{tokens}}
 * with dynamic content from data/. Safe to run repeatedly — deterministic
 * given the same inputs (except {{tagline}} which rotates by day-of-year).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'templates/README.template.md');
const OUT = path.join(ROOT, 'README.md');

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function escapeHtml(s) {
  return String(s).replace(/[<>&"]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
}

function escapeMdText(s) {
  // Protect square brackets / backticks from breaking markdown link syntax
  return String(s).replace(/[\[\]`]/g, (c) => '\\' + c);
}

function formatYoutube(y) {
  if (!y || y.error || !y.url) {
    return '<sub><em>No recent uploads visible.</em></sub>';
  }
  const thumb = y.thumbnail
    ? `<img src="${y.thumbnail}" alt="${escapeHtml(y.title)}" width="360"/>`
    : '';
  return `<a href="${y.url}">${thumb}</a><br><sub>${escapeHtml(y.title)}</sub>`;
}

function formatCommits(cs) {
  if (!Array.isArray(cs) || cs.length === 0) {
    return '<sub><em>No recent shipments visible.</em></sub>';
  }
  return cs.map((c) => {
    const date = (c.date || '').slice(0, 10);
    const repoShort = c.repo.split('/').pop();
    return `- \`${repoShort}\` — [${escapeMdText(c.message)}](${c.url}) <sub>· ${date}</sub>`;
  }).join('\n');
}

function formatProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) return '';
  const cells = projects.map((p) => (
    `  <td width="33%" align="center"><a href="${p.url}"><img src="cards/${p.slug}.svg" alt="${escapeHtml(p.title)}" width="100%"/></a></td>`
  ));
  return `<table>\n<tr>\n${cells.join('\n')}\n</tr>\n</table>`;
}

function formatStatus(s) {
  if (!s || !s.now) return '<sub><em>Status not set.</em></sub>';
  let out = `> ${s.now}`;
  if (Array.isArray(s.links) && s.links.length) {
    const links = s.links.map((l) => `[${l.label}](${l.url})`).join(' · ');
    out += `\n>\n> ${links}`;
  }
  return out;
}

function main() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error(`template not found: ${TEMPLATE}`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const taglines = loadJson(path.join(ROOT, 'data/taglines.json'), ['terminal-first by choice']);
  const status   = loadJson(path.join(ROOT, 'data/status.json'), {});
  const youtube  = loadJson(path.join(ROOT, 'data/youtube.json'), null);
  const commits  = loadJson(path.join(ROOT, 'data/recent-commits.json'), []);
  const projects = loadJson(path.join(ROOT, 'data/projects.json'), []);

  const tagline = Array.isArray(taglines) && taglines.length
    ? taglines[dayOfYear() % taglines.length]
    : 'terminal-first by choice';

  const ctx = {
    tagline,
    status:   formatStatus(status),
    youtube:  formatYoutube(youtube),
    commits:  formatCommits(commits),
    projects: formatProjects(projects),
    year:     String(new Date().getFullYear()),
    updated:  new Date().toISOString().slice(0, 10),
  };

  let output = template;
  for (const [k, v] of Object.entries(ctx)) {
    output = output.split(`{{${k}}}`).join(v);
  }

  fs.writeFileSync(OUT, output);
  console.log(`wrote ${OUT}`);
}

main();
