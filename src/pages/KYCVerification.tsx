import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Upload, CheckCircle, Clock, AlertTriangle, 
  FileText, Camera, User, ArrowLeft, Loader2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKYC } from "@/hooks/useKYC";

export default function KYCVerification() {
  const navigate = useNavigate();
  const { kycStatus, submitKYC, loading } = useKYC();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfie: null as File | null,
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async () => {
    await submitKYC(formData);
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <Badge className="bg-primary/20 text-primary"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Not Submitted</Badge>;
    }
  };

  if (kycStatus === 'verified') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">KYC Verified</CardTitle>
              <CardDescription>Your identity has been successfully verified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-center">You have full access to all platform features including unlimited withdrawals.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <Card className="border-warning/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <CardTitle className="text-2xl">Verification In Progress</CardTitle>
              <CardDescription>Your documents are being reviewed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-center">This usually takes 1-3 business days. We'll notify you once the review is complete.</p>
              </div>
              <Progress value={50} className="h-2" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          {getStatusBadge()}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground">Complete verification to unlock full platform features</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
              <CardDescription>Select your ID document type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select 
                  value={formData.documentType} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, documentType: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="national_id">National ID Card</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Number</Label>
                <Input
                  placeholder="Enter document number"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => setStep(2)}
                disabled={!formData.documentType || !formData.documentNumber}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>Upload clear photos of your documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Document Front</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="doc-front"
                      onChange={handleFileChange('documentFront')}
                    />
                    <label htmlFor="doc-front" className="cursor-pointer">
                      {formData.documentFront ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm">{formData.documentFront.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload front</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Document Back</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="doc-back"
                      onChange={handleFileChange('documentBack')}
                    />
                    <label htmlFor="doc-back" className="cursor-pointer">
                      {formData.documentBack ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm">{formData.documentBack.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload back</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Selfie with Document</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="selfie"
                    onChange={handleFileChange('selfie')}
                  />
                  <label htmlFor="selfie" className="cursor-pointer">
                    {formData.selfie ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm">{formData.selfie.name}</span>
                      </div>
                    ) : (
                      <>
                        <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Take a selfie holding your document</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setStep(3)}
                  disabled={!formData.documentFront || !formData.selfie}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Address Verification
              </CardTitle>
              <CardDescription>Enter your residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    placeholder="12345"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, country: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={loading || !formData.address || !formData.city || !formData.country}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Why do we need this?</p>
                <p className="text-muted-foreground">
                  KYC verification helps us comply with regulations and protect your account from fraud.
                  Your data is encrypted and stored securely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}