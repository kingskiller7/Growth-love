-- Create KYC storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 
  'kyc-documents', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create KYC submissions table to track all submissions
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own KYC submissions" 
ON public.kyc_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can create their own KYC submissions" 
ON public.kyc_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all KYC submissions" 
ON public.kyc_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all submissions
CREATE POLICY "Admins can update KYC submissions" 
ON public.kyc_submissions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for KYC documents
CREATE POLICY "Users can upload their own KYC documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own KYC documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all KYC documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_kyc_submissions_updated_at
BEFORE UPDATE ON public.kyc_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add advanced order fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS trailing_stop_percent NUMERIC,
ADD COLUMN IF NOT EXISTS oco_linked_order_id UUID REFERENCES public.orders(id),
ADD COLUMN IF NOT EXISTS margin_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS leverage NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS liquidation_price NUMERIC;