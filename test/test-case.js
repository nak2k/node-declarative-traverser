const test = require('tape');
const {
  ANY,
  CASE,
  makeTraverser,
} = require('..');

test('test CASE', t=> {
  t.plan(8);

  const schema = {
    [ANY]: {
      [CASE]: async (dataRef, context) => {
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY][CASE]');

        return dataRef.data;
      },

      foo: async (dataRef, context) => {
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY].foo');

        t.equal(dataRef.data, 'foo');
      },

      bar: async (dataRef, context) => {
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY].bar');

        t.equal(dataRef.data, 'bar');
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 'foo',
    bar: 'bar',
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});
