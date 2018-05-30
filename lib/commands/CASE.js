const {
  CASE,
  DEFAULT,
  REQUIRED,
} = require('../symbols');
const {
  parseSchemaNode,
} = require('../parsers');
const {
  noopTraverser,
} = require('../traversers');

function commandCase(schemaRef, options) {
  const {
    schemaPath,
    schema,
  } = schemaRef;

  const caseSchemaRef = {
    schemaPath: `${schemaPath}[CASE]`,
    schema: schema[CASE],
  };

  const caseTraverser = parseSchemaNode(caseSchemaRef, options);

  const defaultSchemaRef = {
    schemaPath: `${schemaPath}[DEFAULT]`,
    schema: schema[DEFAULT] || noopTraverser,
  };

  const defaultTraverser = parseSchemaNode(defaultSchemaRef, options);

  const schemaRefMap = Object.entries(schema).reduce(
    (map, [key, keySchema]) => {
      map[key] = {
        schemaPath: `${schemaPath}.${key}`,
        schema: keySchema,
      };

      return map;
    },
    {}
  );

  const traverserMap = Object.entries(schemaRefMap).reduce(
    (map, [key, schemaRef]) => {
      map[key] = parseSchemaNode(schemaRef, options);

      return map;
    },
    {}
  );

  const required = schema[REQUIRED];

  return (dataRef, context, callback) => {
    if (required === false && dataRef.data === undefined) {
      return callback(null);
    }

    const caseDataRef = {
      key: dataRef.key,
      path: dataRef.path,
      data: dataRef.data,
      schemaRef: caseSchemaRef,
    };

    caseTraverser(caseDataRef, context, (err, key) => {
      if (err) {
        return callback(err);
      }

      const traverser = traverserMap[key];

      if (traverser === undefined) {
        const defaultDataRef = {
          key: dataRef.key,
          path: dataRef.path,
          data: dataRef.data,
          schemaRef: defaultSchemaRef,
        };

        return defaultTraverser(defaultDataRef, context, callback);
      }

      const schemaRef = schemaRefMap[key];

      const traverserDataRef = {
        key: dataRef.key,
        path: dataRef.path,
        data: dataRef.data,
        schemaRef,
      };

      traverser(traverserDataRef, context, callback);
    });
  };
}

/*
 * Exports.
 */
exports[CASE] = commandCase;
