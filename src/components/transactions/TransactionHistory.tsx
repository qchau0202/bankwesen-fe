import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentHistoryRecord } from "@/services/paymentService";

interface TransactionHistoryProps {
  records: PaymentHistoryRecord[];
  selectedYear?: string | null;
  selectedSemester?: string | null;
}

const getStatusColor = (status: string) => {
  if (status === "completed") {
    return "text-green-600";
  }
  if (status === "failed" || status === "cancelled") {
    return "text-red-600";
  }
  return "text-amber-600";
};

const formatStatus = (status: string) => status.replace(/_/g, " ").toUpperCase();

const TransactionHistory = ({ records, selectedYear = null, selectedSemester = null }: TransactionHistoryProps) => {
  const hasFilters = Boolean(selectedYear) || Boolean(selectedSemester);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your past tuition payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No transactions found</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const { payment, tuitions } = record;
              const filteredTuitions =
                hasFilters && (selectedYear || selectedSemester)
                  ? tuitions.filter((tuition) => {
                      const yearMatch = selectedYear ? tuition.academic_year === selectedYear : true;
                      const semesterMatch = selectedSemester ? tuition.semester === selectedSemester : true;
                      return yearMatch && semesterMatch;
                    })
                  : tuitions;

              return (
                <div key={payment.paymentId} id={`tx-${payment.paymentId}`} className="p-4 border rounded-md space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Payment #{payment.paymentId}</p>
                      <p className="text-sm text-muted-foreground">Customer ID: {payment.customerId}</p>
                      <p className="text-sm text-muted-foreground">
                        Created at: {new Date(payment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{payment.amount.toLocaleString()} VND</p>
                      <p className={`text-sm ${getStatusColor(payment.status)}`}>{formatStatus(payment.status)}</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm font-semibold mb-2">
                      Tuition breakdown {selectedYear ? `(${selectedYear})` : ""}{" "}
                      {selectedSemester ? `(${selectedSemester})` : ""}
                    </p>
                    {filteredTuitions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tuition matched the selected filters.</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredTuitions.map((tuition) => (
                          <div
                            key={tuition.tuitionId}
                            className="flex items-start justify-between rounded-md bg-background/60 px-3 py-2"
                          >
                            <div>
                              <p className="font-medium">
                                {tuition.studentName} • {tuition.semester} • {tuition.academic_year}
                              </p>
                              <p className="text-xs text-muted-foreground">Tuition ID: {tuition.tuitionId}</p>
                              <p className="text-xs text-muted-foreground">
                                Amount: {tuition.tuition_amount.toLocaleString()} VND
                              </p>
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                tuition.status === "paid" ? "text-green-600" : "text-amber-600"
                              }`}
                            >
                              {tuition.status === "paid" ? "Paid" : tuition.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;