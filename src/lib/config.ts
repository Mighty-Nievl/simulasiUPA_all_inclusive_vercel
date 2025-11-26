export const SITE_CONFIG = {
  // Domain config
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "simupa.web.id",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.simupa.web.id",
  loginUrl: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : "https://simupa.web.id"}/login`,
  registerUrl: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN ? `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : "https://simupa.web.id"}/daftar`,
  
  // Other potential config items
  name: "Simulasi UPA PERADI",
  description: "Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat",
};
