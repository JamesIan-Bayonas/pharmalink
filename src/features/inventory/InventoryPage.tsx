// src/features/inventory/InventoryPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { getMedicines, deleteMedicine, type Medicine, type PaginationMeta } from '../../services/medicineService';
import { getAllCategories, type Category } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import AddMedicineModal from './AddMedicineModal';
import RestockModal from './RestockModal';

// Native SVG Icons (Article VII Compliance - Zero Third-Party Dependencies)
const SearchIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const FilterIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

const InventoryPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    // Data State
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    
    // Category Filter State 
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

    // Read Filter from URL 
    const activeFilter = searchParams.get('filter') || '';

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

    // Fetch Inventory
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await getMedicines({ 
                pageNumber: page, 
                pageSize: 10, 
                searchTerm: searchTerm,
                filter: activeFilter,
                categoryId: selectedCategoryId || undefined 
            });
            setMedicines(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    // Load Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Refetch when dependencies change
    useEffect(() => {
        fetchInventory();
    }, [page, searchTerm, activeFilter, selectedCategoryId]);

    // Helper to get Category Name from ID
    const getCategoryName = (id: number) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : 'Unassigned';
    };

    // Handlers
    const handleFilterChange = (newFilter: string) => {
        setPage(1);
        setSearchParams(newFilter ? { filter: newFilter } : {}); 
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this medication from inventory?")) return;
        try {
            await deleteMedicine(id);   
            fetchInventory();
        } catch (error) {
            alert("Failed to delete record. It may be linked to existing sales.");
        }
    };

    // Row Color Logic
    const getRowColor = (item: Medicine) => {
        const isLow = item.stockQuantity <= 10;
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const isExpiring = daysUntilExpiry <= 90;

        if (isLow) return 'bg-rose-50/60 hover:bg-rose-100/60';
        if (isExpiring) return 'bg-amber-50/60 hover:bg-amber-100/60';
        return 'bg-white hover:bg-slate-50/80';
    };

    return (
        <div className="space-y-6 antialiased">
            
            {/* HEADER & TOP CONTROL HUB */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Catalog</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage medication stock counts, pricing, and expiration thresholds</p>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    
                    {/* Status Filter Tabs */}
                    <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shrink-0">
                        <button 
                            onClick={() => handleFilterChange('')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                activeFilter === '' 
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => handleFilterChange('low')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                activeFilter === 'low' 
                                    ? 'bg-rose-600 text-white shadow-sm' 
                                    : 'text-rose-600 hover:bg-rose-50'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Low Stock
                        </button>
                        <button 
                            onClick={() => handleFilterChange('expiring')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                activeFilter === 'expiring' 
                                    ? 'bg-amber-500 text-white shadow-sm' 
                                    : 'text-amber-600 hover:bg-amber-50'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Expiring
                        </button>
                    </div>

                    {/* Category Select Dropdown */}
                    <div className="relative shrink-0 sm:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FilterIcon />
                        </div>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => { 
                                setSelectedCategoryId(e.target.value ? Number(e.target.value) : ''); 
                                setPage(1); 
                            }}
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Field */}
                    <div className="relative flex-1 sm:w-56">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search catalog..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                        />
                    </div>
                    
                    {/* Add Item Action (Admin Only) */}
                    {user?.role === 'Admin' && (
                        <button 
                            onClick={() => { setSelectedMedicine(null); setIsAddModalOpen(true); }}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 shrink-0"
                        >
                            <PlusIcon />
                            <span>Add Item</span>
                        </button>
                    )}
                </div>
            </header>

            {/* INVENTORY DATA TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                <th className="py-3.5 px-6">Medication Name</th>
                                <th className="py-3.5 px-6">Category</th>
                                <th className="py-3.5 px-6 text-center">Stock Quantity</th>
                                <th className="py-3.5 px-6 text-right">Unit Price</th>
                                <th className="py-3.5 px-6 text-center">Expiry Date</th>
                                <th className="py-3.5 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Spinner />
                                            <p className="text-xs font-semibold">Loading Inventory Data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : medicines.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        <p className="text-sm font-medium">No medication records match your search or filter rules.</p>
                                    </td>
                                </tr>
                            ) : (
                                medicines.map((item) => {
                                    const isLow = item.stockQuantity <= 10;
                                    const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                    const isExpiring = daysUntilExpiry <= 90;

                                    return (
                                        <tr key={item.id} className={`transition-colors ${getRowColor(item)}`}>
                                            {/* Name & Description */}
                                            <td className="py-3.5 px-6">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{item.description}</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Category Badge */}
                                            <td className="py-3.5 px-6">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                                    {getCategoryName(item.categoryId)}
                                                </span>
                                            </td>

                                            {/* Stock Quantity */}
                                            <td className="py-3.5 px-6 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                                    isLow 
                                                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                }`}>
                                                    {item.stockQuantity} units
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="py-3.5 px-6 text-right font-extrabold text-slate-900">
                                                ₱{item.price.toFixed(2)}
                                            </td>

                                            {/* Expiry Date */}
                                            <td className="py-3.5 px-6 text-center">
                                                <span className={`text-xs font-semibold ${isExpiring ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                                                    {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-6 text-center">
                                                {user?.role === 'Admin' ? (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => { setSelectedMedicine(item); setIsRestockModalOpen(true); }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all"
                                                            title="Restock Stock Quantity"
                                                        >
                                                            <PlusIcon />
                                                            <span>Stock</span>
                                                        </button>

                                                        <button 
                                                            onClick={() => { setSelectedMedicine(item); setIsAddModalOpen(true); }}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                            title="Edit Medication Details"
                                                        >
                                                            <EditIcon />
                                                        </button>

                                                        <button 
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                            title="Delete Record"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">Read Only</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {meta && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200/80 bg-slate-50/50 gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                            Showing Page <span className="text-slate-900 font-bold">{meta.currentPage}</span> of{' '}
                            <span className="text-slate-900 font-bold">{meta.totalPages}</span> ({meta.totalCount} total records)
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
            
            {/* MODAL OVERLAYS */}
            <AddMedicineModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => { setIsAddModalOpen(false); fetchInventory(); }} 
                medicineToEdit={selectedMedicine} 
            />

            <RestockModal
                isOpen={isRestockModalOpen}
                onClose={() => setIsRestockModalOpen(false)}
                onSuccess={() => { fetchInventory(); }}
                medicine={selectedMedicine}
            />
        </div>
    );
};

export default InventoryPage;