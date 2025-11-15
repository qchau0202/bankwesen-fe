import type { User } from "@/config/mockData";
import { API_CONFIG } from "@/config/apiConfig";

// Set cookie helper
const setCookie = (token: string) => {
  document.cookie = `access_token=${token}; path=/; max-age=3600`;
};

// Authentication Service - Real Backend Calls
export const authService = {
  // POST: /api/v1/auth/login
  // Backend route: router = APIRouter(prefix="/api/v1/auth")
  login: async (username: string, password: string): Promise<{ status: number; data?: { user: User; token: string }; error?: string }> => {
    try {
      const url = `${API_CONFIG.AUTH_SERVICE_URL}/api/v1/auth/login`;
      const requestBody = JSON.stringify({ username, password });
      
      // Build headers as plain object - use literal header name to ensure it's set correctly
      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        "X-API-Key": API_CONFIG.API_KEY,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: requestBody,
      });

      // Handle network errors and non-JSON responses
      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          status: response.status || 500,
          error: text || `Failed to connect to authentication service. Status: ${response.status}`,
        };
      }

      try {
        responseData = await response.json();
      } catch (jsonError) {
        // Response is not JSON (network error, server down, etc.)
        return {
          status: response.status || 500,
          error: `Failed to parse response from authentication service. Please ensure the auth service is running on ${API_CONFIG.AUTH_SERVICE_URL}`,
        };
      }

      if (!response.ok) {
        // Handle error response
        console.log("Backend login error response:", responseData);
        const errorMessage = responseData.detail || responseData.message || "Invalid username or password";
        return { status: response.status, error: errorMessage };
      }

      // Success response: TokenResponse
      console.log("Backend login response:", responseData);
      console.log("Backend user_info:", responseData.user_info);
      const { access_token, user_info } = responseData;
      
      if (!access_token || !user_info) {
        return {
          status: 500,
          error: "Invalid response format from authentication service",
        };
      }
      
      const user: User = {
        customerId: user_info.userid || user_info.customerId,
        username: user_info.username,
        full_name: user_info.full_name,
        email: user_info.email,
        phone_number: user_info.phone_number,
        balance: user_info.balance,
      };

      // Store token and user
      setCookie(access_token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("accessToken", access_token);

      return {
        status: 200,
        data: { user, token: access_token },
      };
    } catch (error) {
      console.error("Login error:", error);
      // Network error - service might not be running or CORS issue
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? `Cannot connect to authentication service at ${API_CONFIG.AUTH_SERVICE_URL}. Please ensure the service is running and CORS is properly configured.`
        : error instanceof Error ? error.message : "Failed to connect to authentication service";
      return {
        status: 500,
        error: errorMessage,
      };
    }
  },

  // GET: /api/v1/auth/me - Get user info after login
  // Backend route: router = APIRouter(prefix="/api/v1/auth")
  // Returns: SuccessResponse with data: { userid, username, role }
  getUserInfo: async (): Promise<{ status: number; data?: User; error?: string }> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return { status: 401, error: "Unauthorized" };
      }

      const url = `${API_CONFIG.AUTH_SERVICE_URL}/api/v1/auth/me`;
      
      // Build headers as plain object
      const headers: { [key: string]: string } = {
        "Authorization": `Bearer ${token}`,
      };

      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Verify token is still valid using /me endpoint
        const response = await fetch(url, {
          method: "GET",
          headers: headers,
        });

        if (response.ok) {
          return { status: 200, data: user };
        } else {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("accessToken");
          return { status: 401, error: "Unauthorized - Token expired" };
        }
      }

      // If no stored user, fetch minimal info from /me endpoint
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        return { status: response.status, error: "Unauthorized" };
      }

      const responseData = await response.json();
      console.log("Backend /me response:", responseData);
      console.log("Backend /me user data:", responseData.data);
      const userInfo = responseData.data;

      const user: User = {
        customerId: userInfo.userid || userInfo.customerId,
        username: userInfo.username,
        full_name: userInfo.full_name,
        email: userInfo.email,
        phone_number: userInfo.phone_number,
        balance: userInfo.balance,
      };

      return { status: 200, data: user };
    } catch (error) {
      console.error("Get user info error:", error);
      return { status: 500, error: "Failed to fetch user information" };
    }
  },
};