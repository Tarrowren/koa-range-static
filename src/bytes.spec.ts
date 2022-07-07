import should from "should";
import { format } from "./bytes";

describe("bytes format", () => {
  it("100 B", () => {
    should(format(100)).equal("100.00 B");
  });

  it("1 KB", () => {
    should(format(1024)).equal("1.00 KB");
  });

  it("1 MB", () => {
    should(format(1024 * 1024)).equal("1.00 MB");
  });

  it("1 GB", () => {
    should(format(1024 * 1024 * 1024)).equal("1.00 GB");
  });
});
