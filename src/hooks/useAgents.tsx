import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  strategy: string | null;
  risk_level: number | null;
  trading_pairs: string[];
  created_at: string;
  last_active_at: string | null;
}

export interface AgentPerformance {
  id: string;
  agent_id: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  total_profit_usd: number;
  avg_profit_per_trade: number;
  max_drawdown: number;
  sharpe_ratio: number | null;
  recorded_at: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [performance, setPerformance] = useState<Record<string, AgentPerformance>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();

    const channel = supabase
      .channel('agent-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchAgents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_performance' }, fetchAgents)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAgents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;
      if (agentsData) {
        setAgents(agentsData);

        // Fetch performance for each agent
        const performanceMap: Record<string, AgentPerformance> = {};
        for (const agent of agentsData) {
          const { data: perfData } = await supabase
            .from('agent_performance')
            .select('*')
            .eq('agent_id', agent.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();

          if (perfData) {
            performanceMap[agent.id] = perfData;
          }
        }
        setPerformance(performanceMap);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch agents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { agents, performance, loading, refetch: fetchAgents };
}
