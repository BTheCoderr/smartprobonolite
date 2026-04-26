'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/supabaseClient';

type ProfileContextValue = {
  user: ReturnType<typeof useState<any>>[0];
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data as Profile);
      } else {
        await createProfileRef(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfileRef = async (userId: string) => {
    if (!supabase) return;
    const u = (await supabase.auth.getUser()).data.user;
    if (!u) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: u.email || '',
          full_name: (u.user_metadata as Record<string, string>)?.full_name || '',
          firm_name: (u.user_metadata as Record<string, string>)?.firm_name || '',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getSession();

    const sub = supabase?.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub?.data.subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    const onVisibility = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible' && user?.id) {
        void fetchProfile(user.id);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [user?.id, fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase || !profile) return false;

    try {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', profile.id).select().single();

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }
      if (data) setProfile(data as Profile);
      return true;
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

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      user,
      profile,
      loading,
      updateProfile,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, refreshProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
