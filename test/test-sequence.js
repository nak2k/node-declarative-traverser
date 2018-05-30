const test = require('tape');
const {
  ANY,
  BEGIN,
  CLONE,
  ELEMENT,
  END,
  RETURN_DATA,
  TYPE,
  makeTraverser,
} = require('..');

test('test sequence', t=> {
  t.plan(3);

  const schema = {
    [ANY]: [
      async (dataRef, context) => dataRef.data * 2,
      async (dataRef, context) => dataRef.data * 2,
    ],
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 1,
    bar: 2,
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
    t.deepEqual(data, {
      foo: 4,
      bar: 8,
    });
  });
});
