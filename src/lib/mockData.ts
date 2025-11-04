// Predefined mock data for all scenarios

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  transactionHistory: string[]; // Transaction IDs
}

export interface Student {
  studentId: string;
  studentName: string;
  tuitionAmount: number;
}

export interface Payment {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  tuitionAmount: number;
  status: "pending" | "completed" | "cancelled" | "failed";
  createdAt: string;
  otpAttempts: number;
  isLocked: boolean;
}

export interface OTP {
  code: string;
  paymentId: string;
  expiresAt: number; // Unix timestamp
  attempts: number;
  isExpired: boolean;
}

export interface Transaction {
  id: string;
  paymentId: string;
  userId: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: "success" | "failed";
  createdAt: string;
}

// Predefined Users (with different balance scenarios)
export const MOCK_USERS: User[] = [
  {
    id: "user1",
    username: "john_doe",
    password: "password123",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "0912345678",
    balance: 50000000, // 50M - enough for tuition
    transactionHistory: [],
  },
  {
    id: "user2",
    username: "jane_smith",
    password: "password123",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "0987654321",
    balance: 10000000, // 10M - enough for some tuition
    transactionHistory: [],
  },
  {
    id: "user3",
    username: "bob_wilson",
    password: "password123",
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    phone: "0923456789",
    balance: 5000000, // 5M - not enough for high tuition
    transactionHistory: [],
  },
];

// Predefined Students with Tuition
export const MOCK_STUDENTS: Student[] = [
  {
    studentId: "SV001",
    studentName: "Nguyen Van A",
    tuitionAmount: 15000000, // 15M
  },
  {
    studentId: "SV002",
    studentName: "Tran Thi B",
    tuitionAmount: 20000000, // 20M
  },
  {
    studentId: "SV003",
    studentName: "Le Van C",
    tuitionAmount: 12000000, // 12M
  },
  {
    studentId: "SV004",
    studentName: "Pham Thi D",
    tuitionAmount: 30000000, // 30M - high tuition
  },
  {
    studentId: "SV005",
    studentName: "Hoang Van E",
    tuitionAmount: 8000000, // 8M
  },
];

// In-memory storage for payments, OTPs, and transactions
let payments: Payment[] = [];
let otps: Map<string, OTP> = new Map();
let transactions: Transaction[] = [];

// Load transactions from localStorage
const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem("transactions");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save transactions to localStorage
const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions:", error);
  }
};

// Initialize transactions from localStorage
transactions = loadTransactions();

// Initialize with some sample data
export const initializeMockData = () => {
  // Store users in localStorage if not exists
  const existingUsers = localStorage.getItem("users");
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    localStorage.setItem("users", JSON.stringify(MOCK_USERS));
  }
};

// Get mock data storage
export const getMockStorage = () => ({
  payments,
  otps,
  transactions,
  setPayments: (newPayments: Payment[]) => {
    payments = newPayments;
  },
  setOTP: (paymentId: string, otp: OTP) => {
    otps.set(paymentId, otp);
  },
  getOTP: (paymentId: string) => {
    return otps.get(paymentId);
  },
  deleteOTP: (paymentId: string) => {
    otps.delete(paymentId);
  },
  addTransaction: (transaction: Transaction) => {
    transactions.push(transaction);
    saveTransactions(transactions);
  },
  getTransactions: () => {
    // Reload from localStorage to ensure we have the latest data
    transactions = loadTransactions();
    return transactions;
  },
});