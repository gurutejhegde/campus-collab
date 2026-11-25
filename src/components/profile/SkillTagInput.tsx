import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Skill } from '../../shared/types';
import { PillTag } from '../common/PillTag';
import { Button } from '../common/Button';

interface SkillTagInputProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  label?: string;
  placeholder?: string;
}

export const SkillTagInput: React.FC<SkillTagInputProps> = ({
  skills,
  onChange,
  label = 'Your Core Skills',
  placeholder = 'e.g. React, Python, ROS2...',
}) => {
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<number>(3);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillName.trim();
    if (!trimmed) return;

    // Check if already exists (case-insensitive)
    const exists = skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      // Update level
      onChange(
        skills.map((s) =>
          s.name.toLowerCase() === trimmed.toLowerCase() ? { ...s, level: skillLevel } : s
        )
      );
    } else {
      onChange([...skills, { name: trimmed, level: skillLevel }]);
    }

    setSkillName('');
    setSkillLevel(3);
  };

  const handleRemove = (nameToRemove: string) => {
    onChange(skills.filter((s) => s.name !== nameToRemove));
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}{' '}
          <span className="text-xs text-text-muted font-normal">
            (Tag with proficiency level 1–5)
          </span>
        </label>
      )}

      {/* Input Row */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-pill bg-surface border border-border text-text placeholder:text-text-muted/60 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
        />

        <div className="flex items-center gap-2 bg-surface-subtle px-3 py-1.5 rounded-pill border border-border shrink-0">
          <span className="text-xs font-sans text-text-muted whitespace-nowrap">
            Lvl {skillLevel}/5:
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSkillLevel(lvl)}
                className={`w-6 h-6 rounded-full text-xs font-mono transition-colors ${
                  skillLevel === lvl
                    ? 'bg-accent text-white font-bold'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`}
                title={`Level ${lvl}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={() => handleAdd()}
          variant="secondary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          disabled={!skillName.trim()}
        >
          Add
        </Button>
      </div>

      {/* Active Tags */}
      <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
        {skills.length === 0 ? (
          <p className="text-xs text-text-muted italic py-1">
            No skills added yet. Add at least 1-3 core technical or design skills.
          </p>
        ) : (
          skills.map((s) => (
            <PillTag
              key={s.name}
              label={s.name}
              level={s.level}
              variant="default"
              onRemove={() => handleRemove(s.name)}
            />
          ))
        )}
      </div>
    </div>
  );
};
