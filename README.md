# declarative-traverser

Traverse data declaratively.

## Installation

```
npm i declarative-traverser
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
        [TRAVERSER]: async (dataRef, context) => {
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

## API

### makeTraverser(schema, options = {})

Make a traverser from the specified schema.

- `schema`
  - An object that defines a structure of data to be traversed.
- `options.commandMap`
  - An object that defines additional commands.
  - A key of this object must be a symbol to identify a command.
  - A value of this object must be a function that has arguments `(schemaRef, options)`.
- `options.schemaMap`

This function returns the following function:

``` javascript
traverser(data, [context, ]callback)
```

- `data`
  - An object to be traversed.
- `context`
  - An object that is shared in traversers while data are being traversed.
  - If this argument is omitted, the default value is `{}`.
- `callback(err, context)`
  - A function that is called when traversing is completed or an error occurs.

## Concepts

### Schema

### Command

### Traverser

### DataRef

### Context

### SchemaRef

## Commands

### TYPE

### CASE

## License

MIT
