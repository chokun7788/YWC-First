import { z } from "zod";
const optionalText = z.preprocess(value => value === "" ? undefined : value, z.string().min(1).optional());
const optionalUrl = z.preprocess(value => value === "" ? undefined : value, z.url().optional());
const positiveInt = (fallback: number) => z.coerce.number().int().positive().default(fallback);
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url().default("http://localhost:3000"),
  CONTENT_MODE: z.literal("verified_only").default("verified_only"),
  AI_ENABLED: z.enum(["true", "false"]).default("false").transform(v => v === "true"),
  ENABLE_VISION: z.literal("false").default("false"),
  OPENAI_API_KEY: optionalText, OPENAI_MODEL: optionalText,
  SUPABASE_URL: optionalUrl, SUPABASE_SECRET_KEY: optionalText, SUPABASE_SERVICE_ROLE_KEY: optionalText,
  SESSION_SECRET: optionalText, LOG_HASH_SECRET: optionalText,
  AI_DAILY_CALL_LIMIT: positiveInt(100), AI_SESSION_CALL_LIMIT: positiveInt(8),
  AI_SESSION_WINDOW_SECONDS: positiveInt(600), CHAT_SESSION_REQUEST_LIMIT: positiveInt(20),
}).superRefine((env, ctx) => {
  if (env.AI_ENABLED) {
    for (const key of ["OPENAI_API_KEY", "OPENAI_MODEL", "SUPABASE_URL", "SESSION_SECRET", "LOG_HASH_SECRET"] as const) {
      if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: "Required when enabling AI" });
    }
    if (!env.SUPABASE_SECRET_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) ctx.addIssue({ code: "custom", path: ["SUPABASE_SECRET_KEY"], message: "Server credential required" });
    ctx.addIssue({ code: "custom", path: ["AI_ENABLED"], message: "Paid AI is unavailable until the shared atomic limiter and adapter are implemented" });
  }
  for (const key of ["SESSION_SECRET", "LOG_HASH_SECRET"] as const) {
    if (env[key] && new TextEncoder().encode(env[key]).length < 32) ctx.addIssue({ code: "custom", path: [key], message: "Use at least 32 random bytes" });
  }
});
export function parseEnv(input: Record<string, string | undefined>) {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    // Never include invalid environment values in an error or log.
    const fields = [...new Set(result.error.issues.map(issue => issue.path.join(".")))];
    throw new Error(`Invalid server configuration: ${fields.join(", ")}`);
  }
  return result.data;
}
