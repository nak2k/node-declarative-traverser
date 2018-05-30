const compose = (...fns) => next =>
  fns.reduceRight((next, fn) => fn(next), next);

const identity = v => v;

/*
 * Exports.
 */
exports.compose = compose;
exports.identity = identity;
