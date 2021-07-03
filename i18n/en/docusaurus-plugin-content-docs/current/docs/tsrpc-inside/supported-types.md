---
sidebar_position: 1
---

# List of supported types

## Basic types

### Boolean Type

```ts
type A = boolean
```

### Number Type

#### Built-in number type

```ts
type A = number // 64-bit, encoded as double
type B = bigint // encoded as Buffer, arbitrary length
```

#### Additional scalar types

TSRPC also provides some additional numeric types that are equivalent to `number` / `bigint` at compile time.
But at runtime, they are additionally checked for integers and signed, and a more efficient encoding algorithm is used.
Just refer to it from 'tsrpc-proto'.

```ts
import { int, uint, bigint64, biguint64 } from 'tsrpc-proto'

type A = int // encoded as Varint (ZigZag)
type B = uint // encoded as Varint
type C = bigint64 // encoded as 64-bit int
type D = biguint64 // encoded as 64-bit uint
```

:::note
`tsrpc-proto` is a public dependency for all TSRPC server and client libraries, so no additional installation is needed.
:::

### String Type

```ts
type A = string
```

:::note
The new [string template](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html#template-string-type-) feature in TypeScript 4.3 will be supported in the future. improvements) feature will be supported in the future.
:::

### ArrayBuffer Type

ArrayBuffer and all TypedArray

```ts
type A = ArrayBuffer
type B = Uint8Array
type C = Int32Array
// all TypedArray, not to be enumerated
```

### Enum Type

```ts
enum MyEnum {
  Option1,
  Option2,
  Option3 = 'XXXXXX',
}
type A = MyEnum
```

:::tip
You can safely set strings to enum values. Because of some nifty trick, no matter how long your string is set, it won't affect the encoding size (which is usually 1 bit).
:::

### Literal Type

```ts
type A = 'AAA' | 'BBB' | 'CCC'
type B = 1 | 2
type C = true | null | undefined
```

:::tip
Like `enum`, static text types do not affect the encoding size (usually 1 bit) no matter how large or long you set them, which can definitely reduce the package size significantly.
:::

### Any Type

```ts
type A = any
```

### Date Type

i.e. JavaScript's native `Date`

```ts
type A = Date
```

## Arrays and objects

### Interface Type

Both `` type`'' and  ``interface`' are supported.

```ts
type A = {
  a: string
  b?: number
}

interface B {
  a: string
  b: number
  c?: {
    c1: string
    c2: boolean
  }
}
```

Also supports the definition of Index Sigature.

```ts
interface A {
  a: string
  b: number
  [key: string]: string | number
}

type B = {
  [key: number]: { value: string }
}
```

Inheritance is also supported.

```ts
interface A {
  a: string
}

interface B extends A {
  b: string
}
```

### Array Type

Both ways of writing arrays are supported.

```ts
type A = string[]
type B = Array<string>
```

### Tuple Type

```ts
type A = [number, string]
type B = [string, number?, boolean?]
```

## Reference types

### Type references

The same file reference naturally does not matter, but also supports cross-file references ~

```ts title="A.ts"
export type A = { value: string }
```

```ts title="B.ts"
import { A } from '. /A'

type B = A
```

### field references

```ts
type A = {
  aaa: string
  bbb: { ccc: number }
}

// see here ↓
type B = A['bbb']
// You can nest them if you want
type C = A['bbb']['ccc']
```

## Logical types

### Union Type

```ts
type A = string | number
// can be nested at will
type A = { type: 'aaa'; aaa: string } | { type: 'bbb'; bbb: string }
```

### Intersection Type

```ts
type A = { a: string } & { b: string }
type X = A & B & C
```

:::tip
`Union Type` can be arbitrarily nested with `Intersection Type`, e.g. `A & ( B | C )`.
:::

## Tool types

### Non Primitive Type

Same as TypeScript's own ``NonPrimitive<T>`

```ts
type A = NonPrimitive<B>
```

### Pick Type

Same as `Pick<T>` that comes with TypeScript

```ts
interface A {
  a: string
  b: number
  c: boolean[]
}

// { a: string, b: number }
type B = Pick<A, 'a' | 'b'>
```

### Omit Type

Same as TypeScript's own ``Omit<T>`

```ts
interface A {
  a: string
  b: number
  c: boolean[]
}

// { c: boolean[] }
type B = Omit<A, 'b' | 'c'>
```

### Overwrite Type

This is a tool type defined by TSBuffer itself for rewriting parts of `interface`, and needs to be introduced from `tsrpc-proto`, e.g.

```ts
import { overwrite } from 'tsrpc-proto'

interface A {
  a: string
  b: number
  c: boolean[]
}

// { a: string, b: number, c: number, d: number }
type B = Overwrite<
  A,
  {
    c: number
    d: number
  }
>
```

## Combining and nesting

All of the above supported types can be spliced, combined, nested, and all of them are not in the picture, not only can you detect the type, but you can also binary code it.

For example.

```ts
type X1 = {
  value?: Array<
    { common: string } & (
      | {
          type: 'A'
          a: string
        }
      | {
          type: 'B'
          b: string
        }
    )
  > | null
}
```

More complex can be parsed.

## Binary encoding algorithm

The binary encoding is not `JSON.stringify`, but a true binary encoding with efficiency equivalent to ProtoBuf.

Interested to know about my another independent open source project [TSBuffer](https://github.com/k8w/tsbuffer).
