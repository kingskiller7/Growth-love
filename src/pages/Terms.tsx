import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Eye, Lock } from "lucide-react";

export default function Terms() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Terms & Privacy</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Our commitment to transparency and your privacy
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Terms of Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3 sm:space-y-4">
              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">1. Acceptance of Terms</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  By accessing and using Growth, you accept and agree to be bound by these Terms of Service. 
                  This platform provides cryptocurrency trading services powered by AI agents and requires full 
                  understanding of the risks involved in cryptocurrency trading.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">2. Trading Risks</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Cryptocurrency trading involves substantial risk of loss. Our AI agents provide automated trading 
                  suggestions and executions, but past performance does not guarantee future results. You are solely 
                  responsible for your trading decisions and any resulting losses.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">3. Account Security</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials, private keys, 
                  and recovery phrases. Growth implements self-custody wallet technology, meaning you have full control 
                  and responsibility for your funds.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">4. DEW Token Usage</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  All deposits are automatically converted to DEW tokens, our platform's native currency. Withdrawals 
                  can be made in BTC, USDT, ETH, and other supported cryptocurrencies. Transaction fees apply to all 
                  conversions and withdrawals.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">5. AI Agent Services</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Our multi-agent AI system provides automated trading services based on algorithms and market analysis. 
                  While our agents are designed to optimize trading performance, they may not always produce profitable 
                  results. You can enable, disable, or configure agents at any time.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">6. Prohibited Activities</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You may not use Growth for money laundering, fraud, market manipulation, or any illegal activities. 
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious 
                  activities.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">7. Limitation of Liability</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Growth and its operators are not liable for any direct, indirect, incidental, or consequential damages 
                  arising from your use of the platform, including trading losses, technical failures, or security breaches 
                  resulting from user negligence.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Privacy Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3 sm:space-y-4">
              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Information We Collect</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <strong>Account Information:</strong> Email, name, phone number, and verification documents
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <strong>Transaction Data:</strong> Trading history, deposits, withdrawals, and wallet addresses
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <strong>Usage Data:</strong> Device information, IP addresses, login history, and platform interactions
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">How We Use Your Information</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We use your information to provide and improve our services, process transactions, ensure platform 
                  security, comply with legal obligations, and communicate important updates. We never sell your personal 
                  information to third parties.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Data Security</h3>
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    We implement industry-standard encryption, secure key storage, multi-factor authentication, and regular 
                    security audits to protect your data. Your private keys are encrypted and never transmitted to our servers.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Third-Party Services</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We integrate with decentralized exchanges (DEXs) and blockchain networks to execute trades. These 
                  third-party services have their own privacy policies. We use analytics services to improve platform 
                  performance but do not share personally identifiable information.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Your Rights</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You have the right to access, correct, or delete your personal information. You can export your trading 
                  data and close your account at any time from the settings page. Some information may be retained for 
                  legal compliance purposes.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Updates to This Policy</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We may update this Privacy Policy periodically. We will notify you of significant changes via email 
                  or platform notifications. Continued use of Growth after changes constitutes acceptance of the updated policy.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs text-muted-foreground text-center">
                Last Updated: January 2025 • For questions or concerns, contact us through Help & Support
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
