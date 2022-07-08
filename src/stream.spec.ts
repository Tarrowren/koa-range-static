import { randomBytes } from "crypto";
import should from "should";
import { Readable } from "stream";
import { buffer } from "stream/consumers";
import { MultiReadStream } from "./stream";

describe("stream pipeline", () => {
  it("3 readable stream", async () => {
    const bufs = [randomBytes(10), randomBytes(10), randomBytes(10)];

    const buf = await buffer(
      new MultiReadStream(bufs.map((buf) => Readable.from(buf)))
    );

    should(buf).deepEqual(Buffer.concat(bufs));
  });
});
