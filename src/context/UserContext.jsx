import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [purchasedRemedies, setPurchasedRemedies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPurchases(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPurchases(session.user.id);
      } else {
        setPurchasedRemedies([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPurchases = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('remedy_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data) {
        setPurchasedRemedies(data.map(p => p.remedy_id));
      }
    } catch (error) {
      console.error('Error fetching purchases:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
  };

  const purchaseRemedy = async (remedyId) => {
    if (!user) return;
    
    // In a real app, this is done by the Stripe Webhook, but we do optimistic UI updates
    const updatedPurchases = [...purchasedRemedies, remedyId];
    setPurchasedRemedies([...new Set(updatedPurchases)]);
    
    // We also insert directly for this prototype if not fully trusting webhooks yet
    // though the webhook *should* handle this securely.
    await supabase.from('purchases').insert([
      { user_id: user.id, remedy_id: remedyId }
    ]);
  };

  const hasPurchased = (remedyId) => {
    return purchasedRemedies.includes(remedyId);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout, purchaseRemedy, hasPurchased, purchasedRemedies }}>
      {children}
    </UserContext.Provider>
  );
};
