import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type KYCStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

interface KYCData {
  documentType: string;
  documentNumber: string;
  documentFront: File | null;
  documentBack: File | null;
  selfie: File | null;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export function useKYC() {
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_submitted');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_verified, kyc_verified_at')
        .eq('id', user.id)
        .single();

      if (profile?.kyc_verified) {
        setKycStatus('verified');
      } else if (profile?.kyc_verified_at) {
        // If kyc_verified_at exists but not verified, it's pending
        setKycStatus('pending');
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const submitKYC = async (data: KYCData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // In production, upload files to storage and store references
      // For now, we'll mark as pending review
      
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_verified: false,
          kyc_verified_at: new Date().toISOString(),
          country: data.country,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Create notification for admin
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'KYC Submitted',
        message: 'Your KYC verification has been submitted and is under review.',
        type: 'kyc',
      });

      // Log security event
      await supabase.from('security_audit_log').insert({
        user_id: user.id,
        event_type: 'kyc_submitted',
        event_description: `KYC verification submitted with ${data.documentType}`,
        severity: 'info',
      });

      setKycStatus('pending');
      toast({
        title: 'KYC Submitted',
        description: 'Your verification documents are under review.',
      });
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit KYC verification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_verified: approved,
          kyc_verified_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Notify user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: approved ? 'KYC Approved' : 'KYC Rejected',
        message: approved 
          ? 'Your identity has been verified. You now have full access.'
          : 'Your KYC verification was rejected. Please resubmit with clearer documents.',
        type: 'kyc',
      });

      toast({
        title: approved ? 'User Verified' : 'User Rejected',
        description: `KYC status updated successfully`,
      });
    } catch (error) {
      console.error('Error verifying user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update KYC status',
        variant: 'destructive',
      });
    }
  };

  return {
    kycStatus,
    loading,
    submitKYC,
    verifyUser,
    refetch: fetchKYCStatus,
  };
}