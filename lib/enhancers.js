const {
  ALLOWED_VALUES,
  ALLOWED_PATTERN,
  ANY,
  BEGIN,
  DEFAULT,
  ELEMENT,
  END,
  REQUIRED,
  SHORTHAND_ENABLED,
  TRAVERSER,
} = require('./symbols');
const {
  ERR_NOT_ALLOWED_VALUE,
  ERR_NOT_MATCHED_VALUE,
  ERR_REQUIRED,
  ERR_TYPE_MISMATCH,
} = require('./errors');
const {
  logError,
} = require('./context');
const {
  compose,
  identity,
} = require('./util');
const {
  parseSchemaNode,
} = require('./parsers');

const allowedPatternEnhancer = (schemaRef, options) => {
  const allowedPatternSchema = schemaRef.schema[ALLOWED_PATTERN];

  if (allowedPatternSchema === undefined) {
    return identity;
  }

  const allowedPatternSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[ALLOWED_PATTERN]`,
    schema: allowedPatternSchema,
  };

  const allowedPattern = (typeof allowedPatternSchema === 'string')
    ? new RegExp(allowedPatternSchema)
    : allowedPatternSchema;

  return next => (dataRef, context, callback) => {
    if (!allowedPattern.test(dataRef.data)) {
      const allowedPatternDataRef = {
        key: dataRef.key,
        path: dataRef.path,
        data: dataRef.data,
        schemaRef: allowedPatternSchemaRef,
      };

      logError(allowedPatternDataRef, context,
        ERR_NOT_MATCHED_VALUE, dataRef.data, allowedPattern.source);
      return callback(null);
    }

    next(dataRef, context, callback);
  };
};

const allowedValuesEnhancer = (schemaRef, options) => {
  const allowedValuesSchema = schemaRef.schema[ALLOWED_VALUES];

  if (allowedValuesSchema === undefined) {
    return identity;
  }

  const allowedValuesSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[ALLOWED_VALUES]`,
    schema: allowedValuesSchema,
  };

  const allowedValues = Array.prototype.concat(allowedValuesSchema);

  return next => (dataRef, context, callback) => {
    if (!allowedValues.includes(dataRef.data)) {
      const allowedValuesDataRef = {
        key: dataRef.key,
        path: dataRef.path,
        data: dataRef.data,
        schemaRef: allowedValuesSchemaRef,
      };

      logError(allowedValuesDataRef, context, ERR_NOT_ALLOWED_VALUE, dataRef.data);
      return callback(null);
    }

    next(dataRef, context, callback);
  };
};

const anyEnhancer = (schemaRef, options) => {
  const anySchema = schemaRef.schema[ANY];

  if (anySchema === undefined) {
    return identity;
  }

  const anySchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[ANY]`,
    schema: anySchema,
  };

  const anyTraverser = parseSchemaNode(anySchemaRef, options);

  const propNames = Object.keys(schemaRef.schema);

  return next => (dataRef, context, callback) => {
    const anyKeys = Object.keys(dataRef.data).filter(key => !propNames.includes(key));

    anyKeys.reduceRight((next, key) => () => {
      const keyDataRef = {
        key,
        path: `${dataRef.path}.${key}`,
        data: dataRef.data[key],
        schemaRef: anySchemaRef,
      };

      anyTraverser(keyDataRef, context, (err, data) => {
        if (err) {
          return callback(err);
        }

        if (data !== undefined) {
          dataRef.data[key] = data;
        }

        next();
      });
    }, () => callback(null))();
  };
};

const arrayTestEnhancer = (schemaRef, options) => {
  if (schemaRef.schema[SHORTHAND_ENABLED]) {
    return identity;
  }

  return next => (dataRef, context, callback) => {
    if (!Array.isArray(dataRef.data)) {
      logError(dataRef, context, ERR_TYPE_MISMATCH, 'array');
      return callback(null);
    }

    next(dataRef, context, callback);
  };
};

const beginEnhancer = (schemaRef, options) => {
  const beginSchema = schemaRef.schema[BEGIN];

  if (beginSchema === undefined) {
    return identity;
  }

  const beginSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[BEGIN]`,
    schema: beginSchema,
  };

  const beginTraverser = parseSchemaNode(beginSchemaRef, options);

  return next => (dataRef, context, callback) => {
    const beginDataRef = {
      key: dataRef.key,
      path: dataRef.path,
      data: dataRef.data,
      schemaRef: beginSchemaRef,
    };

    beginTraverser(beginDataRef, context, (err, data) => {
      if (err) {
        return callback(err);
      }

      if (data === undefined) {
        return next(dataRef, context, callback);
      }

      next({
        key: dataRef.key,
        path: dataRef.path,
        data: data,
        schemaRef: dataRef.schemaRef,
      }, context, callback);
    });
  };
};

const defaultEnhancer = (schemaRef, options) => {
  const defaultSchema = schemaRef.schema[DEFAULT];

  if (defaultSchema === undefined) {
    return identity;
  }

  const defaultSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[DEFAULT]`,
    schema: defaultSchema,
  };

  const defaultValue = defaultSchema;

  return next => (dataRef, context, callback) => {
    next({
      key: dataRef.key,
      path: dataRef.path,
      data: dataRef.data === undefined ? defaultValue : dataRef.data,
      schemaRef: defaultSchemaRef,
    }, context, callback);
  };
};

const elementEnhancer = (schemaRef, options) => {
  const {
    [ELEMENT]: elementSchema,
    [SHORTHAND_ENABLED]: shorthandEnabled,
  } = schemaRef.schema;

  if (elementSchema === undefined) {
    return identity;
  }

  const elementSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[ELEMENT]`,
    schema: elementSchema,
  };

  const elementTraverser = parseSchemaNode(elementSchemaRef, options);

  return next => (dataRef, context, callback) => {
    const {
      key,
      path,
      data,
    } = dataRef;

    if (shorthandEnabled && !Array.isArray(data)) {
      const elementDataRef = {
        key,
        path,
        data,
        schemaRef: elementSchemaRef,
      };

      elementTraverser(elementDataRef, context, callback);

      return;
    }

    data.reduceRight((next, element, index, array) => () => {
      const elementDataRef = {
        key: index,
        path: `${path}[${index}]`,
        data: element,
        schemaRef: elementSchemaRef,
      };

      elementTraverser(elementDataRef, context, (err, data) => {
        if (err) {
          return callback(err);
        }

        if (data !== undefined) {
          array[index] = data;
        }

        next();
      });
    }, () => callback(null))(null);
  };

};

const endEnhancer = (schemaRef, options) => {
  const endSchema = schemaRef.schema[END];

  if (endSchema === undefined) {
    return identity;
  }

  const endSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[END]`,
    schema: endSchema,
  };

  const endTraverser = parseSchemaNode(endSchemaRef, options);

  return next => (dataRef, context, callback) => {
    next(dataRef, context, err => {
      if (err) {
        return callback(err);
      }

      const endDataRef = {
        key: dataRef.key,
        path: dataRef.path,
        data: dataRef.data,
        schemaRef: endSchemaRef,
      };

      endTraverser(endDataRef, context, callback);
    });
  };
};

const propsEnhancer = (schemaRef, options) => {
  const propEnhancers = Object.entries(schemaRef.schema).map(([propName, propSchema]) => {
    const propSchemaRef = {
      schemaPath: `${schemaRef.schemaPath}.${propName}`,
      schema: propSchema,
    };

    const propTraverser = parseSchemaNode(propSchemaRef, options);

    return next => (dataRef, context, callback) => {
      const keyDataRef = {
        key: propName,
        path: `${dataRef.path}.${propName}`,
        data: dataRef.data[propName],
        schemaRef: propSchemaRef,
      };

      propTraverser(keyDataRef, context, (err, data) => {
        if (err) {
          return callback(err);
        }

        if (data !== undefined) {
          dataRef.data[propName] = data;
        }

        next(dataRef, context, callback);
      });
    };
  });

  return compose(...propEnhancers);
};

const requiredEnhancer = (schemaRef, options) => {
  const requiredSchema = schemaRef.schema[REQUIRED];

  if (requiredSchema === undefined) {
    return identity;
  }

  const required = requiredSchema;

  return next => (dataRef, context, callback) => {
    if (dataRef.data === undefined) {
      if (required) {
        logError(dataRef, context, ERR_REQUIRED);
      }
      return callback(null);
    }

    next(dataRef, context, callback);
  };
};

const traverserEnhancer = (schemaRef, options) => {
  const schema = schemaRef.schema[TRAVERSER];

  if (schema === undefined) {
    return identity;
  }

  const traverserSchemaRef = {
    schemaPath: `${schemaRef.schemaPath}[TRAVERSER]`,
    schema,
  };

  const traverserTraverser = parseSchemaNode(traverserSchemaRef, options);

  return next => (dataRef, context, callback) => {
    const traverserDataRef = {
      key: dataRef.key,
      path: dataRef.path,
      data: dataRef.data,
      schemaRef: traverserSchemaRef,
    };

    traverserTraverser(traverserDataRef, context, err => {
      if (err) {
        return callback(err);
      }

      next(dataRef, context, callback);
    });
  };
};

const typeTestEnhancer = type => next => (dataRef, context, callback) => {
  if (typeof dataRef.data !== type) {
    logError(dataRef, context, ERR_TYPE_MISMATCH, type);
    return callback(null);
  }

  next(dataRef, context, callback);
};

/*
 * Exports.
 */
exports.allowedPatternEnhancer = allowedPatternEnhancer;
exports.allowedValuesEnhancer = allowedValuesEnhancer;
exports.anyEnhancer = anyEnhancer;
exports.arrayTestEnhancer = arrayTestEnhancer;
exports.beginEnhancer = beginEnhancer;
exports.defaultEnhancer = defaultEnhancer;
exports.elementEnhancer = elementEnhancer;
exports.endEnhancer = endEnhancer;
exports.propsEnhancer = propsEnhancer;
exports.requiredEnhancer = requiredEnhancer;
exports.traverserEnhancer = traverserEnhancer;
exports.typeTestEnhancer = typeTestEnhancer;
