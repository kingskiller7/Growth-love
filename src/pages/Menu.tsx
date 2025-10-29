import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, User, Settings, HelpCircle, LogOut, FileText, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Menu() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const menuItems = [
    {
      icon: Shield,
      title: "Security Settings",
      description: "Manage 2FA, login history, and security alerts",
      onClick: () => navigate("/security"),
      variant: "default" as const,
    },
    {
      icon: User,
      title: "Profile Settings",
      description: "Update your personal information and preferences",
      onClick: () => navigate("/profile-setup"),
      variant: "outline" as const,
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure notification preferences",
      onClick: () => {},
      variant: "outline" as const,
    },
    {
      icon: FileText,
      title: "Terms & Privacy",
      description: "View our terms of service and privacy policy",
      onClick: () => {},
      variant: "outline" as const,
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help and contact customer support",
      onClick: () => {},
      variant: "outline" as const,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={item.onClick}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Sign Out
            </CardTitle>
            <CardDescription>
              Log out of your account on this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
