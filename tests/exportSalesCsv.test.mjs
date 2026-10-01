import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSalesCsv, collectSalesForExport, SalesExportChangedError } from '../src/features/sales/exportSalesCsv.ts';

const records = Array.from({ length: 53 }, (_, index) => ({
    id: index + 1, userId: 7, totalAmount: 12.5,
    transactionDate: '2026-09-30T10:00:00Z',
    items: [{ id: 1, medicineName: 'Example', quantity: 1, unitPrice: 12.5, subTotal: 12.5 }]
}));

const pageResponse = (page, rows = records, pageSize = 50) => ({
    data: rows.slice((page - 1) * pageSize, page * pageSize),
    meta: { totalCount: rows.length, currentPage: page, pageSize, totalPages: Math.ceil(rows.length / pageSize) }
});

test('collects 53 records over capped pages and preserves the selected inclusive dates', async () => {
    const calls = [];
    const sales = await collectSalesForExport(async params => {
        calls.push(params);
        return pageResponse(params.pageNumber);
    }, { startDate: '2026-09-01', endDate: '2026-09-30' });
    assert.deepEqual(sales, records);
    assert.deepEqual(calls, [1, 2].map(pageNumber => ({
        startDate: '2026-09-01', endDate: '2026-09-30', pageNumber, pageSize: 50
    })));
});

test('an empty range returns no records without requesting another page', async () => {
    let calls = 0;
    assert.deepEqual(await collectSalesForExport(async () => {
        calls += 1;
        return pageResponse(1, []);
    }, {}), []);
    assert.equal(calls, 1);
});

test('a later-page failure produces no collection; a deliberate retry starts at page one', async () => {
    const calls = [];
    let fail = true;
    const fetch = async params => {
        calls.push(params.pageNumber);
        if (fail && params.pageNumber === 2) throw new Error('Connection interrupted');
        return pageResponse(params.pageNumber);
    };
    await assert.rejects(collectSalesForExport(fetch, {}), /Connection interrupted/);
    fail = false;
    assert.deepEqual(await collectSalesForExport(fetch, {}), records);
    assert.deepEqual(calls, [1, 2, 1, 2]);
});

test('rejects changed counts, repeated rows, short pages, and inconsistent page metadata', async () => {
    const changedCount = pageResponse(2, [...records, { ...records[0], id: 54 }]);
    const duplicate = pageResponse(2);
    duplicate.data[0] = records[0];
    const short = pageResponse(2);
    short.data.pop();
    const wrongPage = pageResponse(2);
    wrongPage.meta.currentPage = 1;
    const wrongTotalPages = pageResponse(2);
    wrongTotalPages.meta.totalPages = 1;
    for (const response of [changedCount, duplicate, short, wrongPage, wrongTotalPages]) {
        await assert.rejects(collectSalesForExport(async params =>
            params.pageNumber === 1 ? pageResponse(1) : response, {}), SalesExportChangedError);
    }
});

test('exports every record beyond the API page size without dropping the last row', () => {
    const sales = Array.from({ length: 53 }, (_, index) => ({
        id: index + 1,
        userId: 7,
        totalAmount: 12.5,
        transactionDate: '2026-09-30T10:00:00Z',
        items: [{ id: 1, medicineName: 'Example', quantity: 1, unitPrice: 12.5, subTotal: 12.5 }]
    }));

    const lines = buildSalesCsv(sales).split('\n');
    assert.equal(lines.length, 54);
    assert.equal(lines[0], 'Receipt ID,Date,Time,Original Items Count,Original Total Amount,Cashier ID,Status,Revision,Current Items Count,Current Total Amount');
    assert.match(lines[1], /^1,.*,1,12\.50,7,Unknown,,,$/);
    assert.match(lines.at(-1), /^53,.*,1,12\.50,7,Unknown,,,$/);
});

test('retains original CSV amounts and explicitly exports corrected and voided current values', () => {
    const csv = buildSalesCsv([
        { ...records[0], status: 'Corrected', revision: 1, effectiveTotal: 25, effectiveItems: records[0].items },
        { ...records[1], status: 'Voided', revision: 2, effectiveTotal: 0, effectiveItems: [] }
    ]);
    assert.match(csv, /12\.50,7,Corrected,1,1,25\.00/);
    assert.match(csv, /12\.50,7,Voided,2,0,0\.00/);
});
