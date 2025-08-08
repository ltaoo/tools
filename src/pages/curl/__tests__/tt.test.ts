import { describe, expect, it } from "vitest";

import { parse_header_raw } from "../curl_parser";

describe("normalize the header raw", () => {
  it("the -H with ''", () => {
    const raw = `-H 'request-identifier: anBIQin1eaCYxffXW7gsUQ=='`;
    const r = parse_header_raw(raw);

    expect(r).toStrictEqual({
      key: "request-identifier",
      value: "anBIQin1eaCYxffXW7gsUQ==",
    });
  });
});
