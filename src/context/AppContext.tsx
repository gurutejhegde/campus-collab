import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { DataStore } from '../core/data/dataStore';
import { isSupabaseConfigured, supabase } from '../core/data/supabaseClient';
import { SupabaseDataStore } from '../core/data/supabaseDataStore';
import { Profile } from '../core/types/domain';

interface AppContextValue {
  isConfigured: boolean;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  dataStore: DataStore | null;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  const dataStore = useMemo(() => {
    return supabase ? new SupabaseDataStore(supabase) : null;
  }, []);

  const loadUserProfile = useCallback(
    async (userId: string) => {
      if (!dataStore) return;
      try {
        const fetched = await dataStore.getProfile(userId);
        setProfile(fetched);
      } catch (err) {
        console.error('Failed to load profile from Supabase:', err);
        setProfile(null);
      }
    },
    [dataStore]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadUserProfile(data.session.user.id);
      }
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        await loadUserProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
  }, [session, loadUserProfile]);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setProfile(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        session,
        profile,
        loading,
        dataStore,
        refreshProfile,
        setProfile,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
