import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";

type PayerInfo = {
  name?: string;
  phone?: string;
  email?: string;
};

type PayerInfoCardProps = {
  payer: PayerInfo;
};

export const PayerInfoCard: React.FC<PayerInfoCardProps> = ({ payer }) => {
  return (
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
            value={payer.name || ""}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payer-phone">Phone Number</Label>
          <Input
            id="payer-phone"
            type="tel"
            value={payer.phone || ""}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payer-email">Email Address</Label>
          <Input
            id="payer-email"
            type="email"
            value={payer.email || ""}
            disabled
            className="bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PayerInfoCard;

