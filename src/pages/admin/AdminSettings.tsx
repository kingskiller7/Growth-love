import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, Shield, Zap, Bell, 
  Database, Globe, Save
} from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Trading Settings
    maxOrderSize: 100000,
    minOrderSize: 10,
    tradingEnabled: true,
    maintenanceMode: false,
    
    // Risk Settings
    maxDrawdown: 20,
    circuitBreakerThreshold: 10,
    stopLossDefault: 5,
    
    // Notification Settings
    emailAlerts: true,
    securityAlerts: true,
    tradingAlerts: true,
    
    // API Settings
    rateLimit: 100,
    apiVersion: 'v1',
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your configuration has been updated successfully.',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure platform-wide settings</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="trading" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="trading" className="gap-2">
              <Zap className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2">
              <Shield className="h-4 w-4" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Globe className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Configuration</CardTitle>
                <CardDescription>Configure trading limits and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trading Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow trading on the platform</p>
                  </div>
                  <Switch 
                    checked={settings.tradingEnabled}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, tradingEnabled: v }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-warning">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable all platform operations</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, maintenanceMode: v }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Maximum Order Size ($)</Label>
                    <Input 
                      type="number"
                      value={settings.maxOrderSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxOrderSize: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Order Size ($)</Label>
                    <Input 
                      type="number"
                      value={settings.minOrderSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, minOrderSize: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>Configure risk parameters and safety limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Maximum Drawdown (%)</Label>
                  <Input 
                    type="number"
                    value={settings.maxDrawdown}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxDrawdown: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">Trading will be paused when drawdown exceeds this limit</p>
                </div>

                <div className="space-y-2">
                  <Label>Circuit Breaker Threshold (%)</Label>
                  <Input 
                    type="number"
                    value={settings.circuitBreakerThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, circuitBreakerThreshold: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">Market movement threshold to trigger circuit breaker</p>
                </div>

                <div className="space-y-2">
                  <Label>Default Stop Loss (%)</Label>
                  <Input 
                    type="number"
                    value={settings.stopLossDefault}
                    onChange={(e) => setSettings(prev => ({ ...prev, stopLossDefault: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure admin notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications</p>
                  </div>
                  <Switch 
                    checked={settings.emailAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, emailAlerts: v }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about security events</p>
                  </div>
                  <Switch 
                    checked={settings.securityAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, securityAlerts: v }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trading Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about large trades</p>
                  </div>
                  <Switch 
                    checked={settings.tradingAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, tradingAlerts: v }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Configure API settings and rate limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Rate Limit (requests/minute)</Label>
                  <Input 
                    type="number"
                    value={settings.rateLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, rateLimit: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Version</Label>
                  <Input 
                    value={settings.apiVersion}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiVersion: e.target.value }))}
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Connected DEX Integrations</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">Uniswap</span>
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">PancakeSwap</span>
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">Biswap</span>
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">SushiSwap</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
