import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentAction {
  action: 'start' | 'stop' | 'restart' | 'update_config';
  agentId: string;
  config?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, agentId, config }: AgentAction = await req.json();

    if (!action || !agentId) {
      throw new Error('Action and agentId are required');
    }

    console.log(`Agent action: ${action} for agent ${agentId} by user ${user.id}`);

    // Verify agent belongs to user
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    let updateData: any = {};
    let logMessage = '';

    switch (action) {
      case 'start':
        if (agent.status === 'active') {
          throw new Error('Agent is already active');
        }
        updateData = {
          status: 'active',
          last_active_at: new Date().toISOString(),
        };
        logMessage = 'Agent started successfully';
        break;

      case 'stop':
        if (agent.status === 'inactive') {
          throw new Error('Agent is already inactive');
        }
        updateData = {
          status: 'inactive',
        };
        logMessage = 'Agent stopped successfully';
        break;

      case 'restart':
        updateData = {
          status: 'active',
          last_active_at: new Date().toISOString(),
        };
        logMessage = 'Agent restarted successfully';
        break;

      case 'update_config':
        if (!config) {
          throw new Error('Config is required for update_config action');
        }
        updateData = {
          config: { ...agent.config, ...config },
          updated_at: new Date().toISOString(),
        };
        logMessage = 'Agent configuration updated';
        break;

      default:
        throw new Error('Invalid action');
    }

    // Update agent
    const { error: updateError } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', agentId);

    if (updateError) {
      console.error('Error updating agent:', updateError);
      throw new Error('Failed to update agent');
    }

    // Log the action
    await supabase
      .from('agent_logs')
      .insert({
        agent_id: agentId,
        log_level: 'info',
        message: logMessage,
        metadata: {
          action,
          user_id: user.id,
          previous_status: agent.status,
          new_status: updateData.status || agent.status,
        },
      });

    // Send notification to user
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Agent Status Update',
        message: `${agent.name}: ${logMessage}`,
        type: 'agent',
        metadata: {
          agent_id: agentId,
          action,
        },
      });

    console.log(`Agent ${agentId} ${action} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: logMessage,
        agent: {
          id: agentId,
          name: agent.name,
          status: updateData.status || agent.status,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in agent-manager:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
