import { useEffect, useRef } from 'react';

const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean, onEscape: () => void, initialFocusSelector?: string) {
    const containerRef = useRef<T | null>(null);
    const onEscapeRef = useRef(onEscape);

    useEffect(() => {
        onEscapeRef.current = onEscape;
    }, [onEscape]);

    useEffect(() => {
        if (!active) return;
        const container = containerRef.current;
        if (!container) return;

        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const focusables = () =>
            Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
                .filter(element => element.getClientRects().length > 0);
        const preferred = initialFocusSelector
            ? container.querySelector<HTMLElement>(initialFocusSelector)
            : null;
        (preferred ?? focusables()[0] ?? container).focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onEscapeRef.current();
                return;
            }
            if (event.key !== 'Tab') return;
            const controls = focusables();
            if (controls.length === 0) {
                event.preventDefault();
                container.focus();
                return;
            }
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            if (opener?.isConnected) opener.focus();
        };
    }, [active, initialFocusSelector]);

    return containerRef;
}
