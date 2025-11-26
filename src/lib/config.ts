const formatUrl = (url: string) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "simupa.web.id";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${domain}`;

export const SITE_CONFIG = {
  // Domain config
  rootDomain: domain,
  appUrl: formatUrl(appUrl),
  loginUrl: formatUrl(process.env.NEXT_PUBLIC_LOGIN_URL || `https://${domain}/login`),
  registerUrl: formatUrl(process.env.NEXT_PUBLIC_REGISTER_URL || `https://${domain}/daftar`),
  
  // Other potential config items
  name: "Simulasi UPA PERADI",
  description: "Sistem Pembelajaran Gamifikasi untuk Ujian Profesi Advokat",
};
