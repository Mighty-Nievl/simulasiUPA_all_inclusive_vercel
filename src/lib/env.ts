// Simple strict validation without Zod to avoid extra dependencies for now.
// If the project grows, migrating to Zod or T3 Env is recommended.

const requiredEnvVars = [
  "NEXT_PUBLIC_ROOT_DOMAIN",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function validateEnv() {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing environment variables: ${missingVars.join(
        ", "
      )}. Using defaults for build.`
    );
    // Don't throw here to allow build to proceed, but app might misbehave if vars are truly needed at runtime.
  }

  // Helper to ensure URL has protocol
  const formatUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "simupa.web.id";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${domain}`;

  return {
    NEXT_PUBLIC_ROOT_DOMAIN: domain,
    NEXT_PUBLIC_APP_URL: formatUrl(appUrl),
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || domain,
    NEXT_PUBLIC_LOGIN_URL: formatUrl(process.env.NEXT_PUBLIC_LOGIN_URL || `${formatUrl(appUrl)}/login`),
    NEXT_PUBLIC_REGISTER_URL: formatUrl(process.env.NEXT_PUBLIC_REGISTER_URL || `${formatUrl(appUrl)}/daftar`),
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

// Validate on import
export const env = validateEnv();
