import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { registerSchema } from "@/lib/validations";

export default function Register() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: "Accept terms",
        description: "Please accept the terms of service and privacy policy",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs with zod
    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const error = validation.error.errors[0];
      toast({
        title: "Validation error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
    if (!error) {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      navigate("/verify-email");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <h1 className="text-3xl font-bold text-primary">Growth</h1>
          </div>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Step 1 of 3 - Account Setup
          </CardDescription>
          <Progress value={33} className="mt-2" />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <div className="space-y-1">
                  <Progress value={passwordStrength()} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    Password strength: {passwordStrength() < 50 ? "Weak" : passwordStrength() < 75 ? "Medium" : "Strong"}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                  required
                />
                <Label htmlFor="privacy" className="text-sm cursor-pointer leading-tight">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={!acceptTerms || !acceptPrivacy || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
