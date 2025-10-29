import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from "@/hooks/useSecurity";
import { format } from "date-fns";
import { Monitor, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const LoginHistorySection = () => {
  const { loginHistory, isLoadingHistory } = useSecurity();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-primary/20 text-primary";
      case "failed":
        return "bg-destructive/20 text-destructive";
      case "blocked":
        return "bg-warning/20 text-warning";
      default:
        return "bg-muted";
    }
  };

  if (isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent authentication attempts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login History</CardTitle>
        <CardDescription>
          Track all authentication attempts on your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loginHistory && loginHistory.length > 0 ? (
            loginHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-3"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{entry.login_method}</Badge>
                  </div>
                  
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    {entry.ip_address && (
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>{entry.ip_address}</span>
                      </div>
                    )}
                    {entry.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{entry.location}</span>
                      </div>
                    )}
                    {entry.failure_reason && (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>{entry.failure_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(entry.created_at), "PPp")}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No login history available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
