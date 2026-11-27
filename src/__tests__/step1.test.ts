import { describe, expect, it } from 'vitest';
import { isSupabaseConfigured } from '../core/data/supabaseClient';
import { SupabaseDataStore } from '../core/data/supabaseDataStore';

describe('Step 1: Foundation & Supabase DataStore', () => {
  it('detects missing Supabase env cleanly without throwing', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('constructs SupabaseDataStore with expected API surface', () => {
    const fakeClient = {} as ConstructorParameters<typeof SupabaseDataStore>[0];
    const store = new SupabaseDataStore(fakeClient);

    expect(typeof store.getProfiles).toBe('function');
    expect(typeof store.getProfile).toBe('function');
    expect(typeof store.upsertProfile).toBe('function');
    expect(typeof store.getEvents).toBe('function');
    expect(typeof store.createEvent).toBe('function');
    expect(typeof store.getTeams).toBe('function');
    expect(typeof store.createTeam).toBe('function');
    expect(typeof store.getRequestsForUser).toBe('function');
    expect(typeof store.createRequest).toBe('function');
    expect(typeof store.updateRequestStatus).toBe('function');
  });
});
