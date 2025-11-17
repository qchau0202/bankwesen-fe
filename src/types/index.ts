export interface User {
  customerId: string
  username: string
  full_name: string
  email: string
  phone_number: string
  balance: number
}

export interface SemesterTuition {
  id: string
  name: string
  amount: number
  status: "debt" | "paid"
  schoolYear: string
}

export interface Student {
  studentId: string
  studentName: string
  tuitionAmount: number
  semesters: SemesterTuition[]
}

export interface Payment {
  id: string
  userId: string
  studentId: string
  studentName: string
  tuitionAmount: number
  status: "pending" | "completed" | "cancelled" | "failed"
  createdAt: string
  otpAttempts: number
  isLocked: boolean
  semesters: SemesterTuition[]
}

export interface OTP {
  code: string
  paymentId: string
  expiresAt: number
  attempts: number
  isExpired: boolean
}

export interface Transaction {
  id: string
  paymentId: string
  customerId: string
  studentId: string
  studentName: string
  amount: number
  status: "success" | "failed"
  createdAt: string
  semesters: SemesterTuition[]
}

