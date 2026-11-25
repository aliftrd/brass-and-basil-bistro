// Shared dimensions, palette, timings, and station coordinates for Brass & Basil: Bistro Rush.

export const FIELD = {
  width: 1280,
  height: 720,
  headerHeight: 122,
};

export const STEP = 1 / 60;
export const SHIFT_DURATION = 120;
export const BEST_SCORE_KEY = 'brass_basil_bistro_best_v1';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export const CHEF_CONFIG = {
  radius: 19,
  speed: 330,
  interactRange: 88,
  chopSpeed: 0.9,
};

export const FONT_STACK = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
export const MONO_FONT = '"SFMono-Regular", Menlo, Consolas, monospace';

export const PALETTE = {
  backdrop: '#140f0d',
  wall: '#241a16',
  tileA: '#30241f',
  tileB: '#291e1a',
  tileGrout: '#1f1613',
  headerBg: '#19120f',
  headerBorder: '#4c382c',
  woodDark: '#4a3122',
  woodMid: '#6b4730',
  woodLight: '#8c6043',
  marble: '#dfd7cc',
  marbleEdge: '#b7aa99',
  stainless: '#68737d',
  stainlessLight: '#8c99a6',
  brass: '#d9a441',
  brassBright: '#f4c763',
  copper: '#c96f3b',
  copperDark: '#8b431f',
  emerald: '#2ecc71',
  emeraldDark: '#1b7a43',
  amber: '#f39c12',
  crimson: '#e74c3c',
  cream: '#fbf4e9',
  ink: '#221712',
  muted: '#b8a99a',
  ticketPaper: '#fdf8ee',
  ticketHeader: '#e5d4b7',
};

export const STATION_BOUNDS = {
  leftPantryX: 14,
  leftPantryWidth: 172,
  centerIslandLeft: 256,
  centerIslandRight: 890,
  servicePassX: 960,
  servicePassWidth: 306,
  bottomPantryY: 590,
  bottomPantryHeight: 112,
};
