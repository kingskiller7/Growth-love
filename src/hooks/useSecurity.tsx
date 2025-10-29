import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LoginHistory {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  location: string | null;
  device_fingerprint: string | null;
  login_method: string;
  status: string;
  failure_reason: string | null;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  alert_type: string;
  alert_message: string;
  severity: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  metadata: any;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export const useSecurity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch login history
  const { data: loginHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["loginHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as LoginHistory[];
    },
  });

  // Fetch security alerts
  const { data: securityAlerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["securityAlerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as SecurityAlert[];
    },
  });

  // Fetch active sessions
  const { data: activeSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_sessions")
        .select("*")
        .order("last_activity", { ascending: false });

      if (error) throw error;
      return data as ActiveSession[];
    },
  });

  // Log login attempt
  const logLoginAttempt = useMutation({
    mutationFn: async (params: {
      userId: string;
      loginMethod: string;
      status: "success" | "failed" | "blocked";
      failureReason?: string;
      ipAddress?: string;
      userAgent?: string;
      location?: string;
      deviceFingerprint?: string;
    }) => {
      const { error } = await supabase.from("login_history").insert({
        user_id: params.userId,
        login_method: params.loginMethod,
        status: params.status,
        failure_reason: params.failureReason,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        location: params.location,
        device_fingerprint: params.deviceFingerprint,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loginHistory"] });
    },
  });

  // Acknowledge security alert
  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("security_alerts")
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityAlerts"] });
      toast({
        title: "Alert acknowledged",
        description: "Security alert has been marked as read",
      });
    },
  });

  // Revoke session
  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("active_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      toast({
        title: "Session revoked",
        description: "The session has been terminated",
      });
    },
  });

  // Log security event
  const logSecurityEvent = useMutation({
    mutationFn: async (params: {
      userId: string;
      eventType: string;
      eventDescription: string;
      severity?: "info" | "warning" | "critical";
      metadata?: any;
    }) => {
      const { error } = await supabase.from("security_audit_log").insert({
        user_id: params.userId,
        event_type: params.eventType,
        event_description: params.eventDescription,
        severity: params.severity || "info",
        metadata: params.metadata || {},
      });

      if (error) throw error;
    },
  });

  const unacknowledgedAlerts =
    securityAlerts?.filter((alert) => !alert.acknowledged) || [];

  return {
    loginHistory,
    securityAlerts,
    activeSessions,
    unacknowledgedAlerts,
    isLoadingHistory,
    isLoadingAlerts,
    isLoadingSessions,
    logLoginAttempt,
    acknowledgeAlert,
    revokeSession,
    logSecurityEvent,
  };
};
