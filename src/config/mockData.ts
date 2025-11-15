export interface User {
  customerId: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  balance: number;
}

export interface SemesterTuition {
  id: string;
  name: string;
  amount: number;
  status: "debt" | "paid";
  schoolYear: string;
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
  customerId: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: "success" | "failed";
  createdAt: string;
  semesters: SemesterTuition[];
}

// Predefined Students with Tuition
export const MOCK_STUDENTS: Student[] = [
  {
    studentId: "SV001",
    studentName: "Nguyen Van A",
    tuitionAmount: 150000000,
    semesters: [
      // 2025-2026
      { id: "SV001_2025_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: "2025-2026" },
      { id: "SV001_2025_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: "2025-2026" },
      // 2026-2027
      { id: "SV001_2026_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV001_2026_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: "2026-2027" },
      // 2027-2028
      { id: "SV001_2027_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: "2027-2028" },
      { id: "SV001_2027_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: "2027-2028" },
    ],
  },
  {
    studentId: "SV002",
    studentName: "Tran Thi B",
    tuitionAmount: 100000000,
    semesters: [
      { id: "SV002_2023_S1", name: "Semester 1", amount: 8000000, status: "debt", schoolYear: "2023-2024" },
      { id: "SV002_2023_S2", name: "Semester 2", amount: 8000000, status: "debt", schoolYear: "2023-2024" },
      { id: "SV002_2024_S1", name: "Semester 1", amount: 9000000, status: "debt", schoolYear: "2024-2025" },
      { id: "SV002_2024_S2", name: "Semester 2", amount: 9000000, status: "debt", schoolYear: "2024-2025" },
      { id: "SV002_2025_S1", name: "Semester 1", amount: 10000000, status: "debt", schoolYear: "2025-2026" },
      { id: "SV002_2027_S2", name: "Semester 2", amount: 12000000, status: "debt", schoolYear: "2027-2028" },
    ],
  },
  {
    studentId: "SV003",
    studentName: "Le Van C",
    tuitionAmount: 60000000,
    semesters: [
      { id: "SV003_2023_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: "2023-2024" },
      { id: "SV003_2023_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: "2023-2024" },
      { id: "SV003_2024_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: "2024-2025" },
      { id: "SV003_2024_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: "2024-2025" },
      { id: "SV003_2025_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: "2025-2026" },
      { id: "SV003_2025_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: "2025-2026" },
      { id: "SV003_2026_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV003_2026_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV003_2027_S1", name: "Semester 1", amount: 6000000, status: "debt", schoolYear: "2027-2028" },
      { id: "SV003_2027_S2", name: "Semester 2", amount: 6000000, status: "debt", schoolYear: "2027-2028" },
    ],
  },
  {
    studentId: "SV004",
    studentName: "Pham Thi D",
    tuitionAmount: 150000000,
    semesters: [
      { id: "SV004_2023_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: "2023-2024" },
      { id: "SV004_2023_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: "2023-2024" },
      { id: "SV004_2026_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV004_2026_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV004_2027_S1", name: "Semester 1", amount: 15000000, status: "debt", schoolYear: "2027-2028" },
      { id: "SV004_2027_S2", name: "Semester 2", amount: 15000000, status: "debt", schoolYear: "2027-2028" },
    ],
  },
  {
    studentId: "SV005",
    studentName: "Hoang Van E",
    tuitionAmount: 40000000,
    semesters: [
      { id: "SV005_2025_S1", name: "Semester 1", amount: 4000000, status: "debt", schoolYear: "2025-2026" },
      { id: "SV005_2025_S2", name: "Semester 2", amount: 4000000, status: "debt", schoolYear: "2025-2026" },
      { id: "SV005_2026_S1", name: "Semester 1", amount: 4000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV005_2026_S2", name: "Semester 2", amount: 4000000, status: "debt", schoolYear: "2026-2027" },
      { id: "SV005_2027_S1", name: "Semester 1", amount: 4000000, status: "debt", schoolYear: "2027-2028" },
      { id: "SV005_2027_S2", name: "Semester 2", amount: 4000000, status: "debt", schoolYear: "2027-2028" },
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