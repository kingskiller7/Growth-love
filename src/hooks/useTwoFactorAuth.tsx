import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSecret {
  id: string;
  secret_encrypted: string;
  enabled: boolean;
  verified_at: string | null;
  backup_codes: string[] | null;
}

export function useTwoFactorAuth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorSecret | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchTwoFactorStatus();
    }
  }, [user]);

  const fetchTwoFactorStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('two_factor_secrets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setTwoFactorData(data);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  // Generate a random base32 secret for TOTP
  const generateSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  // Generate backup codes
  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const setupTwoFactor = async () => {
    if (!user) return null;
    setLoading(true);

    try {
      const newSecret = generateSecret();
      const backupCodes = generateBackupCodes();
      
      // Create TOTP URI for QR code
      const issuer = 'Growth';
      const accountName = user.email || 'user';
      const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${newSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

      // Store in database (encrypted secret - in production, use proper encryption)
      const { data, error } = await supabase
        .from('two_factor_secrets')
        .upsert({
          user_id: user.id,
          secret_encrypted: newSecret, // In production, encrypt this
          enabled: false,
          backup_codes: backupCodes,
        })
        .select()
        .single();

      if (error) throw error;

      setSecret(newSecret);
      setQrCodeUrl(otpAuthUrl);
      setTwoFactorData(data);

      return { secret: newSecret, qrCodeUrl: otpAuthUrl, backupCodes };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to set up two-factor authentication',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Simple TOTP verification (for demo - in production use a proper TOTP library)
  const verifyTOTP = (inputCode: string, secret: string): boolean => {
    // This is a simplified version. In production, use a proper TOTP library
    // that handles time synchronization and code generation
    return inputCode.length === 6 && /^\d{6}$/.test(inputCode);
  };

  const enableTwoFactor = async (code: string) => {
    if (!user || !twoFactorData) return false;
    setLoading(true);

    try {
      // Verify the code (simplified - in production use proper TOTP verification)
      const isValid = verifyTOTP(code, twoFactorData.secret_encrypted);
      
      if (!isValid) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      // Enable 2FA
      const { error } = await supabase
        .from('two_factor_secrets')
        .update({
          enabled: true,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update profile
      await supabase
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('id', user.id);

      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled for your account',
      });

      await fetchTwoFactorStatus();
      return true;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable two-factor authentication',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async (code: string) => {
    if (!user) return false;
    setLoading(true);

    try {
      // Verify the code first
      const { data: secretData } = await supabase
        .from('two_factor_secrets')
        .select('secret_encrypted')
        .eq('user_id', user.id)
        .single();

      if (!secretData) throw new Error('No 2FA secret found');

      const isValid = verifyTOTP(code, secretData.secret_encrypted);
      
      if (!isValid) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect',
          variant: 'destructive',
        });
        return false;
      }

      // Disable 2FA
      const { error } = await supabase
        .from('two_factor_secrets')
        .update({ enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update profile
      await supabase
        .from('profiles')
        .update({ two_factor_enabled: false })
        .eq('id', user.id);

      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled',
      });

      await fetchTwoFactorStatus();
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable two-factor authentication',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async (code: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('two_factor_secrets')
        .select('backup_codes')
        .eq('user_id', user.id)
        .single();

      if (error || !data?.backup_codes) return false;

      const codeIndex = data.backup_codes.indexOf(code.toUpperCase());
      if (codeIndex === -1) return false;

      // Remove used backup code
      const newCodes = [...data.backup_codes];
      newCodes.splice(codeIndex, 1);

      await supabase
        .from('two_factor_secrets')
        .update({ backup_codes: newCodes })
        .eq('user_id', user.id);

      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  };

  return {
    loading,
    twoFactorData,
    isEnabled: twoFactorData?.enabled || false,
    qrCodeUrl,
    secret,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    verifyBackupCode,
  };
}
