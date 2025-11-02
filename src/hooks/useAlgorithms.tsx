import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Algorithm {
  id: string;
  name: string;
  description: string | null;
  category: string;
  roi: number;
  success_ratio: number;
  win_rate: number;
  total_trades: number;
  avg_profit_per_trade: number;
  risk_level: number | null;
  status: string;
  created_by: string | null;
  is_system: boolean;
  config: any;
  created_at: string;
  is_active?: boolean;
}

export function useAlgorithms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: algorithms = [], isLoading } = useQuery({
    queryKey: ['algorithms'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      // Fetch all available algorithms (system + user's custom)
      const { data: algos, error } = await supabase
        .from('algorithms')
        .select('*')
        .or(`is_system.eq.true,created_by.eq.${user.user?.id}`)
        .order('is_system', { ascending: false })
        .order('roi', { ascending: false });

      if (error) throw error;

      // Fetch user's active algorithm selections
      const { data: userAlgos, error: userAlgosError } = await supabase
        .from('user_algorithms')
        .select('algorithm_id, is_active')
        .eq('user_id', user.user?.id || '');

      if (userAlgosError) throw userAlgosError;

      // Merge active status
      return (algos || []).map(algo => ({
        ...algo,
        is_active: userAlgos?.find(ua => ua.algorithm_id === algo.id)?.is_active || false
      }));
    },
  });

  const toggleAlgorithm = useMutation({
    mutationFn: async ({ algorithmId, isActive }: { algorithmId: string; isActive: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      if (isActive) {
        // Activate algorithm
        const { error } = await supabase
          .from('user_algorithms')
          .upsert({
            user_id: user.user.id,
            algorithm_id: algorithmId,
            is_active: true
          });
        if (error) throw error;
      } else {
        // Deactivate algorithm
        const { error } = await supabase
          .from('user_algorithms')
          .update({ is_active: false })
          .eq('user_id', user.user.id)
          .eq('algorithm_id', algorithmId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['algorithms'] });
      toast({
        title: 'Algorithm Updated',
        description: 'Your algorithm selection has been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createCustomAlgorithm = useMutation({
    mutationFn: async (algorithm: {
      name: string;
      description: string;
      risk_level: number;
      config: any;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('algorithms')
        .insert({
          ...algorithm,
          category: 'custom',
          created_by: user.user.id,
          is_system: false,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['algorithms'] });
      toast({
        title: 'Algorithm Submitted',
        description: 'Your custom algorithm is pending admin approval',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    algorithms,
    isLoading,
    toggleAlgorithm: toggleAlgorithm.mutate,
    createCustomAlgorithm: createCustomAlgorithm.mutate,
  };
}
