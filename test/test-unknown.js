const test = require('tape');
const {
  ANY,
  UNKNOWN_ERROR,
  makeTraverser,
} = require('..');

test('test UNKNOWN_ERROR', t => {
  t.plan(4);

  const schema = {
    [ANY]: UNKNOWN_ERROR,
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: {
    },
    bar: 1,
    baz: 2,
  };

  traverser(data, (err, context) => {
    t.error(err);

    context.errors.forEach(err => t.equal(err.code, 'ERR_UNKNOWN_PROPERTY'));
  });
});
