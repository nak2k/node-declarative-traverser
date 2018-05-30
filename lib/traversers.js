const {
  ERR_PROHIBITED_PROPERTY,
  ERR_TYPE_MISMATCH,
  ERR_UNKNOWN_PROPERTY,
} = require('./errors');
const {
  logError,
} = require('./context');

const cloneTraverser = (dataRef, context, callback) => {
  const { data } = dataRef;

  if (Array.isArray(data)) {
    return callback(null, [...data]);
  } else if (typeof data === 'object') {
    return callback(null, {...data});
  } else {
    return callback(null);
  }
};

const logTraverser = (dataRef, context, callback) => {
  console.dir(dataRef);

  callback(null);
};

const ignoreProperty = (dataRef, context, callback) => {
  callback(null);
};

const noopTraverser = (dataRef, context, callback) => {
  callback(null);
};

const prohibitedPropertyError = (dataRef, context, callback) => {
  if (dataRef.data !== undefined) {
    logError(dataRef, context, ERR_PROHIBITED_PROPERTY, dataRef.key);
  }

  callback(null);
};

const returnDataTraverser = (dataRef, context, callback) => {
  callback(null, dataRef.data);
};

const typeMismatchError = (dataRef, context, callback) => {
  logError(dataRef, context, ERR_TYPE_MISMATCH,
    Object.keys(dataRef.schemaRef.schema).join('|'));

  callback(null);
};

const typeOfDataTraverser = (dataRef, context, callback) => {
  callback(null, typeof dataRef.data);
};

const unknownPropertyError = (dataRef, context, callback) => {
  if (dataRef.data !== undefined) {
    logError(dataRef, context, ERR_UNKNOWN_PROPERTY, dataRef.key);
  }

  callback(null);
};

/*
 * Exports.
 */
exports.cloneTraverser = cloneTraverser;
exports.logTraverser = logTraverser;
exports.ignoreProperty = ignoreProperty;
exports.noopTraverser = noopTraverser;
exports.prohibitedPropertyError = prohibitedPropertyError;
exports.returnDataTraverser = returnDataTraverser;
exports.typeMismatchError = typeMismatchError;
exports.typeOfDataTraverser = typeOfDataTraverser;
exports.unknownPropertyError = unknownPropertyError;
