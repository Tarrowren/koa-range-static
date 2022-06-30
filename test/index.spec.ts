import Application from "koa";
import supertest from "supertest";
import { rangeStatic } from "../src";

const app = new Application();
app.use(rangeStatic({ root: ".", hidden: true }));
app.on("error", () => {
  // disable error output
});
const server = app.listen();

describe("normal", () => {
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
    await supertest(server)
      .post("/package.json")
      .expect(405)
      .expect("Accept-Ranges", "bytes");
  });
});

after((done) => {
  server.close(done);
});
