export function* pseudoRnd(seed = 0, limit = 0) {
  let current = 0;
  while (true) {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    yield seed;
    if (limit > 0) current++;
    if (limit > 0 && current >= limit) break;
  }
}

export const getPseudoRnd = (seed = 0) => {
  const rnd = pseudoRnd(seed);
  return () => rnd.next().value || seed;
};

export const rnd = (seed = 0, min = 0, max = 100) => {
  const range = Math.abs(max - min) + 1;
  const prnd = getPseudoRnd(seed);
  return () => {
    seed = Math.abs(prnd()) % range;
    return seed + min;
  };
};
