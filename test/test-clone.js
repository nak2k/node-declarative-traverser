const test = require('tape');
const {
  BEGIN,
  CLONE,
  END,
  TYPE,
  makeTraverser,
} = require('..');

test('test CLONE', t=> {
  t.plan(3);

  const schema = {
    array: {
      [TYPE]: Array,
      [BEGIN]: CLONE,
      [END]: (dataRef, context, callback) => {
        dataRef.data[0] = undefined;

        callback(null);
      },
    },

    object: {
      [TYPE]: Object,
      [BEGIN]: CLONE,
      [END]: (dataRef, context, callback) => {
        dataRef.data.extra = 123;

        callback(null);
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    array: [1, 2, 3],
    object: {
      foo: 1,
      bar: 'bar',
    },
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
    t.deepEqual(data, {
      array: [1, 2, 3],
      object: {
        foo: 1,
        bar: 'bar',
      },
    });
  });
});
