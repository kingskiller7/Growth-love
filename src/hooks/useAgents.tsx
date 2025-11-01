import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  strategy: string;
  status: string;
  risk_level: string;
  trading_pairs: string[];
  max_position_size: number | null;
  stop_loss_percentage: number | null;
  take_profit_percentage: number | null;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface AgentPerformance {
  id: string;
  agent_id: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number | null;
  total_profit: number;
  average_profit: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  last_trade_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [performance, setPerformance] = useState<Record<string, AgentPerformance>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .from('agents' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;
      if (agentsData) {
        setAgents(agentsData as unknown as Agent[]);

        // Fetch performance for each agent
        const performanceMap: Record<string, AgentPerformance> = {};
        for (const agent of (agentsData as any[])) {
          const { data: perfData } = await supabase
            .from('agent_performance' as any)
            .select('*')
            .eq('agent_id', agent.id)
            .limit(1)
            .single();

          if (perfData) {
            performanceMap[agent.id] = perfData as unknown as AgentPerformance;
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

  const createAgent = useMutation({
    mutationFn: async (agentData: Partial<Agent>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("agents" as any)
        .insert([{ ...agentData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      fetchAgents();
      toast({
        title: "Success",
        description: "Agent created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const updateAgentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("agents" as any)
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Agent;
    },
    onSuccess: (data: Agent) => {
      fetchAgents();
      toast({
        title: "Success",
        description: `Agent ${data.status === 'active' ? 'activated' : 'stopped'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update agent",
        variant: "destructive",
      });
    },
  });

  const stopAllAgents = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("agents" as any)
        .update({ status: 'inactive' })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;
    },
    onSuccess: () => {
      fetchAgents();
      toast({
        title: "Success",
        description: "All agents stopped",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop agents",
        variant: "destructive",
      });
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agents" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      fetchAgents();
      toast({
        title: "Success",
        description: "Agent deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete agent",
        variant: "destructive",
      });
    },
  });

  return { 
    agents, 
    performance, 
    loading, 
    refetch: fetchAgents,
    createAgent: createAgent.mutate,
    updateAgentStatus: updateAgentStatus.mutate,
    stopAllAgents: stopAllAgents.mutate,
    deleteAgent: deleteAgent.mutate,
  };
}
