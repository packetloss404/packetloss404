#!/usr/bin/env node
/**
 * Build README.md from templates/README.template.md by substituting {{tokens}}
 * with dynamic content from data/. Safe to run repeatedly — deterministic
 * given the same inputs.
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

function formatProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) return '';
  const columns = projects.length <= 5 ? 2 : 3;
  const width = `${Math.floor(100 / columns)}%`;
  const cell = (p, centered = false) =>
    `  <td ${centered ? 'colspan="2" width="100%"' : `width="${width}"`} align="center"><a href="${p.url}"><picture><source media="(max-width: 600px)" srcset="cards/${p.slug}-mobile.svg"/><img src="cards/${p.slug}.svg" alt="${escapeHtml(p.title)} — ${escapeHtml(p.subtitle)}" width="${centered ? '50%' : '100%'}"/></picture></a></td>`;
  const rows = [];
  for (let i = 0; i < projects.length; i += columns) {
    const row = projects.slice(i, i + columns);
    rows.push(`<tr>\n${row.map((p) => cell(p, columns === 2 && row.length === 1 && projects.length > 1)).join('\n')}\n</tr>`);
  }
  return `<table>\n${rows.join('\n')}\n</table>`;
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

function formatProjectGroups(groups) {
  if (!Array.isArray(groups)) return '';
  return groups.map((group) =>
    `### ${group.title}\n\n${group.description}\n\n${formatProjects(group.projects)}`
  ).join('\n\n');
}

function main() {
  if (!fs.existsSync(TEMPLATE)) {
    console.error(`template not found: ${TEMPLATE}`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const status   = loadJson(path.join(ROOT, 'data/status.json'), {});
  const projects = loadJson(path.join(ROOT, 'data/projects.json'), []);
  const projectGroups = loadJson(path.join(ROOT, 'data/other-projects.json'), []);
  const ctx = {
    status:   formatStatus(status),
    projects: formatProjects(projects),
    projectGroups: formatProjectGroups(projectGroups),
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
