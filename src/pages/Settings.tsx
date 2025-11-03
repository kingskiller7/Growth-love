import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, User, HelpCircle, LogOut, FileText, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={item.onClick}
            >
              <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{item.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-1">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="border-destructive/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-destructive flex items-center gap-2">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              Sign Out
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Log out of your account on this device
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
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
