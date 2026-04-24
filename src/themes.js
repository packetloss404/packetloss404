// Theme palettes for the particle-dot generator.
// Each theme bundles every color value consumed by src/render.js#pickColor.
// Swap themes to re-skin the same scene without touching geometry.

// --- Matrix (default) — verbatim port of the original palette set. ---
const matrix = {
  background: '#08080E',

  monitorFrame: ['#2A2A3E', '#33334D', '#3D3D5C', '#1E1E32'],
  screenGlow:   ['#0AFF0A', '#00FF41', '#39FF14', '#20C20E'],
  screenBlue:   ['#00BFFF', '#1E90FF', '#00D4FF', '#4FC3F7'],
  screenPurple: ['#9370DB', '#7B68EE', '#6A5ACD', '#BA55D3'],
  screenOrange: ['#FF8C00', '#FFA500', '#FF6347', '#FF7F50'],
  codeColors:   ['#00FF41', '#FF6EC7', '#00D4FF', '#FFD700', '#7B68EE', '#FF4444', '#87CEEB'],

  skinTones:    ['#F0D0A0', '#E8C090', '#F5DEB3', '#FAEBD7'],
  hairColors:   ['#2A1A0A', '#3B2515', '#1A0F05', '#4A3520'],
  hoodieColors: ['#1A1A2E', '#16213E', '#0F3460', '#1B1B3A', '#2C2C54'],
  deskColors:   ['#2C1810', '#3A2218', '#4A3020', '#1E1008'],
  accessoryColor: ['#555566', '#666677', '#777788', '#444455'],
  kbColors:     ['#333344', '#444455', '#2A2A3A', '#00FF41', '#FF6EC7'],
  ledColors:    ['#FF0055', '#00FF41', '#0088FF', '#FF6EC7', '#7B68EE', '#00D4FF', '#FFD700'],
  chairColors:  ['#1A1A1A', '#222222', '#2A2A2A', '#181818'],

  mongap:    '#0A0A12',
  linenum:   '#555566',
  statusbarA:'#00D4FF',
  statusbarB:'#7B68EE',
  floor:     '#0E0E14',
  deskmatA:  '#1A1A1A',
  deskmatB:  '#222233',
  mountA:    '#444455',
  mountB:    '#555566',
  cable:     '#222233',
  ambientFallback: '#1A1A2E',
  hairAccent:    '#00FF41',
  hoodieAccentA: '#00FF41',
  hoodieAccentB: '#7B68EE',
  canA: '#00FF41',
  canB: '#1A1A2E',
  defaultFallback: '#333344',
};

// codePalettes is a 6-entry array, indexed by monitor number, determining
// which palette the code lines on that monitor draw from. Keeping it as a
// field on the theme lets different themes vary the per-monitor feel.
matrix.codePalettes = [
  matrix.screenGlow,
  matrix.screenBlue,
  matrix.codeColors,
  matrix.screenPurple,
  matrix.screenOrange,
  matrix.screenBlue,
];

// --- Cyberpunk — magenta/cyan neon, purple hoodie accents. ---
const cyberpunk = {
  background: '#0A0614',

  monitorFrame: ['#2A1A3E', '#3D2054', '#4A2664', '#1E0F32'],
  screenGlow:   ['#FF00FF', '#FF1493', '#FF6EC7', '#FF69B4'],
  screenBlue:   ['#00D4FF', '#00FFFF', '#4FC3F7', '#1E90FF'],
  screenPurple: ['#9370DB', '#7B68EE', '#BA55D3', '#C471ED'],
  screenOrange: ['#FFD700', '#FFA500', '#FF6347', '#FF7F50'],
  codeColors:   ['#FF00FF', '#00FFFF', '#FFD700', '#FF6EC7', '#7B68EE', '#FF4444', '#00D4FF'],

  skinTones:    ['#F0D0A0', '#E8C090', '#F5DEB3', '#FAEBD7'],
  hairColors:   ['#1A0533', '#2A0A4A', '#15042A', '#3B1560'],
  hoodieColors: ['#1A0A2E', '#2A0A4A', '#0F1A60', '#1B0A3A', '#2C1254'],
  deskColors:   ['#1A0A28', '#22102E', '#2A1438', '#140818'],
  accessoryColor: ['#554466', '#665577', '#776688', '#443355'],
  kbColors:     ['#332244', '#443355', '#2A1A3A', '#FF1493', '#00FFFF'],
  ledColors:    ['#FF1493', '#FF00FF', '#00FFFF', '#FF6EC7', '#7B68EE', '#00D4FF', '#FFD700'],
  chairColors:  ['#120A1A', '#1A1222', '#22182A', '#0E0614'],

  mongap:    '#0A0618',
  linenum:   '#665577',
  statusbarA:'#FF00FF',
  statusbarB:'#00FFFF',
  floor:     '#0E0818',
  deskmatA:  '#1A0A1A',
  deskmatB:  '#2A1433',
  mountA:    '#443366',
  mountB:    '#554477',
  cable:     '#221833',
  ambientFallback: '#1A0A2E',
  hairAccent:    '#FF00FF',
  hoodieAccentA: '#FF1493',
  hoodieAccentB: '#00FFFF',
  canA: '#FF00FF',
  canB: '#1A0A2E',
  defaultFallback: '#443355',
};
cyberpunk.codePalettes = [
  cyberpunk.screenGlow,
  cyberpunk.screenPurple,
  cyberpunk.codeColors,
  cyberpunk.screenBlue,
  cyberpunk.screenGlow,
  cyberpunk.screenPurple,
];

// --- Amber-CRT — warm retro terminal, tungsten glow. ---
const amberCrt = {
  background: '#0E0A06',

  monitorFrame: ['#3A2E1E', '#4D3A24', '#5C4428', '#28200E'],
  screenGlow:   ['#FFB000', '#FFA500', '#FFD700', '#FF8C00'],
  screenBlue:   ['#FFCC66', '#FFB84D', '#FFD966', '#E6A023'],
  screenPurple: ['#CC7722', '#B86014', '#A0500A', '#8B4513'],
  screenOrange: ['#FF6B35', '#FF8C42', '#FFAA4D', '#FF7F50'],
  codeColors:   ['#FFB000', '#FFD700', '#FF8C00', '#FFA500', '#E6A023', '#FF6B35', '#CC9944'],

  skinTones:    ['#F0D0A0', '#E8C090', '#F5DEB3', '#FAEBD7'],
  hairColors:   ['#2A1A0A', '#3B2515', '#1A0F05', '#4A3520'],
  hoodieColors: ['#2E1A0A', '#3E2214', '#603010', '#3A1B1B', '#54342C'],
  deskColors:   ['#3A2218', '#4A3020', '#5A3C28', '#2A180E'],
  accessoryColor: ['#665544', '#776655', '#887766', '#554433'],
  kbColors:     ['#443322', '#554433', '#3A2A1A', '#FFB000', '#FF8C00'],
  ledColors:    ['#FFB000', '#FFA500', '#FFD700', '#FF8C00', '#FF6B35', '#CC9944', '#FFCC66'],
  chairColors:  ['#1A140A', '#221A10', '#2A2218', '#140E08'],

  mongap:    '#120A06',
  linenum:   '#665544',
  statusbarA:'#FFB000',
  statusbarB:'#FF8C00',
  floor:     '#14100A',
  deskmatA:  '#1A140A',
  deskmatB:  '#2A2012',
  mountA:    '#554433',
  mountB:    '#665544',
  cable:     '#221810',
  ambientFallback: '#2E1A0A',
  hairAccent:    '#FFB000',
  hoodieAccentA: '#FFD700',
  hoodieAccentB: '#FF8C00',
  canA: '#FFB000',
  canB: '#2E1A0A',
  defaultFallback: '#554433',
};
amberCrt.codePalettes = [
  amberCrt.screenGlow,
  amberCrt.screenOrange,
  amberCrt.codeColors,
  amberCrt.screenGlow,
  amberCrt.screenOrange,
  amberCrt.screenGlow,
];

// --- Arctic — icy cyan/white, cool steel accents. ---
const arctic = {
  background: '#06080E',

  monitorFrame: ['#1E2A3E', '#24334D', '#283D5C', '#0E1E32'],
  screenGlow:   ['#00FFFF', '#E0FFFF', '#AFEEEE', '#B0E0E6'],
  screenBlue:   ['#4FC3F7', '#00BFFF', '#1E90FF', '#00D4FF'],
  screenPurple: ['#B0C4DE', '#87CEEB', '#ADD8E6', '#C6E2FF'],
  screenOrange: ['#F0F8FF', '#E6E6FA', '#DCDCDC', '#F5F5F5'],
  codeColors:   ['#00FFFF', '#87CEEB', '#E0FFFF', '#AFEEEE', '#B0E0E6', '#4FC3F7', '#F0F8FF'],

  skinTones:    ['#F0D0A0', '#E8C090', '#F5DEB3', '#FAEBD7'],
  hairColors:   ['#1A1E2A', '#252D3B', '#0F141A', '#2E3550'],
  hoodieColors: ['#0E1A2E', '#14213E', '#0F2860', '#101B3A', '#1C2454'],
  deskColors:   ['#1A242E', '#222D38', '#2C3848', '#0E141C'],
  accessoryColor: ['#667788', '#778899', '#8899AA', '#556677'],
  kbColors:     ['#223344', '#334455', '#1A2A3A', '#00FFFF', '#87CEEB'],
  ledColors:    ['#00FFFF', '#E0FFFF', '#4FC3F7', '#87CEEB', '#B0C4DE', '#00D4FF', '#F0F8FF'],
  chairColors:  ['#0E1014', '#14161A', '#1C2028', '#080A0E'],

  mongap:    '#060812',
  linenum:   '#667788',
  statusbarA:'#00FFFF',
  statusbarB:'#87CEEB',
  floor:     '#080E14',
  deskmatA:  '#0E1422',
  deskmatB:  '#1A2433',
  mountA:    '#445566',
  mountB:    '#556677',
  cable:     '#182030',
  ambientFallback: '#0E1A2E',
  hairAccent:    '#00FFFF',
  hoodieAccentA: '#00FFFF',
  hoodieAccentB: '#87CEEB',
  canA: '#00FFFF',
  canB: '#0E1A2E',
  defaultFallback: '#445566',
};
arctic.codePalettes = [
  arctic.screenGlow,
  arctic.screenBlue,
  arctic.codeColors,
  arctic.screenBlue,
  arctic.screenGlow,
  arctic.screenBlue,
];

module.exports = {
  matrix,
  cyberpunk,
  'amber-crt': amberCrt,
  arctic,
};
