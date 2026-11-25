// Deterministic Mulberry32 PRNG for reproducible order sequences and screenshot staging.

export function createSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeightedItem(random, items) {
  if (!items.length) return null;
  const index = Math.floor(random() * items.length);
  return items[Math.min(items.length - 1, Math.max(0, index))];
}
