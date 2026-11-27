import React from 'react';
import { ExternalLink, Github, UserPlus } from 'lucide-react';
import { Profile } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';

interface StudentInspectorProps {
  student: Profile | null;
  onInvite: (student: Profile) => void;
}

export const StudentInspector: React.FC<StudentInspectorProps> = ({ student, onInvite }) => {
  if (!student) {
    return (
      <Card className="p-6 text-xs text-text-muted">
        Select a student to view their skills, availability, and invite them to a team.
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-text">{student.name}</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {student.college} · {student.department} · Year {student.year}
          </p>
        </div>
        <Pill variant="strong" className="font-mono">
          {student.weekly_availability}h/wk
        </Pill>
      </div>

      <p className="text-[13px] text-text-muted leading-relaxed">
        {student.bio || 'No bio shared yet.'}
      </p>

      {student.skills.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="text-[11px] font-semibold text-text-dim">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {student.skills.map((s) => (
              <Pill key={s.name} variant="strong">
                {s.name} <span className="font-mono text-[10px] text-text-dim">L{s.level}</span>
              </Pill>
            ))}
          </div>
        </div>
      )}

      {student.learning_goals.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="text-[11px] font-semibold text-text-dim">Currently Learning</div>
          <div className="flex flex-wrap gap-1.5">
            {student.learning_goals.map((g) => (
              <Pill key={g} variant="burgundy">
                {g}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {(student.github_username || student.linkedin_url || student.portfolio_url) && (
        <div className="pt-3 border-t border-border flex flex-wrap gap-3 text-xs text-text-muted">
          {student.github_username && (
            <a
              href={`https://github.com/${student.github_username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-text font-mono"
            >
              <Github className="w-3.5 h-3.5" /> @{student.github_username}
            </a>
          )}
          {student.portfolio_url && (
            <a
              href={student.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-text"
            >
              Portfolio <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          icon={<UserPlus className="w-3.5 h-3.5" />}
          onClick={() => onInvite(student)}
        >
          Invite to Team
        </Button>
      </div>
    </Card>
  );
};
