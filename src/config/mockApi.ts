import { getMockStorage, loadStudentTuitions, saveStudentTuitions } from "./mockData";
import type {
  User,
  Transaction,
  SemesterTuition,
} from "./mockData";

// 3. Transaction Service API (still using mock for transaction history)
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

    const updatedSemesters: SemesterTuition[] = payment.semesters.map((semester) => {
      const updated: SemesterTuition = {
        ...semester,
        status: "paid",
      };
      return updated;
    });
    payment.semesters = updatedSemesters;

    const studentTuitions = loadStudentTuitions();
    const studentIndex = studentTuitions.findIndex((s) => s.studentId === payment.studentId);
    if (studentIndex !== -1) {
      const student = studentTuitions[studentIndex];
      const semesters: SemesterTuition[] = student.semesters.map((semester) => {
        const paidSemester = updatedSemesters.find((s) => s.id === semester.id);
        if (paidSemester) {
          return { ...semester, status: "paid" };
        }
        return semester;
      });
      const remaining = semesters
        .filter((semester) => semester.status !== "paid")
        .reduce((sum, semester) => sum + semester.amount, 0);
      studentTuitions[studentIndex] = {
        ...student,
        semesters,
        tuitionAmount: remaining,
      };
      saveStudentTuitions(studentTuitions);
    }

    // Update users array
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: User) => u.customerId === user.customerId);
    if (userIndex !== -1) {
      users[userIndex].balance = user.balance;
      users[userIndex].transactionHistory.push(`transaction_${Date.now()}`);
      localStorage.setItem("users", JSON.stringify(users));
    }

    // Create transaction
    const transaction: Transaction = {
      id: `transaction_${Date.now()}`,
      paymentId,
      customerId: user.customerId,
      studentId: payment.studentId,
      studentName: payment.studentName,
      amount: payment.tuitionAmount,
      status: "success",
      createdAt: new Date().toISOString(),
      semesters: updatedSemesters,
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
  getTransactionHistory: async (customerId: string): Promise<{ status: number; data?: Transaction[]; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storage = getMockStorage();
    const customerTransactions = storage.getTransactions().filter((t) => t.customerId === customerId);

    return { status: 200, data: customerTransactions };
  },
};