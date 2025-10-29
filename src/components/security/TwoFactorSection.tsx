import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const TwoFactorSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    toast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled
        ? "Two-factor authentication has been enabled for your account"
        : "Two-factor authentication has been disabled",
    });
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    setBiometricEnabled(enabled);
    toast({
      title: enabled ? "Biometric Authentication Enabled" : "Biometric Authentication Disabled",
      description: enabled
        ? "You can now use biometric authentication to log in"
        : "Biometric authentication has been disabled",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with TOTP-based authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa-toggle">Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          {twoFactorEnabled && (
            <div className="pt-4 border-t space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code to verify setup</li>
                  <li>Save your backup codes in a secure location</li>
                </ol>
              </div>
              <Button variant="outline" className="w-full">
                Setup 2FA Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Use fingerprint or face recognition for quick and secure login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="biometric-toggle">Enable Biometric Login</Label>
              <p className="text-sm text-muted-foreground">
                Available on supported devices with PWA installation
              </p>
            </div>
            <Switch
              id="biometric-toggle"
              checked={biometricEnabled}
              onCheckedChange={handleBiometricToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
