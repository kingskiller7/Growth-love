import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Mail, BookOpen, HelpCircle, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Help() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support Request Sent",
      description: "Our team will get back to you within 24 hours.",
    });
    setSubject("");
    setMessage("");
  };

  const faqs = [
    {
      question: "How do I get started with Growth?",
      answer: "After creating your account and completing verification, make your first deposit. It will be automatically converted to DEW tokens. Then, you can either trade manually or activate AI agents to trade for you automatically."
    },
    {
      question: "What are DEW tokens?",
      answer: "DEW is Growth's native token. All deposits are converted to DEW for platform use. When you withdraw, DEW tokens are converted back to your chosen cryptocurrency (BTC, USDT, ETH, etc.). This ensures seamless trading across all supported assets."
    },
    {
      question: "How do AI trading agents work?",
      answer: "Our multi-agent AI system analyzes market data, identifies trading opportunities, and executes trades based on proven strategies. You can enable/disable agents, configure risk parameters, and monitor their performance in real-time from the Algo page."
    },
    {
      question: "Are my funds safe?",
      answer: "Growth uses self-custody wallet technology, meaning you control your private keys. We implement military-grade encryption, multi-signature support, and regular security audits. Your private keys are encrypted locally and never transmitted to our servers."
    },
    {
      question: "What fees does Growth charge?",
      answer: "Growth charges a small percentage on trades executed through the platform and network fees for deposits/withdrawals. DEX integration fees apply for multi-exchange routing. All fees are displayed transparently before transaction confirmation."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "Navigate to the Wallet page, select the asset you want to withdraw, enter the destination address and amount. Your DEW tokens will be converted to the selected cryptocurrency at current market rates. Withdrawals are processed based on network confirmation times."
    },
    {
      question: "Can I customize trading strategies?",
      answer: "Yes! Advanced users can create custom algorithms and submit them for approval. Navigate to the Algo page, click 'Create Custom Algorithm', and configure your strategy parameters. Approved algorithms become available to all users."
    },
    {
      question: "What is backtesting?",
      answer: "Backtesting allows you to test trading strategies against historical market data to evaluate their performance before deploying them with real funds. Access backtesting from the Analytics page to optimize your strategies."
    },
    {
      question: "How do I enable 2FA?",
      answer: "Navigate to Settings → Security Settings → Two-Factor Authentication. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.), enter the verification code, and save your backup codes in a secure location."
    },
    {
      question: "What should I do if I lose my private key?",
      answer: "If you lose your private key and don't have your recovery phrase, access to your funds may be permanently lost. This is the nature of self-custody. Always back up your recovery phrase immediately after account creation and store it securely offline."
    },
    {
      question: "How do circuit breakers protect my funds?",
      answer: "Circuit breakers automatically pause trading during extreme market volatility or if risk thresholds are exceeded. This prevents catastrophic losses during flash crashes or unexpected market events. You can configure your risk parameters in the Algo settings."
    },
    {
      question: "Can I use Growth on mobile?",
      answer: "Yes! Growth is a Progressive Web App (PWA) that works seamlessly on mobile devices. You can add it to your home screen for an app-like experience with offline capabilities and push notifications."
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Help & Support</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find answers or contact our support team
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader className="p-4 flex flex-row items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <CardTitle className="text-sm sm:text-base">Documentation</CardTitle>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader className="p-4 flex flex-row items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                <CardTitle className="text-sm sm:text-base">Live Chat</CardTitle>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <CardTitle className="text-sm sm:text-base">Email Support</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Contact Support</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Can't find what you're looking for? Send us a message
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="What do you need help with?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-destructive/50">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-center">
                <strong className="text-destructive">Emergency Security Issue?</strong>
                <br />
                If you believe your account has been compromised, immediately use the emergency lockdown feature in Security Settings or contact us at <a href="mailto:security@growth.app" className="text-primary hover:underline">security@growth.app</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
