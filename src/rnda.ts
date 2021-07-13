
export const rnda = (a: any[], randomGenerator = Math.random) => a
    .map(_ => [_, randomGenerator()])
    .sort((w, e) => (w[1] == e[1] ? 0 : w[1] > e[1] ? 1 : -1))
    .map(_ => _[0]);
