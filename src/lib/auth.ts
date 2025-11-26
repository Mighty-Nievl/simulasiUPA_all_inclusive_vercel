import Cookies from "js-cookie";

const AUTH_COOKIE_NAME = "upa_auth_token";

import { SITE_CONFIG } from "./config";

export const auth = {
  login: () => {
    // Set cookie that is accessible across subdomains
    const domain = SITE_CONFIG.rootDomain;

    Cookies.set(AUTH_COOKIE_NAME, "true", { 
      expires: 7, // 7 days
      domain: domain,
      path: "/"
    });
  },

  logout: () => {
    const domain = SITE_CONFIG.rootDomain;

    Cookies.remove(AUTH_COOKIE_NAME, { domain: domain, path: "/" });
  },

  isAuthenticated: () => {
    return !!Cookies.get(AUTH_COOKIE_NAME);
  }
};
