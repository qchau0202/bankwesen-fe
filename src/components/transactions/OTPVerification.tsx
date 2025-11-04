import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OTPVerificationProps {
  onBack: () => void;
  onConfirm: (otp: string) => void;
}

const OTPVerification = ({ onBack, onConfirm }: OTPVerificationProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const otp = formData.get("otp") as string;
    onConfirm(otp);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OTP Verification</CardTitle>
        <CardDescription>
          An OTP code has been sent to your registered email address.
          Please enter the code below to confirm your transaction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
            />
            <p className="text-sm text-muted-foreground">
              OTP expires in 5 minutes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="font-bold"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="font-bold"
            >
              Final Confirmation
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;

