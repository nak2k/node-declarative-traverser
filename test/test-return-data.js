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

test('test RETURN_DATA', t=> {
  t.plan(3);

  const schema = {
    array: {
      [TYPE]: Array,
      [BEGIN]: CLONE,
      [ELEMENT]: (dataRef, context, callback) => {
        callback(null, dataRef.data * 2);
      },
      [END]: RETURN_DATA,
    },

    object: {
      [TYPE]: Object,
      [BEGIN]: CLONE,
      [ANY]:(dataRef, context, callback) => {
        callback(null, dataRef.data * 2);
      },
      [END]: RETURN_DATA,
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    array: [1, 2, 3],
    object: {
      foo: 1,
      bar: 2,
    },
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
    t.deepEqual(data, {
      array: [2, 4, 6],
      object: {
        foo: 2,
        bar: 4,
      },
    });
  });
});
