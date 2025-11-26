const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "simupa.web.id";
const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

export const SITE_CONFIG = {
  // Domain config
  rootDomain,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || `${protocol}://app.${rootDomain}`,
  loginUrl: process.env.NEXT_PUBLIC_LOGIN_URL || `${protocol}://${rootDomain}/login`,
  registerUrl: process.env.NEXT_PUBLIC_REGISTER_URL || `${protocol}://${rootDomain}/daftar`,
  
  // Other potential config items
  name: "Simulasi UPA PERADI",
  description: "Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat",
};
