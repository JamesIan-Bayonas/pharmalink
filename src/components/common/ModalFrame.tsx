import type { ReactNode } from 'react';
import { useFocusTrap } from './useFocusTrap';

interface ModalFrameProps {
    titleId: string;
    onClose: () => void;
    children: ReactNode;
    busy?: boolean;
    initialFocusSelector?: string;
    size?: 'sm' | 'md';
    className?: string;
}

export default function ModalFrame({
    titleId,
    onClose,
    children,
    busy = false,
    initialFocusSelector,
    size = 'md',
    className = ''
}: ModalFrameProps) {
    const dialogRef = useFocusTrap(true, () => {
        if (!busy) onClose();
    }, initialFocusSelector);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`w-full max-h-[90dvh] overflow-y-auto rounded-2xl border border-[var(--border-decorative)] bg-[var(--surface)] p-4 shadow-2xl sm:p-6 ${size === 'sm' ? 'max-w-sm' : 'max-w-md'} ${className}`}
            >
                {children}
            </div>
        </div>
    );
}
