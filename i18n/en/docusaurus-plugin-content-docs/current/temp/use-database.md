---
sidebar_position: 4
---

- Engineering Suggestions
  - Start-up process
  - Environment and configuration
  - Code structure

## Using the database

# # Choose the right database

There are many suitable databases you can choose from, common ones such as

- [MongoDB](https://mongodb.com): pure API call, no need to learn SQL, good combination with TypeScript.
- MySQL](https://mysql.com): classic old school SQL database.
- Redis](https://redis.io): In-memory data storage, suitable for caching and other scenarios.

Compared to SQL databases, we recommend NoSQL databases like MongoDB, which is more suitable for code-first development using TypeScript + NodeJS.

## Global Instances

Usually, you can create database instances right at the start.
For example, you can place a global instance of ``export`''.

```ts title="backend/src/index.ts
export const mongo = new MongoDB({...})
```

Directly reference the global database instance when needed.

```ts title="backend/src/api/ApiXXXX.ts
import { mongo } from '... /index'

await mongo.collection('xxx').find({}).toArray()
```

## Start-up process

Most databases need to be connected before they can be used. To ensure that everything is ready when the user's request arrives, you can handle the Server startup process yourself.
For example, connect all database instances first, then `server.start()`. Assuming that our service uses both `MongoDB` and `Redis`, you could handle the startup process like this.

```ts title="backend/src/index.ts"

let server = new HttpServer();

// global database instance
export const redis = new Redis({...}) ;
export const mongo = new Mongo.DB({...}) ;

// Start the process
async function main(){
    // first connect to the database
    await redis.connect();
    await mongo.connect();

    // then start the service
    await server.start();
}
main().catch(e=>{
    // Any start process exception, exit the process
    server.logger.error('Failed to start', e);
    process.exit(-1);
});

```

## Configuration

Many times, especially between environments, you need to modify the connection configuration of the database.
There are many mechanisms to implement them.
For example.

- Extracting a configuration file
- Get it via environment variables

## Code structure

Putting configuration, public global instances, and service startup processes all in `index.ts` seems bloated and unintuitive. You can organize and disperse them into different module files, e.g.

```
|- backend/src
    |- models
        |- global.ts
    |- api
    |- index.ts
```
