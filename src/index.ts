import { Middleware } from "koa";
import { join, resolve, sep } from "path";
import { Readable } from "stream";
import { readdirAsync } from "./fs";
import { send, SendOptions } from "./send";

export function rangeStatic(options?: RangeStaticOptions): Middleware {
  const { directory, renderDirent, withFileTypes, ...opts } = {
    ...defaultOptions,
    ...options,
  };

  const root = resolve(opts.root);
  opts.root = root;

  const getDirents = withFileTypes
    ? getDirentsWithFileTypes
    : getDirentsWithoutFileTypes;

  return async (ctx) => {
    if (ctx.method !== "HEAD" && ctx.method !== "GET") {
      ctx.status = 405;
      return;
    }

    const result = await send(ctx, ctx.path, opts);
    if (directory && result && result.isDirectory) {
      const path = result.path;

      const dirents = await getDirents(result.path, result.absolute, opts);

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

  /**
   * see `fs.readdir`.
   * If not false, **NOTE** whether your node version supports.
   *
   * Default is `true` on Node v10+.
   */
  withFileTypes?: boolean;
}

export interface Dirent {
  name: string;
  path: string;
  isDirectory?: boolean;
}

const major = Number(process.versions.node.split(".")[0]);

const defaultOptions = {
  directory: false,
  hidden: false,
  renderDirent,
  withFileTypes: major >= 10,
  root: resolve(),
};

function renderDirent(dirents: Dirent[]) {
  return dirents
    .map(({ name, path, isDirectory }) => {
      return `<a href="${path}">${
        isDirectory === true ? name + "/" : name
      }</a>`;
    })
    .join("<br>");
}

async function getDirentsWithFileTypes(
  path: string,
  absolute: string,
  options: SendOptions
) {
  let dirents = await readdirAsync(absolute, true);

  if (!options.hidden) {
    dirents = dirents.filter(({ name }) => name[0] !== ".");
  }

  return dirents
    .map<Dirent>((dirent) => ({
      name: dirent.name,
      path: join(path, dirent.name),
      isDirectory: dirent.isDirectory(),
    }))
    .sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      } else {
        return a.isDirectory ? -1 : 1;
      }
    });
}

async function getDirentsWithoutFileTypes(
  path: string,
  absolute: string,
  options: SendOptions
) {
  let names = await readdirAsync(absolute);

  if (!options.hidden) {
    names = names.filter((name) => name[0] !== ".");
  }

  return names
    .map<Dirent>((name) => ({
      name: name,
      path: join(path, name),
    }))
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
}
