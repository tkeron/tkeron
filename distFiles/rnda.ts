
export const rnda = (a: any[]) => a
    .map(_ => [_, Math.random()])
    .sort((w, e) => (w[1] == e[1] ? 0 : w[1] > e[1] ? 1 : -1))
    .map(_ => _[0]);
