import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function SecuritySetup() {
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [confirmSecurity, setConfirmSecurity] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const backupCodes = [
    "A1B2-C3D4-E5F6",
    "G7H8-I9J0-K1L2",
    "M3N4-O5P6-Q7R8",
    "S9T0-U1V2-W3X4",
  ];

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleComplete = () => {
    if (!confirmSecurity) return;
    // TODO: Implement security setup logic
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Secure your account</CardTitle>
          <CardDescription className="text-center">
            Step 3 of 3 - Security Setup
          </CardDescription>
          <Progress value={100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button
                  variant={twoFactorEnabled ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                >
                  {twoFactorEnabled ? "Enabled" : "Enable"}
                </Button>
              </div>
              {twoFactorEnabled && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <div className="w-32 h-32 bg-muted flex items-center justify-center rounded">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Scan this QR code with your authenticator app
                  </p>
                </div>
              )}
            </div>

            {twoFactorEnabled && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Backup Codes</h4>
                <p className="text-sm text-muted-foreground">
                  Save these codes in a secure place. You can use them to access your account if you lose your phone.
                </p>
                <div className="bg-muted rounded p-3 font-mono text-sm space-y-1">
                  {backupCodes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCopyBackupCodes}
                >
                  {copiedCodes ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Backup Codes
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Biometric Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or face ID
                  </p>
                </div>
                <Button
                  variant={biometricEnabled ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setBiometricEnabled(!biometricEnabled)}
                >
                  {biometricEnabled ? "Enabled" : "Enable"}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="confirm"
                checked={confirmSecurity}
                onCheckedChange={(checked) => setConfirmSecurity(checked as boolean)}
                required
              />
              <Label htmlFor="confirm" className="text-sm cursor-pointer leading-tight">
                I understand that I am responsible for keeping my backup codes secure and that losing them may result in account access issues.
              </Label>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full"
            size="lg"
            disabled={!confirmSecurity}
          >
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
