import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from "@/hooks/useSecurity";
import { format } from "date-fns";
import { Monitor, MapPin, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const ActiveSessionsSection = () => {
  const { activeSessions, isLoadingSessions, revokeSession } = useSecurity();

  if (isLoadingSessions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          View and manage all devices currently logged into your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSessions && activeSessions.length > 0 ? (
            activeSessions.map((session) => {
              const isExpired = new Date(session.expires_at) < new Date();
              
              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-3"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isExpired ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Expired
                        </Badge>
                      ) : (
                        <Badge className="bg-primary/20 text-primary">Active</Badge>
                      )}
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground">
                      {session.ip_address && (
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span>{session.ip_address}</span>
                        </div>
                      )}
                      {session.user_agent && (
                        <div className="text-xs line-clamp-1" title={session.user_agent}>
                          {session.user_agent}
                        </div>
                      )}
                      <div className="text-xs">
                        Last activity: {format(new Date(session.last_activity), "PPp")}
                      </div>
                      <div className="text-xs">
                        Expires: {format(new Date(session.expires_at), "PPp")}
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                        disabled={isExpired}
                      >
                        <LogOut className="h-4 w-4" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will immediately log out this device. You'll need to log in again to access your account from this device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeSession.mutate(session.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Revoke Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No active sessions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
