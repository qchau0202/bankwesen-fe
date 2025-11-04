// Mock API functions that simulate backend API calls

import { getMockStorage, MOCK_STUDENTS, MOCK_USERS } from "./mockData";
import type { User, Student, Payment, OTP, Transaction } from "./mockData";

// Simulate JWT token
const generateJWT = (userId: string): string => {
  return `mock_jwt_token_${userId}_${Date.now()}`;
};

// Simulate setting cookie
const setCookie = (token: string) => {
  document.cookie = `access_token=${token}; path=/; max-age=3600`;
};

// 1. Authentication API
export const authApi = {
  // POST: /api/auth/login
  login: async (username: string, password: string): Promise<{ status: number; data?: { user: User; token: string }; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: User) => u.username === username && u.password === password);

    if (!user) {
      return { status: 401, error: "Invalid username or password" };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    const token = generateJWT(user.id);
    setCookie(token);

    // Store user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("accessToken", token);

    return {
      status: 200,
      data: { user: userWithoutPassword as User, token },
    };
  },

  // GET: /api/tuition/{studentID} - Get user info after login
  getUserInfo: async (): Promise<{ status: number; data?: User; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.id) {
      return { status: 401, error: "Unauthorized" };
    }

    return { status: 200, data: user };
  },
};

// 2. Tuition Service API
export const tuitionApi = {
  // GET: /api/tuition/{studentID}
  getTuitionInfo: async (studentId: string): Promise<{ status: number; data?: Student; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const student = MOCK_STUDENTS.find((s) => s.studentId === studentId);

    if (!student) {
      return { status: 404, error: "Student not found" };
    }

    return { status: 200, data: student };
  },

  // Check if user has enough balance
  checkBalance: (userId: string, tuitionAmount: number): { hasEnough: boolean; balance: number } => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const balance = user.balance || 0;
    return {
      hasEnough: balance >= tuitionAmount,
      balance,
    };
  },
};

// 3. Payment Service API
export const paymentApi = {
  // POST: /api/payment/
  createPayment: async (studentId: string, studentName: string, tuitionAmount: number): Promise<{ status: number; data?: Payment; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.id) {
      return { status: 401, error: "Unauthorized" };
    }

    // Check balance
    const balanceCheck = tuitionApi.checkBalance(user.id, tuitionAmount);
    if (!balanceCheck.hasEnough) {
      return { status: 400, error: "Insufficient balance" };
    }

    const storage = getMockStorage();

    // Check if payment is already locked/processing
    const existingPayment = storage.payments.find(
      (p) => p.userId === user.id && p.studentId === studentId && (p.status === "pending" || p.isLocked)
    );

    if (existingPayment) {
      return { status: 409, error: "Payment already in progress for this student" };
    }

    const payment: Payment = {
      id: `payment_${Date.now()}`,
      userId: user.id,
      studentId,
      studentName,
      tuitionAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      otpAttempts: 0,
      isLocked: true, // Lock the payment
    };

    storage.setPayments([...storage.payments, payment]);

    return { status: 201, data: payment };
  },

  // GET: /api/payment/{paymentID}
  getPayment: async (paymentId: string): Promise<{ status: number; data?: Payment; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const storage = getMockStorage();
    const payment = storage.payments.find((p) => p.id === paymentId);

    if (!payment) {
      return { status: 404, error: "Payment not found" };
    }

    return { status: 200, data: payment };
  },

  // POST: /api/payment/{paymentID}/cancel
  cancelPayment: async (paymentId: string): Promise<{ status: number; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storage = getMockStorage();
    const paymentIndex = storage.payments.findIndex((p) => p.id === paymentId);

    if (paymentIndex === -1) {
      return { status: 404, error: "Payment not found" };
    }

    storage.payments[paymentIndex].status = "cancelled";
    storage.payments[paymentIndex].isLocked = false;
    storage.deleteOTP(paymentId);

    return { status: 200 };
  },
};

// 4. OTP Service API
export const otpApi = {
  // POST: /api/otp/request -> POST: /api/payment/{paymentID}/otp
  requestOTP: async (paymentId: string): Promise<{ status: number; data?: { otp: string; expiresAt: number }; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storage = getMockStorage();
    const payment = storage.payments.find((p) => p.id === paymentId);

    if (!payment) {
      return { status: 404, error: "Payment not found" };
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60000; // 60 seconds

    const otp: OTP = {
      code: otpCode,
      paymentId,
      expiresAt,
      attempts: 0,
      isExpired: false,
    };

    storage.setOTP(paymentId, otp);

    // In real app, send email here
    console.log(`OTP sent to email: ${otpCode} (expires in 60s)`);

    return {
      status: 200,
      data: { otp: otpCode, expiresAt },
    };
  },

  // POST: /api/otp/verify -> POST: /api/payment/{paymentID}/verify-otp
  verifyOTP: async (paymentId: string, otpCode: string): Promise<{ status: number; data?: { success: boolean; message: string }; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storage = getMockStorage();
    const otp = storage.getOTP(paymentId);
    const payment = storage.payments.find((p) => p.id === paymentId);

    if (!payment) {
      return { status: 404, error: "Payment not found" };
    }

    if (!otp) {
      return { status: 400, error: "OTP not found. Please request a new OTP." };
    }

    // Check if expired
    if (Date.now() > otp.expiresAt) {
      otp.isExpired = true;
      storage.setOTP(paymentId, otp);
      return { status: 400, error: "OTP_EXPIRED" };
    }

    // Check attempts (max 3)
    if (otp.attempts >= 3) {
      payment.status = "cancelled";
      payment.isLocked = false;
      storage.deleteOTP(paymentId);
      return { status: 400, error: "MAX_ATTEMPTS_REACHED" };
    }

    // Verify OTP
    if (otp.code !== otpCode) {
      otp.attempts += 1;
      payment.otpAttempts = otp.attempts;
      storage.setOTP(paymentId, otp);

      const remainingAttempts = 3 - otp.attempts;
      if (remainingAttempts === 0) {
        payment.status = "cancelled";
        payment.isLocked = false;
        storage.deleteOTP(paymentId);
        return { status: 400, error: "MAX_ATTEMPTS_REACHED" };
      }

      return { status: 400, error: `Invalid OTP. ${remainingAttempts} attempts remaining.` };
    }

    // OTP verified successfully
    storage.deleteOTP(paymentId);
    return {
      status: 200,
      data: { success: true, message: "OTP verified successfully" },
    };
  },

  // POST: /api/otp/resend -> POST: /api/payment/{paymentID}/otp
  resendOTP: async (paymentId: string): Promise<{ status: number; data?: { otp: string; expiresAt: number }; error?: string }> => {
    return otpApi.requestOTP(paymentId);
  },
};

// 5. Transaction Service API
export const transactionApi = {
  // POST: /api/transaction
  createTransaction: async (paymentId: string): Promise<{ status: number; data?: Transaction; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const storage = getMockStorage();
    const payment = storage.payments.find((p) => p.id === paymentId);

    if (!payment) {
      return { status: 404, error: "Payment not found" };
    }

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

    // Check balance again before transaction
    if (user.balance < payment.tuitionAmount) {
      payment.status = "failed";
      payment.isLocked = false;
      return { status: 400, error: "Insufficient balance" };
    }

    // Deduct balance
    user.balance -= payment.tuitionAmount;
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Update users array
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].balance = user.balance;
      users[userIndex].transactionHistory.push(`transaction_${Date.now()}`);
      localStorage.setItem("users", JSON.stringify(users));
    }

    // Create transaction
    const transaction: Transaction = {
      id: `transaction_${Date.now()}`,
      paymentId,
      userId: user.id,
      studentId: payment.studentId,
      studentName: payment.studentName,
      amount: payment.tuitionAmount,
      status: "success",
      createdAt: new Date().toISOString(),
    };

    storage.addTransaction(transaction);

    // Update payment status
    payment.status = "completed";
    payment.isLocked = false;

    return { status: 201, data: transaction };
  },

  // GET: /api/transaction/{transactionID}
  getTransaction: async (transactionId: string): Promise<{ status: number; data?: Transaction; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const storage = getMockStorage();
    const transaction = storage.getTransactions().find((t) => t.id === transactionId);

    if (!transaction) {
      return { status: 404, error: "Transaction not found" };
    }

    return { status: 200, data: transaction };
  },

  // GET: /api/payment/{paymentID} -> GET: /api/transaction/{transactionID} (for history)
  getTransactionHistory: async (userId: string): Promise<{ status: number; data?: Transaction[]; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storage = getMockStorage();
    const userTransactions = storage.getTransactions().filter((t) => t.userId === userId);

    return { status: 200, data: userTransactions };
  },
};

