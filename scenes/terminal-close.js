// Terminal-close scene — extreme close-up of a single terminal window showing
// a packetcode-style agent session. No text elements; everything is particle
// dots. Lines of varying density, visible prompts, a pulsing cursor.

const {
  ribbonPoints, ellipsePoints, linePoints, rectPoints, tagRange
} = require('../src/helpers');

function build(rng, options = {}) {
  const { sr, srr } = rng;
  const all = [];
  let mark;

  // === BACKGROUND — falling "matrix rain" streaks ===
  // Vertical streaks of ambient dots; denser at the bottom of each streak.
  for (let streak = 0; streak < 18; streak++) {
    const sx = srr(15, 685);
    const sLen = srr(40, 180);
    const sy = srr(-30, 520 - sLen);
    const density = Math.floor(srr(12, 30));
    for (let i = 0; i < density; i++) {
      const t = sr();
      all.push({
        x: sx + srr(-2, 2),
        y: sy + t * sLen,
        ambient: true,
      });
    }
  }

  // === AMBIENT SCATTER (sparse background noise) ===
  for (let i = 0; i < 120; i++) {
    all.push({ x: srr(0, 700), y: srr(0, 520), ambient: true });
  }

  // === TERMINAL WINDOW FRAME ===
  const winX = 50, winY = 30, winW = 600, winH = 460;
  mark = all.length;
  // Four edges, doubled for thickness
  for (let d = 0; d < 2; d++) {
    const o = d * 2;
    all.push(...linePoints(rng, winX - o, winY - o, winX + winW + o, winY - o, 260, 2, 0.4));
    all.push(...linePoints(rng, winX - o, winY + winH + o, winX + winW + o, winY + winH + o, 260, 2, 0.4));
    all.push(...linePoints(rng, winX - o, winY - o, winX - o, winY + winH + o, 200, 2, 0.4));
    all.push(...linePoints(rng, winX + winW + o, winY - o, winX + winW + o, winY + winH + o, 200, 2, 0.4));
  }
  // Corner accents
  const corners = [
    {x: winX, y: winY}, {x: winX + winW, y: winY},
    {x: winX, y: winY + winH}, {x: winX + winW, y: winY + winH},
  ];
  for (const c of corners) all.push(...ellipsePoints(rng, c.x, c.y, 3, 3, 10));
  tagRange(all, mark, 'mon0');

  // === TITLE BAR ===
  mark = all.length;
  // Title bar separator line
  all.push(...linePoints(rng, winX, winY + 22, winX + winW, winY + 22, 180, 1.5, 0.3));
  // Title bar fill (subtle)
  all.push(...rectPoints(rng, winX + 3, winY + 2, winW - 6, 19, 140));
  tagRange(all, mark, 'mon1');

  // === TRAFFIC LIGHTS ===
  mark = all.length;
  all.push(...ellipsePoints(rng, winX + 16, winY + 12, 4.5, 4.5, 28));
  tagRange(all, mark, 'can'); // red-ish via can palette
  mark = all.length;
  all.push(...ellipsePoints(rng, winX + 32, winY + 12, 4.5, 4.5, 28));
  tagRange(all, mark, 'led'); // random bright
  mark = all.length;
  all.push(...ellipsePoints(rng, winX + 48, winY + 12, 4.5, 4.5, 28));
  tagRange(all, mark, 'code0'); // green

  // Title text (represented as dot cluster in the middle of title bar)
  mark = all.length;
  all.push(...linePoints(rng, winX + winW/2 - 50, winY + 11, winX + winW/2 + 50, winY + 11, 40, 1.5, 0.3));
  tagRange(all, mark, 'linenum0');

  // === CONTENT AREA — LINES OF AGENT SESSION ===
  const contentYStart = winY + 34;
  const contentX = winX + 14;
  const contentW = winW - 28;
  const lineH = 13;
  const lineCount = Math.floor((winH - 48) / lineH);

  // Pre-generate a pattern of line types so distribution looks realistic.
  // 0=user-prompt, 1=output-green, 2=tool-cyan, 3=code-blue, 4=separator, 5=indented-muted
  const pattern = [];
  for (let i = 0; i < lineCount; i++) {
    const roll = sr();
    if (i % 11 === 0 && i > 0)       pattern.push(4);
    else if (roll < 0.12)            pattern.push(0);
    else if (roll < 0.30)            pattern.push(2);
    else if (roll < 0.50)            pattern.push(3);
    else if (roll < 0.70)            pattern.push(5);
    else                             pattern.push(1);
  }

  for (let line = 0; line < lineCount; line++) {
    const ly = contentYStart + line * lineH;
    const type = pattern[line];

    if (type === 4) {
      // Separator — thin horizontal line across the pane
      const pts = linePoints(rng, contentX, ly, contentX + contentW, ly, 80, 1, 0.2);
      pts.forEach(p => { p.zone = 'mongap'; });
      all.push(...pts);
      continue;
    }

    let lx, lw, zone, promptBlob = false;

    if (type === 0) {
      // User prompt — `>` indicator + medium-length command
      promptBlob = true;
      lx = contentX + 16;
      lw = srr(60, contentW * 0.5);
      zone = 'code0';
    } else if (type === 1) {
      // Green output
      lx = contentX;
      lw = srr(120, contentW - 10);
      zone = 'code0';
    } else if (type === 2) {
      // Tool-use / cyan
      lx = contentX + 8;
      lw = srr(80, contentW - 20);
      zone = 'code2';
    } else if (type === 3) {
      // Code block — indented, blue
      lx = contentX + 22;
      lw = srr(60, contentW - 40);
      zone = 'code1';
    } else {
      // Indented muted (e.g. timestamps, metadata)
      lx = contentX + 30;
      lw = srr(40, contentW * 0.6);
      zone = 'linenum0';
    }

    if (promptBlob) {
      // `>` prompt as small dense cluster
      const promptPts = ellipsePoints(rng, contentX + 8, ly, 3, 3, 14);
      promptPts.forEach(p => { p.zone = 'code0'; });
      all.push(...promptPts);
    }

    // Main line content — dense dot row representing characters
    const count = Math.floor(lw * 0.7);
    const pts = linePoints(rng, lx, ly, lx + lw, ly, count, 2, 0.35);
    pts.forEach(p => { p.zone = zone; });
    all.push(...pts);

    // Every 4th line gets a trailing "(…)" visual — small dot cluster
    if (line % 5 === 3 && type !== 4) {
      const trailX = lx + lw + 4;
      if (trailX + 12 < contentX + contentW) {
        const dots = ellipsePoints(rng, trailX + 5, ly, 4, 1.5, 10);
        dots.forEach(p => { p.zone = 'linenum0'; });
        all.push(...dots);
      }
    }
  }

  // === BLINKING CURSOR ===
  // Sits on the final "active" line. Use the last non-separator line.
  let cursorLine = lineCount - 1;
  while (cursorLine > 0 && pattern[cursorLine] === 4) cursorLine--;
  const cursorY = contentYStart + cursorLine * lineH;
  mark = all.length;
  all.push(...rectPoints(rng, contentX + 24, cursorY - 4, 7, 9, 45));
  tagRange(all, mark, 'led');

  // === BOTTOM STATUS BAR ===
  mark = all.length;
  // Separator line above status
  all.push(...linePoints(rng, winX, winY + winH - 14, winX + winW, winY + winH - 14, 160, 1.2, 0.3));
  tagRange(all, mark, 'mongap');
  // Status segments — 3 colored blocks
  mark = all.length;
  all.push(...rectPoints(rng, winX + 8, winY + winH - 10, 140, 8, 90));
  tagRange(all, mark, 'statusbar0');
  mark = all.length;
  all.push(...rectPoints(rng, winX + 160, winY + winH - 10, 180, 8, 90));
  tagRange(all, mark, 'code2');
  mark = all.length;
  all.push(...rectPoints(rng, winX + 354, winY + winH - 10, 230, 8, 90));
  tagRange(all, mark, 'statusbar1');

  // === AMBIENT GLOW HUGGING THE WINDOW ===
  for (let i = 0; i < 280; i++) {
    const side = sr();
    let x, y;
    const pad = 35;
    if (side < 0.25) {
      x = srr(winX - pad, winX);       y = srr(winY - pad, winY + winH + pad);
    } else if (side < 0.5) {
      x = srr(winX + winW, winX + winW + pad); y = srr(winY - pad, winY + winH + pad);
    } else if (side < 0.75) {
      x = srr(winX, winX + winW);      y = srr(winY - pad, winY);
    } else {
      x = srr(winX, winX + winW);      y = srr(winY + winH, winY + winH + pad);
    }
    all.push({ x, y, zone: 'glow' });
  }

  // === FINAL AMBIENT SCATTER (to match density of battle-station) ===
  for (let i = 0; i < 150; i++) {
    const base = all[Math.floor(sr() * all.length)];
    const dist = srr(5, 25);
    const angle = sr() * Math.PI * 2;
    all.push({
      x: base.x + dist * Math.cos(angle),
      y: base.y + dist * Math.sin(angle),
      ambient: true,
    });
  }

  return all;
}

module.exports = { build };
