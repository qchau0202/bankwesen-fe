const LOGIN_ROUTE = "/auth";

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === LOGIN_ROUTE) {
    return;
  }

  window.location.replace(LOGIN_ROUTE);
};

const clearSession = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
  } catch (error) {
    console.error("Failed to clear session data:", error);
  }
};

export const handleUnauthorized = () => {
  clearSession();
  redirectToLogin();
};

export const getTokenOrRedirect = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleUnauthorized();
      return null;
    }
    return token;
  } catch (error) {
    console.error("Failed to read access token:", error);
    handleUnauthorized();
    return null;
  }
};