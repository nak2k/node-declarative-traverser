const test = require('tape');
const {
  TRAVERSER,
  TYPE,
  makeTraverser,
} = require('..');

test('test TRAVERSER', t=> {
  t.plan(12);

  const schema = {
    object: {
      [TYPE]: Object,
      [TRAVERSER]: (dataRef, context, callback) => {
        t.deepEqual(dataRef.data, { x: 1, y: 2 });
        t.equal(dataRef.schemaRef.schemaPath, '$.object[TRAVERSER]');

        callback(null);
      },
    },

    string: {
      [TYPE]: String,
      [TRAVERSER]: (dataRef, context, callback) => {
        t.equal(dataRef.data, 'foo');
        t.equal(dataRef.schemaRef.schemaPath, '$.string[TRAVERSER]');

        callback(null);
      },
    },

    number: {
      [TYPE]: Number,
      [TRAVERSER]: (dataRef, context, callback) => {
        t.equal(dataRef.data, 123);
        t.equal(dataRef.schemaRef.schemaPath, '$.number[TRAVERSER]');

        callback(null);
      },
    },

    boolean: {
      [TYPE]: Boolean,
      [TRAVERSER]: (dataRef, context, callback) => {
        t.equal(dataRef.data, true);
        t.equal(dataRef.schemaRef.schemaPath, '$.boolean[TRAVERSER]');

        callback(null);
      },
    },

    array: {
      [TYPE]: Array,
      [TRAVERSER]: (dataRef, context, callback) => {
        t.deepEqual(dataRef.data, [1, 2, 3]);
        t.equal(dataRef.schemaRef.schemaPath, '$.array[TRAVERSER]');

        callback(null);
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    object: {
      x: 1,
      y: 2,
    },
    string: 'foo',
    number: 123,
    boolean: true,
    array: [1, 2, 3],
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.equal(context.errors.length, 0);
  });
});
