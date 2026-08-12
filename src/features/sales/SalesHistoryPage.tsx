import { useEffect, useState } from 'react';
import { getSales, voidSale, type SaleResponse, type PaginationMeta } from '../../services/saleService';
import { useAuth } from '../../context/AuthContext';
import PrintableReceipt, { type ReceiptData } from '../pos/PrintableReciept'; 

// Native SVG Icons (Article VII Compliance - Zero External Dependencies)
const CalendarIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    const [page, setPage] = useState(1);
    
    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Export State
    const [isExporting, setIsExporting] = useState(false);

    const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);
    const [printData, setPrintData] = useState<ReceiptData | null>(null);

    // Fetch Function
    const fetchSales = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [page, startDate, endDate]);

    // VOID LOGIC
    const handleVoid = async (saleId: number) => {
        if (!window.confirm(`Are you sure you want to VOID Sale #${saleId}?\n\nThis will:\n1. Delete the transaction record.\n2. Restore items to inventory.\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await voidSale(saleId);
            alert("Sale voided successfully. Inventory has been restored.");
            fetchSales();
        } catch (error: any) {
            console.error("Void failed", error);
            alert("Failed to void sale: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    // Export Logic
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await getSales({ 
                pageNumber: 1, 
                pageSize: 10000, 
                startDate: startDate || undefined,
                endDate: endDate || undefined 
            });
            const allSales = response.data;
            if (allSales.length === 0) { alert("No records to export."); return; }

            const headers = ["Receipt ID", "Date", "Time", "Items Count", "Total Amount", "Cashier ID"];
            const csvRows = allSales.map(sale => {
                const dateObj = new Date(sale.transactionDate);
                return [
                    sale.id,
                    `"${dateObj.toLocaleDateString()}"`,
                    `"${dateObj.toLocaleTimeString()}"`,
                    sale.items.length,
                    sale.totalAmount.toFixed(2),
                    sale.userId
                ].join(",");
            });
            const csvContent = [headers.join(","), ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export data.");
        } finally {
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
            <header className="flex flex-col xl:flex-row xl:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Audit History</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Historical sales log, transaction receipts, and financial audit reports</p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    
                    {/* Date Range Picker Group */}
                    <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                        <div className="flex items-center gap-2">
                            <CalendarIcon />
                            <div className="flex flex-col">
                                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">From</label>
                                <input 
                                    type="date" 
                                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                                    value={startDate} 
                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
                                />
                            </div>
                        </div>

                        <span className="text-slate-300 font-bold text-xs">to</span>

                        <div className="flex flex-col">
                            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">To</label>
                            <input 
                                type="date" 
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                                value={endDate} 
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
                            />
                        </div>

                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }} 
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
                        disabled={isExporting} 
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    >
                        <ExportIcon />
                        <span>{isExporting ? 'Generating CSV...' : 'Export Excel CSV'}</span>
                    </button>
                </div>
            </header>

            {/* MAIN TRANSACTION AUDIT TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                <th className="py-3.5 px-6">Receipt ID</th>
                                <th className="py-3.5 px-6">Transaction Date & Time</th>
                                <th className="py-3.5 px-6 text-center">Dispensed Items</th>
                                <th className="py-3.5 px-6 text-right">Total Amount</th>
                                <th className="py-3.5 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Spinner />
                                            <p className="text-xs font-semibold">Loading Transaction Logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400">
                                        <p className="text-sm font-medium">No sales transactions found matching your date range filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Receipt ID */}
                                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                                            #{sale.id}
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
                                                {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </td>

                                        {/* Total */}
                                        <td className="py-3.5 px-6 text-right font-extrabold text-slate-900 text-base">
                                            ₱{sale.totalAmount.toFixed(2)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => setSelectedSale(sale)} 
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                                    title="View Transaction Details"
                                                >
                                                    <EyeIcon />
                                                    <span>View</span>
                                                </button>
                                                
                                                {user?.role === 'Admin' && (
                                                    <button 
                                                        onClick={() => handleVoid(sale.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold transition-all"
                                                        title="Void Transaction and Restore Stock"
                                                    >
                                                        <VoidIcon />
                                                        <span>Void</span>
                                                    </button>
                                                )}
                                            </div>
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

            {/* RECEIPT DETAIL INSPECTION MODAL */}
            {selectedSale && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Transaction #{selectedSale.id}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Cashier: Staff #{selectedSale.userId}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedSale(null)} 
                                className="p-1 rounded-lg hover:bg-slate-100"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="text-xs font-semibold text-slate-500 my-3">
                            Date: {new Date(selectedSale.transactionDate).toLocaleString()}
                        </div>

                        {/* Itemized Detail List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
                            {selectedSale.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900">{item.medicineName}</p>
                                        <p className="text-slate-400">Qty: {item.quantity} x ₱{item.unitPrice.toFixed(2)}</p>
                                    </div>
                                    <span className="font-extrabold text-slate-900 text-sm">
                                        ₱{item.subTotal.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-bold text-slate-500 uppercase">Total Paid</span>
                                <span className="text-2xl font-black text-emerald-600">₱{selectedSale.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePrint(selectedSale)} 
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                                >
                                    <PrinterIcon />
                                    <span>Print Receipt</span>
                                </button>
                                <button 
                                    onClick={() => setSelectedSale(null)} 
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
                                >
                                    Close Inspection
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Offscreen Thermal Receipt Printer Component */}
            <PrintableReceipt data={printData} />
        </div>
    );
};

export default SalesHistoryPage;