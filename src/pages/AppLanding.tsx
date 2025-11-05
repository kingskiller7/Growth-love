import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Bot, TrendingUp, Shield, Zap, Smartphone, Download, CheckCircle2 } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";

const AppLanding = () => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  
  // The actual URL users will scan to access and install the PWA
  const appUrl = "https://73711044-afd6-4399-898c-338635b92e17.lovableproject.com";
  
  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast.success("App installation started!");
    } else if (!isInstallable) {
      toast.info("App is already installed or not installable on this device");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Growth</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</a>
            <a href="#download" className="text-sm text-muted-foreground hover:text-primary transition-colors">Download</a>
          </nav>
          <Button variant="outline" size="sm" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                PLAN YOUR <br />
                <span className="italic text-primary">CRYPTO JOURNEY</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                The most advanced AI-powered cryptocurrency trading platform. 
                Automated strategies, best DEX prices, and secure self-custody wallet.
              </p>
            </div>

            <div className="space-y-4">
              {isInstalled ? (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">App is installed!</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">The mobile app is available now</p>
              )}
              <div className="flex gap-4">
                {isInstallable && !isInstalled && (
                  <Button size="lg" className="gap-2" onClick={handleInstall}>
                    <Download className="h-5 w-5" />
                    Install App
                  </Button>
                )}
                <Button size="lg" variant={isInstallable ? "outline" : "default"} asChild>
                  <a href="/register">Get Started</a>
                </Button>
              </div>
              {!isInstallable && !isInstalled && (
                <p className="text-xs text-muted-foreground">
                  On mobile: Tap browser menu → "Add to Home Screen" to install
                </p>
              )}
            </div>
          </div>

          {/* Right Column - QR Code & Phone Mockup */}
          <div id="download" className="flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-card border-2 border-border rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4 text-center">
                  <Smartphone className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-xl font-semibold">Scan to Install</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Scan this QR code with your mobile device to access and install Growth PWA
                  </p>
                  <div className="bg-white p-6 rounded-xl">
                    <QRCode
                      value={appUrl}
                      size={200}
                      level="H"
                      fgColor="#000000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Works offline • Updates automatically • No app store needed
                  </p>
                  <a 
                    href={appUrl} 
                    className="text-xs text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {appUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-primary">1K+</h3>
            <p className="text-sm text-muted-foreground">ACTIVE TRADERS</p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-primary">10K+</h3>
            <p className="text-sm text-muted-foreground">SUCCESSFUL TRADES</p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-primary">4.8+</h3>
            <p className="text-sm text-muted-foreground">USER RATING</p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-bold text-primary">24/7</h3>
            <p className="text-sm text-muted-foreground">AI MONITORING</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">IMMENSE TRADING FEATURES</h2>
          <p className="text-lg text-muted-foreground italic">
            We turn your crypto dreams into profitable reality
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
            <Bot className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Multi-Agent AI</h3>
            <p className="text-sm text-muted-foreground">
              Self-learning algorithms that adapt to market conditions
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Best DEX Prices</h3>
            <p className="text-sm text-muted-foreground">
              Automatic price discovery across multiple exchanges
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Secure Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Self-custody with military-grade encryption
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Advanced insights and performance tracking
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="container mx-auto px-4 py-20 bg-secondary/20 rounded-3xl my-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">WHY TRADERS CHOOSE US</h2>
          <p className="text-lg text-muted-foreground italic">
            We are the top mobile crypto trading platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg">CLEAR & SIMPLE APP INTERFACE</h3>
            <p className="text-sm text-muted-foreground">
              Trade in just two clicks. It's possible with our intuitive app design
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg">THE MOBILE APP IS FREE FOR YOU</h3>
            <p className="text-sm text-muted-foreground">
              You can use the application without a paid subscription
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg">AI-POWERED STRATEGIES</h3>
            <p className="text-sm text-muted-foreground">
              Choose from AI-generated strategies or create your own
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">JOIN OUR COMMUNITY</h2>
          <p className="text-lg text-muted-foreground">
            Start trading smarter with AI-powered strategies and secure self-custody wallet
          </p>
          {isInstallable && !isInstalled ? (
            <Button size="lg" className="text-lg px-8" onClick={handleInstall}>
              <Download className="h-5 w-5 mr-2" />
              Install App Now
            </Button>
          ) : (
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="/register">Get Started</a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold">Growth</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Growth. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLanding;
