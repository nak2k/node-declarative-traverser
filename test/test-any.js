const test = require('tape');
const {
  ANY,
  IGNORED,
  TYPE,
  makeTraverser,
} = require('..');

test('test ANY', t => {
  t.plan(12);

  const schema = {
    [ANY]: (dataRef, context, callback) => {
      t.equal(dataRef.key, 'bar');
      t.equal(dataRef.path, '$.bar');
      t.equal(dataRef.data, 1);
      t.equal(dataRef.schemaRef.schemaPath, '$[ANY]');

      callback(null, dataRef.data * 2);
    },

    foo: (dataRef, context, callback) => {
      t.equal(dataRef.key, 'foo');
      t.equal(dataRef.path, '$.foo');
      t.deepEqual(dataRef.data, { x: 1 });
      t.equal(dataRef.schemaRef.schemaPath, '$.foo');

      callback(null, true);
    },

    baz: IGNORED,
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: {
      x: 1,
    },
    bar: 1,
    baz: 2,
  };

  traverser(data, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
    t.equal(data.foo, true);
    t.equal(data.bar, 2);
  });
});
