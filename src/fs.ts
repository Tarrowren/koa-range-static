// compatible with node v7
import { readdir, stat, Stats } from "fs";

export async function statAsync(path: string) {
  return await new Promise<Stats>((resolve, reject) => {
    stat(path, (err, stats) => {
      err ? reject(err) : resolve(stats);
    });
  });
}

export async function readdirAsync(path: string): Promise<string[]> {
  return await new Promise<string[]>((resolve, reject) => {
    readdir(path, (err, files) => {
      err ? reject(err) : resolve(files);
    });
  });
}
