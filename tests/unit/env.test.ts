import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/lib/schemas/env";
describe("rule-only environment", () => {
  it("works without any credentials, including production", () => {
    expect(parseEnv({}).AI_ENABLED).toBe(false);
    expect(parseEnv({ NODE_ENV: "production" }).AI_ENABLED).toBe(false);
    expect(parseEnv({ OPENAI_API_KEY: "", SUPABASE_URL: "" }).OPENAI_API_KEY).toBeUndefined();
  });
  it("never accepts paid AI before the shared limiter exists", () => {
    expect(() => parseEnv({ AI_ENABLED: "true" })).toThrow(/AI_ENABLED/);
  });
  it("validates switches, limits and server secrets without disclosing values", () => {
    for (const input of [{ AI_ENABLED: "yes" }, { ENABLE_VISION: "true" }, { CONTENT_MODE: "draft" }, { AI_DAILY_CALL_LIMIT: "-1" }]) expect(() => parseEnv(input)).toThrow();
    expect(() => parseEnv({ SESSION_SECRET: "SECRET-SHOULD-NOT-APPEAR" })).toThrow("Invalid server configuration: SESSION_SECRET");
    expect(() => parseEnv({ SUPABASE_URL: "SECRET-SHOULD-NOT-APPEAR" })).not.toThrow(/SECRET-SHOULD-NOT-APPEAR/);
  });
});
