# declarative-traverser

宣言的なデータトラバース。

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

指定した Schema から Travaser を作成する。

- `schema`
  - トラバースするデータの構造を定義した Object.
- `options.commandMap`
  - 追加で定義する Command を定義した Object.
  - Object のキーは Command を識別するための Symbol でなければならない。
  - Object の値は 引数 `(schemaRef, options)` を持つ関数でなければならない。
- `options.schemaMap`

この関数は以下の関数を返す。

``` javascript
traverser(data, [context, ]callback)
```

- `data`
  - トラバースする Object.
- `context`
  - データをトラバースしている間に Traverser 間で共有される Object.
  - この引数を省略した場合、デフォルト値として `{}` が渡される。
- `callback(err, context)`
  - トラバースが完了した時、またはエラーが発生した時に呼ばれる関数。

## Concepts

### Schema

トラバースするデータの構造を定義した Object.

### Command

Schema 上で特定の処理を行うために Symbol でコマンドを指定する。

コマンドの実体は関数 `command(schemaRef, options)` として定義される。

### Traverser

データをトラバースする関数。

Schema を元に生成される関数 `traverser(data, [context, ]callback)` として定義される。

### DataRef

トラバース対象のデータへの参照を示す Object.

以下のプロパティを持つ。

- `key`
  - トラバース対象のデータが親となるデータから参照される際のキー。
  - 親データが Object であればプロパティ名、 Array であればインデックス。
- `path`
  - トラバース対象のデータを root から辿る時のパス。
- `data`
  - トラバース対象のデータ。

### Context

データをトラバースしている間に Traverser 間で共有される Object.

トラバース中に必要な任意のデータを保持することができる。

### SchemaRef

Schema への参照を示す Object.

以下のプロパティを持つ。

- `schemaPath`
- `schema`

## Commands

### TYPE

データの型を指定する。

以下の値を指定できる。

- `Object`
  - データが Object であることを指定する。
- `String`
  - データが文字列であることを指定する。
- `Number`
  - データが数値であることを指定する。
- `Boolean`
  - データが真偽値であることを指定する。
- `Array`
  - データが配列であることを指定する。
- `ANY`
  - データが任意の値で良いことを指定する。

上記以外の場合、 Traverser 生成時にエラー `ERR_SCHEMA_NOT_SUPPORTED_TYPE` が発生する。

### CASE

## License

MIT
