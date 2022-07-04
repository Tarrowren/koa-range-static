import should from "should";
import { parseRangeRequests } from "./range.js";

const filesize = 1024;

describe("parse range", () => {
  it("invalid", () => {
    should(parseRangeRequests("bytes", filesize)).Array().empty();
  });

  it("invalid", () => {
    should(parseRangeRequests("bytes=99-0", filesize)).Array().empty();
  });

  it("1 range", () => {
    should(parseRangeRequests("bytes=-10", filesize)).Array().size(1);
  });

  it("1 range", () => {
    should(parseRangeRequests("bytes=0-", filesize)).Array().size(1);
  });

  it("1 range", () => {
    should(parseRangeRequests("bytes=0-99", filesize)).Array().size(1);
  });

  it("2 ranges", () => {
    should(parseRangeRequests("bytes=0-99,100-299", filesize)).Array().size(2);
  });
});
