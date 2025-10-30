import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  user_id: string;
  base_asset: string;
  quote_asset: string;
  order_type: string;
  order_side: string;
  amount: number;
  price: number | null;
  stop_price: number | null;
  filled_amount: number;
  status: string;
  created_at: string;
  filled_at: string | null;
  updated_at: string;
}

export interface CreateOrderParams {
  baseAsset: string;
  quoteAsset: string;
  orderType: 'market' | 'limit' | 'stop';
  orderSide: 'buy' | 'sell';
  amount: number;
  price?: number;
  stopPrice?: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setOrders(data);
        setOpenOrders(data.filter((o) => o.status === 'open'));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (params: CreateOrderParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const orderData = {
        user_id: user.id,
        base_asset: params.baseAsset,
        quote_asset: params.quoteAsset,
        order_type: params.orderType,
        order_side: params.orderSide,
        amount: params.amount,
        price: params.price || null,
        stop_price: params.stopPrice || null,
        status: 'open' as const,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Order Created',
        description: `${params.orderSide.toUpperCase()} order for ${params.amount} ${params.baseAsset} created successfully`,
      });

      // For market orders, execute immediately
      if (params.orderType === 'market' && data) {
        await executeOrder(data.id);
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const executeOrder = async (orderId: string, dexSource?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('execute-trade', {
        body: { orderId, dexSource },
      });

      if (error) throw error;

      toast({
        title: 'Trade Executed',
        description: `Order executed at $${data.execution_price.toFixed(2)}`,
      });

      return data;
    } catch (error) {
      console.error('Error executing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Order Cancelled',
        description: 'Order cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    orders,
    openOrders,
    loading,
    createOrder,
    executeOrder,
    cancelOrder,
    refetch: fetchOrders,
  };
}
