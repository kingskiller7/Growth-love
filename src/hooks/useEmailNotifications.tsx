import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type EmailTemplate = 'welcome' | 'transaction' | 'security_alert' | 'kyc_status' | 'two_factor' | 'custom';

interface EmailData {
  name?: string;
  type?: string;
  status?: string;
  amount?: string;
  asset?: string;
  txHash?: string;
  alertType?: string;
  details?: string;
  timestamp?: string;
  ipAddress?: string;
  reason?: string;
  action?: string;
  dashboardUrl?: string;
  walletUrl?: string;
  securityUrl?: string;
  kycUrl?: string;
  [key: string]: any;
}

export function useEmailNotifications() {
  const { user } = useAuth();

  const sendEmail = async (
    to: string,
    subject: string,
    template: EmailTemplate,
    data?: EmailData,
    customHtml?: string
  ): Promise<boolean> => {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          template,
          data,
          customHtml,
        },
      });

      if (error) throw error;
      return response?.success || false;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const sendWelcomeEmail = async (email: string, name: string) => {
    return sendEmail(email, 'Welcome to Growth!', 'welcome', { name });
  };

  const sendTransactionEmail = async (
    email: string,
    name: string,
    type: 'deposit' | 'withdrawal',
    status: string,
    amount: string,
    asset: string,
    txHash?: string
  ) => {
    return sendEmail(
      email,
      `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} ${status}`,
      'transaction',
      { name, type, status, amount, asset, txHash }
    );
  };

  const sendSecurityAlertEmail = async (
    email: string,
    name: string,
    alertType: string,
    details: string,
    ipAddress?: string
  ) => {
    return sendEmail(
      email,
      'Security Alert - Growth',
      'security_alert',
      {
        name,
        alertType,
        details,
        timestamp: new Date().toISOString(),
        ipAddress,
      }
    );
  };

  const sendKYCStatusEmail = async (
    email: string,
    name: string,
    status: 'verified' | 'rejected',
    reason?: string
  ) => {
    return sendEmail(
      email,
      status === 'verified' ? 'KYC Verified!' : 'KYC Review Required',
      'kyc_status',
      { name, status, reason }
    );
  };

  const send2FAEmail = async (
    email: string,
    name: string,
    action: 'enabled' | 'disabled'
  ) => {
    return sendEmail(
      email,
      `Two-Factor Authentication ${action === 'enabled' ? 'Enabled' : 'Disabled'}`,
      'two_factor',
      { name, action }
    );
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendTransactionEmail,
    sendSecurityAlertEmail,
    sendKYCStatusEmail,
    send2FAEmail,
  };
}
