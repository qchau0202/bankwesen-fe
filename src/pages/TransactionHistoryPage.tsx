import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionHistory from "@/components/transactions/TransactionHistory";
import { paymentService, type PaymentHistoryRecord } from "@/services/paymentService";

type SemesterFilter = "Semester I" | "Semester II" | "all";

const TransactionHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<PaymentHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [selectedSemester, setSelectedSemester] = useState<SemesterFilter>("all");
  const [targetTx, setTargetTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  // Check if user is logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!currentUser.customerId || !accessToken) {
      navigate("/auth");
    }
  }, [currentUser.customerId, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!currentUser.customerId || !accessToken) {
        return;
      }

      try {
        const response = await paymentService.getPaymentHistory();
        if (response.status === 200 && response.data) {
          setRecords(response.data.payments || []);
          setError(null);
        } else {
          setRecords([]);
          setError(response.error || "Failed to load payment history.");
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setError("Unexpected error while fetching payment history.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser.customerId, navigate]);

  // Parse query params for tx, y (year), sem (1 or 2)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tx = params.get("tx");
    const y = params.get("y");
    const sem = params.get("sem");
    if (y) {
      // y can be a year string like "2023-2024" or a single year number
      // If it's a number, convert to year format
      const yr = Number(y);
      if (!Number.isNaN(yr)) {
        setSelectedYear(`${yr}-${yr + 1}`);
      } else {
        // Already in format "2023-2024"
        setSelectedYear(y);
      }
    }
    if (sem === "1") setSelectedSemester("Semester I");
    if (sem === "2") setSelectedSemester("Semester II");
    if (sem && sem.toLowerCase() === "semester i") setSelectedSemester("Semester I");
    if (sem && sem.toLowerCase() === "semester ii") setSelectedSemester("Semester II");
    if (tx) setTargetTx(tx);
  }, [location.search]);

  // Scroll to targeted transaction when data arrives
  useEffect(() => {
    if (!loading && targetTx) {
      const el = document.getElementById(`tx-${targetTx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 2000);
      }
    }
  }, [loading, targetTx]);

  const availableYears = Array.from(
    new Set(
      records.flatMap((record) =>
        (record.tuitions || [])
          .map((tuition) => tuition.academic_year)
          .filter(Boolean)
      )
    )
  ).sort((a, b) => {
    // Sort by the first year in the string (e.g., "2023-2024" -> 2023)
    const yearA = parseInt(a?.split("-")[0] ?? "0");
    const yearB = parseInt(b?.split("-")[0] ?? "0");
    return yearA - yearB;
  });

  const filteredTransactions =
    selectedYear === "all" && selectedSemester === "all"
      ? records
      : records.filter((record) => {
          const tuitions = record.tuitions || [];
          return tuitions.some((tuition) => {
            const yearMatch = selectedYear === "all" ? true : tuition.academic_year === selectedYear;
            const semMatch = selectedSemester === "all" ? true : tuition.semester === selectedSemester;
            return yearMatch && semMatch;
          });
        });

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-semibold">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/home")}
            className="font-bold mb-6"
          >
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">TDTU ibanking Transaction History</h1>
          <p className="text-muted-foreground">View your past tuition payment transactions</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="filter-year" className="block text-sm font-medium mb-1">
                    School Year
                  </label>
                  <select
                    id="filter-year"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(e.target.value === "all" ? "all" : e.target.value)
                    }
                  >
                    <option value="all">All years</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="filter-semester" className="block text-sm font-medium mb-1">
                    Semester
                  </label>
                  <select
                    id="filter-semester"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value as SemesterFilter)}
                  >
                    <option value="all">All semesters</option>
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {records.length === 0 && !error ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No transactions found. Start by making a tuition payment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <TransactionHistory
              records={filteredTransactions}
              selectedYear={selectedYear === "all" ? null : selectedYear}
              selectedSemester={selectedSemester === "all" ? null : selectedSemester}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;

