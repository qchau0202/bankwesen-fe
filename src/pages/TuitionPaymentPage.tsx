import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tuitionApi, paymentApi, otpApi, transactionApi } from "@/lib/mockApi";
import type { Payment } from "@/lib/mockData";

const TuitionPaymentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    tuitionAmount: "",
  });

  // Payment and OTP state
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser.id) {
      toast.error("Please login first");
      navigate("/auth");
    }
  }, [currentUser.id, navigate]);

  // Auto-fetch tuition info when student ID changes
  useEffect(() => {
    const fetchTuitionInfo = async () => {
      if (formData.studentId && formData.studentId.length >= 3) {
        try {
          const response = await tuitionApi.getTuitionInfo(formData.studentId);
          
          if (response.status === 200 && response.data) {
            setFormData(prev => ({
              ...prev,
              studentName: response.data!.studentName,
              tuitionAmount: response.data!.tuitionAmount.toString(),
            }));

            // Check balance
            const balanceCheck = tuitionApi.checkBalance(currentUser.id, response.data!.tuitionAmount);
            if (!balanceCheck.hasEnough) {
              setBalanceError(`Insufficient balance. Your balance: ${balanceCheck.balance.toLocaleString()} VND, Required: ${response.data!.tuitionAmount.toLocaleString()} VND`);
            } else {
              setBalanceError(null);
            }
          } else {
            setFormData(prev => ({
              ...prev,
              studentName: "",
              tuitionAmount: "",
            }));
            setBalanceError(response.error || "Student not found");
          }
        } catch (error) {
          setBalanceError("Failed to fetch tuition information");
        }
      } else {
        setFormData(prev => ({
          ...prev,
          studentName: "",
          tuitionAmount: "",
        }));
        setBalanceError(null);
      }
    };

    const debounceTimer = setTimeout(fetchTuitionInfo, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.studentId, currentUser.id]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);
    setLoading(true);

    try {
      // Create payment
      const paymentResponse = await paymentApi.createPayment(
        formData.studentId,
        formData.studentName,
        parseFloat(formData.tuitionAmount)
      );

      if (paymentResponse.status === 201 && paymentResponse.data) {
        setCurrentPayment(paymentResponse.data);
        
        // Request OTP
        const otpResponse = await otpApi.requestOTP(paymentResponse.data.id);
        
        if (otpResponse.status === 200 && otpResponse.data) {
          setOtpExpiresAt(otpResponse.data.expiresAt);
          setCanResend(false);
          setStep("otp");
          toast.success(`OTP sent to your email: ${otpResponse.data.otp}`, {
            duration: 10000, // Show for 10 seconds
          });
        } else {
          toast.error(otpResponse.error || "Failed to send OTP");
        }
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
      const response = await otpApi.resendOTP(currentPayment.id);
      
      if (response.status === 200 && response.data) {
        setOtpExpiresAt(response.data.expiresAt);
        setCanResend(false);
        setOtpAttempts(0);
        toast.success(`New OTP sent to your email: ${response.data.otp}`, {
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

    setLoading(true);
    try {
      const response = await otpApi.verifyOTP(currentPayment.id, otpCode);

      if (response.status === 200 && response.data?.success) {
        // OTP verified, create transaction
        const transactionResponse = await transactionApi.createTransaction(currentPayment.id);

        if (transactionResponse.status === 201 && transactionResponse.data) {
          toast.success("Transaction completed successfully!");
          
          // Update user balance in localStorage
          const updatedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
          updatedUser.balance -= currentPayment.tuitionAmount;
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));

          // Update users array
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const userIndex = users.findIndex((u: any) => u.id === updatedUser.id);
          if (userIndex !== -1) {
            users[userIndex].balance = updatedUser.balance;
            localStorage.setItem("users", JSON.stringify(users));
          }

          // Reset form and go back
          setTimeout(() => {
            setStep("form");
            setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
            setCurrentPayment(null);
            setOtpCode("");
            setOtpAttempts(0);
            navigate("/home");
          }, 2000);
        } else {
          toast.error(transactionResponse.error || "Transaction failed");
        }
      } else {
        // Handle OTP errors
        if (response.error === "OTP_EXPIRED") {
          setCanResend(true);
          toast.error("OTP has expired. Please request a new one.");
        } else if (response.error === "MAX_ATTEMPTS_REACHED") {
          // Cancel payment
          await paymentApi.cancelPayment(currentPayment.id);
          toast.error("Maximum OTP attempts reached. Payment cancelled.");
          setStep("form");
          setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
          setCurrentPayment(null);
          setOtpCode("");
          setOtpAttempts(0);
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
      await paymentApi.cancelPayment(currentPayment.id);
      toast.success("Payment cancelled");
      setStep("form");
      setFormData({ studentId: "", studentName: "", tuitionAmount: "" });
      setCurrentPayment(null);
      setOtpCode("");
      setOtpAttempts(0);
    } catch (error) {
      toast.error("Failed to cancel payment");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    const isExpired = timeLeft === 0;

    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>
                Enter the OTP code sent to your email ({currentUser.email})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                  />
                  {otpExpiresAt && (
                    <p className="text-sm text-muted-foreground">
                      {isExpired ? (
                        <span className="text-red-500">OTP expired</span>
                      ) : (
                        `Expires in: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                      )}
                    </p>
                  )}
                  {otpAttempts > 0 && (
                    <p className="text-sm text-yellow-600">
                      Attempts: {otpAttempts}/3
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelPayment}
                    disabled={loading}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                  {canResend || isExpired ? (
                    <Button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="font-bold"
                    >
                      Resend OTP
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading || !otpCode || otpCode.length !== 6}
                    className="font-bold"
                  >
                    {loading ? "Verifying..." : "Confirm Payment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Payment</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Section 1: Payer Information */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Payer Information</CardTitle>
                <CardDescription>
                  Your account information (auto-filled and locked)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payer-name">Full Name</Label>
                  <Input
                    id="payer-name"
                    type="text"
                    value={currentUser.name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-phone">Phone Number</Label>
                  <Input
                    id="payer-phone"
                    type="tel"
                    value={currentUser.phone || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-email">Email Address</Label>
                  <Input
                    id="payer-email"
                    type="email"
                    value={currentUser.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Tuition Information */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Tuition Information</CardTitle>
                <CardDescription>
                  Enter the student ID to retrieve tuition information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID (MSSV)</Label>
                  <Input
                    id="student-id"
                    name="studentId"
                    type="text"
                    placeholder="Enter student ID (e.g., SV001)"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-name">Student Full Name</Label>
                  <Input
                    id="student-name"
                    name="studentName"
                    type="text"
                    placeholder="Student name will appear here"
                    value={formData.studentName}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tuition-amount">Tuition Amount</Label>
                  <Input
                    id="tuition-amount"
                    name="tuitionAmount"
                    type="text"
                    placeholder="Amount will be retrieved automatically"
                    value={formData.tuitionAmount ? `${parseFloat(formData.tuitionAmount).toLocaleString()} VND` : ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Payment Information */}
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
                    value={`${(currentUser.balance || 0).toLocaleString()} VND`}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Tuition Amount to Pay</Label>
                  <Input
                    id="payment-amount"
                    type="text"
                    value={formData.tuitionAmount ? `${parseFloat(formData.tuitionAmount).toLocaleString()} VND` : "0 VND"}
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
              disabled={loading || !formData.studentId || !formData.studentName || !!balanceError}
              className="font-bold"
            >
              {loading ? "Processing..." : "Confirm Transaction"}
            </Button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
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
                  <p>Name: {currentUser.name}</p>
                  <p>Email: {currentUser.email}</p>
                  <p>Phone: {currentUser.phone}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Tuition Information:</p>
                <div className="pl-4 space-y-1 text-sm text-muted-foreground">
                  <p>Student ID: {formData.studentId}</p>
                  <p>Student Name: {formData.studentName}</p>
                  <p>Tuition Amount: {parseFloat(formData.tuitionAmount || "0").toLocaleString()} VND</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment Details:</p>
                <div className="pl-4 space-y-1 text-sm text-muted-foreground">
                  <p>Available Balance: {(currentUser.balance || 0).toLocaleString()} VND</p>
                  <p>Amount to Pay: {parseFloat(formData.tuitionAmount || "0").toLocaleString()} VND</p>
                  <p className="font-semibold text-foreground">
                    Remaining Balance: {((currentUser.balance || 0) - parseFloat(formData.tuitionAmount || "0")).toLocaleString()} VND
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmPayment}
                disabled={loading}
                className="font-bold"
              >
                {loading ? "Processing..." : "Confirm & Continue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TuitionPaymentPage;
