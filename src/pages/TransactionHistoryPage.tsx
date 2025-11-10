import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { transactionApi } from "@/lib/mockApi";
import type { Transaction } from "@/lib/mockData";
import TransactionHistory from "@/components/transactions/TransactionHistory";

const TransactionHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedSemester, setSelectedSemester] = useState<"Semester 1" | "Semester 2" | "all">("all");
  const [targetTx, setTargetTx] = useState<string | null>(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser.id) {
        navigate("/auth");
        return;
      }

      try {
        const response = await transactionApi.getTransactionHistory(currentUser.id);
        if (response.status === 200 && response.data) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser.id, navigate]);

  // Parse query params for tx, y (year), sem (1 or 2)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tx = params.get("tx");
    const y = params.get("y");
    const sem = params.get("sem");
    if (y) {
      const yr = Number(y);
      if (!Number.isNaN(yr)) {
        setSelectedYear(yr);
      }
    }
    if (sem === "1") setSelectedSemester("Semester 1");
    if (sem === "2") setSelectedSemester("Semester 2");
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
      transactions.flatMap((t) => (t.semesters || []).map((s) => s.schoolYear))
    )
  ).sort((a, b) => a - b);

  const filteredTransactions =
    selectedYear === "all" && selectedSemester === "all"
      ? transactions
      : transactions.filter((t) => {
          const semesters = t.semesters || [];
          return semesters.some((s) => {
            const yearMatch = selectedYear === "all" ? true : s.schoolYear === selectedYear;
            const semMatch =
              selectedSemester === "all" ? true : s.name === selectedSemester;
            return yearMatch && semMatch;
          });
        });

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
        <div className="max-w-4xl mx-auto">
          <p>Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">View your past tuition payment transactions</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => navigate("/home")}
            className="font-bold"
          >
            Back to Home
          </Button>

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
                      setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))
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
                    onChange={(e) => setSelectedSemester(e.target.value as any)}
                  >
                    <option value="all">All semesters</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No transactions found. Start by making a tuition payment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <TransactionHistory
              transactions={filteredTransactions}
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

