import { randomBytes } from "crypto";
import { createReadStream } from "fs";
import { resolve } from "path";
import should from "should";
import { Readable } from "stream";
import { createMultiStream } from "./stream";

describe("multi stream", () => {
  it("buffer readable", async () => {
    const bufs = [1024, 1024, 1024].map((size) => randomBytes(size));

    const buf = await buffer(
      createMultiStream(bufs.map((b) => Readable.from(b)))
    );

    should(buf).deepEqual(Buffer.concat(bufs));
  });

  it("fs readable", async () => {
    const streams = [
      createReadStream(resolve("test.txt")),
      createReadStream(resolve("test.txt")),
    ];

    const buf = await buffer(createMultiStream(streams));

    should(buf).deepEqual(Buffer.alloc(2 * 1024, "0"));
  });
});

async function buffer(stream: Readable) {
  const bufs: Buffer[] = [];
  for await (const chunk of stream) {
    bufs.push(chunk);
  }
  return Buffer.concat(bufs);
}
