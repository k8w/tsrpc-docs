---
sidebar_position: 1
---

# 支持的类型清单

## 基础类型

### Boolean Type
```ts
type A = boolean;
```

### Number Type
#### 内置的数字类型
```ts
type A = number;  // 64位，编码为 double
type B = bigint;  // 编码为 Buffer，任意长度
```

#### 额外的标量类型

TSRPC 还提供了一些额外的数字类型，在编译时刻，它们和 `number` / `bigint` 等效。
但在运行时刻，会额外检查它们是否为整数及有符号，同时会使用更有效率的编码算法。
只需要从 'tsrpc-proto' 引用即可。

```ts
import { int, uint , bigint64, biguint64 } from 'tsrpc-proto';

type A = int;  // 编码为 Varint（ZigZag）
type B = uint;    // 编码为 Varint
type C = bigint64;    // 编码为 64位 int
type D = biguint64;   // 编码为 64位 uint
```

:::note
`tsrpc-proto` 是所有 TSRPC 服务端和客户端库的公共依赖，所以不需要额外安装。
:::

### String Type
```ts
type A = string;
```

:::note
TypeScript 4.3 新增的 [字符串模板](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html#template-string-type-improvements) 特性将在未来支持。
:::

### ArrayBuffer Type
ArrayBuffer 和所有 TypedArray
```ts
type A = ArrayBuffer;
type B = Uint8Array;
type C = Int32Array;
// 所有 TypedArray，就不一一列举了
```

### Enum Type
```ts
enum MyEnum {
    Option1,
    Option2,
    Option3 = 'XXXXX'
}
type A = MyEnum;
```

:::tip
你可以放心的将字符串设为枚举值。因为一些奇淫巧技的存在，无论你的字符串设置的多长，都不会影响编码大小（通常就是 1 bit）。
:::

### Literal Type
```ts
type A = 'AAA' | 'BBB' | 'CCC';
type B = 1 | 2;
type C = true | null | undefined;
```

:::tip
跟 `enum` 一样，静态文本类型你无论设置的多大多长，都不会影响编码大小（通常就是 1 bit），这绝对可以显著减小包体。
:::

### Any Type
```ts
type A = any;
```

### Date Type
即 JavaScript 原生的 `Date`
```ts
type A = Date;
```

## 数组和对象

### Interface Type
支持 `type` 和 `interface` 两种写法：
```ts
type A = {
    a: string,
    b?: number
}

interface B {
    a: string,
    b: number,
    c?: {
        c1: string,
        c2: boolean
    }
}
```

也支持 Index Sigature 的定义：
```ts
interface A {
    a: string,
    b: number,
    [key: string]: string | number
}

type B = {
    [key: number]: { value: string }
}
```

还支持继承：
```ts
interface A {
    a: string;
}

interface B extends A {
    b: string;
}
```

### Array Type

同时支持数组的两种写法：
```ts
type A = string[];
type B = Array<string>;
```

### Tuple Type
```ts
type A = [number, string];
type B = [string, number?, boolean?];
```

## 引用类型
### 类型引用
同文件引用自然不在话下，还支持跨文件引用哦~
```ts title="A.ts"
export type A = { value: string }; 
```

```ts title="B.ts"
import { A } from './A';

type B = A;
```

### 字段引用
```ts
type A = {
    aaa: string,
    bbb: { ccc: number }
}

// 看这里 ↓
type B = A['bbb'];
// 想嵌套也可以
type C = A['bbb']['ccc'];
```

## 逻辑类型

### Union Type
```ts
type A = string | number;
// 可以随意嵌套
type A = { type : 'aaa', aaa: string } | { type: 'bbb', bbb: string }
```

### Intersection Type
```ts
type A = { a: string } & { b: string };
type X = A & B & C;
```

:::tip
`Union Type` 可以和 `Intersection Type` 随意嵌套，例如 `A & ( B | C )`。
:::

## 工具类型

### Non Primitive Type
同 TypeScript 自带的 `NonPrimitive<T>`
```ts
type A = NonPrimitive<B>;
```

### Pick Type
同 TypeScript 自带的 `Pick<T>`
```ts
interface A {
    a: string,
    b: number,
    c: boolean[]
}

// { a: string, b: number }
type B = Pick<A, 'a' | 'b'>
```

### Omit Type
同 TypeScript 自带的 `Omit<T>`
```ts
interface A {
    a: string,
    b: number,
    c: boolean[]
}

// { c: boolean[] }
type B = Omit<A, 'b' | 'c'>
```

### Overwrite Type
这个是 TSBuffer 自行定义的工具类型，用于对 `interface` 的部分改写，例如：
```ts
interface A {
    a: string,
    b: number,
    c: boolean[]
}

// { a: string, b: number, c: number, d: number }
type B = Overwrite<A, {
    c: number,
    d: number
}>
```

## 组合嵌套

以上所有支持的类型，随便拼接、组合、嵌套，全部不在话下，不仅可以检测类型，还能二进制编码哦~

比如：
```ts
type X1 = {
    value?: Array<
        { common: string } & (
            { 
                type: 'A', 
                a: string 
            } | { 
                type: 'B', 
                b: string
            }
        )
    > | null;
};
```

再复杂也可以解析。

## 二进制编码算法

二进制编码不是 `JSON.stringify`，而是效率相当于 ProtoBuf 的真真的二进制编码。

有兴趣可以了解我的另一个独立开源项目 [TSBuffer](https://github.com/k8w/tsbuffer)。