// Render a list of tagged particle points into an animated SVG.
// Color selection is theme-driven; geometry and PRNG call order are preserved
// from the original monolithic generate-packet.js so that running with
// seed=42, scene=battle-station, theme=matrix produces byte-identical output.

function createPickColor(theme, rng) {
  const { sr } = rng;
  return function pickColor(p) {
    if (!p.zone && p.ambient) {
      const roll = sr();
      if (roll < 0.3)  return theme.screenGlow[Math.floor(sr() * theme.screenGlow.length)];
      if (roll < 0.55) return theme.screenBlue[Math.floor(sr() * theme.screenBlue.length)];
      if (roll < 0.75) return theme.screenPurple[Math.floor(sr() * theme.screenPurple.length)];
      return theme.ambientFallback;
    }

    const z = p.zone || '';

    if (z.startsWith('mon'))    return theme.monitorFrame[Math.floor(sr() * theme.monitorFrame.length)];
    if (z === 'mongap')         return theme.mongap;

    if (z.startsWith('code')) {
      const mIdx = parseInt(z.replace('code', ''));
      const pal = theme.codePalettes[mIdx] || theme.codeColors;
      return pal[Math.floor(sr() * pal.length)];
    }
    if (z.startsWith('linenum'))   return theme.linenum;
    if (z.startsWith('statusbar')) return sr() < 0.5 ? theme.statusbarA : theme.statusbarB;

    if (z === 'glow') {
      const roll = sr();
      if (roll < 0.3)  return theme.screenGlow[Math.floor(sr() * theme.screenGlow.length)];
      if (roll < 0.55) return theme.screenBlue[Math.floor(sr() * theme.screenBlue.length)];
      return theme.screenPurple[Math.floor(sr() * theme.screenPurple.length)];
    }

    if (z === 'reflected') {
      const roll = sr();
      if (roll < 0.4) return theme.screenBlue[Math.floor(sr() * theme.screenBlue.length)];
      if (roll < 0.7) return theme.screenGlow[Math.floor(sr() * theme.screenGlow.length)];
      return theme.screenPurple[Math.floor(sr() * theme.screenPurple.length)];
    }

    if (z === 'led')     return theme.ledColors[Math.floor(sr() * theme.ledColors.length)];
    if (z === 'floor')   return theme.floor;
    if (z === 'desk')    return theme.deskColors[Math.floor(sr() * theme.deskColors.length)];
    if (z === 'deskmat') return sr() < 0.6 ? theme.deskmatA : theme.deskmatB;
    if (z === 'mount')   return sr() < 0.8 ? theme.mountA : theme.mountB;
    if (z === 'cable')   return theme.cable;

    if (z === 'hair') {
      return sr() < 0.88
        ? theme.hairColors[Math.floor(sr() * theme.hairColors.length)]
        : theme.hairAccent;
    }
    if (z === 'skin') return theme.skinTones[Math.floor(sr() * theme.skinTones.length)];
    if (z === 'hoodie' || z === 'hood') {
      return sr() < 0.82
        ? theme.hoodieColors[Math.floor(sr() * theme.hoodieColors.length)]
        : (sr() < 0.5 ? theme.hoodieAccentA : theme.hoodieAccentB);
    }
    if (z === 'chair') return theme.chairColors[Math.floor(sr() * theme.chairColors.length)];

    if (z === 'keyboard') {
      return sr() < 0.65
        ? theme.kbColors[Math.floor(sr() * 3)]
        : theme.kbColors[3 + Math.floor(sr() * 2)];
    }

    if (z === 'can')       return sr() < 0.5 ? theme.canA : theme.canB;
    if (z === 'accessory') return theme.accessoryColor[Math.floor(sr() * theme.accessoryColor.length)];

    return theme.defaultFallback;
  };
}

function renderSvg(points, theme, rng, opts = {}) {
  const {
    width  = 700,
    height = 520,
    scale  = 0.92,
    ox     = 28,
    oy     = 8,
  } = opts;
  const { srr } = rng;
  const pickColor = createPickColor(theme, rng);

  let dots = '';
  points.forEach((p) => {
    const x = (p.x * scale + ox).toFixed(1);
    const y = (p.y * scale + oy).toFixed(1);

    let r, op;
    const z = p.zone || '';
    if (p.ambient) {
      r = srr(0.3, 0.8); op = srr(0.06, 0.2);
    } else if (z === 'glow') {
      r = srr(0.6, 2.0); op = srr(0.03, 0.12);
    } else if (z === 'reflected') {
      r = srr(0.4, 1.0); op = srr(0.08, 0.2);
    } else if (z === 'led') {
      r = srr(0.5, 1.4); op = srr(0.4, 0.85);
    } else if (z.startsWith('code') || z.startsWith('linenum') || z.startsWith('statusbar')) {
      r = srr(0.3, 0.9); op = srr(0.45, 0.92);
    } else if (z.startsWith('mon')) {
      r = srr(0.5, 1.4); op = srr(0.5, 0.95);
    } else if (z === 'mongap') {
      r = srr(0.3, 0.6); op = srr(0.3, 0.5);
    } else if (z === 'keyboard') {
      r = srr(0.4, 1.0); op = srr(0.35, 0.75);
    } else if (z === 'cable') {
      r = srr(0.3, 0.7); op = srr(0.2, 0.4);
    } else if (z === 'floor') {
      r = srr(0.5, 1.2); op = srr(0.05, 0.12);
    } else {
      r = srr(0.5, 1.8); op = srr(0.3, 0.88);
    }

    const del = srr(0, 8).toFixed(1);
    const dur = srr(2.5, 6).toFixed(1);
    const col = pickColor(p);
    const opLo = Math.max(0.02, op - 0.12).toFixed(2);
    const opHi = Math.min(1, op + 0.1).toFixed(2);

    dots += `    <circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${col}" opacity="${op.toFixed(2)}"><animate attributeName="opacity" values="${opLo};${opHi};${opLo}" dur="${dur}s" begin="${del}s" repeatCount="indefinite"/></circle>\n`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${theme.background}"/>
  <g>
${dots}  </g>
</svg>`;
}

module.exports = { renderSvg, createPickColor };
