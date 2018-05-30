const test = require('tape');
const {
  ANY,
  makeTraverser,
} = require('..');

test('test options.commanMap', t=> {
  t.plan(4);

  const MY_COMMAND = Symbol();

  const schema = {
    [ANY]: {
      [MY_COMMAND]: true,
      param1: 123,
    },
  };

  const options = {
    commandMap: {
      [MY_COMMAND](schemaRef, options) {
        t.deepEqual(schemaRef, {
          schemaPath: '$[ANY]',
          schema: {
            [MY_COMMAND]: true,
            param1: 123,
          },
        });

        return (dataRef, context, callback) => {
          t.equal(dataRef.data, 'foo');

          callback(null);
        };
      },
    },
  };

  const traverser = makeTraverser(schema, options);

  const data = {
    foo: 'foo',
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.deepEqual(context.errors, []);
  });
});
