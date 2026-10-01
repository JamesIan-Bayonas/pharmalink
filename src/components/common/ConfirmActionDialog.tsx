import { useId, useState, type ReactNode } from 'react';
import ModalFrame from './ModalFrame';

interface ConfirmActionDialogProps {
    title: string;
    description: ReactNode;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
    onClose: () => void;
    getErrorMessage?: (error: unknown) => string;
}

export default function ConfirmActionDialog({
    title,
    description,
    confirmLabel,
    onConfirm,
    onClose,
    getErrorMessage
}: ConfirmActionDialogProps) {
    const titleId = useId();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const confirm = async () => {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            await onConfirm();
            onClose();
        } catch (caught: unknown) {
            setError(getErrorMessage?.(caught) || 'The action could not be completed. Try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <ModalFrame titleId={titleId} onClose={onClose} busy={busy} size="sm">
            <h2 id={titleId} className="text-lg font-bold">{title}</h2>
            <div className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</div>
            {error && <p role="alert" className="mt-4 rounded-lg border border-[var(--critical)] bg-[var(--critical-surface)] p-3 text-sm text-[var(--critical)]">{error}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-[var(--border-control)] px-4 py-2 font-semibold disabled:opacity-50">Cancel</button>
                <button type="button" disabled={busy} onClick={confirm} className="rounded-lg bg-[var(--critical)] px-4 py-2 font-bold text-[var(--surface)] disabled:opacity-50">{busy ? 'Working…' : confirmLabel}</button>
            </div>
        </ModalFrame>
    );
}
