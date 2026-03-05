#!/usr/bin/env node
/**
 * Generate a particle-dot battle station scene — fine detail version.
 * View from behind: person at desk with 6x 29" curved monitors on mounts.
 */

const fs = require('fs');

let seed = 42;
function sr() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function srr(a, b) { return a + sr() * (b - a); }

function bezier(p0, p1, p2, p3, t) {
  const m = 1 - t;
  return {
    x: m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x,
    y: m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y
  };
}

function ribbonPoints(p0, p1, p2, p3, count, thickness, scatter = 1.5) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = sr();
    const p = bezier(p0, p1, p2, p3, t);
    const dt = 0.01;
    const p2t = bezier(p0, p1, p2, p3, Math.min(1, t + dt));
    const dx = p2t.x - p.x, dy = p2t.y - p.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy/len, ny = dx/len;
    const tw = thickness * (1 - t * 0.3);
    const offset = srr(-tw/2, tw/2);
    pts.push({
      x: p.x + nx * offset + srr(-scatter, scatter),
      y: p.y + ny * offset + srr(-scatter, scatter)
    });
  }
  return pts;
}

function ellipsePoints(cx, cy, rx, ry, count, rotation = 0) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = sr() * Math.PI * 2;
    const r = Math.sqrt(sr());
    let x = r * rx * Math.cos(a);
    let y = r * ry * Math.sin(a);
    const cos = Math.cos(rotation), sin = Math.sin(rotation);
    pts.push({
      x: cx + x * cos - y * sin,
      y: cy + x * sin + y * cos
    });
  }
  return pts;
}

function linePoints(x1, y1, x2, y2, count, thickness, scatter = 1) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = sr();
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy/len, ny = dx/len;
    const offset = srr(-thickness/2, thickness/2);
    pts.push({
      x: x + nx * offset + srr(-scatter, scatter),
      y: y + ny * offset + srr(-scatter, scatter)
    });
  }
  return pts;
}

function rectPoints(x, y, w, h, count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({ x: x + sr() * w, y: y + sr() * h });
  }
  return pts;
}

// Curved monitor — fine detail version with bezel, stand notch, thinner bezels
function curvedMonitor(cx, cy, w, h, curveDepth, count, zone) {
  const pts = [];
  const edgeDensity = Math.floor(count * 0.18);
  const sideDensity = Math.floor(count * 0.1);
  // Top bezel — double line for thickness
  for (let b = 0; b < 2; b++) {
    const yOff = b * 2.5;
    pts.push(...ribbonPoints(
      {x: cx - w/2, y: cy - h/2 + yOff}, {x: cx - w/4, y: cy - h/2 + curveDepth + yOff},
      {x: cx + w/4, y: cy - h/2 + curveDepth + yOff}, {x: cx + w/2, y: cy - h/2 + yOff},
      edgeDensity, 2, 0.5
    ));
  }
  // Bottom bezel — double line
  for (let b = 0; b < 2; b++) {
    const yOff = -b * 2.5;
    pts.push(...ribbonPoints(
      {x: cx - w/2, y: cy + h/2 + yOff}, {x: cx - w/4, y: cy + h/2 - curveDepth + yOff},
      {x: cx + w/4, y: cy + h/2 - curveDepth + yOff}, {x: cx + w/2, y: cy + h/2 + yOff},
      edgeDensity, 2, 0.5
    ));
  }
  // Left edge — double
  pts.push(...linePoints(cx - w/2, cy - h/2, cx - w/2, cy + h/2, sideDensity, 2, 0.5));
  pts.push(...linePoints(cx - w/2 + 2.5, cy - h/2 + 3, cx - w/2 + 2.5, cy + h/2 - 3, sideDensity, 1.5, 0.4));
  // Right edge — double
  pts.push(...linePoints(cx + w/2, cy - h/2, cx + w/2, cy + h/2, sideDensity, 2, 0.5));
  pts.push(...linePoints(cx + w/2 - 2.5, cy - h/2 + 3, cx + w/2 - 2.5, cy + h/2 - 3, sideDensity, 1.5, 0.4));
  // Corner dots (rounded corners)
  const corners = [
    {x: cx - w/2 + 3, y: cy - h/2 + 3},
    {x: cx + w/2 - 3, y: cy - h/2 + 3},
    {x: cx - w/2 + 3, y: cy + h/2 - 3},
    {x: cx + w/2 - 3, y: cy + h/2 - 3}
  ];
  for (const c of corners) {
    pts.push(...ellipsePoints(c.x, c.y, 3, 3, 8));
  }
  // Screen fill (denser interior glow)
  for (let i = 0; i < Math.floor(count * 0.35); i++) {
    const sx = cx + srr(-w/2 + 6, w/2 - 6);
    const sy = cy + srr(-h/2 + 6, h/2 - 6);
    const tx = (sx - cx) / (w/2);
    const yAdj = curveDepth * (1 - tx * tx) * 0.3;
    pts.push({ x: sx, y: sy + yAdj });
  }
  // Thin chin bezel line (bottom of monitor)
  pts.push(...ribbonPoints(
    {x: cx - w/2 + 8, y: cy + h/2 + 4}, {x: cx - w/4, y: cy + h/2 + 4 - curveDepth * 0.3},
    {x: cx + w/4, y: cy + h/2 + 4 - curveDepth * 0.3}, {x: cx + w/2 - 8, y: cy + h/2 + 4},
    Math.floor(edgeDensity * 0.5), 1.5, 0.4
  ));
  pts.forEach(p => { p.zone = zone; });
  return pts;
}

function tagRange(arr, start, zone) {
  for (let i = start; i < arr.length; i++) {
    if (!arr[i].zone) arr[i].zone = zone;
  }
}

let all = [];

// ==========================================
// SCENE: BACK VIEW — PERSON AT BATTLE STATION
// Canvas ~700x520
// ==========================================

// === FLOOR (subtle gradient at very bottom) ===
const floorPts = [];
for (let i = 0; i < 100; i++) {
  floorPts.push({ x: srr(20, 680), y: srr(490, 520) });
}
floorPts.forEach(p => { p.zone = 'floor'; });
all.push(...floorPts);

// === DESK SURFACE ===
let mark = all.length;
// Desk top edge — tighter, sharper
all.push(...ribbonPoints(
  {x: 55, y: 338}, {x: 200, y: 333}, {x: 500, y: 333}, {x: 645, y: 338},
  250, 5, 0.8
));
// Desk back edge highlight
all.push(...ribbonPoints(
  {x: 58, y: 340}, {x: 200, y: 336}, {x: 500, y: 336}, {x: 642, y: 340},
  120, 3, 0.6
));
// Desk front edge
all.push(...ribbonPoints(
  {x: 35, y: 468}, {x: 200, y: 464}, {x: 500, y: 464}, {x: 665, y: 468},
  220, 5, 0.8
));
// Desk surface fill (denser)
const deskPts = rectPoints(52, 337, 596, 130, 400);
deskPts.forEach(p => { p.zone = 'desk'; });
all.push(...deskPts);
// Desk side edges
all.push(...linePoints(55, 338, 35, 468, 60, 4, 0.7));
all.push(...linePoints(645, 338, 665, 468, 60, 4, 0.7));
// Desk legs with detail
all.push(...linePoints(75, 468, 75, 515, 45, 6, 0.6));
all.push(...linePoints(625, 468, 625, 515, 45, 6, 0.6));
// Cross brace
all.push(...ribbonPoints(
  {x: 75, y: 500}, {x: 200, y: 498}, {x: 500, y: 498}, {x: 625, y: 500},
  80, 3, 0.7
));
tagRange(all, mark, 'desk');

// === DESK MAT (subtle rectangle under keyboard area) ===
mark = all.length;
all.push(...linePoints(280, 345, 430, 345, 50, 2, 0.5));
all.push(...linePoints(280, 385, 430, 385, 50, 2, 0.5));
all.push(...linePoints(280, 345, 280, 385, 25, 2, 0.5));
all.push(...linePoints(430, 345, 430, 385, 25, 2, 0.5));
tagRange(all, mark, 'deskmat');

// === 6 MONITORS — 3 top row, 3 bottom row ===
const monW = 158, monH = 92, curve = 7;
const botY = 272, topY = 160;
const monXPositions = [172, 350, 528];

// Bottom row
for (let i = 0; i < 3; i++) {
  all.push(...curvedMonitor(monXPositions[i], botY, monW, monH, curve, 280, `mon${i}`));
}

// Top row (slightly smaller perspective)
const monWT = 150, monHT = 87, curveT = 6;
for (let i = 0; i < 3; i++) {
  all.push(...curvedMonitor(monXPositions[i], topY, monWT, monHT, curveT, 250, `mon${i + 3}`));
}

// === MONITOR GAPS (thin dark lines between adjacent monitors) ===
mark = all.length;
// Bottom row gaps
all.push(...linePoints(251, botY - monH/2 + 5, 251, botY + monH/2 - 5, 35, 2, 0.4));
all.push(...linePoints(449, botY - monH/2 + 5, 449, botY + monH/2 - 5, 35, 2, 0.4));
// Top row gaps
all.push(...linePoints(247, topY - monHT/2 + 5, 247, topY + monHT/2 - 5, 30, 2, 0.4));
all.push(...linePoints(453, topY - monHT/2 + 5, 453, topY + monHT/2 - 5, 30, 2, 0.4));
// Horizontal gap between rows
all.push(...ribbonPoints(
  {x: 93, y: 218}, {x: 250, y: 220}, {x: 450, y: 220}, {x: 607, y: 218},
  60, 2, 0.4
));
tagRange(all, mark, 'mongap');

// === MONITOR MOUNTS / ARMS ===
mark = all.length;
// Central mount pole (thicker, detailed)
all.push(...linePoints(350, 115, 350, 338, 120, 5, 0.6));
all.push(...linePoints(352, 115, 352, 338, 60, 3, 0.5));
// Pole base clamp on desk
all.push(...ellipsePoints(350, 338, 12, 4, 30));
// Mount arms — bottom row with joints
for (const mx of monXPositions) {
  const dx = mx - 350;
  // Arm segment
  all.push(...ribbonPoints(
    {x: 350, y: 308}, {x: 350 + dx * 0.3, y: 312},
    {x: 350 + dx * 0.65, y: 316}, {x: mx, y: 318},
    45, 4, 0.6
  ));
  // Joint dot
  all.push(...ellipsePoints(350 + dx * 0.5, 314, 3, 3, 10));
}
// Mount arms — top row
for (const mx of monXPositions) {
  const dx = mx - 350;
  all.push(...ribbonPoints(
    {x: 350, y: 195}, {x: 350 + dx * 0.3, y: 198},
    {x: 350 + dx * 0.65, y: 201}, {x: mx, y: 206},
    40, 3.5, 0.6
  ));
  all.push(...ellipsePoints(350 + dx * 0.5, 200, 3, 3, 8));
}
tagRange(all, mark, 'mount');

// === PERSON (back view — seated, fine detail) ===
// Head (back of head — layered for depth)
mark = all.length;
all.push(...ellipsePoints(350, 368, 26, 22, 200));
// Hair on back — layered texture
all.push(...ellipsePoints(350, 363, 28, 20, 150));
// Hair whorl / crown
all.push(...ellipsePoints(350, 355, 12, 10, 50));
// Hair edges — tighter outline
all.push(...ribbonPoints(
  {x: 322, y: 365}, {x: 325, y: 348}, {x: 350, y: 343}, {x: 375, y: 348},
  60, 3, 0.6
));
all.push(...ribbonPoints(
  {x: 375, y: 348}, {x: 378, y: 365}, {x: 375, y: 382}, {x: 365, y: 390},
  50, 3, 0.6
));
all.push(...ribbonPoints(
  {x: 322, y: 365}, {x: 320, y: 378}, {x: 325, y: 388}, {x: 335, y: 390},
  50, 3, 0.6
));
// Hair texture streaks
for (let i = 0; i < 6; i++) {
  const angle = -0.8 + i * 0.32;
  const r1 = 8, r2 = 22;
  all.push(...ribbonPoints(
    {x: 350 + r1 * Math.cos(angle), y: 358 + r1 * Math.sin(angle)},
    {x: 350 + r2 * 0.4 * Math.cos(angle + 0.1), y: 358 + r2 * 0.4 * Math.sin(angle + 0.1)},
    {x: 350 + r2 * 0.7 * Math.cos(angle + 0.15), y: 358 + r2 * 0.7 * Math.sin(angle + 0.15)},
    {x: 350 + r2 * Math.cos(angle + 0.2), y: 358 + r2 * Math.sin(angle + 0.2)},
    25, 2, 0.5
  ));
}
tagRange(all, mark, 'hair');

// Ears (more detailed — outer rim + lobe)
mark = all.length;
all.push(...ellipsePoints(319, 373, 6, 9, 40));
all.push(...ribbonPoints(
  {x: 314, y: 365}, {x: 312, y: 372}, {x: 313, y: 380}, {x: 317, y: 384},
  25, 2, 0.5
));
all.push(...ellipsePoints(381, 373, 6, 9, 40));
all.push(...ribbonPoints(
  {x: 386, y: 365}, {x: 388, y: 372}, {x: 387, y: 380}, {x: 383, y: 384},
  25, 2, 0.5
));
tagRange(all, mark, 'skin');

// Neck (more defined)
mark = all.length;
all.push(...ribbonPoints(
  {x: 338, y: 388}, {x: 336, y: 398}, {x: 335, y: 410}, {x: 334, y: 420},
  65, 12, 1
));
all.push(...ribbonPoints(
  {x: 362, y: 388}, {x: 364, y: 398}, {x: 365, y: 410}, {x: 366, y: 420},
  65, 12, 1
));
// Neck center fill
all.push(...ellipsePoints(350, 405, 14, 16, 60));
// Neck tendons / shadow lines
all.push(...ribbonPoints(
  {x: 342, y: 390}, {x: 341, y: 400}, {x: 340, y: 410}, {x: 340, y: 418},
  20, 2, 0.4
));
all.push(...ribbonPoints(
  {x: 358, y: 390}, {x: 359, y: 400}, {x: 360, y: 410}, {x: 360, y: 418},
  20, 2, 0.4
));
tagRange(all, mark, 'skin');

// Shoulders and upper back (hoodie — with folds and seams)
mark = all.length;
// Left shoulder — main curve
all.push(...ribbonPoints(
  {x: 334, y: 420}, {x: 306, y: 426}, {x: 268, y: 436}, {x: 225, y: 450},
  160, 20, 1.8
));
// Left shoulder top edge
all.push(...ribbonPoints(
  {x: 334, y: 418}, {x: 305, y: 422}, {x: 268, y: 430}, {x: 225, y: 442},
  70, 3, 0.6
));
// Right shoulder — main curve
all.push(...ribbonPoints(
  {x: 366, y: 420}, {x: 394, y: 426}, {x: 432, y: 436}, {x: 475, y: 450},
  160, 20, 1.8
));
// Right shoulder top edge
all.push(...ribbonPoints(
  {x: 366, y: 418}, {x: 395, y: 422}, {x: 432, y: 430}, {x: 475, y: 442},
  70, 3, 0.6
));
// Upper back fill (denser)
all.push(...ellipsePoints(350, 443, 68, 26, 280));
// Mid back
all.push(...ellipsePoints(350, 470, 78, 22, 220));
// Spine line (subtle center seam)
all.push(...ribbonPoints(
  {x: 350, y: 420}, {x: 350, y: 445}, {x: 350, y: 475}, {x: 350, y: 510},
  50, 2, 0.5
));
// Shoulder blade hints (left + right)
all.push(...ribbonPoints(
  {x: 320, y: 440}, {x: 315, y: 450}, {x: 318, y: 460}, {x: 325, y: 468},
  35, 4, 0.8
));
all.push(...ribbonPoints(
  {x: 380, y: 440}, {x: 385, y: 450}, {x: 382, y: 460}, {x: 375, y: 468},
  35, 4, 0.8
));
// Hoodie side seams
all.push(...ribbonPoints(
  {x: 270, y: 445}, {x: 268, y: 465}, {x: 270, y: 485}, {x: 275, y: 510},
  40, 2, 0.5
));
all.push(...ribbonPoints(
  {x: 430, y: 445}, {x: 432, y: 465}, {x: 430, y: 485}, {x: 425, y: 510},
  40, 2, 0.5
));
// Hoodie wrinkle folds on back
for (let i = 0; i < 4; i++) {
  const fy = 448 + i * 14;
  const fx = 320 + srr(-15, 15);
  all.push(...ribbonPoints(
    {x: fx, y: fy}, {x: fx + 10, y: fy + 2}, {x: fx + 25, y: fy + 1}, {x: fx + 40, y: fy - 1},
    18, 2, 0.5
  ));
}
// Lower back sides
all.push(...ribbonPoints(
  {x: 265, y: 458}, {x: 275, y: 478}, {x: 285, y: 498}, {x: 295, y: 515},
  70, 16, 1.8
));
all.push(...ribbonPoints(
  {x: 435, y: 458}, {x: 425, y: 478}, {x: 415, y: 498}, {x: 405, y: 515},
  70, 16, 1.8
));
tagRange(all, mark, 'hoodie');

// Hoodie hood (bunched behind neck — more detail)
mark = all.length;
all.push(...ellipsePoints(350, 408, 24, 9, 70));
all.push(...ribbonPoints(
  {x: 326, y: 403}, {x: 330, y: 412}, {x: 348, y: 418}, {x: 374, y: 413},
  55, 6, 1
));
// Hood edge fold line
all.push(...ribbonPoints(
  {x: 328, y: 400}, {x: 335, y: 408}, {x: 355, y: 412}, {x: 372, y: 408},
  30, 2, 0.5
));
// Hood drawstrings hanging down back
all.push(...ribbonPoints(
  {x: 340, y: 415}, {x: 338, y: 425}, {x: 336, y: 435}, {x: 335, y: 442},
  20, 1.5, 0.4
));
all.push(...ribbonPoints(
  {x: 360, y: 415}, {x: 362, y: 425}, {x: 364, y: 435}, {x: 365, y: 442},
  20, 1.5, 0.4
));
tagRange(all, mark, 'hood');

// === GAMING CHAIR (armrests visible at sides) ===
mark = all.length;
// Chair back (behind person, peeks out sides)
all.push(...ribbonPoints(
  {x: 215, y: 430}, {x: 210, y: 460}, {x: 212, y: 490}, {x: 218, y: 515},
  50, 8, 1
));
all.push(...ribbonPoints(
  {x: 485, y: 430}, {x: 490, y: 460}, {x: 488, y: 490}, {x: 482, y: 515},
  50, 8, 1
));
// Armrests
all.push(...ribbonPoints(
  {x: 230, y: 448}, {x: 222, y: 452}, {x: 215, y: 454}, {x: 205, y: 455},
  35, 5, 0.6
));
all.push(...ribbonPoints(
  {x: 470, y: 448}, {x: 478, y: 452}, {x: 485, y: 454}, {x: 495, y: 455},
  35, 5, 0.6
));
// Armrest pads
all.push(...ellipsePoints(205, 455, 8, 3, 20));
all.push(...ellipsePoints(495, 455, 8, 3, 20));
tagRange(all, mark, 'chair');

// === KEYBOARD (finer detail with individual key rows) ===
mark = all.length;
const kbPts = [];
// Keyboard case outline (tighter)
kbPts.push(...linePoints(300, 348, 400, 348, 55, 2, 0.4));
kbPts.push(...linePoints(300, 374, 400, 374, 55, 2, 0.4));
kbPts.push(...linePoints(300, 348, 300, 374, 25, 2, 0.4));
kbPts.push(...linePoints(400, 348, 400, 374, 25, 2, 0.4));
// Key rows (5 rows, varying key counts for realism)
const keyRows = [14, 14, 13, 12, 8]; // top to bottom
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
// Spacebar (wider key)
kbPts.push(...linePoints(332, 371, 368, 371, 12, 1.5, 0.3));
kbPts.forEach(p => { p.zone = 'keyboard'; });
all.push(...kbPts);

// === MOUSE (right of keyboard, finer) ===
mark = all.length;
const mousePts = [];
mousePts.push(...ellipsePoints(418, 362, 7, 11, 50));
// Mouse edge
mousePts.push(...ribbonPoints(
  {x: 412, y: 352}, {x: 410, y: 362}, {x: 411, y: 372}, {x: 415, y: 374},
  20, 2, 0.4
));
mousePts.push(...ribbonPoints(
  {x: 424, y: 352}, {x: 426, y: 362}, {x: 425, y: 372}, {x: 421, y: 374},
  20, 2, 0.4
));
// Scroll wheel
mousePts.push(...linePoints(418, 356, 418, 362, 8, 1.5, 0.3));
// Mouse cable
mousePts.push(...ribbonPoints(
  {x: 418, y: 351}, {x: 418, y: 345}, {x: 420, y: 340}, {x: 425, y: 335},
  15, 1.5, 0.4
));
mousePts.forEach(p => { p.zone = 'keyboard'; });
all.push(...mousePts);

// === MOUSEPAD ===
mark = all.length;
all.push(...linePoints(405, 345, 440, 345, 25, 1.5, 0.3));
all.push(...linePoints(405, 382, 440, 382, 25, 1.5, 0.3));
all.push(...linePoints(405, 345, 405, 382, 18, 1.5, 0.3));
all.push(...linePoints(440, 345, 440, 382, 18, 1.5, 0.3));
tagRange(all, mark, 'deskmat');

// === DESK ITEMS ===
// Headphone stand (left — more detail)
mark = all.length;
// Stand pole
all.push(...linePoints(108, 308, 108, 348, 40, 3, 0.5));
// Stand base
all.push(...ellipsePoints(108, 348, 10, 3, 20));
// Stand hook curve
all.push(...ribbonPoints(
  {x: 93, y: 308}, {x: 97, y: 293}, {x: 119, y: 293}, {x: 123, y: 308},
  45, 3, 0.6
));
// Headphone cups with detail
all.push(...ellipsePoints(91, 314, 7, 11, 40));
all.push(...ellipsePoints(125, 314, 7, 11, 40));
// Cup inner rings
all.push(...ribbonPoints(
  {x: 85, y: 308}, {x: 84, y: 314}, {x: 85, y: 320}, {x: 91, y: 322},
  15, 1, 0.3
));
all.push(...ribbonPoints(
  {x: 131, y: 308}, {x: 132, y: 314}, {x: 131, y: 320}, {x: 125, y: 322},
  15, 1, 0.3
));
// Headband padding
all.push(...ribbonPoints(
  {x: 95, y: 296}, {x: 102, y: 290}, {x: 114, y: 290}, {x: 121, y: 296},
  25, 3, 0.5
));
tagRange(all, mark, 'accessory');

// Energy drink can (right — with label detail)
mark = all.length;
all.push(...linePoints(582, 338, 582, 368, 35, 8, 0.5));
all.push(...ellipsePoints(582, 338, 6, 2.5, 20));
all.push(...ellipsePoints(582, 368, 6, 2.5, 20));
// Can label stripe
all.push(...ribbonPoints(
  {x: 575, y: 350}, {x: 578, y: 350}, {x: 586, y: 350}, {x: 589, y: 350},
  12, 2, 0.3
));
// Pull tab
all.push(...ellipsePoints(582, 337, 2, 1, 6));
tagRange(all, mark, 'can');

// Small figurine on desk
mark = all.length;
all.push(...linePoints(137, 343, 137, 360, 20, 3, 0.4));
all.push(...ellipsePoints(137, 339, 6, 6, 30));
// Figurine base
all.push(...ellipsePoints(137, 362, 5, 2, 12));
tagRange(all, mark, 'accessory');

// Coaster with mug (far left)
mark = all.length;
all.push(...ellipsePoints(82, 360, 10, 4, 25));
all.push(...linePoints(76, 348, 76, 360, 12, 2, 0.4));
all.push(...linePoints(88, 348, 88, 360, 12, 2, 0.4));
all.push(...ellipsePoints(82, 348, 8, 3, 18));
// Mug handle
all.push(...ribbonPoints(
  {x: 88, y: 350}, {x: 93, y: 350}, {x: 95, y: 355}, {x: 90, y: 358},
  10, 1.5, 0.3
));
tagRange(all, mark, 'accessory');

// === CABLES (behind monitors / under desk) ===
mark = all.length;
// Cable bundle behind center monitor down to desk
all.push(...ribbonPoints(
  {x: 350, y: 322}, {x: 348, y: 328}, {x: 346, y: 332}, {x: 345, y: 338},
  20, 3, 0.5
));
// Cable running left
all.push(...ribbonPoints(
  {x: 345, y: 338}, {x: 280, y: 340}, {x: 200, y: 342}, {x: 130, y: 345},
  35, 2, 0.5
));
// Cable running right
all.push(...ribbonPoints(
  {x: 345, y: 338}, {x: 420, y: 340}, {x: 500, y: 342}, {x: 570, y: 345},
  35, 2, 0.5
));
// USB cable from keyboard
all.push(...ribbonPoints(
  {x: 350, y: 348}, {x: 350, y: 343}, {x: 348, y: 340}, {x: 345, y: 338},
  10, 1.5, 0.3
));
tagRange(all, mark, 'cable');

// === MONITOR SCREEN CONTENT (code + terminals — much denser) ===
for (let m = 0; m < 6; m++) {
  const cx = monXPositions[m % 3];
  const cy = m < 3 ? botY : topY;
  const mw = m < 3 ? monW : monWT;
  const mh = m < 3 ? monH : monHT;
  // More code lines, varying indent
  const lineCount = m < 3 ? 12 : 11;
  for (let line = 0; line < lineCount; line++) {
    const indent = Math.floor(sr() * 4) * 6;
    const lx = cx - mw/2 + 10 + indent;
    const ly = cy - mh/2 + 8 + line * ((mh - 16) / lineCount);
    const lw = srr(15, mw * 0.55 - indent);
    const pts = linePoints(lx, ly, lx + lw, ly, Math.floor(srr(10, 25)), 1.5, 0.3);
    pts.forEach(p => { p.zone = `code${m}`; });
    all.push(...pts);
  }
  // Line numbers (left gutter)
  for (let line = 0; line < lineCount; line++) {
    const ly = cy - mh/2 + 8 + line * ((mh - 16) / lineCount);
    const lx = cx - mw/2 + 6;
    all.push({ x: lx, y: ly, zone: `linenum${m}` });
    all.push({ x: lx + 2.5, y: ly, zone: `linenum${m}` });
  }
  // Status bar at bottom of screen
  const pts2 = linePoints(cx - mw/2 + 5, cy + mh/2 - 6, cx + mw/2 - 5, cy + mh/2 - 6, 20, 1.5, 0.3);
  pts2.forEach(p => { p.zone = `statusbar${m}`; });
  all.push(...pts2);
  // Tab bar at top
  const pts3 = linePoints(cx - mw/2 + 5, cy - mh/2 + 5, cx - mw/2 + 45, cy - mh/2 + 5, 12, 1.5, 0.3);
  pts3.forEach(p => { p.zone = `code${m}`; });
  all.push(...pts3);
}

// === LED STRIP under desk edge (RGB glow) ===
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

// === AMBIENT GLOW from monitors (larger, softer) ===
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

// Monitor light on person (reflected glow on hair/shoulders)
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

// === GENERATE SVG ===
const svgW = 700, svgH = 520;
const scale = 0.92;
const ox = 28, oy = 8;

// Color palettes
const monitorFrame = ['#2A2A3E', '#33334D', '#3D3D5C', '#1E1E32'];
const screenGlow = ['#0AFF0A', '#00FF41', '#39FF14', '#20C20E'];
const screenBlue = ['#00BFFF', '#1E90FF', '#00D4FF', '#4FC3F7'];
const screenPurple = ['#9370DB', '#7B68EE', '#6A5ACD', '#BA55D3'];
const screenOrange = ['#FF8C00', '#FFA500', '#FF6347', '#FF7F50'];
const codeColors = ['#00FF41', '#FF6EC7', '#00D4FF', '#FFD700', '#7B68EE', '#FF4444', '#87CEEB'];
const skinTones = ['#F0D0A0', '#E8C090', '#F5DEB3', '#FAEBD7'];
const hairColors = ['#2A1A0A', '#3B2515', '#1A0F05', '#4A3520'];
const hoodieColors = ['#1A1A2E', '#16213E', '#0F3460', '#1B1B3A', '#2C2C54'];
const deskColors = ['#2C1810', '#3A2218', '#4A3020', '#1E1008'];
const accessoryColor = ['#555566', '#666677', '#777788', '#444455'];
const kbColors = ['#333344', '#444455', '#2A2A3A', '#00FF41', '#FF6EC7'];
const ledColors = ['#FF0055', '#00FF41', '#0088FF', '#FF6EC7', '#7B68EE', '#00D4FF', '#FFD700'];
const chairColors = ['#1A1A1A', '#222222', '#2A2A2A', '#181818'];

function pickColor(p) {
  if (!p.zone && p.ambient) {
    const roll = sr();
    if (roll < 0.3) return screenGlow[Math.floor(sr() * screenGlow.length)];
    if (roll < 0.55) return screenBlue[Math.floor(sr() * screenBlue.length)];
    if (roll < 0.75) return screenPurple[Math.floor(sr() * screenPurple.length)];
    return '#1A1A2E';
  }

  const z = p.zone || '';

  if (z.startsWith('mon')) return monitorFrame[Math.floor(sr() * monitorFrame.length)];
  if (z === 'mongap') return '#0A0A12';

  if (z.startsWith('code')) {
    const mIdx = parseInt(z.replace('code', ''));
    const palettes = [screenGlow, screenBlue, codeColors, screenPurple, screenOrange, screenBlue];
    const pal = palettes[mIdx] || codeColors;
    return pal[Math.floor(sr() * pal.length)];
  }
  if (z.startsWith('linenum')) return '#555566';
  if (z.startsWith('statusbar')) return sr() < 0.5 ? '#00D4FF' : '#7B68EE';

  if (z === 'glow') {
    const roll = sr();
    if (roll < 0.3) return screenGlow[Math.floor(sr() * screenGlow.length)];
    if (roll < 0.55) return screenBlue[Math.floor(sr() * screenBlue.length)];
    return screenPurple[Math.floor(sr() * screenPurple.length)];
  }

  if (z === 'reflected') {
    const roll = sr();
    if (roll < 0.4) return screenBlue[Math.floor(sr() * screenBlue.length)];
    if (roll < 0.7) return screenGlow[Math.floor(sr() * screenGlow.length)];
    return screenPurple[Math.floor(sr() * screenPurple.length)];
  }

  if (z === 'led') return ledColors[Math.floor(sr() * ledColors.length)];
  if (z === 'floor') return '#0E0E14';
  if (z === 'desk') return deskColors[Math.floor(sr() * deskColors.length)];
  if (z === 'deskmat') return sr() < 0.6 ? '#1A1A1A' : '#222233';
  if (z === 'mount') return sr() < 0.8 ? '#444455' : '#555566';
  if (z === 'cable') return '#222233';

  if (z === 'hair') {
    return sr() < 0.88 ? hairColors[Math.floor(sr() * hairColors.length)] : '#00FF41';
  }
  if (z === 'skin') return skinTones[Math.floor(sr() * skinTones.length)];
  if (z === 'hoodie' || z === 'hood') {
    return sr() < 0.82
      ? hoodieColors[Math.floor(sr() * hoodieColors.length)]
      : (sr() < 0.5 ? '#00FF41' : '#7B68EE');
  }
  if (z === 'chair') return chairColors[Math.floor(sr() * chairColors.length)];

  if (z === 'keyboard') {
    return sr() < 0.65
      ? kbColors[Math.floor(sr() * 3)]
      : kbColors[3 + Math.floor(sr() * 2)];
  }

  if (z === 'can') {
    return sr() < 0.5 ? '#00FF41' : '#1A1A2E';
  }
  if (z === 'accessory') return accessoryColor[Math.floor(sr() * accessoryColor.length)];

  return '#333344';
}

let dots = '';
all.forEach((p) => {
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">
  <rect width="100%" height="100%" fill="#08080E"/>
  <g>
${dots}  </g>
</svg>`;

fs.writeFileSync('pixel-packet.svg', svg);
console.log(`Generated ${all.length} particle dots`);
console.log('Output: pixel-packet.svg');
