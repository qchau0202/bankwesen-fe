import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as React from "react";
import type { SemesterTuition } from "@/config/mockData";

type PaymentSuccessCardProps = {
  transactionId: string;
  studentId: string;
  studentName: string;
  amount: number;
  createdAt: string;
  semesters: SemesterTuition[];
  onViewHistory: (args: { transactionId: string; year?: string; semester?: "Semester 1" | "Semester 2" }) => void;
  onBackHome: () => void;
};

export const PaymentSuccessCard: React.FC<PaymentSuccessCardProps> = ({
  transactionId,
  studentId,
  studentName,
  amount,
  createdAt,
  semesters,
  onViewHistory,
  onBackHome,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Successful</CardTitle>
        <CardDescription>
          Your transaction has been completed. Here are the details:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border bg-muted/50 p-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p className="font-semibold">Student</p>
                <p className="text-muted-foreground">{studentName} ({studentId})</p>
              </div>
              <div>
                <p className="font-semibold">Amount</p>
                <p className="text-muted-foreground">{amount.toLocaleString()} VND</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p className="text-muted-foreground">{new Date(createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-semibold">Transaction</p>
                <p className="text-muted-foreground break-all">{transactionId}</p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-muted/50 p-4 text-sm">
            <p className="font-semibold mb-2">Semesters Paid</p>
            <div className="space-y-2">
              {semesters.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2">
                  <div>
                    <p className="font-medium">{s.schoolYear} - {s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.amount.toLocaleString()} VND</p>
                  </div>
                  <span className="text-xs font-semibold text-green-600">Paid</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="font-bold"
              onClick={onBackHome}
            >
              Back to Home
            </Button>
            <Button
              type="button"
              className="font-bold"
              onClick={() => onViewHistory({ transactionId })}
            >
              View Transaction
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSuccessCard;

