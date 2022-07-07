# koa-range-static

Static file server middleware, support for range request

## Install

```sh
npm i koa-range-static
```

## API

```js
const { rangeStatic, send } = require("koa-range-static");
app.use(rangeStatic({ root: "." }));
app.use(async (ctx) => {
  await send(ctx, ctx.path);
});
```

- rangeStatic options

  - `directory` Show directory, conflict with `format`. Default is `false`
  - `renderDirent` Render directory entries.
  - For others, see `send options`

- send options
  - `format` If not false, format the path to serve static file servers and not require a trailing slash for directories, so that you can do both /directory and /directory/. Default is `false`
  - `hidden` Allow transfer of hidden files and show hidden directory. Default is `false`
  - `immutable` Tell the browser the resource is immutable and can be cached indefinitely. Default is `false`
  - `index` Name of the index file to serve automatically when visiting the root location. Default is `"index.html"`
  - `maxage` Browser cache max-age in seconds. Default is `0`
  - `root` Root directory to restrict file access. Default is `resolve()`

## Example

```js
const Application = require("koa");
const { rangeStatic } = require("koa-range-static");

const app = new Application();
app.use(rangeStatic({ root: ".", directory: true }));
app.listen(3000);
```

## License

MIT
