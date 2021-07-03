---
sidebar_position: 5
---

## Using the database

## Choice of database

There are many databases to choose from, depending on the situation.
However, in most cases, to make the most of the TypeScript type feature, we recommend that you use a database that **supports JSON**.
Why is that?

Suppose we have a data table for storing articles (Post in English) with the following type definition.

```ts
export interface Post {
  id: number
  title: string
  content: string
  createUserId: number
  createTime: Date
  // updateUser and updateTime are optional (because they don't exist when first created)
  updateUserId?: number
  updateTime?: Date
}
```

There are 2 fields `updateUserId` and `updateTime`, which are optional. This makes sense, since these two fields are not included when the article is first created. (They are only set when the article is updated)

But such a type definition actually potentially buries a hole in that it does not constrain that `updateUserId` and `updateTime` must **both** appear or not. If you accidentally set only one of them in your code and forget the other, the type is still legal and TypeScript will not prompt any error.
But it is clearly wrong in business, and this is a bug!

> Murphy's Law: What can go wrong must go wrong.

We can totally avoid it at the type definition stage!
This is a typical scenario: **a set of fields either appear at the same time or not **at the same time.
For this scenario, you can wrap the whole set of fields into a subobject and then make the whole optional, e.g.

```ts
export interface Post {
  id: number
  title: string
  content: string
  // To keep the style consistent, create is also handled this way
  create: {
    uid: number
    time: Date
  }
  update?: {
    uid: number
    time: Date
  }
}
```

In this case, `update.uid` and `update.time` either appear at the same time or not at the same time. If only one of them is passed, TypeScript will prompt an error at the compile stage.
Not only do you avoid the aforementioned pitfalls, but you will also find that the code seems to be more elegant: the previously repeated word `update` now appears only 1 time, and there is less code.

There are many similar examples where you can make clever use of type definitions to make the data structure more rigorous, but this inevitably requires the use of nested JSON structures.
So to make better use of TypeScript's type features, we recommend that you use a database that supports storing JSON structures.

MongoDB is a good choice.

:::note
If you are just developing a local single-process lightweight service, [LowDB](https://github.com/typicode/lowdb) is also a good choice.
:::

## Using MongoDB

Here we take MongoDB as an example.

If you are not familiar with Mongo, you can also take a look at the official [Quick Start](https://docs.mongodb.com/manual/tutorial/getting-started/).

### Installation

MongoDB already provides an official NodeJS client, see the [official documentation](http://mongodb.github.io/node-mongodb-native/) for details on how to use it.
First install it with.

```shell
npm i mongodb
```

Since we are using TypeScript, we also need its type definition.

```shell
npm i @types/mongodb --save-dev
```

Then it's ready to be used in code.

### Configuration and startup

MongoDB's clients are all asynchronous APIs and it automatically maintains a connection pool, so you only need to create a shared `Db` instance globally.
For easy management of global instances, you can wrap them together in a single package, e.g.

```ts
import { Db, MongoClient } from 'mongodb'

export class Global {
  static db: Db

  static async initDb() {
    const uri =
      'mongodb://username:password@xxx.com:27017/test?authSource=admin'
    const client = await new MongoClient(uri).connect()
    this.db = client.db()
  }
}
```

:::tip
You can put the connection configuration in a configuration file or in environment variables.
:::

You need to connect to the database before the service starts, so modify the startup process in ``index.ts`'' as follows

```ts title="index.ts"
async function main() {
  // Auto implement APIs
  await server.autoImplementApi(path.resolve(__dirname, 'api'))

  // Connect to the database before starting the service
  await Global.initDb()

  await server.start()
}
```

Then, you can call MongoDB in your interface using ``Global.db`'', for example

```ts
export async function ApiGetPost(call: ApiCall<ReqGetPost, ResGetPost>) {
  let op = await Global.db.collection<Post>('Post').findOne({
    _id: new ObjectID(call.req._id),
  })
  // ...
}
```

:::tip
Usually you don't need to manually go and close the connection, keeping a long connection to the database will make your interface more responsive.
:::

### Table name and structure mapping

As you saw in the example above, we can tell TypeScript the table structure type by writing something like `db.collection<type name>('table name')`.
But again, you've laid a small hole for yourself.

> Murphy's Law: What can go wrong must go wrong.

What if the table name is misspelled? What if the type name is associated with the wrong type? These are common occurrences.

Again, you can take advantage of TypeScript's type system to get around these problems right from the start.
First, define an `interface` that shows all table names and their types.

```ts
export interface DbCollectionType {
  // table name: type name
  Post: DbPost
  User: DbUser
  Comment: DbComment
}
```

Then, implement a `.collection` method on your own to automatically associate table names and type names using TS's generics.

```ts
import { Collection, Db, MongoClient } from "mongodb";

export class Global {

    static db: Db;
    static async initDb() { ... }

    static collection<T extends keyof DbCollectionType>(col: T): Collection<DbCollectionType[T]> {
        return this.db.collection(col);
    }
}
```

Now you can use `Global.collection` instead of `Global.db.collection`, with automatic code hinting and type constraints.

! [](assets/global-collection.gif)

### Handling ObjectIDs

MongoDB automatically creates a `_id` field for all records, of type `ObjectID`, which is referenced from the `mongodb` NPM package.
So the `ObjectID` type is not available to the front-end, and needs to be converted to a string when communicating with the front-end: ``ts

```ts
import { ObjectID } from 'mongodb'

let _id = new ObjectID('60d9f7d32b285522785b3cb5')
let str = _id.toHexString()
```

Therefore, you should not use `ObjectID` for all type definitions and files in the `shared` directory. Because they are to be shared across projects, the front end may not have `mongodb` installed.
But your database table structure definition needs `_id: ObjectID`, and the front-end needs to use the table structure type, so declaring two copies is obviously burying the hole again. (Type redundancy)

TSRPC provides a tool type `Overwrite` to solve this problem.

#### 1. Define common types for the front and back ends in the shared directory

To ensure cross-project availability, `_id` is set to `string`.

```ts title="shared/protocols/models/Post.ts"
export interface Post {
  _id: string
  title: string
  content: string
}
```

#### 2. Rewriting the actual database storage structure on the backend using Overwrite

To avoid name confusion, we name the database table structure definition for `Post` as `DbPost`.

```ts title="backend/src/models/dbItems/DbPost.ts
import { ObjectID } from 'mongodb'
import { Overwrite } from 'tsrpc'
import { Post } from '... /... /shared/protocols/models/Post'

// { _id: ObjectID, title: string, content: string }
export type DbPost = Overwrite<
  Post,
  {
    _id: ObjectID
  }
>
```

In this way, you can minimize type redundancy and use `Overwrite` to do a small amount of field rewriting for individual scenarios on the back end.

### Please note the pitfalls

TypeScript works in strict mode by default, and there is a difference between `null` and `undefined`.

But MongoDB has a pitfall here, for example if you.

```ts
db.collection('Test').insertOne({
  value: undefined,
})
```

Or.

```ts
db.collection('Test').updateOne(
  { _id: 'xxx' },
  {
    $set: {
      value: undefined,
    },
  }
)
```

The above operation, in MongoDB, will only make `value` `null`, not `undefined`.
The next time you get the data back, you'll find that `value` becomes `null`.

By default, TSRPC's automatic type detection, like TypeScript's strict mode, distinguishes between `null` and `undefined`, which causes the response to not be returned properly.
There are two solutions.

#### 1. Avoid the above usage

TSRPC does not encode undefined, i.e. if you send `{ value: undefined }` from the client, the server receives `{}`.
Remember that setting a field to `undefined` in MongoDB's `update` should be done with `$unset: { field name: 1 }`, not `$set: { field name: undefined }`.

#### 2. Make TSRPC non-strictly checksum `null` and `undefined`

That is, make TSRPC treat `null` and `undefined` as identical, consistent with how `strictNullChecks: false` behaves in `tsconfig`.
This is easiest to do as long as your business does not treat `null` and `undefined` strictly differently.

## Reducing type redundancy

A common scenario for CRUD interfaces is to allow only a limited number of fields to be sent by the client for data table structures, with the rest of the fields maintained by the client.
Using the TypeScript tool types `Pick`, `Omit`, `Partial`, you can also define them with minimal redundancy, e.g.

```ts
export interface ReqAddPost {
  // Remove the specified 4 fields from the Post
  newPost: Omit<Post, '_id' | 'create' | 'update' | 'visitedNum'>
}
```

```ts
export interface ReqUpdatePost {
  // { _id: string, title?: string, content?: string }
  update: { _id: string } & Partial<Pick<Post, 'title' | 'content'>>
}
```

:::tip
Even if the client sends additional fields outside the protocol, the TSRPC type system will automatically reject them, ensuring strict type and field security.
:::

## Full example of CRUD

See: https://github.com/k8w/tsrpc-examples/tree/main/examples/mongodb-crud
