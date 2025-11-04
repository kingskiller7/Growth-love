import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, TrendingUp, Shield, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Trading Notifications
    tradeExecuted: true,
    pricealerts: true,
    portfolioMilestones: true,
    aiSuggestions: true,
    
    // Security Notifications
    loginAlerts: true,
    securityAlerts: true,
    newDeviceLogin: true,
    passwordChanges: true,
    
    // Transaction Notifications
    deposits: true,
    withdrawals: true,
    confirmations: true,
    
    // AI Agent Notifications
    agentStatus: true,
    performanceAlerts: true,
    strategyChanges: false,
    
    // System Notifications
    maintenance: true,
    updates: true,
    marketNews: false,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    toast({
      title: "Notification Settings Updated",
      description: "Your preferences have been saved.",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Notification Preferences</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage how and when you receive notifications
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Trading Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Trading Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Stay informed about your trades and market movements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trade-executed" className="text-sm sm:text-base">Trade Executed</Label>
                  <p className="text-xs text-muted-foreground">Notify when trades are completed</p>
                </div>
                <Switch
                  id="trade-executed"
                  checked={settings.tradeExecuted}
                  onCheckedChange={() => handleToggle('tradeExecuted')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="price-alerts" className="text-sm sm:text-base">Price Alerts</Label>
                  <p className="text-xs text-muted-foreground">Alert when assets reach target prices</p>
                </div>
                <Switch
                  id="price-alerts"
                  checked={settings.pricealerts}
                  onCheckedChange={() => handleToggle('pricealerts')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="portfolio-milestones" className="text-sm sm:text-base">Portfolio Milestones</Label>
                  <p className="text-xs text-muted-foreground">Celebrate gains and profit targets</p>
                </div>
                <Switch
                  id="portfolio-milestones"
                  checked={settings.portfolioMilestones}
                  onCheckedChange={() => handleToggle('portfolioMilestones')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-suggestions" className="text-sm sm:text-base">AI Suggestions</Label>
                  <p className="text-xs text-muted-foreground">Receive AI-powered trading insights</p>
                </div>
                <Switch
                  id="ai-suggestions"
                  checked={settings.aiSuggestions}
                  onCheckedChange={() => handleToggle('aiSuggestions')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Security Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Critical security alerts (recommended to keep all enabled)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="login-alerts" className="text-sm sm:text-base">Login Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notify on every login attempt</p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={settings.loginAlerts}
                  onCheckedChange={() => handleToggle('loginAlerts')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="security-alerts" className="text-sm sm:text-base">Security Alerts</Label>
                  <p className="text-xs text-muted-foreground">Suspicious activity warnings</p>
                </div>
                <Switch
                  id="security-alerts"
                  checked={settings.securityAlerts}
                  onCheckedChange={() => handleToggle('securityAlerts')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-device" className="text-sm sm:text-base">New Device Login</Label>
                  <p className="text-xs text-muted-foreground">Alert when logging in from new device</p>
                </div>
                <Switch
                  id="new-device"
                  checked={settings.newDeviceLogin}
                  onCheckedChange={() => handleToggle('newDeviceLogin')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="password-changes" className="text-sm sm:text-base">Password Changes</Label>
                  <p className="text-xs text-muted-foreground">Notify on password updates</p>
                </div>
                <Switch
                  id="password-changes"
                  checked={settings.passwordChanges}
                  onCheckedChange={() => handleToggle('passwordChanges')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Transaction Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Transaction Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Track deposits, withdrawals, and confirmations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="deposits" className="text-sm sm:text-base">Deposits</Label>
                  <p className="text-xs text-muted-foreground">Confirm deposit transactions</p>
                </div>
                <Switch
                  id="deposits"
                  checked={settings.deposits}
                  onCheckedChange={() => handleToggle('deposits')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="withdrawals" className="text-sm sm:text-base">Withdrawals</Label>
                  <p className="text-xs text-muted-foreground">Confirm withdrawal requests</p>
                </div>
                <Switch
                  id="withdrawals"
                  checked={settings.withdrawals}
                  onCheckedChange={() => handleToggle('withdrawals')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="confirmations" className="text-sm sm:text-base">Network Confirmations</Label>
                  <p className="text-xs text-muted-foreground">Update on blockchain confirmations</p>
                </div>
                <Switch
                  id="confirmations"
                  checked={settings.confirmations}
                  onCheckedChange={() => handleToggle('confirmations')}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">AI Agent Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Monitor your automated trading agents
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="agent-status" className="text-sm sm:text-base">Agent Status Changes</Label>
                  <p className="text-xs text-muted-foreground">Alert when agents start or stop</p>
                </div>
                <Switch
                  id="agent-status"
                  checked={settings.agentStatus}
                  onCheckedChange={() => handleToggle('agentStatus')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="performance-alerts" className="text-sm sm:text-base">Performance Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notify on significant wins or losses</p>
                </div>
                <Switch
                  id="performance-alerts"
                  checked={settings.performanceAlerts}
                  onCheckedChange={() => handleToggle('performanceAlerts')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="strategy-changes" className="text-sm sm:text-base">Strategy Changes</Label>
                  <p className="text-xs text-muted-foreground">Alert on agent strategy modifications</p>
                </div>
                <Switch
                  id="strategy-changes"
                  checked={settings.strategyChanges}
                  onCheckedChange={() => handleToggle('strategyChanges')}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <CardTitle className="text-lg sm:text-xl">System Notifications</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Platform updates and announcements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance" className="text-sm sm:text-base">Maintenance Alerts</Label>
                  <p className="text-xs text-muted-foreground">Scheduled maintenance notifications</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenance}
                  onCheckedChange={() => handleToggle('maintenance')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="updates" className="text-sm sm:text-base">Platform Updates</Label>
                  <p className="text-xs text-muted-foreground">New features and improvements</p>
                </div>
                <Switch
                  id="updates"
                  checked={settings.updates}
                  onCheckedChange={() => handleToggle('updates')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="market-news" className="text-sm sm:text-base">Market News</Label>
                  <p className="text-xs text-muted-foreground">Important crypto market updates</p>
                </div>
                <Switch
                  id="market-news"
                  checked={settings.marketNews}
                  onCheckedChange={() => handleToggle('marketNews')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
