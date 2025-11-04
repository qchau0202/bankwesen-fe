import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: "success" | "pending" | "failed";
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
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
                      {new Date(transaction.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.amount.toLocaleString()} VND
                    </p>
                    <p
                      className={`text-sm ${
                        transaction.status === "success"
                          ? "text-green-600"
                          : transaction.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

