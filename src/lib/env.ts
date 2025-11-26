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
    throw new Error(
      `❌ Invalid environment variables: Missing ${missingVars.join(
        ", "
      )}. Please check your .env file.`
    );
  }

  // Helper to ensure URL has protocol
  const formatUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  return {
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN!,
    NEXT_PUBLIC_APP_URL: formatUrl(process.env.NEXT_PUBLIC_APP_URL!),
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || process.env.NEXT_PUBLIC_ROOT_DOMAIN!,
    NEXT_PUBLIC_LOGIN_URL: formatUrl(process.env.NEXT_PUBLIC_LOGIN_URL!) || `${formatUrl(process.env.NEXT_PUBLIC_APP_URL!)}/login`,
    NEXT_PUBLIC_REGISTER_URL: formatUrl(process.env.NEXT_PUBLIC_REGISTER_URL!) || `${formatUrl(process.env.NEXT_PUBLIC_APP_URL!)}/daftar`,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

// Validate on import
export const env = validateEnv();
