import { API_CONFIG } from "@/config/apiConfig";
import type { Student, SemesterTuition } from "@/config/mockData";

// Backend response types
interface TuitionResponse {
  tuitionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  semester: string;
  academic_year: string;
  tuition_amount: number;
  due_date: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface StudentTuitionListResponse {
  studentId: string;
  studentName: string;
  studentEmail: string;
  tuitions: TuitionResponse[];
  total_tuitions: number;
  total_debt: number;
  total_debt_vnd: string;
}

// Map backend status to frontend status
const mapStatus = (status: string): "debt" | "paid" => {
  if (status === "paid") return "paid";
  return "debt"; // "debt", "pending", or any other status
};

// Map backend tuition to frontend semester format
const mapTuitionToSemester = (tuition: TuitionResponse): SemesterTuition => {
  return {
    id: tuition.tuitionId,
    name: tuition.semester,
    amount: tuition.tuition_amount,
    status: mapStatus(tuition.status),
    schoolYear: tuition.academic_year,
  };
};

// Map backend response to frontend Student format
const mapToStudent = (response: StudentTuitionListResponse): Student => {
  const semesters: SemesterTuition[] = response.tuitions.map(mapTuitionToSemester);
  
  // Calculate total outstanding (only debt status)
  const totalOutstanding = semesters
    .filter((sem) => sem.status === "debt")
    .reduce((sum, sem) => sum + sem.amount, 0);

  return {
    studentId: response.studentId,
    studentName: response.studentName,
    tuitionAmount: totalOutstanding,
    semesters,
  };
};

// Tuition Service - Real Backend Calls
export const tuitionService = {
  // GET: /api/tuition/{studentId}
  getTuitionInfo: async (studentId: string): Promise<{ status: number; data?: Student; error?: string }> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return { status: 401, error: "Unauthorized - Please login first" };
      }

      const url = `${API_CONFIG.TUITION_SERVICE_URL}/api/tuition/${studentId}`;
      
      const headers: { [key: string]: string } = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-Key": API_CONFIG.API_KEY,
      };

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      // Handle network errors and non-JSON responses
      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return {
          status: response.status || 500,
          error: text || `Failed to connect to tuition service. Status: ${response.status}`,
        };
      }

      try {
        responseData = await response.json();
      } catch (jsonError) {
        return {
          status: response.status || 500,
          error: `Failed to parse response from tuition service. Please ensure the service is running on ${API_CONFIG.TUITION_SERVICE_URL}`,
        };
      }

      if (!response.ok) {
        const errorMessage = responseData.detail || responseData.message || "Failed to fetch tuition information";
        return { status: response.status, error: errorMessage };
      }

      // Success response: StudentTuitionListResponse
      const student = mapToStudent(responseData);
      return { status: 200, data: student };
    } catch (error) {
      console.error("Get tuition info error:", error);
      const errorMessage = error instanceof TypeError && error.message.includes('fetch')
        ? `Cannot connect to tuition service at ${API_CONFIG.TUITION_SERVICE_URL}. Please ensure the service is running and CORS is properly configured.`
        : error instanceof Error ? error.message : "Failed to connect to tuition service";
      return {
        status: 500,
        error: errorMessage,
      };
    }
  },

  // Check balance (this still uses localStorage as it's user balance, not tuition-specific)
  checkBalance: (_userId: string, tuitionAmount: number): { hasEnough: boolean; balance: number } => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const balance = user.balance || 0;
    return {
      hasEnough: balance >= tuitionAmount,
      balance,
    };
  },
};

