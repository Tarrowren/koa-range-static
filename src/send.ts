import { createReadStream } from "fs";
import { Context } from "koa";
import { extname, join, relative, resolve, sep } from "path";
import { statAsync } from "./fs";
import { parseRangeRequests } from "./range";

export async function send(
  ctx: Context,
  path: string,
  options?: SendOptions
): Promise<Dirent | void> {
  ctx.set("Accept-Ranges", "bytes");

  const { format, hidden, immutable, index, maxage, root } = {
    ...defaultOptions,
    ...options,
  };

  // disable access to files outside of root
  path = join(sep, decodeURI(path));

  let absolute = join(root, path);
  if (!hidden && isHidden(root, absolute)) return;

  let stats = await statAsync(absolute);

  if (stats.isDirectory()) {
    if (!format) {
      return {
        isDirectory: true,
        path,
        absolute,
      };
    }

    path = join(path, index);
    absolute = join(root, path);
    stats = await statAsync(absolute);
  }

  const rangeText = ctx.header.range;

  let range: [number, number] | undefined;

  if (rangeText) {
    const ranges = parseRangeRequests(rangeText, stats.size);

    if (ranges.length === 0) {
      ctx.status = 416;
      return;
    }

    range = ranges[0];
  }

  if (!ctx.response.get("Last-Modified")) {
    ctx.set("Last-Modified", stats.mtime.toUTCString());
  }
  if (!ctx.response.get("Cache-Control")) {
    const directives = [`max-age=${maxage}`];
    if (immutable) {
      directives.push("immutable");
    }
    ctx.set("Cache-Control", directives.join(","));
  }

  if (range) {
    const [start, end] = range;
    ctx.set("Content-Length", `${end - start + 1}`);
    ctx.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    ctx.status = 206;
    ctx.type = extname(path);
    ctx.body = createReadStream(absolute, { start, end });
  } else {
    ctx.set("Content-Length", `${stats.size}`);
    ctx.status = 200;
    ctx.type = extname(path);
    ctx.body = createReadStream(absolute);
  }

  return {
    isDirectory: false,
    path,
    absolute,
  };
}

export interface SendOptions {
  /**
   * If not false, format the path to serve static file servers and not require a trailing slash for directories, so that you can do both /directory and /directory/.
   *
   * Default is `false`
   */
  format?: boolean;

  /**
   * Allow transfer of hidden files and show hidden directory.
   *
   * Default is `false`
   */
  hidden?: boolean;

  /**
   * Tell the browser the resource is immutable and can be cached indefinitely.
   *
   * Default is `false`
   */
  immutable?: boolean;

  /**
   * Name of the index file to serve automatically when visiting the root location.
   *
   * Default is `"index.html"`
   */
  index?: string;

  /**
   * Browser cache max-age in seconds.
   *
   * Default is `0`
   */
  maxage?: number;

  /**
   * Root directory to restrict file access.
   *
   * Default is `resolve()`
   */
  root?: string;
}

export interface Dirent {
  isDirectory: boolean;
  path: string;
  absolute: string;
}

const defaultOptions = {
  format: false,
  hidden: false,
  immutable: false,
  index: "index.html",
  maxage: 0,
  root: resolve(),
};

function isHidden(root: string, path: string): boolean {
  return relative(root, path)
    .split(sep)
    .some((v) => v[0] === ".");
}
