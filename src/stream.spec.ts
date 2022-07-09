import { randomBytes } from "crypto";
import { createReadStream } from "fs";
import { resolve } from "path";
import should from "should";
import { Readable } from "stream";
import { createBufferStream, createMultiStream } from "./stream";

describe("multi stream", () => {
  it("multi buffer readable", async () => {
    const bufs = [1024, 1024, 1024].map((size) => randomBytes(size));

    const result = await buffer(
      createMultiStream(bufs.map((b) => createBufferStream(b)))
    );

    should(result).deepEqual(Buffer.concat(bufs));
  });

  it("multi fs readable", async () => {
    const streams = [
      createReadStream(resolve("test.txt")),
      createReadStream(resolve("test.txt")),
    ];

    const result = await buffer(createMultiStream(streams));

    should(result).deepEqual(Buffer.alloc(2 * 1024, "0"));
  });

  it("buffer to stream", async () => {
    const buf = randomBytes(16);

    const result = await buffer(createBufferStream(buf));

    should(result).deepEqual(buf);
  });
});

async function buffer(stream: Readable) {
  const bufs: Buffer[] = [];
  for await (const chunk of stream) {
    bufs.push(chunk);
  }
  return Buffer.concat(bufs);
}
