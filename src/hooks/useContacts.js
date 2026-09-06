import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useContacts({ status } = {}) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const hasFetchedRef           = useRef(false);

  const fetchContacts = useCallback(async () => {
    if (!hasFetchedRef.current) setLoading(true);
    let query = supabase
      .from('ttq6_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    hasFetchedRef.current = true;
    if (error) setError(error.message);
    else setContacts(data ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  async function submitContact(payload) {
    const { data, error } = await supabase
      .from('ttq6_contacts')
      .insert(payload)
      .select()
      .single();
    return { data, error };
  }

  async function markAsRead(id) {
    const { error } = await supabase
      .from('ttq6_contacts')
      .update({ status: 'read' })
      .eq('id', id);
    if (!error) await fetchContacts();
    return { error };
  }

  async function replyContact(id, reply, repliedBy) {
    const { error } = await supabase
      .from('ttq6_contacts')
      .update({ status: 'replied', reply, replied_by: repliedBy, replied_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await fetchContacts();
    return { error };
  }

  async function archiveContact(id) {
    const { error } = await supabase
      .from('ttq6_contacts')
      .update({ status: 'archived' })
      .eq('id', id);
    if (!error) await fetchContacts();
    return { error };
  }

  const unreadCount = contacts.filter(c => c.status === 'unread').length;

  return { contacts, loading, error, unreadCount, refetch: fetchContacts, submitContact, markAsRead, replyContact, archiveContact };
}
