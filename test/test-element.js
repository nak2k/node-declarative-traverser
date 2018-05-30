const test = require('tape');
const {
  ELEMENT,
  TYPE,
  makeTraverser,
} = require('..');

test('test ELEMENT', t=> {
  t.plan(5);

  const schema = {
    foo: {
      [TYPE]: Array,
      [ELEMENT]: (dataRef, context, callback) => {
        t.equal(dataRef.schemaRef.schemaPath, '$.foo[ELEMENT]');

        context.elements.push(dataRef.data);

        callback(null);
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: [1, 2, 3],
  };

  traverser(data, { elements: [] }, (err, context) => {
    t.error(err);
    t.deepEqual(context, {
      elements: [1, 2, 3],
      errors: [],
      result: undefined,
    });
  });
});
