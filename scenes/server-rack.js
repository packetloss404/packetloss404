// Server-rack scene — side-front view of a self-hosted LLM rig.
// A 10U rack packed with a switch, servers, a NAS, a GPU box, storage,
// and a PDU. Blinking activity LEDs, cable bundles, ambient server-room glow.

const {
  ribbonPoints, ellipsePoints, linePoints, rectPoints, tagRange
} = require('../src/helpers');

function build(rng, options = {}) {
  const { sr, srr } = rng;
  const all = [];
  let mark;

  const W = 700, H = 520;

  // === FLOOR / AMBIENT FLOOR GLOW ===
  for (let i = 0; i < 140; i++) {
    all.push({ x: srr(0, W), y: srr(480, H), zone: 'floor' });
  }

  // === AMBIENT BACKGROUND ===
  for (let i = 0; i < 120; i++) {
    all.push({ x: srr(0, W), y: srr(0, H), ambient: true });
  }

  // === RACK FRAME ===
  const rackX = 170, rackY = 50, rackW = 360, rackH = 430;
  mark = all.length;
  // Uprights (front posts)
  all.push(...linePoints(rng, rackX, rackY, rackX, rackY + rackH, 170, 3, 0.5));
  all.push(...linePoints(rng, rackX + rackW, rackY, rackX + rackW, rackY + rackH, 170, 3, 0.5));
  // Top / bottom cross bars
  all.push(...linePoints(rng, rackX - 8, rackY, rackX + rackW + 8, rackY, 150, 3, 0.5));
  all.push(...linePoints(rng, rackX - 8, rackY + rackH, rackX + rackW + 8, rackY + rackH, 150, 3, 0.5));
  // Side panel hints — thin lines suggesting depth
  all.push(...linePoints(rng, rackX - 10, rackY + 6, rackX - 10, rackY + rackH - 6, 70, 2, 0.3));
  all.push(...linePoints(rng, rackX + rackW + 10, rackY + 6, rackX + rackW + 10, rackY + rackH - 6, 70, 2, 0.3));
  // Rack feet
  all.push(...rectPoints(rng, rackX - 12, rackY + rackH, 20, 8, 24));
  all.push(...rectPoints(rng, rackX + rackW - 8, rackY + rackH, 20, 8, 24));
  tagRange(all, mark, 'mount');

  // Inner rack area where units stack
  const uX = rackX + 8;
  const uW = rackW - 16;
  let uy = rackY + 6;

  // Helper: draw a divider between units
  function divider(y) {
    const pts = linePoints(rng, uX, y, uX + uW, y, 90, 1, 0.2);
    pts.forEach(p => { p.zone = 'mongap'; });
    all.push(...pts);
  }

  // --- UNIT 1: NETWORK SWITCH (40px) ---
  const u1h = 40;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u1h, 120));
  tagRange(all, mark, 'keyboard');
  // Port grid — 2 rows × 14 cols
  mark = all.length;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 14; col++) {
      const px = uX + 24 + col * 19;
      const py = uy + 10 + row * 14;
      all.push(...rectPoints(rng, px, py, 7, 7, 6));
    }
  }
  tagRange(all, mark, 'mon0');
  // Activity LEDs above each port
  mark = all.length;
  for (let col = 0; col < 14; col++) {
    const px = uX + 27 + col * 19;
    all.push(...ellipsePoints(rng, px, uy + 33, 1.2, 1.2, 5));
  }
  // Chassis status LEDs
  all.push(...ellipsePoints(rng, uX + 10, uy + 13, 2, 2, 8));
  all.push(...ellipsePoints(rng, uX + 10, uy + 22, 2, 2, 8));
  all.push(...ellipsePoints(rng, uX + 10, uy + 31, 2, 2, 8));
  tagRange(all, mark, 'led');
  uy += u1h;
  divider(uy);

  // --- UNIT 2: 1U SERVER A ---
  const u2h = 38;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u2h, 110));
  tagRange(all, mark, 'keyboard');
  // Front panel — vent grille lines
  mark = all.length;
  for (let i = 0; i < 5; i++) {
    all.push(...linePoints(rng, uX + 40, uy + 8 + i * 5, uX + uW - 50, uy + 8 + i * 5, 28, 1, 0.2));
  }
  tagRange(all, mark, 'mon0');
  // LED column on left
  mark = all.length;
  for (let i = 0; i < 5; i++) {
    all.push(...ellipsePoints(rng, uX + 10, uy + 10 + i * 5, 1.5, 1.5, 6));
  }
  // Drive activity indicator
  all.push(...rectPoints(rng, uX + uW - 40, uy + 14, 26, 4, 12));
  tagRange(all, mark, 'led');
  // Power button
  all.push(...ellipsePoints(rng, uX + 24, uy + u2h/2, 2.5, 2.5, 10));
  uy += u2h;
  divider(uy);

  // --- UNIT 3: 1U SERVER B ---
  const u3h = 38;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u3h, 110));
  tagRange(all, mark, 'keyboard');
  mark = all.length;
  for (let i = 0; i < 5; i++) {
    all.push(...linePoints(rng, uX + 40, uy + 8 + i * 5, uX + uW - 50, uy + 8 + i * 5, 28, 1, 0.2));
  }
  tagRange(all, mark, 'mon0');
  mark = all.length;
  for (let i = 0; i < 5; i++) {
    all.push(...ellipsePoints(rng, uX + 10, uy + 10 + i * 5, 1.5, 1.5, 6));
  }
  all.push(...rectPoints(rng, uX + uW - 40, uy + 14, 26, 4, 12));
  tagRange(all, mark, 'led');
  uy += u3h;
  divider(uy);

  // --- UNIT 4+5: 2U NAS (4 drive bays across) ---
  const u4h = 72;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u4h, 160));
  tagRange(all, mark, 'keyboard');
  // 4 drive bays
  const bayW = (uW - 30) / 4;
  for (let b = 0; b < 4; b++) {
    mark = all.length;
    const bx = uX + 15 + b * bayW;
    all.push(...rectPoints(rng, bx, uy + 10, bayW - 6, u4h - 20, 60));
    // Bay border
    all.push(...linePoints(rng, bx, uy + 10, bx + bayW - 6, uy + 10, 24, 1, 0.2));
    all.push(...linePoints(rng, bx, uy + u4h - 10, bx + bayW - 6, uy + u4h - 10, 24, 1, 0.2));
    all.push(...linePoints(rng, bx, uy + 10, bx, uy + u4h - 10, 18, 1, 0.2));
    all.push(...linePoints(rng, bx + bayW - 6, uy + 10, bx + bayW - 6, uy + u4h - 10, 18, 1, 0.2));
    tagRange(all, mark, 'mon0');
    // Drive LED (activity)
    mark = all.length;
    all.push(...ellipsePoints(rng, bx + bayW - 12, uy + u4h - 16, 1.5, 1.5, 8));
    tagRange(all, mark, 'led');
  }
  uy += u4h;
  divider(uy);

  // --- UNIT 6-8: 3U GPU BOX (dual fans) ---
  const u6h = 112;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u6h, 260));
  tagRange(all, mark, 'keyboard');
  // Fan cutouts (two big circles)
  const fan1X = uX + uW * 0.28, fan1Y = uy + u6h/2;
  const fan2X = uX + uW * 0.72, fan2Y = uy + u6h/2;
  const fanR = 38;
  mark = all.length;
  for (const [fx, fy] of [[fan1X, fan1Y], [fan2X, fan2Y]]) {
    // Outer ring
    for (let a = 0; a < 80; a++) {
      const ang = (a / 80) * Math.PI * 2;
      all.push({ x: fx + Math.cos(ang) * fanR, y: fy + Math.sin(ang) * fanR });
    }
    // Inner ring
    for (let a = 0; a < 50; a++) {
      const ang = (a / 50) * Math.PI * 2;
      all.push({ x: fx + Math.cos(ang) * (fanR - 4), y: fy + Math.sin(ang) * (fanR - 4) });
    }
    // Hub
    all.push(...ellipsePoints(rng, fx, fy, 6, 6, 20));
    // Fan blades — 7 curved ribbons from hub outward
    for (let b = 0; b < 7; b++) {
      const ang = (b / 7) * Math.PI * 2;
      const midR = (fanR - 4) * 0.55;
      const tipR = (fanR - 4) * 0.95;
      all.push(...ribbonPoints(rng,
        {x: fx + Math.cos(ang) * 6, y: fy + Math.sin(ang) * 6},
        {x: fx + Math.cos(ang + 0.2) * midR, y: fy + Math.sin(ang + 0.2) * midR},
        {x: fx + Math.cos(ang + 0.4) * tipR * 0.9, y: fy + Math.sin(ang + 0.4) * tipR * 0.9},
        {x: fx + Math.cos(ang + 0.55) * tipR, y: fy + Math.sin(ang + 0.55) * tipR},
        22, 2.5, 0.5
      ));
    }
  }
  tagRange(all, mark, 'mon0');
  // GPU status LEDs between fans
  mark = all.length;
  for (let i = 0; i < 4; i++) {
    all.push(...ellipsePoints(rng, uX + uW/2 - 20 + i * 10, uy + u6h/2 - 18, 2, 2, 8));
  }
  // Brand accent bar along top
  all.push(...rectPoints(rng, uX + 10, uy + 4, uW - 20, 3, 40));
  tagRange(all, mark, 'led');
  uy += u6h;
  divider(uy);

  // --- UNIT 9+10: 2U STORAGE (JBOD rows) ---
  const u9h = 72;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u9h, 160));
  tagRange(all, mark, 'keyboard');
  // 2 rows × 6 compact drive bays
  mark = all.length;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const bx = uX + 16 + col * ((uW - 32) / 6);
      const by = uy + 10 + row * 28;
      const bw = (uW - 32) / 6 - 4;
      all.push(...rectPoints(rng, bx, by, bw, 22, 22));
      all.push(...linePoints(rng, bx, by, bx + bw, by, 12, 1, 0.2));
      all.push(...linePoints(rng, bx, by + 22, bx + bw, by + 22, 12, 1, 0.2));
    }
  }
  tagRange(all, mark, 'mon0');
  // Activity LEDs on each bay
  mark = all.length;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const bx = uX + 16 + col * ((uW - 32) / 6);
      const by = uy + 10 + row * 28;
      const bw = (uW - 32) / 6 - 4;
      all.push(...ellipsePoints(rng, bx + bw - 5, by + 18, 1.3, 1.3, 5));
    }
  }
  tagRange(all, mark, 'led');
  uy += u9h;
  divider(uy);

  // --- UNIT 11: PDU (power distribution) ---
  const u11h = rackY + rackH - uy - 6;
  mark = all.length;
  all.push(...rectPoints(rng, uX, uy, uW, u11h, 100));
  tagRange(all, mark, 'keyboard');
  // Outlets — round sockets along the length
  mark = all.length;
  for (let i = 0; i < 10; i++) {
    const ox = uX + 24 + i * ((uW - 48) / 9);
    all.push(...ellipsePoints(rng, ox, uy + u11h/2, 4, 4, 16));
    // Tiny prong indicators
    all.push(...ellipsePoints(rng, ox - 1.5, uy + u11h/2 - 1, 0.6, 0.6, 3));
    all.push(...ellipsePoints(rng, ox + 1.5, uy + u11h/2 - 1, 0.6, 0.6, 3));
  }
  tagRange(all, mark, 'mon0');
  // Power LED
  mark = all.length;
  all.push(...ellipsePoints(rng, uX + 10, uy + u11h/2, 2, 2, 8));
  tagRange(all, mark, 'led');

  // === CABLE BUNDLES — routed on the right side of the rack ===
  mark = all.length;
  // Main trunk running top to bottom
  all.push(...ribbonPoints(rng,
    {x: rackX + rackW + 18, y: rackY + 20},
    {x: rackX + rackW + 22, y: rackY + rackH * 0.35},
    {x: rackX + rackW + 16, y: rackY + rackH * 0.65},
    {x: rackX + rackW + 20, y: rackY + rackH - 20},
    240, 7, 0.9
  ));
  // Branch cables into each unit
  const branchYs = [70, 108, 146, 220, 300, 400, 455];
  for (const by of branchYs) {
    all.push(...ribbonPoints(rng,
      {x: rackX + rackW + 18, y: rackY + by - rackY},
      {x: rackX + rackW + 10, y: rackY + by - rackY + 2},
      {x: rackX + rackW + 4, y: rackY + by - rackY + 1},
      {x: rackX + rackW - 4, y: rackY + by - rackY},
      30, 2, 0.4
    ));
  }
  tagRange(all, mark, 'cable');

  // === EXTERNAL LABEL / STATUS MONITOR (upper-left, LLM tokens) ===
  // A small floating "tokens/sec" monitor to tie to self-hosted LLM theme.
  const monX = 30, monY = 60, monMW = 110, monMH = 80;
  mark = all.length;
  // Border
  all.push(...linePoints(rng, monX, monY, monX + monMW, monY, 50, 1.5, 0.3));
  all.push(...linePoints(rng, monX, monY + monMH, monX + monMW, monY + monMH, 50, 1.5, 0.3));
  all.push(...linePoints(rng, monX, monY, monX, monY + monMH, 38, 1.5, 0.3));
  all.push(...linePoints(rng, monX + monMW, monY, monX + monMW, monY + monMH, 38, 1.5, 0.3));
  tagRange(all, mark, 'mon0');
  // Header bar
  mark = all.length;
  all.push(...linePoints(rng, monX + 4, monY + 10, monX + monMW - 4, monY + 10, 30, 1, 0.2));
  tagRange(all, mark, 'mongap');
  // Big number (simulated with dense dot cluster)
  mark = all.length;
  all.push(...rectPoints(rng, monX + 15, monY + 18, 80, 22, 120));
  tagRange(all, mark, 'code0');
  // Sparkline at bottom
  mark = all.length;
  const spark = [];
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    spark.push({
      x: monX + 10 + t * (monMW - 20),
      y: monY + monMH - 14 - Math.sin(t * Math.PI * 3) * 6 - srr(0, 3),
    });
  }
  all.push(...spark);
  tagRange(all, mark, 'code2');

  // === PACKET FLOW LINES (top-right, network activity) ===
  mark = all.length;
  for (let i = 0; i < 5; i++) {
    const py = 70 + i * 18;
    all.push(...ribbonPoints(rng,
      {x: 560, y: py},
      {x: 600, y: py - 4},
      {x: 640, y: py + 4},
      {x: 680, y: py},
      40, 1.5, 0.4
    ));
  }
  tagRange(all, mark, 'led');

  // === AMBIENT GLOW — greenish server-room mood light ===
  for (let i = 0; i < 240; i++) {
    const x = srr(rackX - 60, rackX + rackW + 60);
    const y = srr(rackY - 40, rackY + rackH + 40);
    all.push({ x, y, zone: 'glow' });
  }

  // === AMBIENT SCATTER to match density ===
  for (let i = 0; i < 200; i++) {
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
