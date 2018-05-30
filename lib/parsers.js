const {
  ALLOWED_PATTERN,
  ALLOWED_VALUES,
  CLONE,
  DEBUG,
  DEPRECATED,
  IGNORED,
  INFO,
  ORDER,
  PROHIBITED,
  RETURN_DATA,
  TYPE,
  TYPE_MISMATCH,
  TYPE_OF_DATA,
  UNKNOWN_ERROR,
  WARNING,
} = require('./symbols');
const {
  cloneTraverser,
  ignoreProperty,
  noopTraverser,
  prohibitedPropertyError,
  returnDataTraverser,
  typeMismatchError,
  typeOfDataTraverser,
  unknownPropertyError,
} = require('./traversers');
const { callbackify } = require('callbackify3');
const {
  ERR_SCHEMA_AMBIGUOUS_COMMAND,
  ERR_SCHEMA_NOT_SUPPORTED_TYPE,
  ERR_SCHEMA_UNDEFINED,
  ERR_SCHEMA_UNKNOWN_SYMBOL,
  ERR_SCHEMA_TYPE_MISMATCH,
  ERR_TYPE_MISMATCH,
} = require('./errors');
const {
  compose,
} = require('./util');

const DEFAULT_COMMAND_MAP = {};

const DEFAULT_SCHEMA_MAP = {
  [CLONE]: cloneTraverser,
  [DEBUG]: noopTraverser,
  [DEPRECATED]: noopTraverser,
  [IGNORED]: ignoreProperty,
  [INFO]: noopTraverser,
  [PROHIBITED]: prohibitedPropertyError,
  [RETURN_DATA]: returnDataTraverser,
  [TYPE_MISMATCH]: typeMismatchError,
  [TYPE_OF_DATA]: typeOfDataTraverser,
  [UNKNOWN_ERROR]: unknownPropertyError,
  [WARNING]: noopTraverser,
};

function parseSchema(schemaRef, options) {
  return parseSchemaNode(schemaRef, {
    ...options,
    commandMap: {
      ...DEFAULT_COMMAND_MAP,
      ...(options.commandMap || {}),
    },
    schemaMap: {
      ...DEFAULT_SCHEMA_MAP,
      ...(options.schemaMap || {}),
    },
  });
}

function parseSchemaNode(schemaRef, options) {
  const { schema } = schemaRef;

  switch (typeof schema) {
    case 'function':
      if (schema === String || schema === Number || schema === Boolean) {
        schemaRef = {
          schemaPath: schemaRef.schemaPath,
          schema: {
            [TYPE]: schema,
          },
        };

        return dispatchCommand(schemaRef, options);
      }

      return callbackify(schema);

    case 'object':
      if (Array.isArray(schema)) {
        return runSequence(schemaRef, options);
      }

      if (schema instanceof RegExp) {        
        schemaRef = {
          schemaPath: schemaRef.schemaPath,
          schema: {
            [TYPE]: String,
            [ALLOWED_PATTERN]: schema,
          },
        };
      }

      return dispatchCommand(schemaRef, options);

    case 'symbol': {
      const symbolSchema = options.schemaMap[schema];

      if (symbolSchema === undefined) {
        throw ERR_SCHEMA_UNKNOWN_SYMBOL(schema, schemaRef.schemaPath);
      }

      return parseSchemaNode({
        schemaPath: `schemaMap[${schema.toString()}]`,
        schema: symbolSchema,
      }, options);
    }

    case 'number':
      return dispatchCommand({
        schemaPath: schemaRef.schemaPath,
        schema: {
          [TYPE]: Number,
          [ALLOWED_VALUES]: schema,
        },
      }, options);
      break;

    case 'string':
      return dispatchCommand({
        schemaPath: schemaRef.schemaPath,
        schema: {
          [TYPE]: String,
          [ALLOWED_VALUES]: schema,
        },
      }, options);

    case 'boolean':
      return dispatchCommand({
        schemaPath: schemaRef.schemaPath,
        schema: {
          [TYPE]: Boolean,
          [ALLOWED_VALUES]: schema,
        },
      }, options);
      break;

    case 'undefined':
      throw ERR_SCHEMA_UNDEFINED(schemaRef.schemaPath);
  }
}

function dispatchCommand(schemaRef, options) {
  const { commandMap } = options;

  const { schema } = schemaRef;

  const commandKeys = Object.getOwnPropertySymbols(commandMap);

  const commandKeysOnSchema = commandKeys.filter(key => schema[key] !== undefined);

  if (commandKeysOnSchema.length > 1) {
    throw ERR_SCHEMA_AMBIGUOUS_COMMAND(schemaRef.schemaPath);
  }

  const [ commandKey = TYPE ] = commandKeysOnSchema;

  const command = commandMap[commandKey];

  return command(schemaRef, options);
}

function _registerDefaultCommandMap(map) {
  Object.assign(DEFAULT_COMMAND_MAP, map);
}

function runSequence(schemaRef, options) {
  const {
    schemaPath,
    schema,
  } = schemaRef;

  const enhancers = schema.map((elementSchema, index) => {
    const elementSchemaRef = {
      schemaPath: `${schemaPath}[${index}]`,
      schema: elementSchema,
    };

    const elementTraverser = parseSchemaNode(elementSchemaRef, options);

    return next => (dataRef, context, callback) => {
      const elementDataRef = {
        key: dataRef.key,
        path: dataRef.path,
        data: dataRef.data,
        schemaRef: elementSchemaRef,
      };

      elementTraverser(elementDataRef, context, (err, data) => {
        if (err) {
          return callback(err);
        }

        if (data !== undefined) {
          dataRef = {
            key: dataRef.key,
            path: dataRef.path,
            data: data,
            schemaRef: dataRef.schemaRef,
          };
        }

        next(dataRef, context, callback);
      });
    };
  });

  return compose(...enhancers)(returnDataTraverser);
}

/*
 * Exports.
 */
exports._registerDefaultCommandMap = _registerDefaultCommandMap;
exports.parseSchema = parseSchema;
exports.parseSchemaNode = parseSchemaNode;
