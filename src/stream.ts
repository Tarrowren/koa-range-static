import { Readable, ReadableOptions } from "stream";

export function createMultiStream(sources: Readable[]): MultiStream {
  return new MultiStream(sources);
}

export function from(buffer: Buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
}

export class MultiStream extends Readable {
  #sources: Readable[];
  #current: Readable | null = null;

  constructor(sources: Readable[], options?: ReadableOptions) {
    super({ ...options, autoDestroy: true });
    this.#sources = sources;

    this.#next();
  }

  _read(size: number): void {
    this.#forward(size);
  }

  _destroy(
    error: Error | null,
    callback: (error?: Error | null) => void
  ): void {
    if (this.#current) {
      this.#destroy(this.#current, error);
    }

    for (const stream of this.#sources) {
      this.#destroy(stream, error);
    }

    callback(error);
  }

  #forward(size: number) {
    if (!this.#current) {
      return;
    }

    let chunk: Buffer | null;

    do {
      chunk = this.#current.read(size);
      if (!chunk || !this.push(chunk)) {
        break;
      }
    } while (true);
  }

  #next() {
    const stream = this.#sources.shift();

    if (!stream) {
      this.push(null);
      return;
    }

    this.#current = stream;
    stream
      .on("readable", () => {
        this.#forward(this.readableHighWaterMark);
      })
      .once("end", () => {
        this.#current = null;
        stream.removeAllListeners();
        stream.destroy?.();
        this.#next();
      })
      .once("close", () => {
        if (!stream.readableEnded && !stream.destroyed) {
          const error = new Error("ERR_STREAM_PREMATURE_CLOSE");
          stream.removeAllListeners();
          this.destroy?.(error);
        }
      })
      .once("error", (error) => {
        stream.removeAllListeners();
        this.destroy?.(error);
      });
  }

  #destroy(stream: Readable, error?: Error | null) {
    if (!stream.destroyed) {
      stream.destroy?.(error ?? undefined);
    }
  }
}
