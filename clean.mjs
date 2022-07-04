import { rm } from "fs/promises";
import { resolve } from "path";

await rm(resolve("lib"), { recursive: true, force: true });
