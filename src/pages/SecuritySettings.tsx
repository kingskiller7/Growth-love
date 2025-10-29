import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, History, AlertTriangle, Monitor } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginHistorySection } from "@/components/security/LoginHistorySection";
import { SecurityAlertsSection } from "@/components/security/SecurityAlertsSection";
import { ActiveSessionsSection } from "@/components/security/ActiveSessionsSection";
import { TwoFactorSection } from "@/components/security/TwoFactorSection";

const SecuritySettings = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6 max-w-6xl">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Security Settings</h1>
            <p className="text-muted-foreground">
              Manage your account security and monitor activity
            </p>
          </div>
        </div>

        <Tabs defaultValue="2fa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="2fa" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">2FA</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="2fa" className="space-y-4">
            <TwoFactorSection />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <ActiveSessionsSection />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <LoginHistorySection />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <SecurityAlertsSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SecuritySettings;
