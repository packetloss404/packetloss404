// Particle-dot geometry helpers — shared between scenes and cards.
// All helpers that consume randomness accept an `rng` object as first arg,
// returned from `createRng(seed)`. This keeps PRNG state explicit and
// makes output reproducible across callers.

function createRng(seed) {
  let s = seed;
  const sr = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const srr = (a, b) => a + sr() * (b - a);
  return { sr, srr };
}

function bezier(p0, p1, p2, p3, t) {
  const m = 1 - t;
  return {
    x: m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x,
    y: m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y
  };
}

function ribbonPoints(rng, p0, p1, p2, p3, count, thickness, scatter = 1.5) {
  const { sr, srr } = rng;
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

function ellipsePoints(rng, cx, cy, rx, ry, count, rotation = 0) {
  const { sr } = rng;
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

function linePoints(rng, x1, y1, x2, y2, count, thickness, scatter = 1) {
  const { sr, srr } = rng;
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

function rectPoints(rng, x, y, w, h, count) {
  const { sr } = rng;
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({ x: x + sr() * w, y: y + sr() * h });
  }
  return pts;
}

// Curved monitor — bezel, stand notch, thin bezels, screen fill.
function curvedMonitor(rng, cx, cy, w, h, curveDepth, count, zone) {
  const pts = [];
  const edgeDensity = Math.floor(count * 0.18);
  const sideDensity = Math.floor(count * 0.1);
  // Top bezel — double line for thickness
  for (let b = 0; b < 2; b++) {
    const yOff = b * 2.5;
    pts.push(...ribbonPoints(rng,
      {x: cx - w/2, y: cy - h/2 + yOff}, {x: cx - w/4, y: cy - h/2 + curveDepth + yOff},
      {x: cx + w/4, y: cy - h/2 + curveDepth + yOff}, {x: cx + w/2, y: cy - h/2 + yOff},
      edgeDensity, 2, 0.5
    ));
  }
  // Bottom bezel — double line
  for (let b = 0; b < 2; b++) {
    const yOff = -b * 2.5;
    pts.push(...ribbonPoints(rng,
      {x: cx - w/2, y: cy + h/2 + yOff}, {x: cx - w/4, y: cy + h/2 - curveDepth + yOff},
      {x: cx + w/4, y: cy + h/2 - curveDepth + yOff}, {x: cx + w/2, y: cy + h/2 + yOff},
      edgeDensity, 2, 0.5
    ));
  }
  // Left edge — double
  pts.push(...linePoints(rng, cx - w/2, cy - h/2, cx - w/2, cy + h/2, sideDensity, 2, 0.5));
  pts.push(...linePoints(rng, cx - w/2 + 2.5, cy - h/2 + 3, cx - w/2 + 2.5, cy + h/2 - 3, sideDensity, 1.5, 0.4));
  // Right edge — double
  pts.push(...linePoints(rng, cx + w/2, cy - h/2, cx + w/2, cy + h/2, sideDensity, 2, 0.5));
  pts.push(...linePoints(rng, cx + w/2 - 2.5, cy - h/2 + 3, cx + w/2 - 2.5, cy + h/2 - 3, sideDensity, 1.5, 0.4));
  // Corner dots
  const corners = [
    {x: cx - w/2 + 3, y: cy - h/2 + 3},
    {x: cx + w/2 - 3, y: cy - h/2 + 3},
    {x: cx - w/2 + 3, y: cy + h/2 - 3},
    {x: cx + w/2 - 3, y: cy + h/2 - 3}
  ];
  for (const c of corners) {
    pts.push(...ellipsePoints(rng, c.x, c.y, 3, 3, 8));
  }
  // Screen fill (denser interior glow)
  for (let i = 0; i < Math.floor(count * 0.35); i++) {
    const sx = cx + rng.srr(-w/2 + 6, w/2 - 6);
    const sy = cy + rng.srr(-h/2 + 6, h/2 - 6);
    const tx = (sx - cx) / (w/2);
    const yAdj = curveDepth * (1 - tx * tx) * 0.3;
    pts.push({ x: sx, y: sy + yAdj });
  }
  // Thin chin bezel
  pts.push(...ribbonPoints(rng,
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

module.exports = {
  createRng,
  bezier,
  ribbonPoints,
  ellipsePoints,
  linePoints,
  rectPoints,
  curvedMonitor,
  tagRange,
};
