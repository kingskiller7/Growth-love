-- Create login history table for tracking authentication attempts
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  device_fingerprint TEXT,
  login_method TEXT NOT NULL, -- 'password', 'google', 'biometric', '2fa'
  status TEXT NOT NULL, -- 'success', 'failed', 'blocked'
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'password_change', 'email_change', '2fa_enabled', '2fa_disabled', 'suspicious_activity', etc.
  event_description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create active sessions table for session management
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create 2FA secrets table (encrypted storage for TOTP secrets)
CREATE TABLE IF NOT EXISTS public.two_factor_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes TEXT[], -- Array of encrypted backup codes
  enabled BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'suspicious_login', 'multiple_failed_attempts', 'new_device', etc.
  alert_message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_history
CREATE POLICY "Users can view their own login history"
ON public.login_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all login history"
ON public.login_history FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert login history"
ON public.login_history FOR INSERT
WITH CHECK (true);

-- RLS Policies for security_audit_log
CREATE POLICY "Users can view their own audit log"
ON public.security_audit_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
ON public.security_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.security_audit_log FOR INSERT
WITH CHECK (true);

-- RLS Policies for active_sessions
CREATE POLICY "Users can view their own sessions"
ON public.active_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON public.active_sessions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions"
ON public.active_sessions FOR ALL
USING (true);

-- RLS Policies for two_factor_secrets
CREATE POLICY "Users can view their own 2FA secrets"
ON public.two_factor_secrets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA secrets"
ON public.two_factor_secrets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA secrets"
ON public.two_factor_secrets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for security_alerts
CREATE POLICY "Users can view their own security alerts"
ON public.security_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge their own alerts"
ON public.security_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create security alerts"
ON public.security_alerts FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX idx_login_history_created_at ON public.login_history(created_at DESC);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);
CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_acknowledged ON public.security_alerts(acknowledged);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.active_sessions
  WHERE expires_at < now();
END;
$$;

-- Create function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_attempts INTEGER;
  different_locations INTEGER;
BEGIN
  -- Check for multiple failed login attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_history
  WHERE user_id = NEW.user_id
    AND status = 'failed'
    AND created_at > now() - INTERVAL '15 minutes';

  IF failed_attempts >= 5 THEN
    -- Create security alert for multiple failed attempts
    INSERT INTO public.security_alerts (user_id, alert_type, alert_message, severity)
    VALUES (
      NEW.user_id,
      'multiple_failed_attempts',
      'Multiple failed login attempts detected in the last 15 minutes',
      'high'
    );
  END IF;

  -- Check for logins from different locations within short time
  SELECT COUNT(DISTINCT location) INTO different_locations
  FROM public.login_history
  WHERE user_id = NEW.user_id
    AND status = 'success'
    AND created_at > now() - INTERVAL '1 hour'
    AND location IS NOT NULL;

  IF different_locations >= 3 THEN
    -- Create security alert for unusual location activity
    INSERT INTO public.security_alerts (user_id, alert_type, alert_message, severity)
    VALUES (
      NEW.user_id,
      'suspicious_location',
      'Logins detected from multiple locations within a short time period',
      'medium'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for suspicious activity detection
CREATE TRIGGER detect_suspicious_activity_trigger
AFTER INSERT ON public.login_history
FOR EACH ROW
EXECUTE FUNCTION public.detect_suspicious_activity();

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id UUID,
  _event_type TEXT,
  _event_description TEXT,
  _severity TEXT DEFAULT 'info',
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_description,
    severity,
    metadata
  ) VALUES (
    _user_id,
    _event_type,
    _event_description,
    _severity,
    _metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;