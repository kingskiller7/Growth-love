import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSecurity } from "@/hooks/useSecurity";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const SecurityAlertsSection = () => {
  const { securityAlerts, isLoadingAlerts, acknowledgeAlert } = useSecurity();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-primary/20 text-primary";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  if (isLoadingAlerts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
          <CardDescription>Important security notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>
          Review and acknowledge security notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityAlerts && securityAlerts.length > 0 ? (
            securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  !alert.acknowledged ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{alert.alert_type}</Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm">{alert.alert_message}</p>

                    <div className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), "PPp")}
                      {alert.acknowledged_at && (
                        <span className="ml-2">
                          • Acknowledged {format(new Date(alert.acknowledged_at), "PPp")}
                        </span>
                      )}
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert.mutate(alert.id)}
                      disabled={acknowledgeAlert.isPending}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
              <p>No security alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
