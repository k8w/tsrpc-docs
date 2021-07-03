---
sidebar_position: 1
---

## Create TSRPC application

## Create a project

Use the `create-tsrpc-app` tool to quickly create a TSRPC project.

```shell
npx create-tsrpc-app@latest
```

The creation process is interactive, and TSRPC full-stack application projects containing front and back ends can be easily created by selecting the appropriate configuration on the menu.

! [](assets/create-tsrpc-app.gif)

:::note
Requires NodeJS 12+, see more help via `npx create-tsrpc-app@latest --help`.
:::

:::tip
Remember not to forget the `@latest` at the end of the command, this allows you to always create from the latest version of the project template.
:::

## Full-stack project structure

TSRPC shares common code such as protocol definitions between front- and back-end projects to get better code hints and improve development efficiency.
Typically, server-side projects are named `backend` and client-side projects are named `frontend`, and they both have a shared code directory `src/shared`. The shared directory is edited on the backend and then read-only synchronized to the frontend, or you can use Symlink to synchronize it automatically.

A common directory structure is as follows.

```
|- backend --------------------------- backend project
    |- src
        |- shared -------------------- Shared code between front and backend (sync to frontend)
            |- protocols ------------- protocol definitions
        |- api ----------------------- API implementation
        index.ts

|- frontend -------------------------- frontend project
    |- src
        |- shared -------------------- front-end and back-end shared code (read-only)
            |- protocols
        |- index.ts
```

:::tip
`frontend` and `backend` are two completely separate projects that can be placed in the same code repository or spread out in two separate code repositories.
:::

## Local development

Both frontend and backend projects run local development services in their respective directories via `npm run dev`.

```shell
cd backend
npm run dev
```

```shell
cd frontend
npm run dev
```

The project template already comes with a small example, start it and see the effect~

## compile build

Similarly, compile the build with `npm run build` in the respective directory and output it to the `dist` directory by default.

```shell
cd backend
npm run build
```

```shell
cd frontend
npm run build
```
