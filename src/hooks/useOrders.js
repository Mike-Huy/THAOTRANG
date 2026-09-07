import { supabase } from '../lib/supabase';

/**
 * Hook to create and manage customer orders in Supabase.
 */
export function useOrders() {
  /**
   * Insert a new order into ttq6_orders.
   * @param {{ customer_name: string, customer_phone: string, customer_address?: string, note?: string, items: Array, total_amount: number }} payload
   */
  async function createOrder(payload) {
    const { data, error } = await supabase
      .from('ttq6_orders')
      .insert(payload)
      .select()
      .single();
    return { data, error };
  }

  return { createOrder };
}
