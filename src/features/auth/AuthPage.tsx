import React, { useState } from 'react';
import { Github, Lock, Mail } from 'lucide-react';
import { supabase } from '../../core/data/supabaseClient';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setNotice('Account created. Check your email inbox to confirm, then sign in.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGitHubAuth = async () => {
    if (!supabase) return;
    setError(null);
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (oauthErr) setError(oauthErr.message);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-[6px] bg-accent text-white font-bold text-sm grid place-items-center">
              C
            </div>
            <span className="font-semibold text-[15px] tracking-tight">CampusCollab</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'signin' ? 'Sign in to find your team' : 'Create your student account'}
          </h1>
          <p className="text-xs text-text-muted">
            Match with college builders, join hackathon teams, or post an idea.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center"
            icon={<Github className="w-4 h-4" />}
            onClick={handleGitHubAuth}
          >
            Continue with GitHub
          </Button>

          <div className="flex items-center gap-3 text-[11px] text-text-dim">
            <span className="h-px flex-1 bg-border" />
            <span>or use email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {error && (
            <div className="p-3 rounded-control bg-danger/10 border border-danger/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-control bg-ok-soft border border-ok/30 text-xs text-ok">
              {notice}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                College or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting
                ? 'Authenticating...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>

          <div className="pt-2 border-t border-border text-center text-xs text-text-muted">
            {mode === 'signin' ? (
              <>
                New to CampusCollab?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-accent-text hover:underline font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-accent-text hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
