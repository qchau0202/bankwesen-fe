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

export interface SemesterTuition {
  id: string;
  name: string;
  amount: number;
  status: "debt" | "paid";
  schoolYear: number; // e.g., 2023, 2024 ...
}

export interface Student {
  studentId: string;
  studentName: string;
  tuitionAmount: number;
  semesters: SemesterTuition[];
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
  semesters: SemesterTuition[];
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
  semesters: SemesterTuition[];
}

// Predefined Users (with different balance scenarios)
export const MOCK_USERS: User[] = [
  {
    id: "user1",
    username: "john_doe",
    password: "123456",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "0912345678",
    balance: 1000000000000,
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
    tuitionAmount: 150000000,
    semesters: [
      // 2025
      { id: "SV001_2025_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: 2025 },
      { id: "SV001_2025_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: 2025 },
      // 2026
      { id: "SV001_2026_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: 2026 },
      { id: "SV001_2026_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: 2026 },
      // 2027
      { id: "SV001_2027_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: 2027 },
      { id: "SV001_2027_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: 2027 },
    ],
  },
  {
    studentId: "SV002",
    studentName: "Tran Thi B",
    tuitionAmount: 100000000,
    semesters: [
      { id: "SV002_2023_S1", name: "Semester 1", amount: 8000000, status: "debt", schoolYear: 2023 },
      { id: "SV002_2023_S2", name: "Semester 2", amount: 8000000, status: "debt", schoolYear: 2023 },
      { id: "SV002_2024_S1", name: "Semester 1", amount: 9000000, status: "debt", schoolYear: 2024 },
      { id: "SV002_2024_S2", name: "Semester 2", amount: 9000000, status: "debt", schoolYear: 2024 },
      { id: "SV002_2025_S1", name: "Semester 1", amount: 10000000, status: "debt", schoolYear: 2025 },
      { id: "SV002_2027_S2", name: "Semester 2", amount: 12000000, status: "debt", schoolYear: 2027 },
    ],
  },
  {
    studentId: "SV003",
    studentName: "Le Van C",
    tuitionAmount: 60000000,
    semesters: [
      { id: "SV003_2023_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: 2023 },
      { id: "SV003_2023_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: 2023 },
      { id: "SV003_2024_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: 2024 },
      { id: "SV003_2024_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: 2024 },
      { id: "SV003_2025_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: 2025 },
      { id: "SV003_2025_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: 2025 },
      { id: "SV003_2026_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: 2026 },
      { id: "SV003_2026_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: 2026 },
      { id: "SV003_2027_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: 2027 },
      { id: "SV003_2027_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: 2027 },
    ],
  },
  {
    studentId: "SV004",
    studentName: "Pham Thi D",
    tuitionAmount: 150000000,
    semesters: [
      { id: "SV004_2023_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: 2023 },
      { id: "SV004_2023_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: 2023 },
      { id: "SV004_2026_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: 2026 },
      { id: "SV004_2026_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: 2026 },
      { id: "SV004_2027_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: 2027 },
      { id: "SV004_2027_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: 2027 },
    ],
  },
  {
    studentId: "SV005",
    studentName: "Hoang Van E",
    tuitionAmount: 40000000,
    semesters: [
      { id: "SV005_2025_S1", name: "Semester 1", amount: 4000000, status: "debt", schoolYear: 2025 },
      { id: "SV005_2025_S2", name: "Semester 2", amount: 4000000, status: "debt", schoolYear: 2025 },
      { id: "SV005_2026_S1", name: "Semester 1", amount: 4000000, status: "debt", schoolYear: 2026 },
      { id: "SV005_2026_S2", name: "Semester 2", amount: 4000000, status: "debt", schoolYear: 2026 },
      { id: "SV005_2027_S1", name: "Semester 1", amount: 4000000, status: "debt", schoolYear: 2027 },
      { id: "SV005_2027_S2", name: "Semester 2", amount: 4000000, status: "debt", schoolYear: 2027 },
    ],
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

  const existingStudents = localStorage.getItem("studentTuitions");
  if (!existingStudents) {
    localStorage.setItem("studentTuitions", JSON.stringify(MOCK_STUDENTS));
  }
};

export const loadStudentTuitions = (): Student[] => {
  try {
    const stored = localStorage.getItem("studentTuitions");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load student tuitions:", error);
  }

  return JSON.parse(JSON.stringify(MOCK_STUDENTS));
};

export const saveStudentTuitions = (students: Student[]) => {
  try {
    localStorage.setItem("studentTuitions", JSON.stringify(students));
  } catch (error) {
    console.error("Failed to save student tuitions:", error);
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