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

interface KYCSubmission {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useKYC() {
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_submitted');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
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
      } else {
        // Check for pending submissions
        const { data: submission } = await supabase
          .from('kyc_submissions')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (submission) {
          if (submission.status === 'pending') {
            setKycStatus('pending');
          } else if (submission.status === 'rejected') {
            setKycStatus('rejected');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const uploadFile = async (file: File, userId: string, fileType: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${fileType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      return fileName;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      return null;
    }
  };

  const submitKYC = async (data: KYCData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload documents to storage
      let documentFrontUrl: string | null = null;
      let documentBackUrl: string | null = null;
      let selfieUrl: string | null = null;

      if (data.documentFront) {
        documentFrontUrl = await uploadFile(data.documentFront, user.id, 'document-front');
      }
      if (data.documentBack) {
        documentBackUrl = await uploadFile(data.documentBack, user.id, 'document-back');
      }
      if (data.selfie) {
        selfieUrl = await uploadFile(data.selfie, user.id, 'selfie');
      }

      // Create KYC submission record
      const { error: submissionError } = await supabase
        .from('kyc_submissions')
        .insert({
          user_id: user.id,
          document_type: data.documentType,
          document_number: data.documentNumber,
          document_front_url: documentFrontUrl,
          document_back_url: documentBackUrl,
          selfie_url: selfieUrl,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
          country: data.country,
          status: 'pending',
        });

      if (submissionError) throw submissionError;

      // Update profile
      await supabase
        .from('profiles')
        .update({
          country: data.country,
          kyc_verified_at: new Date().toISOString(),
        })
        .eq('id', user.id);

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

  const fetchPendingSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
    }
  };

  const getDocumentUrl = async (path: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(path, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  const verifyUser = async (userId: string, submissionId: string, approved: boolean, notes?: string) => {
    try {
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (!admin) throw new Error('Not authenticated');

      // Update KYC submission
      const { error: submissionError } = await supabase
        .from('kyc_submissions')
        .update({
          status: approved ? 'approved' : 'rejected',
          admin_notes: notes || null,
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          kyc_verified: approved,
          kyc_verified_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Notify user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: approved ? 'KYC Approved' : 'KYC Rejected',
        message: approved 
          ? 'Your identity has been verified. You now have full access.'
          : `Your KYC verification was rejected. ${notes || 'Please resubmit with clearer documents.'}`,
        type: 'kyc',
      });

      // Log security event
      await supabase.from('security_audit_log').insert({
        user_id: admin.id,
        event_type: approved ? 'kyc_approved' : 'kyc_rejected',
        event_description: `KYC ${approved ? 'approved' : 'rejected'} for user ${userId}`,
        severity: 'info',
        metadata: { target_user_id: userId, notes },
      });

      toast({
        title: approved ? 'User Verified' : 'User Rejected',
        description: `KYC status updated successfully`,
      });

      await fetchPendingSubmissions();
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
    submissions,
    submitKYC,
    verifyUser,
    fetchPendingSubmissions,
    getDocumentUrl,
    refetch: fetchKYCStatus,
  };
}
