import type { SaleResponse } from '../../services/saleService';

export function supportsSaleAudit(sale: SaleResponse): boolean {
    return Number.isInteger(sale.revision) && sale.revision! >= 0 &&
        ['Recorded', 'Corrected', 'Voided'].includes(sale.status || '') &&
        Number.isFinite(sale.effectiveTotal) && Array.isArray(sale.effectiveItems) && Array.isArray(sale.adjustments) &&
        sale.effectiveItems.every(item => Number.isInteger(item.medicineId) && item.medicineId > 0);
}
