const test = require('tape');
const {
  ANY,
  CASE,
  DEFAULT,
  TYPE_OF_DATA,
  makeTraverser,
} = require('..');

test('test TYPE_OF_DATA', t=> {
  t.plan(8);

  const schema = {
    [ANY]: {
      [CASE]: TYPE_OF_DATA,

      string: async (dataRef, context) => {
        t.equal(dataRef.data, 'foo');
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY].string');
      },

      number: async (dataRef, context) => {
        t.equal(dataRef.data, 1);
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY].number');
      },

      [DEFAULT]: async (dataRef, context) => {
        t.equal(dataRef.data, true);
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY][DEFAULT]');
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 'foo',
    bar: 1,
    baz: true,
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});
