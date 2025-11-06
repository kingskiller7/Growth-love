import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Algorithm {
  id: string;
  name: string;
  description: string;
  category: string;
  created_by: string;
  risk_level: number;
  status: string;
  is_system: boolean;
  roi: number;
  win_rate: number;
  total_trades: number;
  created_at: string;
}

export default function AlgorithmManagement() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlgorithms();

    const channel = supabase
      .channel('algorithm-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'algorithms' }, fetchAlgorithms)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlgorithms = async () => {
    try {
      const { data, error } = await supabase
        .from('algorithms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAlgorithms(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch algorithms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('algorithms')
        .update({ status: 'active', approved_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Algorithm Approved',
        description: 'Algorithm has been approved and activated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve algorithm',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('algorithms')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Algorithm Rejected',
        description: 'Algorithm has been rejected',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject algorithm',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('algorithms')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Algorithm Deactivated',
        description: 'Algorithm has been deactivated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate algorithm',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-destructive';
      case 'inactive':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const getRiskColor = (level: number) => {
    if (level <= 3) return 'text-accent';
    if (level <= 6) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="text-center text-muted-foreground">Loading algorithms...</div>
        </div>
      </MainLayout>
    );
  }

  const pendingAlgos = algorithms.filter(a => a.status === 'pending');
  const activeAlgos = algorithms.filter(a => a.status === 'active');
  const otherAlgos = algorithms.filter(a => !['pending', 'active'].includes(a.status));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Algorithm Management</h1>
            <p className="text-muted-foreground">Review and manage trading algorithms</p>
          </div>
        </div>

        {pendingAlgos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Approval ({pendingAlgos.length})
            </h2>
            {pendingAlgos.map((algo) => (
              <Card key={algo.id} className="game-card border-warning/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {algo.name}
                        <Badge className={getStatusColor(algo.status)}>{algo.status}</Badge>
                        {!algo.is_system && <Badge variant="outline">User Submitted</Badge>}
                      </CardTitle>
                      <CardDescription>{algo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{algo.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Risk Level</div>
                      <div className={`text-2xl font-bold ${getRiskColor(algo.risk_level)}`}>{algo.risk_level}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">ROI</div>
                      <div className="text-2xl font-bold text-accent">{algo.roi}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-2xl font-bold">{algo.win_rate}%</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button onClick={() => handleApprove(algo.id)} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(algo.id)} variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Active Algorithms ({activeAlgos.length})
          </h2>
          {activeAlgos.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">No active algorithms</div>
              </CardContent>
            </Card>
          ) : (
            activeAlgos.map((algo) => (
              <Card key={algo.id} className="game-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {algo.name}
                        <Badge className={getStatusColor(algo.status)}>{algo.status}</Badge>
                        {algo.is_system && <Badge variant="outline" className="border-primary">System</Badge>}
                      </CardTitle>
                      <CardDescription>{algo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{algo.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Risk</div>
                      <div className={`text-xl font-bold ${getRiskColor(algo.risk_level)}`}>{algo.risk_level}/10</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">ROI</div>
                      <div className="text-xl font-bold text-accent">{algo.roi}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-xl font-bold">{algo.win_rate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                      <div className="text-xl font-bold font-mono">{algo.total_trades}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button onClick={() => handleDeactivate(algo.id)} variant="outline" size="sm">
                      Deactivate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {otherAlgos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Other Algorithms ({otherAlgos.length})
            </h2>
            {otherAlgos.map((algo) => (
              <Card key={algo.id} className="game-card opacity-60">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      {algo.name}
                      <Badge className={getStatusColor(algo.status)}>{algo.status}</Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{algo.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
