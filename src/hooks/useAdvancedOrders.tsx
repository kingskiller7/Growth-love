import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrailingStopOrder {
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  trailingPercent: number;
  orderSide: 'buy' | 'sell';
}

export interface OCOOrder {
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  limitPrice: number;
  stopPrice: number;
  orderSide: 'buy' | 'sell';
}

export interface MarginOrder {
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  leverage: number;
  orderSide: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price?: number;
}

export function useAdvancedOrders() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTrailingStopOrder = async (params: TrailingStopOrder) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          base_asset: params.baseAsset,
          quote_asset: params.quoteAsset,
          order_type: 'stop',
          order_side: params.orderSide,
          amount: params.amount,
          trailing_stop_percent: params.trailingPercent,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Trailing Stop Order Created',
        description: `${params.trailingPercent}% trailing stop for ${params.amount} ${params.baseAsset}`,
      });

      return data;
    } catch (error) {
      console.error('Error creating trailing stop order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create trailing stop order',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createOCOOrder = async (params: OCOOrder) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create limit order
      const { data: limitOrder, error: limitError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          base_asset: params.baseAsset,
          quote_asset: params.quoteAsset,
          order_type: 'limit',
          order_side: params.orderSide,
          amount: params.amount,
          price: params.limitPrice,
          status: 'open',
        })
        .select()
        .single();

      if (limitError) throw limitError;

      // Create stop order linked to limit order
      const { data: stopOrder, error: stopError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          base_asset: params.baseAsset,
          quote_asset: params.quoteAsset,
          order_type: 'stop',
          order_side: params.orderSide,
          amount: params.amount,
          stop_price: params.stopPrice,
          oco_linked_order_id: limitOrder.id,
          status: 'open',
        })
        .select()
        .single();

      if (stopError) throw stopError;

      // Update limit order to link to stop order
      await supabase
        .from('orders')
        .update({ oco_linked_order_id: stopOrder.id })
        .eq('id', limitOrder.id);

      toast({
        title: 'OCO Order Created',
        description: `Limit at $${params.limitPrice} / Stop at $${params.stopPrice}`,
      });

      return { limitOrder, stopOrder };
    } catch (error) {
      console.error('Error creating OCO order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create OCO order',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createMarginOrder = async (params: MarginOrder) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check leverage limits (max 10x for safety)
      if (params.leverage > 10) {
        throw new Error('Maximum leverage is 10x');
      }

      // Calculate liquidation price (simplified)
      const maintenanceMargin = 0.05; // 5% maintenance margin
      const liquidationPrice = params.orderSide === 'buy'
        ? (params.price || 0) * (1 - (1 / params.leverage) + maintenanceMargin)
        : (params.price || 0) * (1 + (1 / params.leverage) - maintenanceMargin);

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          base_asset: params.baseAsset,
          quote_asset: params.quoteAsset,
          order_type: params.orderType,
          order_side: params.orderSide,
          amount: params.amount,
          price: params.price,
          margin_enabled: true,
          leverage: params.leverage,
          liquidation_price: liquidationPrice,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Margin Order Created',
        description: `${params.leverage}x leverage for ${params.amount} ${params.baseAsset}`,
      });

      return data;
    } catch (error) {
      console.error('Error creating margin order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create margin order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelOCOOrder = async (orderId: string) => {
    try {
      // Get the order and its linked order
      const { data: order } = await supabase
        .from('orders')
        .select('oco_linked_order_id')
        .eq('id', orderId)
        .single();

      // Cancel both orders
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (order?.oco_linked_order_id) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.oco_linked_order_id);
      }

      toast({
        title: 'OCO Order Cancelled',
        description: 'Both linked orders have been cancelled',
      });
    } catch (error) {
      console.error('Error cancelling OCO order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel OCO order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    loading,
    createTrailingStopOrder,
    createOCOOrder,
    createMarginOrder,
    cancelOCOOrder,
  };
}
