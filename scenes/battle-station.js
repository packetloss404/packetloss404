// Battle-station scene — back view of a person at a 6-curved-monitor desk.
// Ported verbatim from the original generate-packet.js scene body so that
// output is byte-identical to pre-refactor for seed=42, theme=matrix.
//
// build(rng, options) returns an array of tagged particle points.
// options.codeLines (optional): array of strings used to drive monitor line
// widths instead of pure-random widths. Shape is preserved (same number of
// sr() calls per line) so the banner's geometry stays recognizable.

const {
  ribbonPoints, ellipsePoints, linePoints, rectPoints,
  curvedMonitor, tagRange
} = require('../src/helpers');

function build(rng, options = {}) {
  const { sr, srr } = rng;
  const codeLines = options.codeLines || null;

  const all = [];

  // === FLOOR ===
  const floorPts = [];
  for (let i = 0; i < 100; i++) {
    floorPts.push({ x: srr(20, 680), y: srr(490, 520) });
  }
  floorPts.forEach(p => { p.zone = 'floor'; });
  all.push(...floorPts);

  // === DESK SURFACE ===
  let mark = all.length;
  all.push(...ribbonPoints(rng,
    {x: 55, y: 338}, {x: 200, y: 333}, {x: 500, y: 333}, {x: 645, y: 338},
    250, 5, 0.8
  ));
  all.push(...ribbonPoints(rng,
    {x: 58, y: 340}, {x: 200, y: 336}, {x: 500, y: 336}, {x: 642, y: 340},
    120, 3, 0.6
  ));
  all.push(...ribbonPoints(rng,
    {x: 35, y: 468}, {x: 200, y: 464}, {x: 500, y: 464}, {x: 665, y: 468},
    220, 5, 0.8
  ));
  const deskPts = rectPoints(rng, 52, 337, 596, 130, 400);
  deskPts.forEach(p => { p.zone = 'desk'; });
  all.push(...deskPts);
  all.push(...linePoints(rng, 55, 338, 35, 468, 60, 4, 0.7));
  all.push(...linePoints(rng, 645, 338, 665, 468, 60, 4, 0.7));
  all.push(...linePoints(rng, 75, 468, 75, 515, 45, 6, 0.6));
  all.push(...linePoints(rng, 625, 468, 625, 515, 45, 6, 0.6));
  all.push(...ribbonPoints(rng,
    {x: 75, y: 500}, {x: 200, y: 498}, {x: 500, y: 498}, {x: 625, y: 500},
    80, 3, 0.7
  ));
  tagRange(all, mark, 'desk');

  // === DESK MAT ===
  mark = all.length;
  all.push(...linePoints(rng, 280, 345, 430, 345, 50, 2, 0.5));
  all.push(...linePoints(rng, 280, 385, 430, 385, 50, 2, 0.5));
  all.push(...linePoints(rng, 280, 345, 280, 385, 25, 2, 0.5));
  all.push(...linePoints(rng, 430, 345, 430, 385, 25, 2, 0.5));
  tagRange(all, mark, 'deskmat');

  // === 6 MONITORS — 3 top row, 3 bottom row ===
  const monW = 158, monH = 92, curve = 7;
  const botY = 272, topY = 160;
  const monXPositions = [172, 350, 528];

  for (let i = 0; i < 3; i++) {
    all.push(...curvedMonitor(rng, monXPositions[i], botY, monW, monH, curve, 280, `mon${i}`));
  }

  const monWT = 150, monHT = 87, curveT = 6;
  for (let i = 0; i < 3; i++) {
    all.push(...curvedMonitor(rng, monXPositions[i], topY, monWT, monHT, curveT, 250, `mon${i + 3}`));
  }

  // === MONITOR GAPS ===
  mark = all.length;
  all.push(...linePoints(rng, 251, botY - monH/2 + 5, 251, botY + monH/2 - 5, 35, 2, 0.4));
  all.push(...linePoints(rng, 449, botY - monH/2 + 5, 449, botY + monH/2 - 5, 35, 2, 0.4));
  all.push(...linePoints(rng, 247, topY - monHT/2 + 5, 247, topY + monHT/2 - 5, 30, 2, 0.4));
  all.push(...linePoints(rng, 453, topY - monHT/2 + 5, 453, topY + monHT/2 - 5, 30, 2, 0.4));
  all.push(...ribbonPoints(rng,
    {x: 93, y: 218}, {x: 250, y: 220}, {x: 450, y: 220}, {x: 607, y: 218},
    60, 2, 0.4
  ));
  tagRange(all, mark, 'mongap');

  // === MONITOR MOUNTS / ARMS ===
  mark = all.length;
  all.push(...linePoints(rng, 350, 115, 350, 338, 120, 5, 0.6));
  all.push(...linePoints(rng, 352, 115, 352, 338, 60, 3, 0.5));
  all.push(...ellipsePoints(rng, 350, 338, 12, 4, 30));
  for (const mx of monXPositions) {
    const dx = mx - 350;
    all.push(...ribbonPoints(rng,
      {x: 350, y: 308}, {x: 350 + dx * 0.3, y: 312},
      {x: 350 + dx * 0.65, y: 316}, {x: mx, y: 318},
      45, 4, 0.6
    ));
    all.push(...ellipsePoints(rng, 350 + dx * 0.5, 314, 3, 3, 10));
  }
  for (const mx of monXPositions) {
    const dx = mx - 350;
    all.push(...ribbonPoints(rng,
      {x: 350, y: 195}, {x: 350 + dx * 0.3, y: 198},
      {x: 350 + dx * 0.65, y: 201}, {x: mx, y: 206},
      40, 3.5, 0.6
    ));
    all.push(...ellipsePoints(rng, 350 + dx * 0.5, 200, 3, 3, 8));
  }
  tagRange(all, mark, 'mount');

  // === PERSON — head + hair ===
  mark = all.length;
  all.push(...ellipsePoints(rng, 350, 368, 26, 22, 200));
  all.push(...ellipsePoints(rng, 350, 363, 28, 20, 150));
  all.push(...ellipsePoints(rng, 350, 355, 12, 10, 50));
  all.push(...ribbonPoints(rng,
    {x: 322, y: 365}, {x: 325, y: 348}, {x: 350, y: 343}, {x: 375, y: 348},
    60, 3, 0.6
  ));
  all.push(...ribbonPoints(rng,
    {x: 375, y: 348}, {x: 378, y: 365}, {x: 375, y: 382}, {x: 365, y: 390},
    50, 3, 0.6
  ));
  all.push(...ribbonPoints(rng,
    {x: 322, y: 365}, {x: 320, y: 378}, {x: 325, y: 388}, {x: 335, y: 390},
    50, 3, 0.6
  ));
  for (let i = 0; i < 6; i++) {
    const angle = -0.8 + i * 0.32;
    const r1 = 8, r2 = 22;
    all.push(...ribbonPoints(rng,
      {x: 350 + r1 * Math.cos(angle), y: 358 + r1 * Math.sin(angle)},
      {x: 350 + r2 * 0.4 * Math.cos(angle + 0.1), y: 358 + r2 * 0.4 * Math.sin(angle + 0.1)},
      {x: 350 + r2 * 0.7 * Math.cos(angle + 0.15), y: 358 + r2 * 0.7 * Math.sin(angle + 0.15)},
      {x: 350 + r2 * Math.cos(angle + 0.2), y: 358 + r2 * Math.sin(angle + 0.2)},
      25, 2, 0.5
    ));
  }
  tagRange(all, mark, 'hair');

  // === EARS ===
  mark = all.length;
  all.push(...ellipsePoints(rng, 319, 373, 6, 9, 40));
  all.push(...ribbonPoints(rng,
    {x: 314, y: 365}, {x: 312, y: 372}, {x: 313, y: 380}, {x: 317, y: 384},
    25, 2, 0.5
  ));
  all.push(...ellipsePoints(rng, 381, 373, 6, 9, 40));
  all.push(...ribbonPoints(rng,
    {x: 386, y: 365}, {x: 388, y: 372}, {x: 387, y: 380}, {x: 383, y: 384},
    25, 2, 0.5
  ));
  tagRange(all, mark, 'skin');

  // === NECK ===
  mark = all.length;
  all.push(...ribbonPoints(rng,
    {x: 338, y: 388}, {x: 336, y: 398}, {x: 335, y: 410}, {x: 334, y: 420},
    65, 12, 1
  ));
  all.push(...ribbonPoints(rng,
    {x: 362, y: 388}, {x: 364, y: 398}, {x: 365, y: 410}, {x: 366, y: 420},
    65, 12, 1
  ));
  all.push(...ellipsePoints(rng, 350, 405, 14, 16, 60));
  all.push(...ribbonPoints(rng,
    {x: 342, y: 390}, {x: 341, y: 400}, {x: 340, y: 410}, {x: 340, y: 418},
    20, 2, 0.4
  ));
  all.push(...ribbonPoints(rng,
    {x: 358, y: 390}, {x: 359, y: 400}, {x: 360, y: 410}, {x: 360, y: 418},
    20, 2, 0.4
  ));
  tagRange(all, mark, 'skin');

  // === HOODIE (shoulders + back + folds) ===
  mark = all.length;
  all.push(...ribbonPoints(rng,
    {x: 334, y: 420}, {x: 306, y: 426}, {x: 268, y: 436}, {x: 225, y: 450},
    160, 20, 1.8
  ));
  all.push(...ribbonPoints(rng,
    {x: 334, y: 418}, {x: 305, y: 422}, {x: 268, y: 430}, {x: 225, y: 442},
    70, 3, 0.6
  ));
  all.push(...ribbonPoints(rng,
    {x: 366, y: 420}, {x: 394, y: 426}, {x: 432, y: 436}, {x: 475, y: 450},
    160, 20, 1.8
  ));
  all.push(...ribbonPoints(rng,
    {x: 366, y: 418}, {x: 395, y: 422}, {x: 432, y: 430}, {x: 475, y: 442},
    70, 3, 0.6
  ));
  all.push(...ellipsePoints(rng, 350, 443, 68, 26, 280));
  all.push(...ellipsePoints(rng, 350, 470, 78, 22, 220));
  all.push(...ribbonPoints(rng,
    {x: 350, y: 420}, {x: 350, y: 445}, {x: 350, y: 475}, {x: 350, y: 510},
    50, 2, 0.5
  ));
  all.push(...ribbonPoints(rng,
    {x: 320, y: 440}, {x: 315, y: 450}, {x: 318, y: 460}, {x: 325, y: 468},
    35, 4, 0.8
  ));
  all.push(...ribbonPoints(rng,
    {x: 380, y: 440}, {x: 385, y: 450}, {x: 382, y: 460}, {x: 375, y: 468},
    35, 4, 0.8
  ));
  all.push(...ribbonPoints(rng,
    {x: 270, y: 445}, {x: 268, y: 465}, {x: 270, y: 485}, {x: 275, y: 510},
    40, 2, 0.5
  ));
  all.push(...ribbonPoints(rng,
    {x: 430, y: 445}, {x: 432, y: 465}, {x: 430, y: 485}, {x: 425, y: 510},
    40, 2, 0.5
  ));
  for (let i = 0; i < 4; i++) {
    const fy = 448 + i * 14;
    const fx = 320 + srr(-15, 15);
    all.push(...ribbonPoints(rng,
      {x: fx, y: fy}, {x: fx + 10, y: fy + 2}, {x: fx + 25, y: fy + 1}, {x: fx + 40, y: fy - 1},
      18, 2, 0.5
    ));
  }
  all.push(...ribbonPoints(rng,
    {x: 265, y: 458}, {x: 275, y: 478}, {x: 285, y: 498}, {x: 295, y: 515},
    70, 16, 1.8
  ));
  all.push(...ribbonPoints(rng,
    {x: 435, y: 458}, {x: 425, y: 478}, {x: 415, y: 498}, {x: 405, y: 515},
    70, 16, 1.8
  ));
  tagRange(all, mark, 'hoodie');

  // === HOOD ===
  mark = all.length;
  all.push(...ellipsePoints(rng, 350, 408, 24, 9, 70));
  all.push(...ribbonPoints(rng,
    {x: 326, y: 403}, {x: 330, y: 412}, {x: 348, y: 418}, {x: 374, y: 413},
    55, 6, 1
  ));
  all.push(...ribbonPoints(rng,
    {x: 328, y: 400}, {x: 335, y: 408}, {x: 355, y: 412}, {x: 372, y: 408},
    30, 2, 0.5
  ));
  all.push(...ribbonPoints(rng,
    {x: 340, y: 415}, {x: 338, y: 425}, {x: 336, y: 435}, {x: 335, y: 442},
    20, 1.5, 0.4
  ));
  all.push(...ribbonPoints(rng,
    {x: 360, y: 415}, {x: 362, y: 425}, {x: 364, y: 435}, {x: 365, y: 442},
    20, 1.5, 0.4
  ));
  tagRange(all, mark, 'hood');

  // === GAMING CHAIR ===
  mark = all.length;
  all.push(...ribbonPoints(rng,
    {x: 215, y: 430}, {x: 210, y: 460}, {x: 212, y: 490}, {x: 218, y: 515},
    50, 8, 1
  ));
  all.push(...ribbonPoints(rng,
    {x: 485, y: 430}, {x: 490, y: 460}, {x: 488, y: 490}, {x: 482, y: 515},
    50, 8, 1
  ));
  all.push(...ribbonPoints(rng,
    {x: 230, y: 448}, {x: 222, y: 452}, {x: 215, y: 454}, {x: 205, y: 455},
    35, 5, 0.6
  ));
  all.push(...ribbonPoints(rng,
    {x: 470, y: 448}, {x: 478, y: 452}, {x: 485, y: 454}, {x: 495, y: 455},
    35, 5, 0.6
  ));
  all.push(...ellipsePoints(rng, 205, 455, 8, 3, 20));
  all.push(...ellipsePoints(rng, 495, 455, 8, 3, 20));
  tagRange(all, mark, 'chair');

  // === KEYBOARD ===
  mark = all.length;
  const kbPts = [];
  kbPts.push(...linePoints(rng, 300, 348, 400, 348, 55, 2, 0.4));
  kbPts.push(...linePoints(rng, 300, 374, 400, 374, 55, 2, 0.4));
  kbPts.push(...linePoints(rng, 300, 348, 300, 374, 25, 2, 0.4));
  kbPts.push(...linePoints(rng, 400, 348, 400, 374, 25, 2, 0.4));
  const keyRows = [14, 14, 13, 12, 8];
  const rowWidths = [84, 84, 78, 72, 48];
  for (let row = 0; row < 5; row++) {
    const ry = 351 + row * 4.8;
    const cols = keyRows[row];
    const startX = 350 - rowWidths[row] / 2;
    for (let col = 0; col < cols; col++) {
      kbPts.push({
        x: startX + col * (rowWidths[row] / cols) + srr(-0.3, 0.3),
        y: ry + srr(-0.3, 0.3)
      });
    }
  }
  kbPts.push(...linePoints(rng, 332, 371, 368, 371, 12, 1.5, 0.3));
  kbPts.forEach(p => { p.zone = 'keyboard'; });
  all.push(...kbPts);

  // === MOUSE ===
  mark = all.length;
  const mousePts = [];
  mousePts.push(...ellipsePoints(rng, 418, 362, 7, 11, 50));
  mousePts.push(...ribbonPoints(rng,
    {x: 412, y: 352}, {x: 410, y: 362}, {x: 411, y: 372}, {x: 415, y: 374},
    20, 2, 0.4
  ));
  mousePts.push(...ribbonPoints(rng,
    {x: 424, y: 352}, {x: 426, y: 362}, {x: 425, y: 372}, {x: 421, y: 374},
    20, 2, 0.4
  ));
  mousePts.push(...linePoints(rng, 418, 356, 418, 362, 8, 1.5, 0.3));
  mousePts.push(...ribbonPoints(rng,
    {x: 418, y: 351}, {x: 418, y: 345}, {x: 420, y: 340}, {x: 425, y: 335},
    15, 1.5, 0.4
  ));
  mousePts.forEach(p => { p.zone = 'keyboard'; });
  all.push(...mousePts);

  // === MOUSEPAD ===
  mark = all.length;
  all.push(...linePoints(rng, 405, 345, 440, 345, 25, 1.5, 0.3));
  all.push(...linePoints(rng, 405, 382, 440, 382, 25, 1.5, 0.3));
  all.push(...linePoints(rng, 405, 345, 405, 382, 18, 1.5, 0.3));
  all.push(...linePoints(rng, 440, 345, 440, 382, 18, 1.5, 0.3));
  tagRange(all, mark, 'deskmat');

  // === HEADPHONE STAND ===
  mark = all.length;
  all.push(...linePoints(rng, 108, 308, 108, 348, 40, 3, 0.5));
  all.push(...ellipsePoints(rng, 108, 348, 10, 3, 20));
  all.push(...ribbonPoints(rng,
    {x: 93, y: 308}, {x: 97, y: 293}, {x: 119, y: 293}, {x: 123, y: 308},
    45, 3, 0.6
  ));
  all.push(...ellipsePoints(rng, 91, 314, 7, 11, 40));
  all.push(...ellipsePoints(rng, 125, 314, 7, 11, 40));
  all.push(...ribbonPoints(rng,
    {x: 85, y: 308}, {x: 84, y: 314}, {x: 85, y: 320}, {x: 91, y: 322},
    15, 1, 0.3
  ));
  all.push(...ribbonPoints(rng,
    {x: 131, y: 308}, {x: 132, y: 314}, {x: 131, y: 320}, {x: 125, y: 322},
    15, 1, 0.3
  ));
  all.push(...ribbonPoints(rng,
    {x: 95, y: 296}, {x: 102, y: 290}, {x: 114, y: 290}, {x: 121, y: 296},
    25, 3, 0.5
  ));
  tagRange(all, mark, 'accessory');

  // === CAN ===
  mark = all.length;
  all.push(...linePoints(rng, 582, 338, 582, 368, 35, 8, 0.5));
  all.push(...ellipsePoints(rng, 582, 338, 6, 2.5, 20));
  all.push(...ellipsePoints(rng, 582, 368, 6, 2.5, 20));
  all.push(...ribbonPoints(rng,
    {x: 575, y: 350}, {x: 578, y: 350}, {x: 586, y: 350}, {x: 589, y: 350},
    12, 2, 0.3
  ));
  all.push(...ellipsePoints(rng, 582, 337, 2, 1, 6));
  tagRange(all, mark, 'can');

  // === FIGURINE ===
  mark = all.length;
  all.push(...linePoints(rng, 137, 343, 137, 360, 20, 3, 0.4));
  all.push(...ellipsePoints(rng, 137, 339, 6, 6, 30));
  all.push(...ellipsePoints(rng, 137, 362, 5, 2, 12));
  tagRange(all, mark, 'accessory');

  // === COASTER / MUG ===
  mark = all.length;
  all.push(...ellipsePoints(rng, 82, 360, 10, 4, 25));
  all.push(...linePoints(rng, 76, 348, 76, 360, 12, 2, 0.4));
  all.push(...linePoints(rng, 88, 348, 88, 360, 12, 2, 0.4));
  all.push(...ellipsePoints(rng, 82, 348, 8, 3, 18));
  all.push(...ribbonPoints(rng,
    {x: 88, y: 350}, {x: 93, y: 350}, {x: 95, y: 355}, {x: 90, y: 358},
    10, 1.5, 0.3
  ));
  tagRange(all, mark, 'accessory');

  // === CABLES ===
  mark = all.length;
  all.push(...ribbonPoints(rng,
    {x: 350, y: 322}, {x: 348, y: 328}, {x: 346, y: 332}, {x: 345, y: 338},
    20, 3, 0.5
  ));
  all.push(...ribbonPoints(rng,
    {x: 345, y: 338}, {x: 280, y: 340}, {x: 200, y: 342}, {x: 130, y: 345},
    35, 2, 0.5
  ));
  all.push(...ribbonPoints(rng,
    {x: 345, y: 338}, {x: 420, y: 340}, {x: 500, y: 342}, {x: 570, y: 345},
    35, 2, 0.5
  ));
  all.push(...ribbonPoints(rng,
    {x: 350, y: 348}, {x: 350, y: 343}, {x: 348, y: 340}, {x: 345, y: 338},
    10, 1.5, 0.3
  ));
  tagRange(all, mark, 'cable');

  // === MONITOR SCREEN CONTENT ===
  for (let m = 0; m < 6; m++) {
    const cx = monXPositions[m % 3];
    const cy = m < 3 ? botY : topY;
    const mw = m < 3 ? monW : monWT;
    const mh = m < 3 ? monH : monHT;
    const lineCount = m < 3 ? 12 : 11;
    for (let line = 0; line < lineCount; line++) {
      const indent = Math.floor(sr() * 4) * 6;
      const lx = cx - mw/2 + 10 + indent;
      const ly = cy - mh/2 + 8 + line * ((mh - 16) / lineCount);
      let lw = srr(15, mw * 0.55 - indent);
      // Data-driven override: scale width to message length if provided.
      if (codeLines && codeLines.length > 0) {
        const msg = codeLines[(m * lineCount + line) % codeLines.length];
        const maxW = mw * 0.55 - indent;
        const scaled = Math.min(maxW, Math.max(10, msg.length * 1.1));
        lw = scaled;
      }
      const pts = linePoints(rng, lx, ly, lx + lw, ly, Math.floor(srr(10, 25)), 1.5, 0.3);
      pts.forEach(p => { p.zone = `code${m}`; });
      all.push(...pts);
    }
    for (let line = 0; line < lineCount; line++) {
      const ly = cy - mh/2 + 8 + line * ((mh - 16) / lineCount);
      const lx = cx - mw/2 + 6;
      all.push({ x: lx, y: ly, zone: `linenum${m}` });
      all.push({ x: lx + 2.5, y: ly, zone: `linenum${m}` });
    }
    const pts2 = linePoints(rng, cx - mw/2 + 5, cy + mh/2 - 6, cx + mw/2 - 5, cy + mh/2 - 6, 20, 1.5, 0.3);
    pts2.forEach(p => { p.zone = `statusbar${m}`; });
    all.push(...pts2);
    const pts3 = linePoints(rng, cx - mw/2 + 5, cy - mh/2 + 5, cx - mw/2 + 45, cy - mh/2 + 5, 12, 1.5, 0.3);
    pts3.forEach(p => { p.zone = `code${m}`; });
    all.push(...pts3);
  }

  // === LED STRIP ===
  mark = all.length;
  for (let i = 0; i < 180; i++) {
    const t = sr();
    const x = 50 + t * 600;
    all.push({
      x: x,
      y: 466 + srr(-1, 1),
      zone: 'led'
    });
  }

  // === AMBIENT GLOW from monitors ===
  for (let i = 0; i < 300; i++) {
    const mx = monXPositions[Math.floor(sr() * 3)];
    const my = sr() < 0.5 ? botY : topY;
    const dist = srr(50, 140);
    const angle = sr() * Math.PI * 2;
    all.push({
      x: mx + dist * Math.cos(angle),
      y: my + dist * Math.sin(angle),
      zone: 'glow'
    });
  }

  // === REFLECTED GLOW on person ===
  for (let i = 0; i < 60; i++) {
    const base = all.filter(p => p.zone === 'hair' || p.zone === 'hoodie')[Math.floor(sr() * 400)];
    if (base) {
      all.push({
        x: base.x + srr(-3, 3),
        y: base.y + srr(-3, 3),
        zone: 'reflected'
      });
    }
  }

  // === AMBIENT SCATTER ===
  for (let i = 0; i < 150; i++) {
    const base = all[Math.floor(sr() * all.length)];
    const dist = srr(5, 25);
    const angle = sr() * Math.PI * 2;
    all.push({
      x: base.x + dist * Math.cos(angle),
      y: base.y + dist * Math.sin(angle),
      ambient: true
    });
  }

  return all;
}

module.exports = { build };
