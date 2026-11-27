import React from 'react';
import { Database, KeyRound, Terminal } from 'lucide-react';
import { Card } from '../../ui/Card';

export const SetupEnvView: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-accent text-white font-bold flex items-center justify-center">
            C
          </div>
          <div>
            <h1 className="text-xl font-semibold">Connect Supabase to CampusCollab</h1>
            <p className="text-xs text-text-muted">Step 1 Verification Setup — Real Postgres + Auth</p>
          </div>
        </div>

        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Database className="w-4 h-4 text-accent-text" />
              <span>1. Run SQL Migration in Supabase</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Open your Supabase Dashboard → <strong>SQL Editor</strong> → New Query, paste the contents of{' '}
              <code className="font-mono text-text bg-well px-1.5 py-0.5 rounded border border-border">
                supabase/migrations/001_init.sql
              </code>{' '}
              and run it.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="w-4 h-4 text-accent-text" />
              <span>2. Create .env with Your Project Keys</span>
            </div>
            <p className="text-xs text-text-muted">
              From Supabase Dashboard → <strong>Project Settings → API</strong>, create{' '}
              <code className="font-mono text-text bg-well px-1.5 py-0.5 rounded border border-border">.env</code>{' '}
              in the project root:
            </p>
            <pre className="p-3 rounded-control bg-well border border-border font-mono text-xs text-text overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
            </pre>
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Terminal className="w-4 h-4 text-accent-text" />
              <span>3. Restart Vite Dev Server</span>
            </div>
            <p className="text-xs text-text-muted">
              Restart <code className="font-mono text-text">npm run dev</code> after saving{' '}
              <code className="font-mono text-text">.env</code> and refresh this page.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
