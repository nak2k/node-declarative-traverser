const test = require('tape');
const {
  ANY,
  makeTraverser,
} = require('..');

test('test options.schemaMap', t=> {
  t.plan(3);

  const MY_SYMBOL = Symbol();

  const schema = {
    [ANY]: MY_SYMBOL,
  };

  const options = {
    schemaMap: {
      [MY_SYMBOL]: async (dataRef, context) => {
        t.equal(dataRef.data, 'foo');
      },
    },
  };

  const traverser = makeTraverser(schema, options);

  const data = {
    foo: 'foo',
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});
