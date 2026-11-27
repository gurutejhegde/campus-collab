import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';

interface StepPlaceholderProps {
  step: string;
  title: string;
  description: string;
}

export const StepPlaceholder: React.FC<StepPlaceholderProps> = ({ step, title, description }) => {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <Pill variant="burgundy">{step}</Pill>
        <h1 className="text-2xl font-semibold tracking-tight pt-1">{title}</h1>
        <p className="text-xs text-text-muted">{description}</p>
      </div>

      <Card className="p-5 space-y-3">
        <div className="text-xs font-medium text-text">Step 1 Active Verification Scope</div>
        <p className="text-xs text-text-muted leading-relaxed">
          Currently verifying Step 1: real Supabase authentication, Postgres profile persistence, and the Burgundy + Neutral Dark navigation shell. Once Step 1 is confirmed working, we will build this module next.
        </p>
        <div>
          <Link to="/profile" className="text-xs text-accent-text hover:underline font-medium">
            Inspect or edit your saved Supabase profile
          </Link>
        </div>
      </Card>
    </div>
  );
};
