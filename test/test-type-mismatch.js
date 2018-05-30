const test = require('tape');
const {
  ANY,
  CASE,
  DEFAULT,
  TYPE_MISMATCH,
  TYPE_OF_DATA,
  makeTraverser,
} = require('..');

test('test TYPE_MISMATCH', t=> {
  t.plan(7);

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

      [DEFAULT]: TYPE_MISMATCH,
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
    t.equal(context.errors.length, 1);
    t.equal(context.errors[0].code, 'ERR_TYPE_MISMATCH');
  });
});
