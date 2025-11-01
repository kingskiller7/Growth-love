import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, MinusCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AISuggestion {
  id: string;
  user_id: string;
  agent_id: string | null;
  suggestion_type: string;
  trading_pair: string;
  action: string;
  confidence: number;
  reasoning: string;
  price_target: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export const AISuggestionsPanel = ({ symbol }: { symbol?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["ai_suggestions", symbol],
    queryFn: async () => {
      let query = supabase
        .from("ai_suggestions" as any)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (symbol) {
        query = query.eq("trading_pair", symbol);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AISuggestion[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const updateSuggestion = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      const { error } = await supabase
        .from("ai_suggestions" as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai_suggestions"] });
      toast({
        title: variables.status === 'accepted' ? "Suggestion accepted" : "Suggestion rejected",
        description: variables.status === 'accepted' 
          ? "You can now execute this trade"
          : "Suggestion has been dismissed",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-secondary/50 border-accent/20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="p-4 bg-secondary/50 border-accent/20">
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No AI suggestions available</p>
          <p className="text-xs mt-2">AI will analyze markets and provide recommendations</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">AI Trading Suggestions</h3>
        <Badge variant="outline" className="text-xs">
          Powered by Gemini 2.5 Flash
        </Badge>
      </div>

      {suggestions.map((suggestion) => {
        const isExpired = suggestion.expires_at && new Date(suggestion.expires_at) < new Date();
        const actionIcon = suggestion.action === 'buy' 
          ? <TrendingUp className="h-4 w-4 text-green-500" />
          : suggestion.action === 'sell'
          ? <TrendingDown className="h-4 w-4 text-red-500" />
          : <MinusCircle className="h-4 w-4 text-yellow-500" />;

        return (
          <Card 
            key={suggestion.id} 
            className={`p-4 bg-secondary/30 border-accent/10 ${isExpired ? 'opacity-50' : ''}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {actionIcon}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground uppercase">
                        {suggestion.action}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {suggestion.trading_pair}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          Number(suggestion.confidence) > 70 
                            ? 'border-green-500/50 text-green-500'
                            : Number(suggestion.confidence) > 50
                            ? 'border-yellow-500/50 text-yellow-500'
                            : 'border-red-500/50 text-red-500'
                        }`}
                      >
                        {suggestion.confidence}% confidence
                      </Badge>
                      {isExpired && (
                        <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {suggestion.reasoning}
              </p>

              {(suggestion.price_target || suggestion.stop_loss || suggestion.take_profit) && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                  {suggestion.price_target && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-xs font-semibold text-foreground">${Number(suggestion.price_target).toFixed(2)}</p>
                    </div>
                  )}
                  {suggestion.stop_loss && (
                    <div>
                      <p className="text-xs text-muted-foreground">Stop Loss</p>
                      <p className="text-xs font-semibold text-destructive">${Number(suggestion.stop_loss).toFixed(2)}</p>
                    </div>
                  )}
                  {suggestion.take_profit && (
                    <div>
                      <p className="text-xs text-muted-foreground">Take Profit</p>
                      <p className="text-xs font-semibold text-green-500">${Number(suggestion.take_profit).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}

              {!isExpired && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-accent hover:bg-accent/80"
                    onClick={() => updateSuggestion.mutate({ id: suggestion.id, status: 'accepted' })}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateSuggestion.mutate({ id: suggestion.id, status: 'rejected' })}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};