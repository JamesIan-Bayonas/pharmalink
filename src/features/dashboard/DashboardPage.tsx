import { useCallback, useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/useAuth';

// Native SVG Icons (Article VII Compliance - Zero External Dependencies)
const RevenueIcon = () => (
    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TransactionIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AlertTriangleIcon = () => (
    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CalendarExpirationsIcon = () => (
    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const PosTerminalIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const InventoryBoxIcon = () => (
    <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const Spinner = () => (
    <svg className="w-8 h-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadedAt, setLoadedAt] = useState<Date | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getDashboardStats();
            setStats(data);
            setLoadedAt(new Date());
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setError('The dashboard snapshot could not be refreshed. Check the connection and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchStats(); }, [fetchStats]);

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-3">
                <Spinner />
                <p className="text-sm font-semibold text-slate-500 animate-pulse">Synchronizing Analytics...</p>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div role="alert" className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 max-w-2xl mx-auto my-8">
                <h3 className="font-bold text-base mb-1">Snapshot unavailable</h3>
                <p className="text-sm text-rose-600">{error}</p>
                <button type="button" onClick={fetchStats} className="mt-3 font-bold underline">Retry snapshot</button>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6 antialiased">
            {error && <div role="alert" className="rounded-xl border border-[var(--critical)] bg-[var(--critical-surface)] p-4 text-sm text-[var(--critical)]">{error} The figures below are from the previous load.</div>}
            
            {/* PAGE HEADER */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pharmacy Overview</h1>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            Snapshot
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Sales and inventory snapshot {loadedAt ? `loaded ${loadedAt.toLocaleString()}` : 'not yet loaded'}</p>
                </div>
                <button type="button" onClick={fetchStats} disabled={loading} className="rounded-xl border border-[var(--border-control)] bg-[var(--surface-subtle)] px-3.5 py-2 text-xs font-semibold disabled:opacity-50 self-start sm:self-auto">{loading ? 'Refreshing…' : 'Refresh snapshot'}</button>
            </header>

            {/* TOP ROW: STAT CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* 1. REVENUE TODAY */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sales total today</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                ₱{stats.totalRevenueToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                            <RevenueIcon />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-3">Current corrected totals for today's sales; voids excluded. Payment is not verified.</p>
                </div>

                {/* 2. TRANSACTIONS TODAY */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transactions</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                {stats.totalSalesToday}
                            </h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                            <TransactionIcon />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-3">Sales originally recorded today, excluding retained voids</p>
                </div>

                {/* 3. LOW STOCK WARNING (LINK) */}
                <Link to="/inventory?filter=low" className="group block">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-rose-500 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Low Stock</p>
                                    <ArrowRightIcon />
                                </div>
                                <h3 className="text-2xl font-extrabold text-rose-600 tracking-tight">
                                    {stats.lowStockItems}
                                </h3>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                                <AlertTriangleIcon />
                            </div>
                        </div>
                        <p className="text-xs text-rose-700 font-medium mt-3">Items at or below safety threshold (≤ 10)</p>
                    </div>
                </Link>

                {/* 4. EXPIRING SOON WARNING (LINK) */}
                <Link to="/inventory?filter=expiring" className="group block">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Expired or due soon</p>
                                    <ArrowRightIcon />
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    {stats.expiringSoonItems}
                                </h3>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                                <CalendarExpirationsIcon />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-3">Expired or due within 90 days (out of {stats.totalMedicines} total)</p>
                    </div>
                </Link>

            </div>

            {/* MIDDLE ROW: CHART SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Weekly Revenue Trend</h2>
                        <p className="text-xs text-slate-500">Current corrected totals by original sale day over the last 7 calendar days; voids excluded</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        7-Day Window
                    </span>
                </div>

                <div className="w-full h-[320px] pt-2">
                    {stats.weeklySales && stats.weeklySales.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weeklySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--action-primary)" stopOpacity={1} />
                                        <stop offset="100%" stopColor="var(--action-primary)" stopOpacity={0.72} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-decorative)" />
                                <XAxis 
                                    dataKey="dateLabel" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                                    tickFormatter={(value) => `₱${value}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'var(--surface-subtle)', radius: 6 }}
                                    formatter={(value: unknown) => [`₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Revenue']}
                                    contentStyle={{ 
                                        backgroundColor: 'var(--surface)',
                                        borderRadius: '12px', 
                                        border: '1px solid var(--border-decorative)',
                                        color: 'var(--text-primary)',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '10px 14px'
                                    }}
                                    itemStyle={{ color: 'var(--action-primary)', fontWeight: 600, fontSize: '13px' }}
                                    labelStyle={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                                />
                                <Bar 
                                    dataKey="totalAmount"
                                    fill="url(#barGradient)" 
                                    radius={[6, 6, 0, 0]} 
                                    barSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p className="text-sm font-medium">No sales recorded during the last 7 days.</p>
                            <p className="text-xs text-slate-500 mt-0.5">Process new sales via the POS Terminal to view visual trendlines.</p>
                        </div>
                    )}
                </div>
                {stats.weeklySales && stats.weeklySales.length > 0 && (
                    <table className="sr-only">
                        <caption>Recorded sales totals for days represented in the chart</caption>
                        <thead><tr><th scope="col">Day</th><th scope="col">Sales total</th></tr></thead>
                        <tbody>{stats.weeklySales.map((day, index) => <tr key={`${day.dateLabel}-${index}`}><th scope="row">{day.dateLabel}</th><td>₱{day.totalAmount.toFixed(2)}</td></tr>)}</tbody>
                    </table>
                )}
            </div>

            {/* BOTTOM ROW: QUICK ACTIONS HUB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* POS ACTION GATEWAY */}
                <div className="bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-100 rounded-2xl p-6 flex flex-col justify-between items-start space-y-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-sm shrink-0">
                            <PosTerminalIcon />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-blue-950 text-lg">POS Sales Terminal</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Find medicines, review the cart, record sales, and print sale receipts.
                            </p>
                        </div>
                    </div>
                    <Link 
                        to="/sales" 
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                    >
                        <span>Launch POS Terminal</span>
                        <ArrowRightIcon />
                    </Link>
                </div>

                {/* INVENTORY ACTION GATEWAY */}
                <div className="bg-gradient-to-br from-slate-100/70 to-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between items-start space-y-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm shrink-0">
                            <InventoryBoxIcon />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-lg">Inventory & Stock Control</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {user?.role === 'Admin'
                                    ? 'Review stock and expiry dates, then update medicines or restock where needed.'
                                    : 'Review stock and expiry dates. An administrator manages medicine changes and restocking.'}
                            </p>
                        </div>
                    </div>
                    <Link 
                        to="/inventory" 
                        className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5"
                    >
                        <span>{user?.role === 'Admin' ? 'Manage Inventory Catalog' : 'View Inventory Catalog'}</span>
                        <ArrowRightIcon />
                    </Link>
                </div>

            </div>

        </div>
    );
};

export default DashboardPage;
