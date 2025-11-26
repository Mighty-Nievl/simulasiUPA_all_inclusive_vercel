import Cookies from "js-cookie";

const AUTH_COOKIE_NAME = "upa_auth_token";

export const auth = {
  login: () => {
    // Set cookie that is accessible across subdomains
    // For localhost, we just use 'localhost'
    // For production, we use '.simupa.web.id'
    const hostname = window.location.hostname;
    const domain = hostname.includes("localhost") 
      ? "localhost" 
      : "." + hostname.split(".").slice(-2).join(".");

    Cookies.set(AUTH_COOKIE_NAME, "true", { 
      expires: 7, // 7 days
      domain: domain,
      path: "/"
    });
  },

  logout: () => {
    const hostname = window.location.hostname;
    const domain = hostname.includes("localhost") 
      ? "localhost" 
      : "." + hostname.split(".").slice(-2).join(".");

    Cookies.remove(AUTH_COOKIE_NAME, { domain: domain, path: "/" });
  },

  isAuthenticated: () => {
    return !!Cookies.get(AUTH_COOKIE_NAME);
  }
};
