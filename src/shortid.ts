import { randomBytes } from "crypto";

export async function shortid(size: number) {
  const buf = await new Promise<Buffer>((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });
  return buf.toString("hex");
}
