import { API_CONFIG } from "@/config/apiConfig";
import type { Payment, SemesterTuition } from "@/config/mockData";
import { getTokenOrRedirect, handleUnauthorized } from "@/services/sessionUtils";

// Backend response types
interface PaymentResponse {
  paymentId: string;
  customerId: string;
  tuitionIds: string[];
  idempotency_key: string;
  amount: number;
  status: string;
  otp_attempts: number;
  is_locked: boolean;
  created_at: string;
  expired_at?: string;
}

interface OTPVerifyResponse {
  success: boolean;
  message: string;
  payment?: PaymentResponse;
}

// Map backend PaymentResponse to frontend Payment format
const mapToPayment = (response: PaymentResponse, studentId: string, studentName: string, semesters: SemesterTuition[]): Payment => {
  // Find semesters that match the tuitionIds
  const paidSemesters = semesters.filter((sem) => response.tuitionIds.includes(sem.id));
  const tuitionAmount = paidSemesters.reduce((sum, sem) => sum + sem.amount, 0);

  return {
    id: response.paymentId,
    userId: response.customerId,
    studentId,
    studentName,
    tuitionAmount,
    status: response.status === "completed" ? "completed" : response.status === "cancelled" ? "cancelled" : response.status === "failed" ? "failed" : "pending",
    createdAt: response.created_at,
    otpAttempts: response.otp_attempts,
    isLocked: response.is_locked,
    semesters: paidSemesters,
  };
};

const updateCurrentUserBalance = (amountPaid: number) => {
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    return;
  }

  try {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const currentBalance = typeof parsedUser.balance === "number" ? parsedUser.balance : 0;
    const updatedBalance = Math.max(0, currentBalance - amountPaid);

    parsedUser.balance = updatedBalance;
    localStorage.setItem("currentUser", JSON.stringify(parsedUser));
  } catch (error) {
    console.error("Failed to update local user balance:", error);
  }
};

// Payment Service
export const paymentService = {
  // POST: /api/payment/
  createPayment: async (
    tuitionIds: string[],
    studentId?: string
  ): Promise<{ status: number; data?: PaymentResponse; error?: string }> => {
    try {
      const token = getTokenOrRedirect();
      if (!token) {
        return { status: 401, error: "Unauthorized - Please login first" };
      }

      const url = `${API_CONFIG.PAYMENT_SERVICE_URL}/api/payment/`;
      
      const requestBody: { tuitionIds: string[]; studentId?: string } = {
        tuitionIds,
      };
      if (studentId) {
        requestBody.studentId = studentId;
      }

      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-Key": API_CONFIG.API_KEY,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      // Handle network errors and non-JSON responses
      if (response.status === 401) {
        handleUnauthorized();
        return { status: 401, error: "Session expired. Please login again." };
      }

      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          status: response.status || 500,
          error: text || `Failed to connect to payment service. Status: ${response.status}`,
        };
      }

      try {
        responseData = await response.json();
      } catch (jsonError) {
        return {
          status: response.status || 500,
          error: `Failed to parse response from payment service. Please ensure the service is running on ${API_CONFIG.PAYMENT_SERVICE_URL}`,
        };
      }

      if (!response.ok) {
        const errorMessage = responseData.detail || responseData.message || "Failed to create payment";
        return { status: response.status, error: errorMessage };
      }

      // Success response: PaymentResponse
      return { status: 201, data: responseData };
    } catch (error) {
      console.error("Create payment error:", error);
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? `Cannot connect to payment service at ${API_CONFIG.PAYMENT_SERVICE_URL}. Please ensure the service is running and CORS is properly configured.`
        : error instanceof Error ? error.message : "Failed to connect to payment service";
      return {
        status: 500,
        error: errorMessage,
      };
    }
  },

  // POST: /api/payment/{paymentID}/verify-otp
  verifyOTP: async (
    paymentId: string,
    otpCode: string,
    studentId: string,
    studentName: string,
    semesters: SemesterTuition[]
  ): Promise<{ status: number; data?: Payment; error?: string }> => {
    try {
      const token = getTokenOrRedirect();
      if (!token) {
        return { status: 401, error: "Unauthorized - Please login first" };
      }

      const url = `${API_CONFIG.PAYMENT_SERVICE_URL}/api/payment/${paymentId}/verify-otp`;
      
      const requestBody = {
        otp_code: otpCode,
      };

      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-Key": API_CONFIG.API_KEY,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { status: 401, error: "Session expired. Please login again." };
      }

      let responseData: OTPVerifyResponse;
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          status: response.status || 500,
          error: text || `Failed to connect to payment service. Status: ${response.status}`,
        };
      }

      try {
        responseData = await response.json();
      } catch (jsonError) {
        return {
          status: response.status || 500,
          error: `Failed to parse response from payment service.`,
        };
      }

      if (!response.ok) {
        const errorMessage = responseData.message || "Failed to verify OTP";
        
        // Check for specific error types
        if (errorMessage.toLowerCase().includes("expired")) {
          return { status: response.status, error: "OTP_EXPIRED" };
        }
        if (errorMessage.toLowerCase().includes("max") || errorMessage.toLowerCase().includes("locked")) {
          return { status: response.status, error: "MAX_ATTEMPTS_REACHED" };
        }
        
        return { status: response.status, error: errorMessage };
      }

      // Success response: OTPVerifyResponse with payment
      if (responseData.success && responseData.payment) {
        const payment = mapToPayment(responseData.payment, studentId, studentName, semesters);
        updateCurrentUserBalance(payment.tuitionAmount);
        return { status: 200, data: payment };
      }

      return { status: 500, error: "Invalid response format" };
    } catch (error) {
      console.error("Verify OTP error:", error);
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? `Cannot connect to payment service at ${API_CONFIG.PAYMENT_SERVICE_URL}.`
        : error instanceof Error ? error.message : "Failed to verify OTP";
      return {
        status: 500,
        error: errorMessage,
      };
    }
  },

  // POST: /api/payment/{paymentID}/cancel
  cancelPayment: async (paymentId: string): Promise<{ status: number; error?: string }> => {
    try {
      const token = getTokenOrRedirect();
      if (!token) {
        return { status: 401, error: "Unauthorized - Please login first" };
      }

      const url = `${API_CONFIG.PAYMENT_SERVICE_URL}/api/payment/${paymentId}/cancel`;
      
      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-Key": API_CONFIG.API_KEY,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { status: 401, error: "Session expired. Please login again." };
      }

      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          status: response.status || 500,
          error: text || `Failed to connect to payment service. Status: ${response.status}`,
        };
      }

      try {
        responseData = await response.json();
      } catch (jsonError) {
        return {
          status: response.status || 500,
          error: `Failed to parse response from payment service.`,
        };
      }

      if (!response.ok) {
        const errorMessage = responseData.detail || responseData.message || "Failed to cancel payment";
        return { status: response.status, error: errorMessage };
      }

      return { status: 200 };
    } catch (error) {
      console.error("Cancel payment error:", error);
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? `Cannot connect to payment service at ${API_CONFIG.PAYMENT_SERVICE_URL}.`
        : error instanceof Error ? error.message : "Failed to cancel payment";
      return {
        status: 500,
        error: errorMessage,
      };
    }
  },

  // GET: /api/payment/{paymentID}
  getPayment: async (paymentId: string): Promise<{ status: number; data?: PaymentResponse; error?: string }> => {
    try {
      const token = getTokenOrRedirect();
      if (!token) {
        return { status: 401, error: "Unauthorized - Please login first" };
      }

      const url = `${API_CONFIG.PAYMENT_SERVICE_URL}/api/payment/${paymentId}`;
      
      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-Key": API_CONFIG.API_KEY,
      };

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { status: 401, error: "Session expired. Please login again." };
      }

      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          status: response.status || 500,
          error: text || `Failed to connect to payment service. Status: ${response.status}`,
        };
      }

      try {
        responseData = await response.json();
      } catch (jsonError) {
        return {
          status: response.status || 500,
          error: `Failed to parse response from payment service.`,
        };
      }

      if (!response.ok) {
        const errorMessage = responseData.detail || responseData.message || "Payment not found";
        return { status: response.status, error: errorMessage };
      }

      return { status: 200, data: responseData };
    } catch (error) {
      console.error("Get payment error:", error);
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? `Cannot connect to payment service at ${API_CONFIG.PAYMENT_SERVICE_URL}.`
        : error instanceof Error ? error.message : "Failed to get payment";
      return {
        status: 500,
        error: errorMessage,
      };
    }
  },
};