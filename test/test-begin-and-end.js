const test = require('tape');
const {
  ANY,
  BEGIN,
  END,
  makeTraverser,
} = require('..');

test('test sort properties in BEGIN', t=> {
  t.plan(4);

  const schema = {
    [BEGIN]: (dataRef, context, callback) => {
      callback(null, Object.entries(dataRef.data).reduceRight(
        (obj, [key, value]) => (obj[key] = value, obj),
        {}
      ));
    },

    [ANY]: (dataRef, context, callback) => {
      if (context.lastKey === undefined) {
        t.equal(dataRef.key, 'bar');
      } else if (context.lastKey === 'bar') {
        t.equal(dataRef.key, 'foo');
      }

      context.lastKey = dataRef.key;

      callback(null);
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 1,
    bar: 1,
  };

  traverser(data, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});

test('test BEGIN and END', t=> {
  t.plan(9);

  const schema = {
    [BEGIN]: (dataRef, context, callback) => {
      t.equal(dataRef.schemaRef.schemaPath, '$[BEGIN]');
      t.deepEqual(context.propNames, []);
      callback(null);
    },

    [END]: (dataRef, context, callback) => {
      t.equal(dataRef.schemaRef.schemaPath, '$[END]');
      t.deepEqual(context.propNames, ['foo', 'bar']);
      callback(null, 123);
    },

    [ANY]: (dataRef, context, callback) => {
      t.equal(dataRef.schemaRef.schemaPath, '$[ANY]');

      context.propNames.push(dataRef.key);

      callback(null);
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 1,
    bar: 1,
  };

  traverser(data, { propNames: [] }, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
    t.equal(context.result, 123);
  });
});
