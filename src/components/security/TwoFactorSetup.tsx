import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Smartphone, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';

export function TwoFactorSetup() {
  const { 
    loading, 
    isEnabled, 
    twoFactorData,
    qrCodeUrl, 
    secret,
    setupTwoFactor, 
    enableTwoFactor, 
    disableTwoFactor 
  } = useTwoFactorAuth();
  const { toast } = useToast();
  
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleStartSetup = async () => {
    const result = await setupTwoFactor();
    if (result) {
      setSetupData(result);
      setStep('verify');
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    const success = await enableTwoFactor(verificationCode);
    if (success) {
      setStep('backup');
    }
  };

  const handleDisable = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    const success = await disableTwoFactor(verificationCode);
    if (success) {
      setDisableOpen(false);
      setVerificationCode('');
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
    toast({
      title: 'Copied',
      description: type === 'secret' ? 'Secret key copied to clipboard' : 'Backup codes copied to clipboard',
    });
  };

  const resetSetup = () => {
    setStep('setup');
    setSetupData(null);
    setVerificationCode('');
    setSetupOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Secure your account with TOTP-based verification
            </CardDescription>
          </div>
          <Badge variant={isEnabled ? 'default' : 'secondary'} className={isEnabled ? 'bg-primary/20 text-primary' : ''}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnabled ? (
          <>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">2FA is Active</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your account is protected with two-factor authentication.
              </p>
            </div>
            
            <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Disable 2FA</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Enter your verification code to disable 2FA
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    onClick={handleDisable} 
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full"
                    variant="destructive"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disable 2FA'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Dialog open={setupOpen} onOpenChange={(open) => { setSetupOpen(open); if (!open) resetSetup(); }}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Smartphone className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {step === 'setup' && 'Set Up Two-Factor Authentication'}
                  {step === 'verify' && 'Verify Your Authenticator'}
                  {step === 'backup' && 'Save Your Backup Codes'}
                </DialogTitle>
                <DialogDescription>
                  {step === 'setup' && 'Scan the QR code with your authenticator app'}
                  {step === 'verify' && 'Enter the 6-digit code from your app'}
                  {step === 'backup' && 'Save these codes in a secure location'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {step === 'setup' && (
                  <div className="text-center">
                    <Button onClick={handleStartSetup} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate QR Code'}
                    </Button>
                  </div>
                )}

                {step === 'verify' && setupData && (
                  <>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCode value={setupData.qrCodeUrl} size={180} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Can't scan? Enter manually:</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={setupData.secret} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(setupData.secret, 'secret')}
                        >
                          {copiedSecret ? <CheckCircle className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Verification Code</Label>
                      <Input
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-widest font-mono"
                        maxLength={6}
                      />
                    </div>

                    <Button 
                      onClick={handleVerify} 
                      disabled={loading || verificationCode.length !== 6}
                      className="w-full"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
                    </Button>
                  </>
                )}

                {step === 'backup' && setupData && (
                  <>
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-4">
                      <p className="text-sm text-warning font-medium">
                        ⚠️ Save these backup codes now. They won't be shown again!
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                      {setupData.backupCodes.map((code, i) => (
                        <code key={i} className="text-center font-mono text-sm py-1">
                          {code}
                        </code>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'codes')}
                    >
                      {copiedCodes ? <CheckCircle className="h-4 w-4 mr-2 text-primary" /> : <Copy className="h-4 w-4 mr-2" />}
                      Copy Backup Codes
                    </Button>

                    <Button onClick={resetSetup} className="w-full">
                      Done
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Recommended Apps
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Google Authenticator</li>
            <li>• Authy</li>
            <li>• Microsoft Authenticator</li>
            <li>• 1Password</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
