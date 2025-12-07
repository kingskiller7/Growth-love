import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Shield, CheckCircle, XCircle, Clock, Eye, 
  FileText, User, MapPin, Loader2, Search,
  Calendar, AlertTriangle, Download
} from "lucide-react";
import { useKYC } from "@/hooks/useKYC";
import { formatDistanceToNow } from "date-fns";

interface KYCSubmission {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function KYCReview() {
  const { submissions, fetchPendingSubmissions, verifyUser, getDocumentUrl } = useKYC();
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<{
    front: string | null;
    back: string | null;
    selfie: string | null;
  }>({ front: null, back: null, selfie: null });

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const handleViewSubmission = async (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setReviewNotes(submission.admin_notes || "");
    
    // Load document URLs
    const front = submission.document_front_url 
      ? await getDocumentUrl(submission.document_front_url) 
      : null;
    const back = submission.document_back_url 
      ? await getDocumentUrl(submission.document_back_url) 
      : null;
    const selfie = submission.selfie_url 
      ? await getDocumentUrl(submission.selfie_url) 
      : null;
    
    setDocumentUrls({ front, back, selfie });
  };

  const handleReview = async (approved: boolean) => {
    if (!selectedSubmission) return;
    setIsReviewing(true);
    
    await verifyUser(
      selectedSubmission.user_id, 
      selectedSubmission.id, 
      approved, 
      reviewNotes
    );
    
    setIsReviewing(false);
    setSelectedSubmission(null);
    setReviewNotes("");
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  const filterSubmissions = (list: KYCSubmission[]) => {
    if (!searchQuery) return list;
    return list.filter(s => 
      s.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.document_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-primary/20 text-primary"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'national_id': return 'National ID Card';
      case 'drivers_license': return "Driver's License";
      default: return type;
    }
  };

  const SubmissionCard = ({ submission }: { submission: KYCSubmission }) => (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{submission.user_id.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-3 w-3" />
            {getDocumentTypeName(submission.document_type)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {submission.city}, {submission.country.toUpperCase()}
          </div>
        </div>
        {getStatusBadge(submission.status)}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 inline mr-1" />
          {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleViewSubmission(submission)}
        >
          <Eye className="h-3 w-3 mr-1" />
          Review
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">KYC Review</h1>
            <p className="text-muted-foreground">Review and approve user identity verification</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{pendingSubmissions.length}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{approvedSubmissions.length}</div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{rejectedSubmissions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Tabs */}
        <Card>
          <Tabs defaultValue="pending">
            <CardHeader>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="pending" className="flex-1 sm:flex-none">
                  Pending ({pendingSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex-1 sm:flex-none">
                  Approved ({approvedSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1 sm:flex-none">
                  Rejected ({rejectedSubmissions.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="pending" className="mt-0">
                {filterSubmissions(pendingSubmissions).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending submissions</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filterSubmissions(pendingSubmissions).map(submission => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="approved" className="mt-0">
                {filterSubmissions(approvedSubmissions).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No approved submissions</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filterSubmissions(approvedSubmissions).map(submission => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                {filterSubmissions(rejectedSubmissions).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rejected submissions</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filterSubmissions(rejectedSubmissions).map(submission => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Review KYC Submission
              </DialogTitle>
            </DialogHeader>
            
            {selectedSubmission && (
              <div className="space-y-6">
                {/* User Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">User ID</Label>
                      <p className="font-mono text-sm">{selectedSubmission.user_id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Document Type</Label>
                      <p>{getDocumentTypeName(selectedSubmission.document_type)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Document Number</Label>
                      <p className="font-mono">{selectedSubmission.document_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Submitted</Label>
                      <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Residential Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedSubmission.address}</p>
                    <p>{selectedSubmission.city}, {selectedSubmission.postal_code}</p>
                    <p className="font-medium">{selectedSubmission.country.toUpperCase()}</p>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-3">
                    {documentUrls.front ? (
                      <div className="space-y-2">
                        <Label>Document Front</Label>
                        <a href={documentUrls.front} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={documentUrls.front} 
                            alt="Document Front" 
                            className="w-full h-32 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(documentUrls.front!, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View Full
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 rounded-lg bg-muted text-muted-foreground">
                        Not uploaded
                      </div>
                    )}
                    
                    {documentUrls.back ? (
                      <div className="space-y-2">
                        <Label>Document Back</Label>
                        <a href={documentUrls.back} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={documentUrls.back} 
                            alt="Document Back" 
                            className="w-full h-32 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(documentUrls.back!, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View Full
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 rounded-lg bg-muted text-muted-foreground">
                        Not uploaded
                      </div>
                    )}
                    
                    {documentUrls.selfie ? (
                      <div className="space-y-2">
                        <Label>Selfie with Document</Label>
                        <a href={documentUrls.selfie} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={documentUrls.selfie} 
                            alt="Selfie" 
                            className="w-full h-32 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(documentUrls.selfie!, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View Full
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 rounded-lg bg-muted text-muted-foreground">
                        Not uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Review Notes */}
                {selectedSubmission.status === 'pending' && (
                  <div className="space-y-2">
                    <Label>Admin Notes (optional)</Label>
                    <Textarea
                      placeholder="Add notes about your review decision..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {/* Previous Notes */}
                {selectedSubmission.admin_notes && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Admin Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedSubmission.admin_notes}</p>
                      {selectedSubmission.reviewed_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed: {new Date(selectedSubmission.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubmission(null)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              {selectedSubmission?.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleReview(false)}
                    disabled={isReviewing}
                    className="w-full sm:w-auto"
                  >
                    {isReviewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleReview(true)}
                    disabled={isReviewing}
                    className="w-full sm:w-auto"
                  >
                    {isReviewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
