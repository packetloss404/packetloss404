#!/usr/bin/env node
/**
 * Generate project showcase SVG cards matching the banner's particle aesthetic.
 *
 * Reads card definitions from data/projects.json (or falls back to defaults
 * below), optionally enriches each with a star count from data/repo-stats.json,
 * and writes one SVG per project into cards/.
 *
 * Each card has: particle frame + corner accents, SVG <text> for title /
 * subtitle / tags (legibility > purism), star count top-right, tech-tag pills.
 */

const fs = require('fs');
const path = require('path');
const {
  createRng, ribbonPoints, ellipsePoints, linePoints, rectPoints, tagRange
} = require('../src/helpers');
const themes = require('../src/themes');

const ROOT = path.resolve(__dirname, '..');

function loadProjects() {
  const p = path.join(ROOT, 'data/projects.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  // Default set — edit data/projects.json to customize without touching code.
  return [
    {
      slug: 'packetade',
      title: 'PacketADE',
      subtitle: 'AI dev workspace unifying Claude Code + Codex CLI',
      tags: ['AGENTIC', 'MULTI-PANE', 'MCP'],
      url: 'https://github.com/packetloss404/packetade',
      repo: 'packetloss404/packetade',
      accent: 'screenGlow',
    },
    {
      slug: 'packetcode',
      title: 'packetcode',
      subtitle: 'Keyboard-first multi-provider AI coding agent',
      tags: ['TERMINAL', 'MULTI-LLM', 'CLI'],
      url: 'https://github.com/packetloss404/packetcode',
      repo: 'packetloss404/packetcode',
      accent: 'screenBlue',
    },
    {
      slug: 'creditquest',
      title: 'Credit Quest',
      subtitle: 'Self-hosted credit intelligence playground',
      tags: ['WEB', 'SELF-HOSTED', 'FINTECH'],
      url: 'https://creditquest.packetloss404.com',
      repo: null,
      accent: 'screenPurple',
    },
  ];
}

function loadStats() {
  const p = path.join(ROOT, 'data/repo-stats.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return {};
}

function renderCard(project, theme, rng) {
  const W = 400, H = 160;
  const all = [];
  let mark;

  // Background fill (low-density so it's mostly theme bg)
  for (let i = 0; i < 80; i++) {
    all.push({ x: rng.srr(0, W), y: rng.srr(0, H), ambient: true });
  }

  // Particle frame
  mark = all.length;
  for (let d = 0; d < 2; d++) {
    const o = d * 1.5;
    all.push(...linePoints(rng, 4 - o, 4 - o, W - 4 + o, 4 - o, 120, 1.5, 0.3));
    all.push(...linePoints(rng, 4 - o, H - 4 + o, W - 4 + o, H - 4 + o, 120, 1.5, 0.3));
    all.push(...linePoints(rng, 4 - o, 4 - o, 4 - o, H - 4 + o, 60, 1.5, 0.3));
    all.push(...linePoints(rng, W - 4 + o, 4 - o, W - 4 + o, H - 4 + o, 60, 1.5, 0.3));
  }
  // Corner accents — four small triangles of dots
  const corners = [{x: 4, y: 4}, {x: W - 4, y: 4}, {x: 4, y: H - 4}, {x: W - 4, y: H - 4}];
  for (const c of corners) all.push(...ellipsePoints(rng, c.x, c.y, 3, 3, 10));
  tagRange(all, mark, 'mon0');

  // Accent strip along left edge (themed)
  mark = all.length;
  all.push(...rectPoints(rng, 8, 10, 4, H - 20, 60));
  const accentZoneByKey = {
    screenGlow: 'code0',   // green
    screenBlue: 'code2',   // cyan
    screenPurple: 'code1', // blue-ish via pickColor fallback
  };
  tagRange(all, mark, accentZoneByKey[project.accent] || 'code0');

  // Decorative dot cluster upper-right (star area backing)
  mark = all.length;
  all.push(...ellipsePoints(rng, W - 40, 22, 28, 10, 50));
  tagRange(all, mark, 'glow');

  // Tech tag pill backings
  mark = all.length;
  const tagY = H - 30;
  let tagX = 20;
  const pillMeta = [];
  for (const tag of project.tags) {
    const pillW = tag.length * 7 + 14;
    all.push(...rectPoints(rng, tagX, tagY, pillW, 18, Math.floor(pillW * 1.2)));
    pillMeta.push({ x: tagX, y: tagY, w: pillW, text: tag });
    tagX += pillW + 8;
  }
  tagRange(all, mark, 'keyboard');

  // Bottom accent bar
  mark = all.length;
  all.push(...linePoints(rng, 20, H - 6, W - 20, H - 6, 80, 1, 0.2));
  tagRange(all, mark, 'mongap');

  // --- Render dot layer ---
  const { renderSvg } = require('../src/render');
  // Reuse renderSvg but we need custom width/height.
  const dotLayer = renderSvg(all, theme, rng, {
    width: W, height: H, scale: 1, ox: 0, oy: 0,
  });

  // Extract <g>...</g> body from dotLayer so we can wrap with text overlays.
  const inner = dotLayer
    .replace(/^[\s\S]*?<g>\n/, '')
    .replace(/\n? {2}<\/g>[\s\S]*$/, '');

  // Pick text colors from theme
  const titleColor = theme.screenGlow[0];
  const subtitleColor = theme.linenum;
  const accentColor = theme[project.accent] ? theme[project.accent][0] : theme.screenGlow[0];
  const tagBgColor = theme.monitorFrame[0];
  const tagTextColor = theme.screenBlue[0];
  const starColor = theme.screenGlow[0];

  // Build text overlays
  let textOverlay = '';
  textOverlay += `    <text x="22" y="46" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="22" font-weight="700" fill="${titleColor}" letter-spacing="0.5">${escapeXml(project.title)}</text>\n`;
  textOverlay += `    <text x="22" y="74" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="11" fill="${subtitleColor}">${escapeXml(project.subtitle)}</text>\n`;
  // Star count
  if (typeof project.stars === 'number') {
    textOverlay += `    <text x="${W - 14}" y="26" text-anchor="end" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="13" fill="${starColor}" font-weight="700">★ ${project.stars}</text>\n`;
  }
  // Prompt-style URL
  textOverlay += `    <text x="22" y="96" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="10" fill="${accentColor}">${escapeXml(promptFromUrl(project.url))}</text>\n`;
  // Tags
  for (const p of pillMeta) {
    textOverlay += `    <text x="${p.x + p.w / 2}" y="${p.y + 12}" text-anchor="middle" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="9" font-weight="700" letter-spacing="1" fill="${tagTextColor}">${escapeXml(p.text)}</text>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="${theme.background}" rx="6"/>
  <g>
${inner}
  </g>
${textOverlay}</svg>`;
}

function promptFromUrl(url) {
  try {
    const u = new URL(url);
    return `$ open ${u.host}${u.pathname}`.slice(0, 52);
  } catch {
    return `$ open ${url}`.slice(0, 52);
  }
}

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c]));
}

function main() {
  const args = {};
  for (const raw of process.argv.slice(2)) {
    const m = raw.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  const themeName = args.theme || 'matrix';
  const theme = themes[themeName];
  if (!theme) {
    console.error(`Unknown theme: ${themeName}`);
    process.exit(1);
  }

  const projects = loadProjects();
  const stats = loadStats();

  for (let i = 0; i < projects.length; i++) {
    const p = { ...projects[i] };
    if (p.repo && stats[p.repo] && typeof stats[p.repo].stars === 'number') {
      p.stars = stats[p.repo].stars;
    }
    // Per-card seed so cards don't all look identical, but still deterministic.
    const rng = createRng(42 + i * 97);
    const svg = renderCard(p, theme, rng);
    const out = path.join(ROOT, `cards/${p.slug}.svg`);
    fs.writeFileSync(out, svg);
    console.log(`Wrote ${out}`);
  }
}

main();
