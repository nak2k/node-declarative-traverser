# declarative-traverser

Traverse data declaratively.

## Installation

```
npm i declarative-traverser -S
```

## Usage

``` javascript
const {
  TRAVERSER,
  TYPE,
  makeTraverser,
} = require('declarative-traverser');

const schema = {
  foo: {
    bar: {
      baz: {
        [TYPE]: String,
        [TRAEVERSER]: async (dataRef, context) => {
          context.baz = dataRef.data;
        },
      },
    },
  },
};

const traverser = makeTraverser(schema);

const data = {
  foo: {
    bar: {
      baz: 'Hello.',
    },
  },
};

traverser(data, (err, context) => {
  if (err) {
    throw err;
  }

  console.log(context.baz);
});
```

## License

MIT
