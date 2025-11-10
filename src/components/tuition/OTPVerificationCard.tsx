import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as React from "react";

type OTPVerificationCardProps = {
  email: string;
  otpCode: string;
  setOtpCode: (code: string) => void;
  timeLeft: number;
  canResend: boolean;
  otpAttempts: number;
  loading: boolean;
  onCancel: () => void;
  onResend: () => void;
  onVerify: () => void;
};

export const OTPVerificationCard: React.FC<OTPVerificationCardProps> = ({
  email,
  otpCode,
  setOtpCode,
  timeLeft,
  canResend,
  otpAttempts,
  loading,
  onCancel,
  onResend,
  onVerify,
}) => {
  const isExpired = timeLeft === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>OTP Verification</CardTitle>
        <CardDescription>
          Enter the OTP code sent to your email ({email})
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
            <p className="text-sm text-muted-foreground">
              {isExpired ? (
                <span className="text-red-500">OTP expired</span>
              ) : (
                `Expires in: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
              )}
            </p>
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
              onClick={onCancel}
              disabled={loading}
              className="font-bold"
            >
              Cancel
            </Button>
            {(canResend || isExpired) && (
              <Button
                type="button"
                onClick={onResend}
                disabled={loading}
                className="font-bold"
              >
                Resend OTP
              </Button>
            )}
            <Button
              type="button"
              onClick={onVerify}
              disabled={loading || !otpCode || otpCode.length !== 6}
              className="font-bold"
            >
              {loading ? "Verifying..." : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerificationCard;

