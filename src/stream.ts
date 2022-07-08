import { Readable, ReadableOptions } from "stream";

export class MultiReadStream extends Readable {
  #streams: Readable[];

  constructor(streams: Readable[], opts?: ReadableOptions) {
    super(opts);
    this.#streams = streams;
  }

  async _read() {
    for (const stream of this.#streams) {
      for await (const chunk of stream) {
        this.push(chunk);
      }
    }

    this.push(null);
  }
}
