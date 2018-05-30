const test = require('tape');
const {
  ANY,
  ALLOWED_PATTERN,
  TRAVERSER,
  TYPE,
  makeTraverser,
} = require('..');

test('test ALLOWED_PATTERN', t=> {
  t.plan(4);

  const schema = {
    [ANY]: {
      [TYPE]: String,
      [ALLOWED_PATTERN]: /foo/,
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
  };

  traverser(data, { passed: [] }, (err, context) => {
    t.error(err);
    t.equal(context.errors.length, 1);
    t.deepEqual(context.passed, ['foo']);
  });
});
