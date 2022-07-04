import Application from "koa";
import supertest from "supertest";
import { rangeStatic } from "./index";

const app = new Application();
app.use(rangeStatic({ directory: true, hidden: true }));
app.on("error", () => {
  // disable error output
});
const server = app.listen();

describe("normal requests", () => {
  it("should return 200 without range", async () => {
    await supertest(server)
      .get("/package.json")
      .expect(200)
      .expect("Accept-Ranges", "bytes");
  });

  it("should return 404 without range", async () => {
    await supertest(server).get("/404.txt").expect(404);
  });

  it("should return 405 when method not GET", async () => {
    await supertest(server).post("/package.json").expect(405);
  });
});

describe("range requests", () => {
  it("should return 206 with range", async () => {
    await supertest(server)
      .get("/test.txt")
      .set("Range", "bytes=0-99")
      .expect(206)
      .expect("Accept-Ranges", "bytes")
      .expect("Content-Length", "100")
      .expect("Content-Range", "bytes 0-99/1024");
  });

  it("should return 206 with range", async () => {
    await supertest(server)
      .get("/test.txt")
      .set("Range", "bytes=-10")
      .expect(206)
      .expect("Accept-Ranges", "bytes")
      .expect("Content-Length", "10")
      .expect("Content-Range", "bytes 1014-1023/1024");
  });

  it("should return 206 with range", async () => {
    await supertest(server)
      .get("/test.txt")
      .set("Range", "bytes=10-")
      .expect(206)
      .expect("Accept-Ranges", "bytes")
      .expect("Content-Length", "1014")
      .expect("Content-Range", "bytes 10-1023/1024");
  });

  it("should return 416 with invalid range", async () => {
    await supertest(server)
      .get("/test.txt")
      .set("Range", "bytes=100-99")
      .expect(416)
      .expect("Accept-Ranges", "bytes");
  });
});

after((done) => {
  server.close(done);
});
