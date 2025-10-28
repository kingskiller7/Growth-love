import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileUpdateSchema } from "@/lib/validations";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    const profileData = {
      full_name: fullName,
      phone_number: phone,
      country,
      date_of_birth: dateOfBirth || undefined,
    };

    // Validate with zod
    const validation = profileUpdateSchema.safeParse(profileData);
    
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
    
    const { error } = await updateProfile(validation.data);

    if (!error) {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      navigate("/security-setup");
    }
    
    setLoading(false);
  };

  const handleSkip = () => {
    navigate("/security-setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Complete your profile</CardTitle>
          <CardDescription className="text-center">
            Step 2 of 3 - Profile Setup
          </CardDescription>
          <Progress value={66} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4 text-primary-foreground" />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleContinue} className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
            </Button>
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
