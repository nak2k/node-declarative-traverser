const test = require('tape');
const {
  makeTraverser,
} = require('..');

test('test shorthands', t=> {
  t.plan(2);

  const schema = {
    string: '123',
    number: 123,
    boolean: true,
    regexp: /pattern/,
  };

  const traverser = makeTraverser(schema, {});

  const data = {
    string: '123',
    number: 123,
    boolean: true,
    regexp: '---pattern---',
  };

  traverser(data, {}, (err, context) => {
    t.error(err);
    t.equal(context.errors.length, 0);
  });
});
