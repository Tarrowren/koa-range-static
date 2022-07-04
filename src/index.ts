import { Stats } from "fs";
import { Middleware } from "koa";
import { join, resolve, sep } from "path";
import { Readable } from "stream";
import { format } from "./bytes.js";
import { readdirAsync, statAsync } from "./fs.js";
import { send, SendOptions } from "./send.js";

export * from "./send.js";

export function rangeStatic(options?: RangeStaticOptions): Middleware {
  const { directory, renderDirent, ...opts } = {
    ...defaultOptions,
    ...options,
  };

  const root = resolve(opts.root);
  opts.root = root;

  return async (ctx) => {
    if (ctx.method !== "HEAD" && ctx.method !== "GET") {
      ctx.status = 405;
      return;
    }

    const result = await send(ctx, ctx.path, opts);
    if (directory && result && result.isDirectory) {
      const { absolute, path } = result;

      let names = await readdirAsync(absolute);

      if (!opts.hidden) {
        names = names.filter((name) => name[0] !== ".");
      }

      const dirents = await Promise.all(
        names.map<Promise<Dirent>>(async (name) => ({
          name,
          path: join(path, name),
          stats: await statAsync(join(absolute, name)),
        }))
      );

      if (path !== sep) {
        dirents.unshift({
          name: "..",
          path: join(path, ".."),
        });
      }

      ctx.body = renderDirent(dirents);
    }
  };
}

export interface RangeStaticOptions extends SendOptions {
  /**
   * Show directory, conflict with `format`
   *
   * Default is `false`
   */
  directory?: boolean;

  /**
   * Render directory entries.
   */
  renderDirent?: (dirents: Dirent[]) => string | Readable;
}

export interface Dirent {
  name: string;
  path: string;
  stats?: Stats;
}

const defaultOptions = {
  directory: false,
  hidden: false,
  renderDirent,
  root: resolve(),
};

function renderDirent(dirents: Dirent[]) {
  return dirents
    .sort((a, b) => {
      if (!a.stats) return -1;
      if (!b.stats) return 1;

      let aIsDirectory = a.stats.isDirectory();
      let bIsDirectory = b.stats.isDirectory();

      if (aIsDirectory === bIsDirectory) {
        return a.name.localeCompare(b.name);
      } else {
        return aIsDirectory ? -1 : 1;
      }
    })
    .map(({ name, path, stats }) => {
      if (!stats) {
        return `<a href="${path}">${name}</a>`;
      }

      if (stats.isDirectory()) {
        return `<a href="${path}">${name}/</a>`;
      } else {
        return `<a href="${path}">${name}\t${format(stats.size)}</a>`;
      }
    })
    .join("<br>");
}
