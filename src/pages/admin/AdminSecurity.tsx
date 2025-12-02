import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, AlertTriangle, Eye, Lock, 
  UserX, Activity, Clock, CheckCircle,
  XCircle, RefreshCw
} from 'lucide-react';

interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  alert_message: string;
  severity: string;
  acknowledged: boolean;
  created_at: string;
}

interface AuditLog {
  id: string;
  event_type: string;
  event_description: string;
  severity: string;
  user_id: string;
  created_at: string;
}

export default function AdminSecurity() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [alertsRes, logsRes] = await Promise.all([
        supabase.from('security_alerts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('security_audit_log').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (alertsRes.data) setAlerts(alertsRes.data);
      if (logsRes.data) setAuditLogs(logsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch security data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('security_alerts')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
      toast({ title: 'Alert acknowledged' });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && !a.acknowledged).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Security Center</h1>
            <p className="text-muted-foreground">Monitor security alerts and audit logs</p>
          </div>
          <Button onClick={fetchSecurityData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{alerts.length}</div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">{highSeverityCount}</div>
            </CardContent>
          </Card>
          <Card className="border-warning/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-warning">Unacknowledged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-warning">{unacknowledgedCount}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{auditLogs.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Security Alerts
              </CardTitle>
              <CardDescription>Active security alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No security alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium">{alert.alert_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                        </div>
                        {!alert.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Audit Log
              </CardTitle>
              <CardDescription>Recent security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No audit logs</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`p-2 rounded-full ${
                        log.severity === 'error' ? 'bg-destructive/10' :
                        log.severity === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                      }`}>
                        {log.event_type.includes('login') ? <Lock className="h-4 w-4" /> :
                         log.event_type.includes('user') ? <UserX className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{log.event_type}</p>
                        <p className="text-xs text-muted-foreground truncate">{log.event_description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
