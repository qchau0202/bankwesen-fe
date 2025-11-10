import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SemesterTuition } from "@/lib/mockData";

type PayerDetails = {
  name?: string;
  email?: string;
  phone?: string;
  balance?: number;
};

type TuitionDetails = {
  studentId: string;
  studentName: string;
  tuitionAmount: string;
};

type TuitionConfirmationDialogProps = {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  payer: PayerDetails;
  tuition: TuitionDetails;
  semesters: SemesterTuition[];
};

export const TuitionConfirmationDialog: React.FC<TuitionConfirmationDialogProps> = ({
  open,
  loading,
  onOpenChange,
  onCancel,
  onConfirm,
  payer,
  tuition,
  semesters,
}) => {
  const tuitionAmountValue = Number.parseFloat(tuition.tuitionAmount || "0") || 0;
  const availableBalance = payer.balance ?? 0;
  const remainingBalance = availableBalance - tuitionAmountValue;
  const outstandingSemesters = semesters.filter((semester) => semester.status !== "paid");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Transaction</DialogTitle>
          <DialogDescription>
            Please review the payment details before confirming. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Payer Information:</p>
            <div className="pl-4 space-y-1 text-sm text-muted-foreground">
              <p>Name: {payer.name}</p>
              <p>Email: {payer.email}</p>
              <p>Phone: {payer.phone}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Tuition Information:</p>
            <div className="pl-4 space-y-1 text-sm text-muted-foreground">
              <p>Student ID: {tuition.studentId}</p>
              <p>Student Name: {tuition.studentName}</p>
              <p>Tuition Amount: {tuitionAmountValue.toLocaleString()} VND</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Payment Details:</p>
            <div className="pl-4 space-y-1 text-sm text-muted-foreground">
              <p>Available Balance: {availableBalance.toLocaleString()} VND</p>
              <p>Amount to Pay: {tuitionAmountValue.toLocaleString()} VND</p>
              <p className="font-semibold text-foreground">
                Remaining Balance: {remainingBalance.toLocaleString()} VND
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Semester Details:</p>
            <div className="space-y-2 rounded-md border border-muted bg-muted/60 p-3 text-sm">
              {semesters.length === 0 ? (
                <p>No semester data available.</p>
              ) : (
                semesters.map((semester) => (
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
                ))
              )}
              {outstandingSemesters.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  This payment will complete all outstanding semesters.
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="font-bold"
          >
            {loading ? "Processing..." : "Confirm & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TuitionConfirmationDialog;

