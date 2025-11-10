import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/mockData";

interface TransactionHistoryProps {
  transactions: Transaction[];
  selectedYear?: number | null;
  selectedSemester?: "Semester 1" | "Semester 2" | null;
}

const TransactionHistory = ({ transactions, selectedYear = null, selectedSemester = null }: TransactionHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View your past tuition payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No transactions found
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                id={`tx-${transaction.id}`}
                className="p-4 border rounded-md space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Payment for {transaction.studentName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Student ID: {transaction.studentId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.amount.toLocaleString()} VND
                    </p>
                    <p
                      className={`text-sm ${
                        transaction.status === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                {(selectedYear || selectedSemester) && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm font-semibold mb-2">
                      Semester Breakdown {selectedYear ? `(Year ${selectedYear})` : ""} {selectedSemester ? `(${selectedSemester})` : ""}
                    </p>
                    {(() => {
                      const filtered = (transaction.semesters || []).filter((semester) => {
                        const yearMatch = selectedYear ? semester.schoolYear === selectedYear : true;
                        const semMatch = selectedSemester ? semester.name === selectedSemester : true;
                        return yearMatch && semMatch;
                      });
                      return filtered.length > 0 ? (
                      <div className="space-y-2">
                        {filtered.map((semester) => (
                            <div
                              key={semester.id}
                              className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2"
                            >
                              <div>
                                <p className="font-medium">{semester.schoolYear} - {semester.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {semester.amount.toLocaleString()} VND
                                </p>
                              </div>
                              <span
                                className={`text-xs font-semibold ${
                                  semester.status === "paid" ? "text-green-600" : "text-amber-600"
                                }`}
                              >
                                {semester.status === "paid" ? "Paid" : "Debt"}
                              </span>
                            </div>
                          ))}
                      </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No semester data for the selected filter(s).
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

