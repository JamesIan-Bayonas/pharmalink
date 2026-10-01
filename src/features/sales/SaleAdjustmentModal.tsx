import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ModalFrame from '../../components/common/ModalFrame';
import { adjustSale, findSaleAdjustment, getSaleById, type SaleResponse, type SaleAdjustmentRequest, type SaleAdjustment } from '../../services/saleService';
import { getMedicines, type Medicine } from '../../services/medicineService';
import { supportsSaleAudit } from './saleAudit';
import { clearPendingAdjustment, retainPendingAdjustment, type AdjustmentLine, type PendingSaleAdjustment } from './pendingSaleAdjustment';

type Line = AdjustmentLine;

export default function SaleAdjustmentModal({ saleId, kind, actorId, resume, onClose, onRecorded }: {
    saleId: number; kind: 'Correction' | 'Void'; actorId: number; resume?: PendingSaleAdjustment; onClose: () => void;
    onRecorded: (adjustment: SaleAdjustment) => void;
}) {
    const [sale, setSale] = useState<SaleResponse | null>(resume?.sale ?? null);
    const [lines, setLines] = useState<Line[]>(resume?.lines ?? []);
    const [reason, setReason] = useState(resume?.request.reason ?? '');
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(!resume);
    const [error, setError] = useState(resume ? 'An unresolved adjustment was restored. Check this request before retrying.' : '');
    const [uncertain, setUncertain] = useState(Boolean(resume));
    const [reconciled, setReconciled] = useState(false);
    const [request, setRequest] = useState<SaleAdjustmentRequest | null>(resume?.request ?? null);
    const pending = useRef(false);
    const noticeRef = useRef<HTMLParagraphElement>(null);
    const busyRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => { if (error) noticeRef.current?.focus(); }, [error]);
    useEffect(() => { if (busy) busyRef.current?.focus(); }, [busy]);
    const [search, setSearch] = useState('');
    const [matches, setMatches] = useState<Medicine[]>([]);
    const [searchBusy, setSearchBusy] = useState(false);
    const [searchError, setSearchError] = useState('');

    const load = async () => {
        setLoading(true); setError('');
        try {
            const current = await getSaleById(saleId);
            if (!supportsSaleAudit(current)) throw new Error('Adjustment support is unavailable. The API and migration need to be updated together.');
            if (current.status === 'Voided') throw new Error('This sale is already voided. No further adjustment can be recorded.');
            const grouped = new Map<number, Line>();
            for (const item of current.effectiveItems!) {
                const prior = grouped.get(item.medicineId);
                if (prior && prior.unitPrice !== item.unitPrice) throw new Error('This legacy sale has multiple prices for one medicine and needs a separate review.');
                grouped.set(item.medicineId, { medicineId: item.medicineId, medicineName: item.medicineName,
                    unitPrice: item.unitPrice, quantity: String(Number(prior?.quantity || 0) + item.quantity) });
            }
            setSale(current); setLines([...grouped.values()]); setRequest(null);
        } catch (e) { setSale(null); setError(e instanceof Error ? e.message : 'The current sale could not be loaded. Try again.'); }
        finally { setLoading(false); }
    };
    useEffect(() => {
        if (resume) return;
        let active = true;
        // Initial loading is scoped to this mounted dialog. All later reloads are deliberate.
        getSaleById(saleId).then(current => {
            if (!active) return;
            if (!supportsSaleAudit(current) || current.status === 'Voided') throw new Error('The sale is voided or adjustment support is unavailable. Close and refresh Sales History.');
            const grouped = new Map<number, Line>();
            for (const item of current.effectiveItems!) {
                const prior = grouped.get(item.medicineId);
                if (prior && prior.unitPrice !== item.unitPrice) throw new Error('This legacy sale has multiple prices for one medicine and needs a separate review.');
                grouped.set(item.medicineId, { medicineId: item.medicineId, medicineName: item.medicineName,
                    unitPrice: item.unitPrice, quantity: String(Number(prior?.quantity || 0) + item.quantity) });
            }
            setSale(current); setLines([...grouped.values()]);
        }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'The current sale could not be loaded.'); })
          .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [saleId, resume]);

    const locked = busy || uncertain;
    const validLines = lines.every(l => /^\d+$/.test(l.quantity) && Number(l.quantity) <= 2147483647);
    const retained = lines.filter(l => Number(l.quantity) > 0);
    const estimate = kind === 'Void' ? 0 : retained.reduce((sum, line) => sum + Number(line.quantity) * line.unitPrice, 0);
    const searchMedicines = async () => {
        if (locked || !search.trim()) return;
        setSearchBusy(true); setSearchError(''); setMatches([]);
        try { const result = await getMedicines({ searchTerm: search.trim(), pageNumber: 1, pageSize: 50 });
            setMatches(result.data);
            if (result.data.length === 0) setSearchError('No medicines match. Try another name.');
            else if (result.meta.totalCount > result.data.length) setSearchError('More matches are available. Narrow the name to find the intended medicine.');
        } catch { setSearchError('Medicines could not be loaded. Keep your correction and try the search again.'); }
        finally { setSearchBusy(false); }
    };
    const finish = (result: SaleAdjustment, sent: SaleAdjustmentRequest) => {
        if (!Number.isInteger(result.id) || result.id < 1 || result.saleId !== saleId || result.clientRequestId !== sent.clientRequestId || result.kind !== sent.kind) {
            setUncertain(true); setError('The server outcome could not be verified. Check this request before retrying.'); return;
        }
        clearPendingAdjustment(actorId, sent.clientRequestId);
        onRecorded(result);
    };
    const submit = async () => {
        if (pending.current || !sale || loading || (uncertain && !reconciled)) return;
        const sent = uncertain && request ? request : {
            clientRequestId: crypto.randomUUID(), kind, reason: reason.trim(), expectedRevision: sale.revision!,
            items: kind === 'Void' ? [] : retained.map(l => ({ medicineId: l.medicineId, quantity: Number(l.quantity) }))
        };
        try { retainPendingAdjustment({ actorId, saleId, sale, lines, request: sent }); }
        catch { setError('This browser could not retain the request for recovery. No new request was sent. Check browser storage and try again.'); return; }
        setRequest(sent); pending.current = true; setBusy(true); setError(''); setReconciled(false);
        try { finish(await adjustSale(saleId, sent), sent); }
        catch (e) {
            const status = axios.isAxiosError(e) ? e.response?.status : undefined;
            if (status && [400, 404, 409].includes(status)) {
                // The API retains terminal rejection by request key, so a late
                // original cannot succeed after this definitive rejection.
                setUncertain(false); setRequest(null);
                clearPendingAdjustment(actorId, sent.clientRequestId);
                setError(axios.isAxiosError<{ message?: string }>(e) ? e.response?.data?.message || 'The adjustment was rejected. Your inputs are retained.' : 'The adjustment was rejected.');
            } else {
                setUncertain(true); setError('The outcome is unknown. Inputs and the request key are retained. Check the request before retrying.');
            }
        } finally { pending.current = false; setBusy(false); }
    };
    const reconcile = async () => {
        if (!request || pending.current) return;
        pending.current = true; setBusy(true); setError('');
        try {
            const result = await findSaleAdjustment(saleId, request.clientRequestId);
            if (result) finish(result, request);
            else { setReconciled(true); setError('This request was not found yet. You may retry the exact same request; no new key will be created.'); }
        } catch (e) {
            if (axios.isAxiosError<{ message?: string }>(e) && e.response?.status === 409) {
                setUncertain(false); setRequest(null); setReconciled(false);
                clearPendingAdjustment(actorId, request.clientRequestId);
                setError(e.response.data.message || 'The request was rejected. Your inputs are retained.');
            } else setError('The request could not be checked. Keep this dialog open and try checking again.');
        }
        finally { pending.current = false; setBusy(false); }
    };

    return <ModalFrame titleId="sale-adjustment-title" onClose={onClose} busy={busy || uncertain} className="sm:max-w-xl">
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <h2 id="sale-adjustment-title" className="text-lg font-bold">{kind === 'Void' ? 'Void' : 'Correct'} sale #{saleId}</h2>
                <button type="button" disabled={locked} onClick={onClose} aria-label="Close adjustment" className="rounded-lg border border-[var(--border-control)] px-3 py-2">Close</button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">The original sale and receipt are retained. This records a separate adjustment with your staff account, time and reason. It does not process payment or a refund.</p>
            {loading && <p role="status">Loading the current sale…</p>}
            {busy && <p role="status" tabIndex={-1} ref={busyRef}>Waiting for the API…</p>}
            {error && <p role="alert" tabIndex={-1} ref={noticeRef} className="rounded-xl border border-[var(--critical)] bg-[var(--critical-surface)] p-3 text-sm text-[var(--critical)]">{error}</p>}
            {!loading && !sale && <button type="button" onClick={load} className="underline">Retry loading sale</button>}
            {sale && <form onSubmit={e => { e.preventDefault(); void submit(); }} className="space-y-4">
                <p className="text-sm">Current recorded total: <strong>₱{sale.effectiveTotal!.toFixed(2)}</strong> · Revision {sale.revision}</p>
                {kind === 'Void' ? <div className="rounded-xl bg-[var(--caution-surface)] p-3 text-sm text-[var(--caution)]">
                    This restores the current recorded quantities to inventory once. The sale remains visible as voided.
                    <ul className="mt-2 list-disc pl-5">{lines.map(l => <li key={l.medicineId}>{l.medicineName}: {l.quantity} {Number(l.quantity) === 1 ? 'unit' : 'units'} returned</li>)}</ul>
                </div> : <>
                    <p className="text-sm text-[var(--text-secondary)]">Change quantities; enter 0 to remove an item. Existing item prices are retained. Added medicines use the API's current price. The API confirms the final total and stock.</p>
                    {lines.map((line, index) => <div key={line.medicineId} className="space-y-2 rounded-xl border border-[var(--border-decorative)] p-3">
                        <label htmlFor={`correction-qty-${line.medicineId}`} className="block text-sm font-semibold">{line.medicineName} · ₱{line.unitPrice.toFixed(2)} each</label>
                        <input id={`correction-qty-${line.medicineId}`} type="number" min="0" max="2147483647" step="1" required disabled={locked} value={line.quantity}
                            onChange={e => { setLines(old => old.map((l, i) => i === index ? { ...l, quantity: e.target.value } : l)); setError(''); }}
                            className="w-full rounded-lg border border-[var(--border-control)] bg-[var(--surface)] p-2" />
                        <p className="text-xs text-[var(--text-secondary)]">{Number(line.quantity) === 0 ? 'Removed from the corrected sale; units return to stock.' : `${line.quantity} ${Number(line.quantity) === 1 ? 'unit' : 'units'} in the corrected sale.`}</p>
                    </div>)}
                    <div className="space-y-2">
                        <label htmlFor="correction-search" className="block text-sm font-semibold">Add a medicine</label>
                        <div className="flex flex-wrap gap-2"><input id="correction-search" disabled={locked || searchBusy} value={search} onChange={e => { setSearch(e.target.value); setMatches([]); }} className="min-w-0 flex-1 rounded-lg border border-[var(--border-control)] bg-[var(--surface)] p-2" />
                            <button type="button" disabled={locked || searchBusy || !search.trim()} onClick={searchMedicines} className="rounded-lg border border-[var(--border-control)] p-2">{searchBusy ? 'Searching…' : 'Search'}</button></div>
                        {searchError && <p role="status" className="text-sm">{searchError}</p>}
                        {matches.map(m => <button type="button" key={m.id} disabled={locked || lines.some(l => l.medicineId === m.id)}
                            onClick={() => { setLines(old => [...old, { medicineId: m.id, medicineName: m.name, unitPrice: m.price, quantity: '1' }]); setMatches([]); setSearch(''); }}
                            className="block w-full rounded-lg border border-[var(--border-control)] p-2 text-left text-sm">Add {m.name} · ₱{m.price.toFixed(2)} · {m.stockQuantity} in stock</button>)}
                    </div>
                    <p className="text-sm font-bold">Estimated corrected total: ₱{estimate.toFixed(2)}</p>
                </>}
                <label className="block text-sm font-semibold" htmlFor="adjustment-reason">Reason (required)</label>
                <textarea id="adjustment-reason" required minLength={3} maxLength={500} disabled={locked} value={reason} onChange={e => { setReason(e.target.value); setError(''); }} rows={3} className="w-full rounded-lg border border-[var(--border-control)] bg-[var(--surface)] p-2" />
                {uncertain && <button type="button" onClick={reconcile} disabled={busy} className="rounded-lg border border-[var(--border-control)] p-3">Check adjustment request</button>}
                {!uncertain && error && <button type="button" onClick={load} disabled={busy} className="block text-sm underline">Reload current sale before revising (resets item quantities; keeps reason)</button>}
                <button type="submit" disabled={busy || searchBusy || (!uncertain && (reason.trim().length < 3 || !validLines || (kind === 'Correction' && retained.length === 0))) || (uncertain && !reconciled)}
                    className="workspace-primary-action w-full rounded-xl p-3 font-bold disabled:opacity-50">{busy ? 'Checking…' : uncertain ? 'Retry the same adjustment' : kind === 'Void' ? 'Confirm void and restore stock' : 'Confirm and record correction'}</button>
                {uncertain && <p className="text-sm text-[var(--caution)]">Keep this dialog open until the request is resolved. Editing and closing are unavailable while the outcome is unknown.</p>}
            </form>}
        </div>
    </ModalFrame>;
}
