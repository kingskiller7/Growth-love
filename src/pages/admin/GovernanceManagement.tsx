import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  votes_for: number;
  votes_against: number;
  quorum_required: number;
  voting_ends_at: string;
  created_at: string;
}

export default function GovernanceManagement() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();

    const channel = supabase
      .channel('proposal-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'governance_proposals' }, fetchProposals)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProposals(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch proposals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent';
      case 'passed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-destructive';
      case 'executed':
        return 'bg-blue-500';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">Loading proposals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Governance Management</h1>
      </div>

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">No proposals yet</div>
            </CardContent>
          </Card>
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{proposal.title}</CardTitle>
                  <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{proposal.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Votes For</div>
                    <div className="text-2xl font-bold text-accent">{proposal.votes_for}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Votes Against</div>
                    <div className="text-2xl font-bold text-destructive">{proposal.votes_against}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Quorum Required: {proposal.quorum_required}</span>
                  <span>Ends: {new Date(proposal.voting_ends_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
