import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import type { SemesterTuition } from "@/lib/mockData";

type PaymentInfoCardProps = {
  availableBalance: number;
  tuitionAmount: string;
  balanceError: string | null;
  semesters: SemesterTuition[];
};

export const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({
  availableBalance,
  tuitionAmount,
  balanceError,
  semesters,
}) => {
  const outstandingSemesters = semesters.filter((semester) => semester.status !== "paid");
  const totalOutstanding = outstandingSemesters.reduce((sum, semester) => sum + semester.amount, 0);

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Review your payment details before confirming
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="available-balance">Available Balance</Label>
          <Input
            id="available-balance"
            type="text"
            value={`${(availableBalance || 0).toLocaleString()} VND`}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Tuition Amount to Pay</Label>
          <Input
            id="payment-amount"
            type="text"
            value={tuitionAmount ? `${parseFloat(tuitionAmount).toLocaleString()} VND` : "0 VND"}
            disabled
            className="bg-muted"
          />
        </div>
        {balanceError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{balanceError}</p>
          </div>
        )}
        <div className="space-y-2">
          <Label>Semester Breakdown</Label>
          <div className="space-y-2 rounded-md border border-muted bg-muted/60 p-3 text-sm">
            {semesters.length === 0 ? (
              <p>No semester information available.</p>
            ) : (
              <>
            {semesters.map((semester) => (
                  <div
                    key={semester.id}
                    className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2"
                  >
                    <div>
                  <p className="font-semibold">{semester.schoolYear} - {semester.name}</p>
                      <p className="text-muted-foreground">
                        {semester.amount.toLocaleString()} VND
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                    semester.status === "paid" ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                  {semester.status === "paid" ? "Paid" : "Debt"}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Payments are applied to all outstanding semesters. Total outstanding:&nbsp;
                  {totalOutstanding.toLocaleString()} VND.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Terms and Conditions</Label>
          <div className="p-4 bg-muted rounded-md text-sm">
            <p className="mb-2">By proceeding with this transaction, you agree to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pay the full tuition amount (no partial payments allowed)</li>
              <li>Ensure sufficient balance is available</li>
              <li>Verify all information before confirmation</li>
              <li>Accept that the transaction is final once confirmed</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoCard;

