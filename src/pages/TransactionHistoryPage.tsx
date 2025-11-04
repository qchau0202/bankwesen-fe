import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { transactionApi } from "@/lib/mockApi";
import type { Transaction } from "@/lib/mockData";
import TransactionHistory from "@/components/transactions/TransactionHistory";

const TransactionHistoryPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
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
              transactions={transactions.map((t) => ({
                id: t.id,
                date: t.createdAt,
                studentId: t.studentId,
                studentName: t.studentName,
                amount: t.amount,
                status: t.status === "success" ? "success" : "failed",
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;

