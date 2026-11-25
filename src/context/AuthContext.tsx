import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '../shared/types';
import { useDataStore } from './DataStoreContext';

interface AuthContextType {
  user: { id: string } | null;
  profile: Profile | null;
  allProfiles: Profile[];
  loading: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  switchPersona: (userId: string) => Promise<void>;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<Profile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dataStore } = useDataStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cc_active_role') as UserRole;
      if (saved === 'student' || saved === 'leader' || saved === 'admin') return saved;
    }
    return 'student';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_active_role', newRole);
    }
  };

  const loadProfiles = async () => {
    try {
      const list = await dataStore.getProfiles();
      setAllProfiles(list);

      const savedUserId =
        typeof window !== 'undefined'
          ? localStorage.getItem('cc_active_student_id') || 'user-ananya'
          : 'user-ananya';

      const current = list.find((p) => p.id === savedUserId) || list[0] || null;
      setProfile(current);
    } catch (err) {
      console.error('Error loading profiles in AuthProvider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [dataStore]);

  const switchPersona = async (userId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_active_student_id', userId);
    }
    const target = allProfiles.find((p) => p.id === userId);
    if (target) {
      setProfile(target);
    } else {
      const fetched = await dataStore.getProfile(userId);
      if (fetched) setProfile(fetched);
    }
  };

  const updateCurrentProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!profile) throw new Error('No active profile loaded');

    const updated = await dataStore.updateProfile({
      ...updates,
      id: profile.id,
    });

    setProfile(updated);
    setAllProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  };

  const refreshProfile = async () => {
    if (!profile) return;
    const fresh = await dataStore.getProfile(profile.id);
    if (fresh) {
      setProfile(fresh);
      const list = await dataStore.getProfiles();
      setAllProfiles(list);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: profile ? { id: profile.id } : null,
        profile,
        allProfiles,
        loading,
        role,
        setRole,
        switchPersona,
        updateCurrentProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
