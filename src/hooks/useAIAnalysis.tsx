import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisRequest {
  type: 'market_analysis' | 'trade_suggestion' | 'portfolio_analysis' | 'risk_assessment';
  data: any;
}

export const useAIAnalysis = () => {
  const { toast } = useToast();

  const analyzeMarket = useMutation({
    mutationFn: async ({ type, data }: AIAnalysisRequest) => {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: { type, data }
      });

      if (error) {
        console.error('AI Analysis error:', error);
        throw error;
      }

      return result;
    },
    onError: (error: any) => {
      if (error.message?.includes('429')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many AI requests. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes('402')) {
        toast({
          title: "Payment Required",
          description: "Please add credits to your workspace to use AI features.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "AI Analysis Error",
          description: error instanceof Error ? error.message : "Failed to analyze",
          variant: "destructive",
        });
      }
    },
  });

  return {
    analyze: analyzeMarket.mutate,
    isAnalyzing: analyzeMarket.isPending,
    analysis: analyzeMarket.data,
  };
};