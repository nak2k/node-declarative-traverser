const {
  ANY,
  SHORTHAND_ENABLED,
  TYPE,
} = require('../symbols');
const {
  compose,
} = require('../util');
const {
  noopTraverser,
} = require('../traversers');
const {
  allowedPatternEnhancer,
  allowedValuesEnhancer,
  anyEnhancer,
  arrayTestEnhancer,
  beginEnhancer,
  defaultEnhancer,
  elementEnhancer,
  endEnhancer,
  propsEnhancer,
  requiredEnhancer,
  traverserEnhancer,
  typeTestEnhancer,
} = require('../enhancers');

function commandType(schemaRef, options) {
  const {
    schema: {
      [TYPE]: type = Object,
    },
  } = schemaRef;

  let traverser;

  if (type === Object) {
    traverser = commandType_Object(schemaRef, options);
  } else if (type === String) {
    traverser = commandType_String(schemaRef, options);
  } else if (type === Number) {
    traverser = commandType_Number(schemaRef, options);
  } else if (type === Boolean) {
    traverser = commandType_Boolean(schemaRef, options);
  } else if (type === Array) {
    traverser = commandType_Array(schemaRef, options);
  } else if (type === ANY) {
    traverser = commandType_Any(schemaRef, options);
  } else {
    throw ERR_SCHEMA_NOT_SUPPORTED_TYPE(type, schemaRef.schemaPath);
  }

  return compose(
    defaultEnhancer(schemaRef, options),
    requiredEnhancer(schemaRef, options),
    beginEnhancer(schemaRef, options),
    endEnhancer(schemaRef, options)
  )(traverser);
}

function commandType_Object(schemaRef, options) {
  return compose(
    typeTestEnhancer('object'),
    propsEnhancer(schemaRef, options),
    anyEnhancer(schemaRef, options),
    traverserEnhancer(schemaRef, options)
  )(noopTraverser);
}

function commandType_Array(schemaRef, options) {
  return compose(
    arrayTestEnhancer(schemaRef, options),
    elementEnhancer(schemaRef, options),
    traverserEnhancer(schemaRef, options)
  )(noopTraverser);
}

function commandType_Number(schemaRef, options) {
  return compose(
    typeTestEnhancer('number'),
    allowedValuesEnhancer(schemaRef, options),
    traverserEnhancer(schemaRef, options)
  )(noopTraverser);
}

function commandType_String(schemaRef, options) {
  return compose(
    typeTestEnhancer('string'),
    allowedPatternEnhancer(schemaRef, options),
    allowedValuesEnhancer(schemaRef, options),
    traverserEnhancer(schemaRef, options)
  )(noopTraverser);
}

function commandType_Boolean(schemaRef, options) {
  return compose(
    typeTestEnhancer('boolean'),
    allowedValuesEnhancer(schemaRef, options),
    traverserEnhancer(schemaRef, options)
  )(noopTraverser);
}

function commandType_Any(schemaRef, options) {
  return compose(
    allowedValuesEnhancer(schemaRef, options),
    traverserEnhancer(schemaRef, options)
  )(noopTraverser);
}

/*
 * Exports.
 */
exports[TYPE] = commandType;
