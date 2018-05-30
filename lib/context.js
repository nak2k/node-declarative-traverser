
function findErrors(prefix, context) {
  return context.errors.filter(err => err.path && err.path.startsWith(prefix));
}

function logError(dataRef, context, errorType, ...args) {
  const err = errorType(...args);
  err.message = `${err.message}. Path: ${dataRef.path}`;
  err.path = dataRef.path;
  context.errors.push(err);
}

/*
 * Exports.
 */
exports.findErrors = findErrors;
exports.logError = logError;
