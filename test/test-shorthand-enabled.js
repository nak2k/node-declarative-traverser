const test = require('tape');
const {
  ANY,
  ELEMENT,
  SHORTHAND_ENABLED,
  TYPE,
  makeTraverser,
} = require('..');

test('test SHORTHAND_ENABLED', t=> {
  t.plan(2);

  const schema = {
    [ANY]: {
      [TYPE]: Array,
      [SHORTHAND_ENABLED]: true,
      [ELEMENT]: (dataRef, context, callback) => {
        context.elements.push(dataRef.data);

        callback(null);
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 1,
    bar: [2, 3],
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
