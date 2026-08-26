import { describe, expect, it } from "vitest";

import { isDatabaseSslEnabled } from "@/lib/database-ssl";

describe("isDatabaseSslEnabled", () => {
  it("enables TLS from an explicit App Service environment value", () => {
    const url = new URL("mysql://user:pass@localhost:3306/database");

    expect(isDatabaseSslEnabled(url, "true")).toBe(true);
  });

  it("enables TLS from the database URL", () => {
    const url = new URL("mysql://user:pass@localhost:3306/database?ssl=true");

    expect(isDatabaseSslEnabled(url, undefined)).toBe(true);
  });

  it("keeps local MySQL TLS disabled by default", () => {
    const url = new URL("mysql://user:pass@localhost:3306/database");

    expect(isDatabaseSslEnabled(url, undefined)).toBe(false);
  });
});
