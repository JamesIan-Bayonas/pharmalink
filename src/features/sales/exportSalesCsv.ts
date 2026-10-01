import type { SaleResponse } from '../../services/saleService';
import type { SaleApiResponse, SalesParams } from '../../services/saleService';

export class SalesExportChangedError extends Error {
    constructor() {
        super('Sales records changed while the report was being generated. Try exporting again.');
    }
}

// Offset pages are not a database snapshot. Reject observable shifts instead of
// silently generating a report with repeated or missing records.
export async function collectSalesForExport(
    fetchPage: (params: SalesParams) => Promise<SaleApiResponse>,
    range: Pick<SalesParams, 'startDate' | 'endDate'>
): Promise<SaleResponse[]> {
    const sales: SaleResponse[] = [];
    const ids = new Set<number>();
    let expectedCount: number | undefined;
    let expectedPageSize: number | undefined;
    let totalPages = 1;

    for (let page = 1; page <= totalPages; page += 1) {
        const response = await fetchPage({ ...range, pageNumber: page, pageSize: 50 });
        const { meta, data } = response;
        if (!Number.isInteger(meta.totalCount) || meta.totalCount < 0 ||
            !Number.isInteger(meta.pageSize) || meta.pageSize < 1 || meta.pageSize > 50 ||
            meta.currentPage !== page || meta.totalPages !== Math.ceil(meta.totalCount / meta.pageSize)) {
            throw new SalesExportChangedError();
        }
        expectedCount ??= meta.totalCount;
        expectedPageSize ??= meta.pageSize;
        totalPages = meta.totalPages;
        const expectedRows = Math.min(meta.pageSize, expectedCount - (page - 1) * meta.pageSize);
        if (meta.totalCount !== expectedCount || meta.pageSize !== expectedPageSize || data.length !== expectedRows) {
            throw new SalesExportChangedError();
        }
        for (const sale of data) {
            if (!Number.isInteger(sale.id) || sale.id < 1 || ids.has(sale.id)) {
                throw new SalesExportChangedError();
            }
            ids.add(sale.id);
            sales.push(sale);
        }
    }
    return sales;
}

export function buildSalesCsv(sales: SaleResponse[]): string {
    const headers = ['Receipt ID', 'Date', 'Time', 'Original Items Count', 'Original Total Amount', 'Cashier ID', 'Status', 'Revision', 'Current Items Count', 'Current Total Amount'];
    const rows = sales.map(sale => {
        const date = new Date(sale.transactionDate);
        return [
            sale.id,
            `"${date.toLocaleDateString()}"`,
            `"${date.toLocaleTimeString()}"`,
            sale.items.length,
            sale.totalAmount.toFixed(2),
            sale.userId,
            sale.status || 'Unknown',
            sale.revision ?? '',
            sale.effectiveItems?.length ?? '',
            sale.effectiveTotal?.toFixed(2) ?? ''
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}
