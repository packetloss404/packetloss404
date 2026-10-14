#!/usr/bin/env node
/**
 * Generate project showcase SVG cards matching the banner's particle aesthetic.
 *
 * Reads card definitions from data/projects.json and data/other-projects.json,
 * optionally enriches each
 * with a positive star count from data/repo-stats.json,
 * and writes one SVG per project plus cards/preview.html.
 *
 * Each card has: particle frame + corner accents, SVG <text> for title /
 * subtitle / tags (legibility > purism), optional star count, tech-tag pills.
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
  const projects = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('data/projects.json must contain at least one project');
  }
  return projects;
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

  if (project.stars > 0) {
    // Decorative dot cluster behind a positive star count.
    mark = all.length;
    all.push(...ellipsePoints(rng, W - 40, 22, 28, 10, 50));
    tagRange(all, mark, 'glow');
  }

  // Tech tag pill backings
  mark = all.length;
  const tagY = H - 30;
  let tagX = 20;
  const pillMeta = [];
  for (const tag of project.tags) {
    const pillW = tag.length * 8 + 16;
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
  const subtitleColor = '#B4B8C8';
  const accentColor = theme[project.accent] ? theme[project.accent][0] : theme.screenGlow[0];
  const tagTextColor = theme.screenBlue[0];
  const starColor = theme.screenGlow[0];

  // Build text overlays
  let textOverlay = '';
  textOverlay += `    <text x="22" y="46" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="22" font-weight="700" fill="${titleColor}" letter-spacing="0.5">${escapeXml(project.title)}</text>\n`;
  textOverlay += `    <text x="22" y="74" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="12" fill="${subtitleColor}">${escapeXml(project.subtitle)}</text>\n`;
  // Star count
  if (project.stars > 0) {
    textOverlay += `    <text x="${W - 14}" y="26" text-anchor="end" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="13" fill="${starColor}" font-weight="700">★ ${project.stars}</text>\n`;
  }
  // Prompt-style URL
  textOverlay += `    <text x="22" y="96" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="11" fill="${accentColor}">${escapeXml(promptFromUrl(project.url))}</text>\n`;
  // Tags
  for (const p of pillMeta) {
    textOverlay += `    <text x="${p.x + p.w / 2}" y="${p.y + 12}" text-anchor="middle" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="11" font-weight="700" letter-spacing="0.5" fill="${tagTextColor}">${escapeXml(p.text)}</text>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="${theme.background}" rx="6"/>
  <g>
${inner}
  </g>
${textOverlay}</svg>`;
}

// GitHub keeps README tables in two columns on phones. Render a compact tile
// with full-size text instead of shrinking the desktop card into unreadability.
function renderMobileCard(project, theme) {
  const accent = theme[project.accent] ? theme[project.accent][0] : theme.screenGlow[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 82" width="120" height="82">
  <rect width="120" height="82" rx="5" fill="${theme.background}"/>
  <rect x="1" y="1" width="118" height="80" rx="4" fill="none" stroke="${accent}" stroke-opacity="0.75"/>
  <rect x="1" y="1" width="3" height="80" fill="${accent}"/>
  <text x="11" y="28" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="13" font-weight="700" fill="${theme.screenGlow[0]}">${escapeXml(project.title)}</text>
  <text x="11" y="49" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="9.5" fill="#D0D5E2">${escapeXml(project.mobileSubtitle || project.subtitle)}</text>
  <text x="11" y="69" font-family="'SFMono-Regular','Menlo','Consolas','Courier New',monospace" font-size="8.5" font-weight="700" fill="${accent}">${escapeXml(project.tags[0] || '')}</text>
</svg>`;
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

function renderPreview(projectGroups) {
  const card = (p) =>
    `      <a href="${escapeXml(p.url)}" aria-label="${escapeXml(p.title)} — ${escapeXml(p.subtitle)}">
        <picture>
          <source media="(max-width: 600px)" srcset="./${escapeXml(p.slug)}-mobile.svg">
          <img src="./${escapeXml(p.slug)}.svg" alt="${escapeXml(p.title)} — ${escapeXml(p.subtitle)}">
        </picture>
      </a>`;
  const groups = projectGroups.map((group) => `    <section class="group">
      <h2>${escapeXml(group.title)}</h2>
      <p>${escapeXml(group.description)}</p>
      <div class="grid">
${group.projects.map(card).join('\n')}
      </div>
    </section>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Project portfolio preview</title>
  <style>
    body { margin: 0; min-height: 100vh; background: #0d1117; color: #c9d1d9; font: 16px system-ui, sans-serif; }
    main { max-width: 860px; margin: 0 auto; padding: 32px 24px; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 24px; color: #8b949e; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .grid a { display: block; min-width: 0; }
    picture { display: block; }
    img { display: block; width: 100%; height: auto; }
    a:focus-visible { outline: 2px solid #58a6ff; outline-offset: 4px; }
    h2 { margin: 40px 0 8px; font-size: 20px; }
    .group p { margin-bottom: 16px; }
    .more a { color: #79c0ff; }
    @media (max-width: 520px) { main { padding: 24px 16px; } .grid { gap: 8px; } .grid a { padding: 6px; border: 1px solid #30363d; } }
  </style>
</head>
<body>
  <main>
    <h1>Projects</h1>
    <p>Preview of the project gallery in the profile README.</p>
    <p>Building <a href="https://deployatmidnight.com/">Midnight</a> for self-hosted deployments and <a href="https://usesugar.dev/">Sugar</a> for coding-agent model routing. Midnight's source is coming soon; Sugar's remains private.</p>
${groups}
    <p class="more">Private-source cards open public project descriptions. <a href="https://www.packetloss404.com/">Explore the full portfolio</a>.</p>
  </main>
</body>
</html>
`;
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
  const projectGroups = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/other-projects.json'), 'utf8'));
  const stats = loadStats();

  const allProjects = [...projects, ...projectGroups.flatMap((group) => group.projects)];
  for (let i = 0; i < allProjects.length; i++) {
    const p = { ...allProjects[i] };
    if (p.repo && stats[p.repo] && typeof stats[p.repo].stars === 'number') {
      p.stars = stats[p.repo].stars;
    }
    // Per-card seed so cards don't all look identical, but still deterministic.
    const rng = createRng(42 + i * 97);
    const svg = renderCard(p, theme, rng);
    const out = path.join(ROOT, `cards/${p.slug}.svg`);
    fs.writeFileSync(out, svg);
    console.log(`Wrote ${out}`);
    const mobileOut = path.join(ROOT, `cards/${p.slug}-mobile.svg`);
    fs.writeFileSync(mobileOut, renderMobileCard(p, theme));
    console.log(`Wrote ${mobileOut}`);
  }

  const previewPath = path.join(ROOT, 'cards/preview.html');
  fs.writeFileSync(previewPath, renderPreview(projectGroups));
  console.log(`Wrote ${previewPath}`);
}

main();
