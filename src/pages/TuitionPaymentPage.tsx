import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { tuitionService } from "@/services/tuitionService";
import { paymentService } from "@/services/paymentService";
import type { Payment, SemesterTuition, Transaction } from "@/config/mockData";
import OTPVerificationCard from "@/components/tuition/OTPVerificationCard";
import PayerInfoCard from "@/components/tuition/PayerInfoCard";
import TuitionInfoCard from "@/components/tuition/TuitionInfoCard";
import PaymentInfoCard from "@/components/tuition/PaymentInfoCard";
import TuitionConfirmationDialog from "@/components/tuition/TuitionConfirmationDialog";
import PaymentSuccessCard from "@/components/tuition/PaymentSuccessCard";

const TuitionPaymentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [loading, setLoading] = useState(false);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    tuitionAmount: "",
  });
  const [studentSemesters, setStudentSemesters] = useState<SemesterTuition[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  // Payment and OTP state
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!currentUser.customerId || !accessToken) {
      toast.error("Please login first");
      navigate("/auth");
    }
  }, [currentUser.customerId, navigate]);

  // Auto-fetch tuition info when student ID changes
  useEffect(() => {
    const fetchTuitionInfo = async () => {
      if (formData.studentId && formData.studentId.length >= 3) {
        try {
          const response = await tuitionService.getTuitionInfo(formData.studentId);
          
          if (response.status === 200 && response.data) {
          const semesters = response.data.semesters || [];
          const outstandingSemesters = semesters.filter((semester) => semester.status !== "paid");
          const totalOutstanding = outstandingSemesters.reduce((sum, semester) => sum + semester.amount, 0);

            setFormData(prev => ({
              ...prev,
              studentName: response.data!.studentName,
            tuitionAmount: totalOutstanding > 0 ? totalOutstanding.toString() : "0",
            }));
          setStudentSemesters(semesters);

          const defaultSemester = (outstandingSemesters[0] ?? semesters[0]) ?? null;
          setSelectedSemesterId(defaultSemester ? defaultSemester.id : null);

            // Check balance
          if (totalOutstanding === 0) {
            setBalanceError("This student has no outstanding tuition to pay.");
            } else {
            const balanceCheck = tuitionService.checkBalance(currentUser.customerId, totalOutstanding);
            if (!balanceCheck.hasEnough) {
              setBalanceError(`Insufficient balance. Your balance: ${balanceCheck.balance.toLocaleString()} VND, Required: ${totalOutstanding.toLocaleString()} VND`);
            } else {
              setBalanceError(null);
            }
            }
          } else {
            setFormData(prev => ({
              ...prev,
              studentName: "",
              tuitionAmount: "",
            }));
          setStudentSemesters([]);
          setSelectedSemesterId(null);
            setBalanceError(response.error || "Student not found");
          }
        } catch (error) {
          setBalanceError("Failed to fetch tuition information");
        setStudentSemesters([]);
        setSelectedSemesterId(null);
        }
      } else {
        setFormData(prev => ({
          ...prev,
          studentName: "",
          tuitionAmount: "",
        }));
        setBalanceError(null);
      setStudentSemesters([]);
      setSelectedSemesterId(null);
      }
    };

    const debounceTimer = setTimeout(fetchTuitionInfo, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.studentId, currentUser.customerId]);

  // Check OTP expiration and update countdown timer
  useEffect(() => {
    if (otpExpiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setCanResend(true);
        }
      };

      // Update immediately
      updateTimer();

      // Update every second
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [otpExpiresAt]);

  // input changes are handled inside components via prop callbacks

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate balance
    if (balanceError) {
      toast.error("Insufficient balance. Cannot proceed with payment.");
      return;
    }

    // Validate form
    if (!formData.studentId || !formData.studentName || !formData.tuitionAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const hasOutstandingSemesters = studentSemesters.some((semester) => semester.status !== "paid");
    if (!hasOutstandingSemesters || parseFloat(formData.tuitionAmount || "0") <= 0) {
      toast.error("No outstanding tuition balance found for this student.");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
    // Prevent double submission
    if (loading) {
      return;
    }

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      // Get selected semesters (outstanding ones)
      const outstandingSemesters = studentSemesters.filter((semester) => semester.status !== "paid");
      
      // If a specific semester is selected, only pay that one; otherwise pay all outstanding
      const semestersToPay = selectedSemesterId
        ? outstandingSemesters.filter((sem) => sem.id === selectedSemesterId)
        : outstandingSemesters;

      if (semestersToPay.length === 0) {
        toast.error("No outstanding tuition selected for payment");
        setLoading(false);
        return;
      }

      // Map semester IDs to tuitionIds (semester.id should be the tuitionId)
      const tuitionIds = semestersToPay.map((sem) => sem.id);

      // Create payment
      const paymentResponse = await paymentService.createPayment(tuitionIds, formData.studentId);

      if (paymentResponse.status === 201 && paymentResponse.data) {
        // Map backend response to frontend Payment format
        const payment: Payment = {
          id: paymentResponse.data.paymentId,
          userId: paymentResponse.data.customerId,
          studentId: formData.studentId,
          studentName: formData.studentName,
          tuitionAmount: paymentResponse.data.amount,
          status: paymentResponse.data.status === "completed" ? "completed" : paymentResponse.data.status === "cancelled" ? "cancelled" : paymentResponse.data.status === "failed" ? "failed" : "pending",
          createdAt: paymentResponse.data.created_at,
          otpAttempts: paymentResponse.data.otp_attempts,
          isLocked: paymentResponse.data.is_locked,
          semesters: semestersToPay,
        };
        setCurrentPayment(payment);
        const otpResponse = await paymentService.requestOTP(payment.id);
        setOtpExpiresAt(otpResponse.data?.expiresAt || 0);
        setOtpAttempts(0);
        setCanResend(false);
        setStep("otp");
        toast.success("OTP sent to your email. Please check your inbox.", {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.error(paymentResponse.error || "Failed to create payment");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!currentPayment) return;

    setLoading(true);
    try {
      // Request OTP again (same endpoint as initial request)
      const response = await paymentService.requestOTP(currentPayment.id);
      
      if (response.status === 200 && response.data) {
        setOtpExpiresAt(response.data.expiresAt);
        setOtpAttempts(0);
        setCanResend(false);
        toast.success("New OTP sent to your email. Please check your inbox.", {
          duration: 10000, // Show for 10 seconds
        });
      } else {
        toast.error(response.error || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!currentPayment || !otpCode) {
      toast.error("Please enter OTP code");
      return;
    }

    // Prevent double submission
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      // Verify OTP - payment completes here (no separate transaction step)
      const response = await paymentService.verifyOTP(
        currentPayment.id,
        otpCode,
        formData.studentId,
        formData.studentName,
        studentSemesters
      );

      if (response.status === 200 && response.data) {
        // Payment completed successfully
        toast.success("Payment completed successfully!");
        
        // Map payment to transaction format for success page
        const transaction: Transaction = {
          id: response.data.id,
          paymentId: response.data.id,
          customerId: response.data.userId,
          studentId: response.data.studentId,
          studentName: response.data.studentName,
          amount: response.data.tuitionAmount,
          status: "success",
          createdAt: response.data.createdAt,
          semesters: response.data.semesters,
        };
        setLastTransaction(transaction);
        setCurrentPayment(response.data);

        // Move to success step and let user decide next navigation
        setStep("success");
      } else {
        // Handle OTP errors
        if (response.error === "OTP_EXPIRED") {
          setCanResend(true);
          toast.error("OTP has expired. Please request a new one.");
        } else if (response.error === "MAX_ATTEMPTS_REACHED") {
          // Cancel payment
          await paymentService.cancelPayment(currentPayment.id);
          toast.error("Maximum OTP attempts reached. Payment cancelled.");
          setStep("form");
          setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
          setCurrentPayment(null);
          setOtpCode("");
          setOtpAttempts(0);
          setStudentSemesters([]);
          setSelectedSemesterId(null);
        } else {
          const attempts = otpAttempts + 1;
          setOtpAttempts(attempts);
          toast.error(response.error || "Invalid OTP code");
        }
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!currentPayment) {
      setStep("form");
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.cancelPayment(currentPayment.id);
      if (response.status === 200) {
        toast.success("Payment cancelled");
        setStep("form");
        setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
        setCurrentPayment(null);
        setOtpCode("");
        setOtpAttempts(0);
        setStudentSemesters([]);
        setSelectedSemesterId(null);
      } else {
        toast.error(response.error || "Failed to cancel payment");
      }
    } catch (error) {
      toast.error("Failed to cancel payment");
    } finally {
      setLoading(false);
    }
  };

  const hasOutstandingSemesters = studentSemesters.some((semester) => semester.status !== "paid");

  if (step === "otp") {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted relative">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-semibold">Processing...</p>
            </div>
          </div>
        )}
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/home")}
              className="font-bold"
              disabled={loading}
            >
              ← Back to Home
            </Button>
          </div>
          <OTPVerificationCard
            email={currentUser.email}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            timeLeft={timeLeft}
            canResend={canResend}
            otpAttempts={otpAttempts}
            loading={loading}
            onCancel={handleCancelPayment}
            onResend={handleResendOTP}
            onVerify={handleVerifyOTP}
          />
        </div>
      </div>
    );
  }

  if (step === "success" && lastTransaction) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
        <div className="max-w-2xl mx-auto">
          <PaymentSuccessCard
            transactionId={lastTransaction.id}
            studentId={lastTransaction.studentId}
            studentName={lastTransaction.studentName}
            amount={lastTransaction.amount}
            createdAt={lastTransaction.createdAt}
            semesters={lastTransaction.semesters || []}
            onBackHome={() => {
              setStep("form");
              setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
              setCurrentPayment(null);
              setOtpCode("");
              setOtpAttempts(0);
              setStudentSemesters([]);
              setSelectedSemesterId(null);
              navigate("/home");
            }}
            onViewHistory={({ transactionId: txId, year, semester }) => {
              setStep("form");
              setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
              setCurrentPayment(null);
              setOtpCode("");
              setOtpAttempts(0);
              setStudentSemesters([]);
              setSelectedSemesterId(null);
              const params = new URLSearchParams();
              params.set("tx", txId);
              if (year) params.set("y", year);
              if (semester) params.set("sem", semester === "Semester 1" ? "1" : "2");
              navigate(`/transaction-history?${params.toString()}`);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-semibold">Processing...</p>
          </div>
        </div>
      )}
      <div className="mx-auto">
        <div className="mb-6">
        <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/home")}
            className="font-bold mb-6"
            disabled={loading}
          >
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">TDTU ibanking Tuition Payment</h1>
          <p className="text-muted-foreground">Please fill in the following information to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <PayerInfoCard payer={{ name: currentUser.full_name, phone: currentUser.phone_number, email: currentUser.email }} />
            <TuitionInfoCard
              formData={formData}
            semesters={studentSemesters}
            selectedSemesterId={selectedSemesterId}
              onStudentIdChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}
            onSelectSemester={(value) => setSelectedSemesterId(value || null)}
            />
            <PaymentInfoCard
              availableBalance={currentUser.balance || 0}
              tuitionAmount={formData.tuitionAmount}
              balanceError={balanceError}
            semesters={studentSemesters}
            />
          </div>

          {/* Transaction Confirmation Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/home")}
              disabled={loading}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.studentId ||
                !formData.studentName ||
                !!balanceError ||
                !hasOutstandingSemesters
              }
              className="font-bold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm Transaction"
              )}
            </Button>
          </div>
        </form>

        <TuitionConfirmationDialog
          open={showConfirmDialog}
          loading={loading}
          onOpenChange={setShowConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmPayment}
          payer={{
            name: currentUser.full_name,
            email: currentUser.email,
            phone: currentUser.phone_number,
            balance: currentUser.balance,
          }}
          tuition={{
            studentId: formData.studentId,
            studentName: formData.studentName,
            tuitionAmount: formData.tuitionAmount,
          }}
          semesters={studentSemesters}
        />
      </div>
    </div>
  );
};

export default TuitionPaymentPage;
