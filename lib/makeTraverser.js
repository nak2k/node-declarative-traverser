const {
  _registerDefaultCommandMap,
  parseSchema,
} = require('./parsers');

_registerDefaultCommandMap(require('./commands'));

const makeTraverser = (schema, options = {}) => {
  const rootSchemaRef = {
    schemaPath: '$',
    schema,
  };

  const rootTraverser = parseSchema(rootSchemaRef, options);

  return (data, context, callback) => {
    if (callback === undefined) {
      [context, callback] = [{}, context];
    }

    if (!context.errors) {
      context.errors = [];
    }

    const rootDataRef = {
      key: '$',
      path: '$',
      data,
      schemaRef: rootSchemaRef,
    };

    rootTraverser(rootDataRef, context, (err, data) => {
      if (err) {
        return callback(err, null);
      }

      context.result = data;

      callback(null, context);
    });
  };
};

/*
 * Exports.
 */
exports.makeTraverser = makeTraverser;
