import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Activity, Zap, Shield, TrendingUp, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";

interface AgentSummary {
  total: number;
  active: number;
  agents: Array<{
    id: string;
    name: string;
    status: string;
    config?: any;
  }>;
}

export function AgentStatusWidget() {
  const [summary, setSummary] = useState<AgentSummary>({ total: 0, active: 0, agents: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    fetchAgentSummary();
    
    // Real-time updates
    const channel = supabase
      .channel('agent-status-widget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchAgentSummary)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAgentSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, status, config')
        .order('name');

      if (error) throw error;
      
      const agents = data || [];
      setSummary({
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        agents: agents.slice(0, 4) as Array<{ id: string; name: string; status: string; config?: any }>,
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (name: string) => {
    if (name.toLowerCase().includes('trading') || name.toLowerCase().includes('strategist')) return TrendingUp;
    if (name.toLowerCase().includes('security')) return Shield;
    if (name.toLowerCase().includes('automation')) return Zap;
    return Bot;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Agents
          </CardTitle>
          <Badge variant="outline" className="border-primary text-primary">
            <Activity className="h-3 w-3 mr-1" />
            {summary.active}/{summary.total} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3">
        {summary.agents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No AI agents configured
          </div>
        ) : (
          <>
            {summary.agents.map((agent) => {
              const IconComponent = getAgentIcon(agent.name);
              return (
                <div 
                  key={agent.id} 
                  className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    agent.status === 'active' ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      agent.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{agent.name}</span>
                      {agent.status === 'active' && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                  </div>
                </div>
              );
            })}

            {isAdmin && (
              <Button 
                variant="ghost" 
                className="w-full justify-between text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/admin/agents')}
              >
                Manage AI Agents
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
