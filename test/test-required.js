const test = require('tape');
const {
  REQUIRED,
  makeTraverser,
} = require('..');

test('test REQUIRED', t=> {
  t.plan(2);

  const schema = {
    requiredProperty: {
      [REQUIRED]: true,
    },

    optionalProperty: {
      [REQUIRED]: false,
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    requiredProperty: {},
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});
