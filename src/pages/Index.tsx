import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TrendingUp, Bot, Shield, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isMobileDevice = useIsMobile();
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect if user is on desktop (not mobile/tablet)
  useEffect(() => {
    const isDesktopDevice = !isMobileDevice && window.innerWidth >= 1024;
    setIsDesktop(isDesktopDevice);
  }, [isMobileDevice]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Redirect desktop users to app landing page
  useEffect(() => {
    if (isDesktop && !user && !loading) {
      navigate("/app-landing");
    }
  }, [isDesktop, user, loading, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="container px-4 py-16">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-primary">Growth</h1>
            <p className="text-xl text-muted-foreground">
              AI-Powered Cryptocurrency Trading Platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Bot className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Multi-Agent AI</h3>
              <p className="text-sm text-muted-foreground">Automated trading strategies</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Smart Trading</h3>
              <p className="text-sm text-muted-foreground">Best prices across DEXs</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Secure Wallet</h3>
              <p className="text-sm text-muted-foreground">Self-custody with encryption</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">Advanced insights</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
