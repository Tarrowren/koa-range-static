import { rm } from "fs/promises";
import { resolve } from "path";

await rm(resolve("cjs"), { recursive: true, force: true });
await rm(resolve("esm"), { recursive: true, force: true });
