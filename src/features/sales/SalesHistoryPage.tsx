import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getSales, getSaleById, type SaleResponse, type PaginationMeta } from '../../services/saleService';
import { useAuth } from '../../context/useAuth';
import PrintableReceipt, { type ReceiptData } from '../pos/PrintableReciept'; 
import ModalFrame from '../../components/common/ModalFrame';
import SaleAdjustmentModal from './SaleAdjustmentModal';
import { supportsSaleAudit } from './saleAudit';
import { readPendingAdjustment, type PendingSaleAdjustment } from './pendingSaleAdjustment';
import { buildSalesCsv, collectSalesForExport, SalesExportChangedError } from './exportSalesCsv';

// Native SVG Icons (Article VII Compliance - Zero External Dependencies)
const CalendarIcon = () => (
    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ExportIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const VoidIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const PrinterIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5 text-slate-500 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const Spinner = () => (
    <svg className="w-6 h-6 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SalesHistoryPage = () => {
    const { user } = useAuth();

    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [page, setPage] = useState(1);
    
    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const invalidDateRange = Boolean(startDate && endDate && startDate > endDate);

    // Export State
    const [isExporting, setIsExporting] = useState(false);
    const exportPending = useRef(false);

    const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
    const [printData, setPrintData] = useState<ReceiptData | null>(null);
    const [adjustment, setAdjustment] = useState<{ saleId: number; kind: 'Correction' | 'Void'; resume?: PendingSaleAdjustment } | null>(() => {
        const resume = user?.role === 'Admin' ? readPendingAdjustment(user.id) : null;
        return resume ? { saleId: resume.saleId, kind: resume.request.kind, resume } : null;
    });
    const [actionNotice, setActionNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

    // Fetch Function
    const fetchSales = useCallback(async () => {
        if (startDate && endDate && startDate > endDate) {
            setSales([]);
            setMeta(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setLoadError(false);
        try {
            const response = await getSales({ 
                pageNumber: page, 
                pageSize: 10,
                startDate: startDate || undefined,
                endDate: endDate || undefined 
            });
            setSales(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load sales history", error);
            setLoadError(true);
            setSales([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    }, [page, startDate, endDate]);

    useEffect(() => {
        void fetchSales();
    }, [fetchSales]);

    const inspect = async (sale: SaleResponse) => {
        setActionNotice(null);
        try { setSelectedSale(await getSaleById(sale.id)); }
        catch (e) { setActionNotice({ kind: 'error', text: axios.isAxiosError(e) ? 'The current sale could not be loaded. Try viewing it again.' : 'The current sale is unavailable.' }); }
    };
    // Export Logic
    const handleExport = async () => {
        if (invalidDateRange || exportPending.current) return;
        exportPending.current = true;
        setIsExporting(true);
        setActionNotice(null);
        try {
            const allSales = await collectSalesForExport(getSales, {
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            if (allSales.length === 0) {
                setActionNotice({ kind: 'error', text: 'There are no records in the selected date range to export.' });
                return;
            }

            const csvContent = buildSalesCsv(allSales);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
            setActionNotice({ kind: 'success', text: `CSV prepared with ${allSales.length} sale${allSales.length === 1 ? '' : 's'} from the selected date range. Download requested; check your browser downloads.` });
        } catch (error) {
            console.error("Export failed", error);
            setActionNotice({ kind: 'error', text: error instanceof SalesExportChangedError
                ? `${error.message} No partial report was downloaded.`
                : 'The CSV could not be generated. No partial report was downloaded. Try exporting again.' });
        } finally {
            exportPending.current = false;
            setIsExporting(false);
        }
    };

    // Printing Logic
    useEffect(() => {
        if (printData) {
            const timer = setTimeout(() => { window.print(); }, 500);
            return () => clearTimeout(timer);
        }
    }, [printData]);

    const handlePrint = (sale: SaleResponse) => {
        const adapterData: ReceiptData = {
            id: sale.id,
            date: sale.transactionDate,
            total: sale.totalAmount,
            status: sale.status,
            revision: sale.revision,
            original: supportsSaleAudit(sale),
            cashierName: `Staff #${sale.userId}`, 
            items: sale.items.map(item => ({
                name: item.medicineName, 
                qty: item.quantity, 
                price: item.unitPrice, 
                total: item.subTotal
            }))
        };
        setPrintData(adapterData);
    };

    return (
        <div className="space-y-6 antialiased flex flex-col min-h-[calc(100vh-140px)]">
            
            {/* HEADER & FILTER AUDIT HUB */}
            <header className="flex flex-col 2xl:flex-row 2xl:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction records</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Review recorded sales and print receipts. Date filters include both selected days.</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">Current totals reflect corrections and exclude voided amounts. Original sales and adjustment history remain available.</p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    
                    {/* Date Range Picker Group */}
                    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 items-center gap-2">
                            <CalendarIcon />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <label htmlFor="sales-start-date" className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">From</label>
                                <input 
                                    id="sales-start-date"
                                    type="date" 
                                    disabled={isExporting}
                                    max={endDate || undefined}
                                    className="w-full min-w-0 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                                    value={startDate} 
                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); setActionNotice(null); }}
                                />
                            </div>
                        </div>

                        <span className="hidden text-slate-300 font-bold text-xs sm:inline">to</span>

                        <div className="flex min-w-0 flex-1 flex-col">
                            <label htmlFor="sales-end-date" className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">To</label>
                            <input 
                                id="sales-end-date"
                                type="date" 
                                disabled={isExporting}
                                    min={startDate || undefined}
                                className="w-full min-w-0 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                                value={endDate} 
                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); setActionNotice(null); }}
                            />
                        </div>

                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); setPage(1); setActionNotice(null); }}
                                aria-label="Clear date filter"
                                disabled={isExporting}
                                className="ml-1 p-1 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-bold transition-all"
                                title="Clear date filter"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Export Action */}
                    <button 
                        onClick={handleExport} 
                        disabled={isExporting || invalidDateRange}
                        className="workspace-primary-action inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all"
                    >
                        <ExportIcon />
                        <span>{isExporting ? 'Generating CSV...' : 'Export CSV'}</span>
                    </button>
                </div>
            </header>

            {invalidDateRange && <div role="alert" className="rounded-xl border border-[var(--critical)] bg-[var(--critical-surface)] p-4 text-sm text-[var(--critical)]">The “From” date must be on or before the “To” date.</div>}
            {isExporting && <p role="status" className="text-sm text-[var(--text-secondary)]">Generating the report for the selected dates. Date filters are unavailable until it finishes.</p>}
            {!loading && sales.some(s => !supportsSaleAudit(s)) && <p role="status" className="rounded-xl bg-[var(--caution-surface)] p-3 text-sm text-[var(--caution)]">Some records do not include adjustment support. Their displayed values come from the available sale response; correction and void actions require the coordinated API and migration update.</p>}

            {/* MAIN TRANSACTION AUDIT TABLE */}
            {loadError && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Sales records could not be loaded. Check the connection and <button type="button" onClick={fetchSales} className="font-bold underline">try again</button>.
                </div>
            )}
            {actionNotice && (
                <div role={actionNotice.kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm ${actionNotice.kind === 'error' ? 'border-[var(--critical)] bg-[var(--critical-surface)] text-[var(--critical)]' : 'border-[var(--positive)] bg-[var(--positive-surface)] text-[var(--positive)]'}`}>
                    {actionNotice.text}
                </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between md:flex-1">
                <div className="md:hidden divide-y divide-[var(--border-decorative)]">
                    {loading ? <p className="p-6 text-sm text-[var(--text-secondary)]">Loading sales…</p>
                        : loadError || invalidDateRange ? null
                        : sales.length === 0 ? <p className="p-6 text-sm text-[var(--text-secondary)]">{startDate || endDate ? 'No sales were recorded in the selected date range.' : 'No sales have been recorded yet.'}</p>
                        : sales.map(sale => (
                            <article key={sale.id} className="space-y-3 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div><h2 className="font-bold">Sale #{sale.id}</h2><p className="text-sm font-semibold text-[var(--text-secondary)]">{sale.status || 'Adjustment status unavailable'}</p><p className="text-xs text-[var(--text-secondary)]">{new Date(sale.transactionDate).toLocaleString()}</p></div>
                                    <strong>₱{(sale.effectiveTotal ?? sale.totalAmount).toFixed(2)}</strong>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">{(sale.effectiveItems ?? sale.items).length} {(sale.effectiveItems ?? sale.items).length === 1 ? 'item' : 'items'} · Staff #{sale.userId}</p>
                                <div className="flex flex-wrap gap-2 border-t border-[var(--border-decorative)] pt-3">
                                    <button type="button" onClick={() => void inspect(sale)} className="rounded-lg border border-[var(--border-control)] px-3 py-2 text-xs font-bold">View details</button>
                                    {user?.role === 'Admin' && supportsSaleAudit(sale) && sale.status !== 'Voided' && <>
                                        <button type="button" disabled={isExporting} onClick={() => setAdjustment({ saleId: sale.id, kind: 'Correction' })} className="rounded-lg border border-[var(--border-control)] px-3 py-2 text-xs font-bold">Correct sale</button>
                                        <button type="button" disabled={isExporting} onClick={() => setAdjustment({ saleId: sale.id, kind: 'Void' })} className="rounded-lg border border-[var(--critical)] px-3 py-2 text-xs font-bold text-[var(--critical)]">Void sale</button>
                                    </>}
                                </div>
                            </article>
                        ))}
                </div>
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[760px] text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                <th className="py-3.5 px-6">Receipt ID</th>
                                <th className="py-3.5 px-6">Transaction Date & Time</th>
                                <th className="py-3.5 px-6 text-center">Dispensed Items</th>
                                <th className="py-3.5 px-6 text-right">Current Total</th>
                                <th className="py-3.5 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Spinner />
                                            <p className="text-xs font-semibold">Loading Transaction Logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : loadError || invalidDateRange ? null : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-500">
                                        <p className="text-sm font-medium">{startDate || endDate ? 'No sales were recorded in the selected date range.' : 'No sales have been recorded yet.'}</p>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Receipt ID */}
                                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                                            #{sale.id}
                                            <span className="block text-xs font-sans text-[var(--text-secondary)]">{sale.status || 'Status unavailable'}</span>
                                        </td>

                                        {/* Date */}
                                        <td className="py-3.5 px-6 text-slate-600 font-medium text-xs">
                                            {new Date(sale.transactionDate).toLocaleString(undefined, { 
                                                year: 'numeric', month: 'short', day: 'numeric', 
                                                hour: '2-digit', minute: '2-digit' 
                                            })}
                                        </td>

                                        {/* Items Count Badge */}
                                        <td className="py-3.5 px-6 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                                                {(sale.effectiveItems ?? sale.items).length} {(sale.effectiveItems ?? sale.items).length === 1 ? 'item' : 'items'}
                                            </span>
                                        </td>

                                        {/* Total */}
                                        <td className="py-3.5 px-6 text-right font-extrabold text-slate-900 text-base">
                                            ₱{(sale.effectiveTotal ?? sale.totalAmount).toFixed(2)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => void inspect(sale)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                                    title="View Transaction Details"
                                                >
                                                    <EyeIcon />
                                                    <span>View</span>
                                                </button>
                                                
                                                {user?.role === 'Admin' && supportsSaleAudit(sale) && sale.status !== 'Voided' && <>
                                                    <button type="button" disabled={isExporting} onClick={() => setAdjustment({ saleId: sale.id, kind: 'Correction' })} className="rounded-lg border border-[var(--border-control)] px-2 py-1 text-xs font-bold">Correct</button>
                                                    <button type="button" disabled={isExporting} onClick={() => setAdjustment({ saleId: sale.id, kind: 'Void' })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--critical)] px-2 py-1 text-xs font-bold text-[var(--critical)]"><VoidIcon />Void</button>
                                                </>}                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {meta && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200/80 bg-slate-50/50 gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                            Showing Page <span className="text-slate-900 font-bold">{meta.currentPage}</span> of{' '}
                            <span className="text-slate-900 font-bold">{meta.totalPages}</span> ({meta.totalCount} total transactions)
                        </span>

                        <div className="flex items-center gap-2">
                            <button 
                                disabled={meta.currentPage === 1} 
                                onClick={() => setPage(p => p - 1)} 
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                            >
                                <ChevronLeftIcon />
                                <span>Previous</span>
                            </button>

                            <button 
                                disabled={meta.currentPage === meta.totalPages || meta.totalPages === 0} 
                                onClick={() => setPage(p => p + 1)} 
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                            >
                                <span>Next</span>
                                <ChevronRightIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {adjustment && user?.role === 'Admin' && <SaleAdjustmentModal key={`${adjustment.saleId}-${adjustment.kind}`} saleId={adjustment.saleId} kind={adjustment.kind} actorId={user.id} resume={adjustment.resume}
                onClose={() => setAdjustment(null)} onRecorded={result => {
                    setAdjustment(null);
                    setActionNotice({ kind: 'success', text: `Sale #${result.saleId}: ${result.kind === 'Void' ? 'void' : 'correction'} #${result.id} recorded. Original sale retained. Current total: ₱${result.afterTotal.toFixed(2)}.` });
                    void fetchSales();
                }} />}
            {/* RECEIPT DETAIL INSPECTION MODAL */}
            {selectedSale && (
                <ModalFrame titleId="sale-detail-title" onClose={() => setSelectedSale(null)}>
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 id="sale-detail-title" className="text-lg font-bold text-slate-900">Transaction #{selectedSale.id}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cashier: Staff #{selectedSale.userId}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedSale(null)} 
                                aria-label="Close sale details"
                                className="p-1 rounded-lg hover:bg-slate-100"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="text-xs font-semibold text-slate-500 my-3">
                            Date: {new Date(selectedSale.transactionDate).toLocaleString()}
                        </div>
                        <p className="my-3 text-sm font-bold">{selectedSale.status || 'Adjustment status unavailable'} · {supportsSaleAudit(selectedSale) ? 'Current total' : 'Available sale total'}: ₱{(selectedSale.effectiveTotal ?? selectedSale.totalAmount).toFixed(2)}</p>
                        <h4 className="font-semibold">Original sale items</h4>
                        {selectedSale.items.some(i => !i.nameIsSnapshot) && <p className="text-xs text-[var(--text-secondary)]">Legacy item names use current medicine labels; original name snapshots were not available.</p>}

                        {/* Itemized Detail List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
                            {selectedSale.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900">{item.medicineName}</p>
                                        <p className="text-slate-500">Qty: {item.quantity} x ₱{item.unitPrice.toFixed(2)}</p>
                                    </div>
                                    <span className="font-extrabold text-slate-900 text-sm">
                                        ₱{item.subTotal.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {selectedSale.status === 'Corrected' && <section className="my-4 space-y-2">
                            <h4 className="font-semibold">Current corrected items</h4>
                            {selectedSale.effectiveItems?.map(item => <p key={item.medicineId} className="text-sm">{item.medicineName} · {item.quantity} × ₱{item.unitPrice.toFixed(2)} = ₱{item.subTotal.toFixed(2)}</p>)}
                        </section>}
                        <section className="my-4 space-y-3">
                            <h4 className="font-semibold">Adjustment history</h4>
                            {!selectedSale.adjustments ? <p className="text-sm">Adjustment support is unavailable. Update the API and migration together.</p>
                                : selectedSale.adjustments.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No adjustments recorded.</p>
                                : selectedSale.adjustments.map(a => <article key={a.id} className="space-y-2 rounded-xl border border-[var(--border-decorative)] p-3 text-sm">
                                    <p className="font-bold">{a.kind} #{a.id} · Revision {a.revision}</p>
                                    <p>Staff #{a.actorId} · {new Date(a.recordedAt).toLocaleString()}</p>
                                    <p className="whitespace-pre-wrap break-words">Reason: {a.reason}</p>
                                    <p>₱{a.beforeTotal.toFixed(2)} → ₱{a.afterTotal.toFixed(2)}</p>
                                    <details><summary className="cursor-pointer underline">View before and after items</summary>
                                        <p className="mt-2 font-semibold">Before</p>{a.beforeItems.map((i, index) => <p key={index}>{i.medicineName}: {i.quantity} × ₱{i.unitPrice.toFixed(2)}</p>)}
                                        <p className="mt-2 font-semibold">After</p>{a.afterItems.length === 0 ? <p>Voided; no active items.</p> : a.afterItems.map((i, index) => <p key={index}>{i.medicineName}: {i.quantity} × ₱{i.unitPrice.toFixed(2)}</p>)}
                                    </details>
                                </article>)}
                        </section>

                        {/* Modal Footer / Actions */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-bold text-slate-500 uppercase">Original recorded total</span>
                                <span className="text-2xl font-black text-blue-600">₱{selectedSale.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePrint(selectedSale)} 
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                                >
                                    <PrinterIcon />
                                    <span>{supportsSaleAudit(selectedSale) ? 'Print original receipt' : 'Print available receipt'}</span>
                                </button>
                                <button 
                                    onClick={() => setSelectedSale(null)} 
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
                                >
                                    Close Inspection
                                </button>
                            </div>
                        </div>

                </ModalFrame>
            )}

            {/* Offscreen Thermal Receipt Printer Component */}
            <PrintableReceipt data={printData} />
        </div>
    );
};

export default SalesHistoryPage;
