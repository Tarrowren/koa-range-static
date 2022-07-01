import { Dirent, PathLike, readdir, stat, Stats } from "fs";

export async function statAsync(path: PathLike) {
  return await new Promise<Stats>((resolve, reject) => {
    stat(path, (err, stats) => {
      err ? reject(err) : resolve(stats);
    });
  });
}

export async function readdirAsync(
  path: PathLike,
  withFileTypes?: false
): Promise<string[]>;
export async function readdirAsync(
  path: PathLike,
  withFileTypes: true
): Promise<Dirent[]>;
export async function readdirAsync(
  path: PathLike,
  withFileTypes?: boolean
): Promise<Dirent[] | string[]> {
  if (withFileTypes) {
    return await new Promise<Dirent[]>((resolve, reject) => {
      readdir(path, { withFileTypes: withFileTypes }, (err, files) => {
        err ? reject(err) : resolve(files);
      });
    });
  } else {
    return await new Promise<string[]>((resolve, reject) => {
      readdir(path, (err, files) => {
        err ? reject(err) : resolve(files);
      });
    });
  }
}
