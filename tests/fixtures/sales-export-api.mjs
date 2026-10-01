// Disposable UI fixture only. No database, real accounts, or stock mutations.
import http from 'node:http';

const sales = Array.from({ length: 53 }, (_, index) => ({
    id: 53 - index, userId: 7, totalAmount: 12.5,
    transactionDate: '2026-09-30T10:00:00Z',
    items: [{ id: index + 1, medicineId: 1,
        medicineName: 'Disposable example medicine with a long identifying name',
        quantity: 1, unitPrice: 12.5, subTotal: 12.5 }]
}));
const jwtPart = value => Buffer.from(JSON.stringify(value)).toString('base64url');
let failNextExportPage = false;
let duplicateNextExportPage = false;
const requests = [];

http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5175');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    const send = (status, body) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
    };
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const url = new URL(req.url, 'http://127.0.0.1:5598');
    if (url.pathname === '/fixture/fail-next-export') { failNextExportPage = true; send(200, { armed: true }); return; }
    if (url.pathname === '/fixture/duplicate-next-export') { duplicateNextExportPage = true; send(200, { armed: true }); return; }
    if (url.pathname === '/fixture/requests') { send(200, requests); return; }
    if (url.pathname === '/api/Auth/login' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const credentials = JSON.parse(body);
        const role = credentials.username === 'fixture-pharmacist' ? 'Pharmacist' : 'Admin';
        send(200, { token: `${jwtPart({ alg: 'none' })}.${jwtPart({ uid: '7', sub: 'Fixture staff', role, exp: Math.floor(Date.now() / 1000) + 3600 })}.fixture` });
        return;
    }
    if (url.pathname === '/api/Sales' && req.method === 'GET') {
        requests.push(Object.fromEntries(url.searchParams));
        const page = Number(url.searchParams.get('pageNumber') || 1);
        const size = Math.min(Number(url.searchParams.get('pageSize') || 10), 50);
        if (size === 50 && page === 2 && failNextExportPage) {
            failNextExportPage = false; send(503, { message: 'Disposable page failure' }); return;
        }
        // Give the UI enough time to expose its pending state.
        if (size === 50) await new Promise(resolve => setTimeout(resolve, 1500));
        const data = sales.slice((page - 1) * size, page * size);
        if (size === 50 && page === 2 && duplicateNextExportPage) {
            duplicateNextExportPage = false; data[0] = sales[0];
        }
        send(200, { meta: { totalCount: sales.length, pageSize: size, currentPage: page,
            totalPages: Math.ceil(sales.length / size) }, data });
        return;
    }
    send(404, { message: 'This disposable fixture supports Sales History only.' });
}).listen(5598, '127.0.0.1', () => process.stdout.write('Disposable export fixture listening on 127.0.0.1:5598\n'));
