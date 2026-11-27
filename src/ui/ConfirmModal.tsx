import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm Delete',
  onConfirm,
}) => {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-control bg-danger/10 border border-danger/30">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">{description}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
