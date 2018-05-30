const test = require('tape');
const {
  ANY,
  ALLOWED_VALUES,
  TRAVERSER,
  TYPE,
  makeTraverser,
} = require('..');

test('test ALLOWED_VALUES', t=> {
  t.plan(5);

  const schema = {
    [ANY]: {
      [TYPE]: String,
      [ALLOWED_VALUES]: ['foo', 'bar'],
      [TRAVERSER]: (dataRef, context, callback) => {
        t.equal(dataRef.schemaRef.schemaPath, '$[ANY][TRAVERSER]');
        
        context.passed.push(dataRef.data);

        callback(null);
      },
    },
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    foo: 'foo',
    bar: 'bar',
    x: 'x',
    y: 'y',
  };

  traverser(data, { passed: [] }, (err, context) => {
    t.error(err);
    t.equal(context.errors.length, 2);
    t.deepEqual(context.passed, ['foo', 'bar']);
  });
});
