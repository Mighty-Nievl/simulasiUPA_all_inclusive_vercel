const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

export const SITE_CONFIG = {
  // Domain config
  rootDomain,
  appUrl: (process.env.NEXT_PUBLIC_APP_URL?.startsWith("http") ? process.env.NEXT_PUBLIC_APP_URL : `${protocol}://${process.env.NEXT_PUBLIC_APP_URL}`) || `${protocol}://app.${rootDomain}`,
  loginUrl: (process.env.NEXT_PUBLIC_LOGIN_URL?.startsWith("http") ? process.env.NEXT_PUBLIC_LOGIN_URL : (process.env.NEXT_PUBLIC_LOGIN_URL ? `${protocol}://${process.env.NEXT_PUBLIC_LOGIN_URL}` : undefined)) || `${protocol}://${rootDomain}/login`,
  registerUrl: (process.env.NEXT_PUBLIC_REGISTER_URL?.startsWith("http") ? process.env.NEXT_PUBLIC_REGISTER_URL : (process.env.NEXT_PUBLIC_REGISTER_URL ? `${protocol}://${process.env.NEXT_PUBLIC_REGISTER_URL}` : undefined)) || `${protocol}://${rootDomain}/daftar`,
  
  // Other potential config items
  name: "Simulasi UPA PERADI",
  description: "Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat",
};
