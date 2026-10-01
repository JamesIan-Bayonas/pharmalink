// Test-only loopback proxy for the named disposable API on port 5597.
// Does not store/log credentials, JWTs, request bodies or customer data.
import http from 'node:http';
let loseNextAdjustment = false;
http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5175');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (req.url === '/fixture/lose-next-adjustment') {
        loseNextAdjustment = true; res.end('armed'); return;
    }
    if (!req.url.startsWith('/api/')) { res.writeHead(404); res.end(); return; }
    let body = '';
    for await (const chunk of req) body += chunk;
    const adjustment = req.method === 'POST' && /\/adjustments$/.test(req.url);
    try {
        const response = await fetch(`http://127.0.0.1:5597${req.url}`, {
            method: req.method,
            headers: { 'Content-Type': 'application/json', ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}) },
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : body
        });
        const text = await response.text();
        if (adjustment && loseNextAdjustment) {
            loseNextAdjustment = false;
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Disposable proxy withheld the committed response.' }));
        } else {
            res.writeHead(response.status, { 'Content-Type': 'application/json' }); res.end(text);
        }
    } catch {
        res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: 'Disposable API unavailable.' }));
    }
}).listen(5598, '127.0.0.1', () => process.stdout.write('Disposable audit proxy listening on 127.0.0.1:5598\n'));
