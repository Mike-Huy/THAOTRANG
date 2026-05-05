import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBookings({ date, status, courtId } = {}) {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('ttq6_bookings')
      .select('*, court:ttq6_courts(id, name)')
      .order('date', { ascending: false })
      .order('time_start', { ascending: true });

    if (date)    query = query.eq('date', date);
    if (status)  query = query.eq('status', status);
    if (courtId) query = query.eq('court_id', courtId);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setBookings(data ?? []);
    setLoading(false);
  }, [date, status, courtId]);

  const fetchCourts = useCallback(async () => {
    const { data } = await supabase
      .from('ttq6_courts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    setCourts(data ?? []);
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchCourts();
  }, [fetchBookings, fetchCourts]);

  // Kiểm tra sân còn trống trong khung giờ
  async function checkAvailability(courtId, date, timeStart, timeEnd) {
    const { data, error } = await supabase
      .from('ttq6_bookings')
      .select('id')
      .eq('court_id', courtId)
      .eq('date', date)
      .neq('status', 'cancelled')
      .or(`time_start.lt.${timeEnd},time_end.gt.${timeStart}`);
    return { available: !error && data.length === 0, error };
  }

  async function createBooking(payload) {
    const court = courts.find(c => c.id === payload.court_id);
    const duration = calcDuration(payload.time_start, payload.time_end);
    const total_price = court ? Math.round(court.price_per_hour * duration) : 0;

    const { data, error } = await supabase
      .from('ttq6_bookings')
      .insert({ ...payload, total_price })
      .select()
      .single();
    if (!error) await fetchBookings();
    return { data, error };
  }

  async function confirmBooking(id, confirmedBy) {
    const { data, error } = await supabase
      .from('ttq6_bookings')
      .update({ status: 'confirmed', confirmed_by: confirmedBy, confirmed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error) await fetchBookings();
    return { data, error };
  }

  async function cancelBooking(id, reason = '') {
    const { data, error } = await supabase
      .from('ttq6_bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: reason })
      .eq('id', id)
      .select()
      .single();
    if (!error) await fetchBookings();
    return { data, error };
  }

  async function completeBooking(id) {
    const { data, error } = await supabase
      .from('ttq6_bookings')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();
    if (!error) await fetchBookings();
    return { data, error };
  }

  return {
    bookings, courts, loading, error,
    refetch: fetchBookings,
    checkAvailability, createBooking,
    confirmBooking, cancelBooking, completeBooking,
  };
}

function calcDuration(timeStart, timeEnd) {
  const [sh, sm] = timeStart.split(':').map(Number);
  const [eh, em] = timeEnd.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}
