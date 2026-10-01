import type { SaleAdjustmentRequest, SaleResponse } from '../../services/saleService';
import { supportsSaleAudit } from './saleAudit';

export interface AdjustmentLine { medicineId: number; medicineName: string; unitPrice: number; quantity: string }
export interface PendingSaleAdjustment {
    actorId: number; saleId: number; sale: SaleResponse; lines: AdjustmentLine[]; request: SaleAdjustmentRequest;
}
const storageKey = (actorId: number) => `pharmalink-sale-adjustment:${actorId}`;
export function readPendingAdjustment(actorId: number): PendingSaleAdjustment | null {
    try {
        const record = JSON.parse(sessionStorage.getItem(storageKey(actorId)) || 'null') as PendingSaleAdjustment | null;
        if (!record || record.actorId !== actorId || record.saleId !== record.sale.id || !supportsSaleAudit(record.sale) ||
            !['Correction', 'Void'].includes(record.request.kind) || typeof record.request.clientRequestId !== 'string' ||
            !Array.isArray(record.lines) || !Array.isArray(record.request.items)) return null;
        return record;
    } catch { return null; }
}
export function retainPendingAdjustment(record: PendingSaleAdjustment): void {
    sessionStorage.setItem(storageKey(record.actorId), JSON.stringify(record));
}
export function clearPendingAdjustment(actorId: number, requestId: string): void {
    try {
        if (readPendingAdjustment(actorId)?.request.clientRequestId === requestId) sessionStorage.removeItem(storageKey(actorId));
    } catch {
        // A verified server outcome remains definitive if browser storage becomes unavailable.
    }
}
