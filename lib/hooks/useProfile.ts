'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/supabaseClient';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      } else {
        // Profile doesn't exist, create it
        await createProfile(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          firm_name: user.user_metadata?.firm_name || '',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      } else {
        setProfile(data);
        return true;
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    updateProfile,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
