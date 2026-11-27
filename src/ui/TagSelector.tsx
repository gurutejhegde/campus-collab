import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';

interface TagSelectorProps {
  label: string;
  placeholder: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  recommended?: string[];
  accentSelected?: boolean;
  prefixSelected?: string;
  collapseCatalog?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  placeholder,
  options,
  selected,
  onChange,
  recommended = [],
  accentSelected = false,
  prefixSelected = '',
  collapseCatalog = false,
}) => {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(!collapseCatalog);

  const selectedLower = useMemo(
    () => new Set(selected.map((s) => s.toLowerCase())),
    [selected]
  );

  const toggleItem = (item: string) => {
    const exists = selected.some((s) => s.toLowerCase() === item.toLowerCase());
    if (exists) {
      onChange(selected.filter((s) => s.toLowerCase() !== item.toLowerCase()));
    } else {
      onChange([...selected, item]);
    }
  };

  const allOptions = useMemo(() => {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const item of [...selected, ...recommended, ...options]) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
    return merged;
  }, [options, recommended, selected]);

  const trimmedQuery = query.trim();

  const displayedOptions = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (q) {
      return allOptions.filter((opt) => opt.toLowerCase().includes(q));
    }
    if (!showAll) {
      // Calm default: only show already selected items here (recommended shows in its own card)
      return selected;
    }
    return allOptions;
  }, [allOptions, selected, showAll, trimmedQuery]);

  const exactMatchExists =
    trimmedQuery.length > 0 &&
    allOptions.some((opt) => opt.toLowerCase() === trimmedQuery.toLowerCase());

  const unselectedRecommended = useMemo(
    () => recommended.filter((r) => !selectedLower.has(r.toLowerCase())),
    [recommended, selectedLower]
  );

  const addCustom = () => {
    if (!trimmedQuery) return;
    if (!selectedLower.has(trimmedQuery.toLowerCase())) {
      onChange([...selected, trimmedQuery]);
    }
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!trimmedQuery) return;

    if (displayedOptions.length > 0 && exactMatchExists) {
      const exact = displayedOptions.find((o) => o.toLowerCase() === trimmedQuery.toLowerCase());
      if (exact && !selectedLower.has(exact.toLowerCase())) toggleItem(exact);
      setQuery('');
      return;
    }

    if (displayedOptions.length === 1) {
      if (!selectedLower.has(displayedOptions[0].toLowerCase())) {
        toggleItem(displayedOptions[0]);
      }
      setQuery('');
      return;
    }

    addCustom();
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-text">{label}</label>
        {selected.length > 0 && (
          <span className="text-[11px] font-mono text-text-dim">{selected.length} selected</span>
        )}
      </div>

      {/* Role-based recommendations */}
      {unselectedRecommended.length > 0 && (
        <div className="p-3 rounded-control bg-well border border-accent-border space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-accent-text inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recommended for your roles
            </span>
            <button
              type="button"
              onClick={() => onChange([...selected, ...unselectedRecommended])}
              className="text-[11px] text-accent-text hover:underline font-medium"
            >
              Add all ({unselectedRecommended.length})
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unselectedRecommended.map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => toggleItem(rec)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-accent-soft text-accent-text border border-accent-border hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{rec}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search / Custom Type-ahead */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
      />

      {/* Chips */}
      {(displayedOptions.length > 0 || (trimmedQuery && !exactMatchExists)) && (
        <div className="flex flex-wrap gap-1.5">
          {displayedOptions.map((option) => {
            const isSelected = selectedLower.has(option.toLowerCase());
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  toggleItem(option);
                  if (trimmedQuery) setQuery('');
                }}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                  isSelected
                    ? accentSelected
                      ? 'bg-accent-soft text-accent-text border-accent-border'
                      : 'bg-surface-elevated text-text border-border-strong'
                    : 'bg-well text-text-muted border-border hover:text-text hover:border-border-strong'
                )}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 shrink-0" />
                ) : (
                  <Plus className="w-3 h-3 shrink-0 opacity-60" />
                )}
                <span>{isSelected && prefixSelected ? `${prefixSelected}${option}` : option}</span>
                {isSelected && <X className="w-3 h-3 ml-0.5 opacity-60" />}
              </button>
            );
          })}

          {trimmedQuery && !exactMatchExists && (
            <button
              type="button"
              onClick={addCustom}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border bg-accent text-white border-accent-border hover:bg-accent-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add & select "{trimmedQuery}"</span>
            </button>
          )}
        </div>
      )}

      {collapseCatalog && !trimmedQuery && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors pt-0.5"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Hide full skill list
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Browse all {options.length} preset skills
            </>
          )}
        </button>
      )}
    </div>
  );
};
