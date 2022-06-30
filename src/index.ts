import { createReadStream } from "fs";
import { readdir, stat } from "fs/promises";
import { Middleware } from "koa";
import { extname, join, relative, resolve, sep } from "path";
import { Readable } from "stream";
import { parseHeaderRange } from "./range";

export function rangeStatic(options?: RangeStaticOptions): Middleware {
  let { directory, hidden, immutable, maxage, root, renderDirectory } = {
    ...defaultOptions,
    ...options,
  };

  root = resolve(root);

  return async (ctx) => {
    ctx.set("Accept-Ranges", "bytes");

    if (ctx.method !== "HEAD" && ctx.method !== "GET") {
      ctx.status = 405;
      return;
    }

    const url = join("/", decodeURI(ctx.path));
    const path = join(root, url);

    if (!hidden && isHidden(root, path)) return;

    const stats = await stat(path);

    if (stats.isDirectory()) {
      if (directory) {
        let paths = await readdir(path);
        if (!hidden) {
          paths = paths.filter((path) => path[0] !== ".");
        }

        const item = paths.map((path) => ({
          name: path,
          url: join(url, path),
        }));

        if (path === root) {
          item.unshift({ name: "..", url: join(url, "..") });
        }

        ctx.body = renderDirectory(item);
      }
      return;
    }

    ctx.set("Last-Modified", stats.mtime.toUTCString());

    const directives = [`max-age=${maxage}`];
    if (immutable) {
      directives.push("immutable");
    }
    ctx.set("Cache-Control", directives.join(","));

    const rangeText = ctx.header.range;
    if (!rangeText) {
      ctx.set("Content-Length", `${stats.size}`);
      ctx.status = 200;
      ctx.type = extname(url);
      ctx.body = createReadStream(path);
      return;
    }

    const ranges = parseHeaderRange(rangeText, stats.size);
    if (ranges.length === 0) {
      ctx.status = 416;
      return;
    }

    const [start, end] = ranges[0];
    ctx.set("Content-Length", `${end - start + 1}`);
    ctx.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    ctx.status = 206;
    ctx.type = extname(url);
    ctx.body = createReadStream(path, { start, end });
    return;
  };
}

interface RangeStaticOptions {
  directory?: boolean;
  hidden?: boolean;
  immutable?: boolean;
  maxage?: number;
  root?: string;
  renderDirectory?: (items: Item[]) => string | Readable;
}

interface Item {
  name: string;
  url: string;
}

const defaultOptions: Required<RangeStaticOptions> = {
  directory: false,
  hidden: false,
  immutable: false,
  maxage: 0,
  root: resolve(),
  renderDirectory,
};

function isHidden(root: string, path: string): boolean {
  return relative(root, path)
    .split(sep)
    .some((v) => v[0] === ".");
}

function renderDirectory(items: Item[]) {
  return items
    .map(({ name, url }) => `<a href="${url}">${name}</a>`)
    .join("<br>");
}
