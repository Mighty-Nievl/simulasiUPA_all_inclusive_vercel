import { env } from "@/lib/env";

export const SITE_CONFIG = {
  // Domain config
  rootDomain: env.NEXT_PUBLIC_ROOT_DOMAIN,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  loginUrl: env.NEXT_PUBLIC_LOGIN_URL,
  registerUrl: env.NEXT_PUBLIC_REGISTER_URL,
  
  // Other potential config items
  name: "Simulasi UPA PERADI",
  description: "Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat",
};
