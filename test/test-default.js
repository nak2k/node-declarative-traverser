const test = require('tape');
const {
  DEFAULT,
  TRAVERSER,
  makeTraverser,
} = require('..');

test('test DEFAULT', t=> {
  t.plan(6);

  const schema = {
    foo: {
      [DEFAULT]: {
        bar: 1,
      },

      [TRAVERSER]: async (dataRef, context) => {
        t.equal(dataRef.schemaRef.schemaPath, '$.foo[TRAVERSER]');
        t.deepEqual(dataRef.data, { bar: 1 });
      },
    },

    foo2: {
      [DEFAULT]: {
        bar: 1,
      },

      [TRAVERSER]: async (dataRef, context) => {
        t.equal(dataRef.schemaRef.schemaPath, '$.foo2[TRAVERSER]');
        t.deepEqual(dataRef.data, { baz: 2 });
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo2: {
      baz: 2,
    },
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});
