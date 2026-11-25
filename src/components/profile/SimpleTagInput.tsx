import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PillTag } from '../common/PillTag';
import { Button } from '../common/Button';

interface SimpleTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label: string;
  sublabel?: string;
  placeholder?: string;
  variant?: 'default' | 'accent' | 'stretch';
}

export const SimpleTagInput: React.FC<SimpleTagInputProps> = ({
  tags,
  onChange,
  label,
  sublabel,
  placeholder = 'Add a tag and press Enter...',
  variant = 'default',
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium text-text">
        {label} {sublabel && <span className="text-xs text-text-muted font-normal">({sublabel})</span>}
      </label>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-pill bg-surface border border-border text-text placeholder:text-text-muted/60 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
        />
        <Button
          type="button"
          onClick={() => handleAdd()}
          variant="secondary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          disabled={!inputVal.trim()}
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
        {tags.length === 0 ? (
          <p className="text-xs text-text-muted italic py-1">None added yet.</p>
        ) : (
          tags.map((tag) => (
            <PillTag
              key={tag}
              label={tag}
              variant={variant}
              onRemove={() => handleRemove(tag)}
            />
          ))
        )}
      </div>
    </div>
  );
};
