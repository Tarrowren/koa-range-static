import { Readable, ReadableOptions } from "stream";

export function createMultiStream(streams: Readable[]): MultiStream {
  return new MultiStream(streams);
}

export function createBufferStream(buffer: Buffer) {
  return new BufferStream(buffer);
}

export class MultiStream extends Readable {
  #streams: Readable[];
  #read: ((size: number) => void) | null | undefined;

  constructor(streams: Readable[], opts?: ReadableOptions) {
    super(opts);

    this.#streams = streams;
    this.#start();
  }

  _read(size: number): void {
    if (!this.#read) {
      throw new Error("not ready to read");
    }

    this.#read(size);
  }

  _destroy(
    error: Error | null,
    callback: (error?: Error | null) => void
  ): void {
    callback(error);
  }

  async #start() {
    let size = 0;
    let sizePromise = this.#getSize();
    let cache: Buffer | null | undefined;

    for (const stream of this.#streams) {
      for await (const chunk of stream) {
        if (!Buffer.isBuffer(chunk)) {
          throw new Error("chunk not buffer");
        }

        if (size === 0) {
          size = await sizePromise;
        }

        cache = cache ? Buffer.concat([cache, chunk]) : chunk;
        if (cache.length > size) {
          do {
            this.push(cache.slice(0, size));

            cache = cache.slice(size);

            sizePromise = this.#getSize();
            size = await sizePromise;

            if (cache.length < size) {
              break;
            } else if (cache.length === size) {
              this.push(cache);

              size = 0;
              sizePromise = this.#getSize();
              cache = null;

              break;
            }
          } while (true);
        } else if (cache.length === size) {
          this.push(cache);

          size = 0;
          sizePromise = this.#getSize();
          cache = null;
        }
      }
    }

    if (cache) {
      this.push(cache);

      cache = null;
    }
    this.push(null);
  }

  async #getSize() {
    const size = await new Promise<number>((resolve) => {
      this.#read = resolve;
    });

    this.#read = null;
    return size;
  }
}

export class BufferStream extends Readable {
  #buffer: Buffer | null;
  #bufferLength: number;
  #pos = 0;

  constructor(buffer: Buffer, opts?: ReadableOptions) {
    super(opts);

    this.#buffer = buffer;
    this.#bufferLength = buffer.length;
  }

  _read(size: number): void {
    if (!this.#buffer) {
      return;
    }

    if (this.#pos >= this.#bufferLength) {
      this.push(null);
    } else {
      const start = this.#pos;
      const end = start + size;
      const chunk = this.#buffer.slice(start, end);

      this.#pos = end;

      process.nextTick(() => {
        this.push(chunk);
      });
    }
  }

  _destroy(
    error: Error | null,
    callback: (error?: Error | null) => void
  ): void {
    this.#buffer = null;

    callback(error);
  }
}
