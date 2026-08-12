import { useState, useEffect } from 'react';
import { getMedicines, type Medicine } from '../../services/medicineService';
import { createSale, type SaleItemDto } from '../../services/saleService';
import { useAuth } from '../../context/AuthContext';
import PrintableReceipt, { type ReceiptData } from './PrintableReciept';

// Native SVG Icons (Article VII Compliance - Zero External Dependencies)
const SearchIcon = () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ShoppingBagIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const PrinterIcon = () => (
    <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4 text-rose-500 hover:text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
);

const MinusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
    </svg>
);

const CreditCardIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const Spinner = () => (
    <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface CartItem extends Medicine {
    cartQuantity: number;
}

const POSTerminalPage = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State for the Receipt
    const [lastSale, setLastSale] = useState<ReceiptData | null>(null);

    // Fetch Products
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await getMedicines({ 
                    pageNumber: 1, pageSize: 20, searchTerm: searchTerm 
                });
                setMedicines(response.data);
            } catch (error) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            loadProducts();
        }, 500);

        return () => clearTimeout(debounceTimer);
        
    }, [searchTerm]);

    // Auto print logic
    useEffect(() => {
        if (lastSale) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [lastSale]);

    // Manage Cart
    const addToCart = (medicine: Medicine) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === medicine.id);
            if (existing && existing.cartQuantity >= medicine.stockQuantity) {
                alert("Stock limit reached for this medication!"); 
                return prev;
            }
            if (!existing && medicine.stockQuantity < 1) {
                alert("Item is currently out of stock!"); 
                return prev;
            }
            return existing 
                ? prev.map(i => i.id === medicine.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i)
                : [...prev, { ...medicine, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.reduce((acc, item) => {
            if (item.id === id) {
                if (item.cartQuantity > 1) acc.push({ ...item, cartQuantity: item.cartQuantity - 1 });
            } else {
                acc.push(item);
            }
            return acc;
        }, [] as CartItem[]));
    };

    const deleteFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    // CHECKOUT
    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return;
        if (!window.confirm(`Confirm transaction payment of ₱${grandTotal.toFixed(2)}?`)) return;

        setIsProcessing(true);
        try {
            const salesItems: SaleItemDto[] = cart.map(item => ({
                medicineId: item.id, quantity: item.cartQuantity
            }));

            const result = await createSale({ Items: salesItems });

            const receiptData: ReceiptData = {
                id: (result as any).saleId, 
                date: new Date().toISOString(),
                total: grandTotal, 
                cashierName: user?.username || 'Staff',

                items: cart.map(c => ({
                    name: c.name, 
                    qty: c.cartQuantity, 
                    price: c.price, 
                    total: c.price * c.cartQuantity 
                }))
            };

            setLastSale(receiptData); 
            setCart([]); 
            setSearchTerm(''); 
            
        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert("Checkout Failed: " + (error.response?.data?.message || "Server unresponsive. Please check network."));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReprint = () => {
        if (lastSale) {
            window.print();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-140px)] gap-6 antialiased">
            
            {/* LEFT SIDE: CATALOG BROWSING AREA */}
            <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-w-0">
                
                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search product inventory by name or brand..." 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                    {loading && medicines.length === 0 ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
                            <p className="text-sm font-semibold animate-pulse">Filtering Inventory Catalog...</p>
                        </div>
                    ) : medicines.length === 0 ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-sm font-medium">No medications found matching "{searchTerm}"</p>
                        </div>
                    ) : (
                        medicines.map(med => {
                            const isOutOfStock = med.stockQuantity < 1;
                            const isLowStock = med.stockQuantity > 0 && med.stockQuantity <= 10;

                            return (
                                <button 
                                    key={med.id} 
                                    onClick={() => addToCart(med)}
                                    disabled={isOutOfStock}
                                    className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between space-y-3 group
                                        ${isOutOfStock 
                                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' 
                                            : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 active:bg-blue-50/30'
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {med.name}
                                            </h3>
                                        </div>
                                        {med.description && (
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                {med.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-base font-extrabold text-blue-600">
                                            ₱{med.price.toFixed(2)}
                                        </span>

                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                            ${isOutOfStock 
                                                ? 'bg-slate-200 text-slate-600' 
                                                : isLowStock 
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}
                                        >
                                            {isOutOfStock ? 'Out of Stock' : `${med.stockQuantity} in stock`}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>  

            {/* RIGHT SIDE: LIVE CART LEDGER & CHECKOUT */}
            <div className="w-full lg:w-96 bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-xl flex flex-col border border-slate-800">
                
                {/* Cart Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <ShoppingBagIcon />
                        <h2 className="text-lg font-bold tracking-tight text-white">Current Cart</h2>
                    </div>

                    {lastSale && (
                        <button 
                            onClick={handleReprint} 
                            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-400 transition-all"
                        >
                            <PrinterIcon />
                            <span>Receipt</span>
                        </button>
                    )}
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto my-4 space-y-2.5 pr-1">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 space-y-2">
                            <ShoppingBagIcon />
                            <p className="text-sm font-medium">Cart is currently empty</p>
                            <p className="text-xs text-slate-600 text-center max-w-[200px]">
                                Select medication items from the left catalog to start dispensing.
                            </p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3">
                                <div className="space-y-0.5 min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-100 truncate">{item.name}</h4>
                                    <p className="text-xs text-slate-400">₱{item.price.toFixed(2)} each</p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Stepper Controls */}
                                    <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-0.5">
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
                                            aria-label="Decrease quantity"
                                        >
                                            <MinusIcon />
                                        </button>
                                        <span className="w-8 text-center text-xs font-bold text-white">
                                            {item.cartQuantity}
                                        </span>
                                        <button 
                                            onClick={() => addToCart(item)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <PlusIcon />
                                        </button>
                                    </div>

                                    {/* Total & Remove */}
                                    <div className="text-right space-y-0.5">
                                        <p className="font-extrabold text-sm text-emerald-400">
                                            ₱{(item.price * item.cartQuantity).toFixed(2)}
                                        </p>
                                        <button 
                                            onClick={() => deleteFromCart(item.id)}
                                            className="text-[10px] text-slate-500 hover:text-rose-400 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer / Grand Total / Pay Trigger */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-400 font-medium">
                            <span>Subtotal Items</span>
                            <span>{cart.reduce((sum, item) => sum + item.cartQuantity, 0)} units</span>
                        </div>
                        <div className="flex justify-between items-baseline text-white">
                            <span className="text-sm font-semibold">Grand Total</span>
                            <span className="text-3xl font-black text-emerald-400 tracking-tight">
                                ₱{grandTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout} 
                        disabled={cart.length === 0 || isProcessing}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white
                                  bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
                                  shadow-lg shadow-emerald-600/20 transition-all duration-150
                                  flex items-center justify-center gap-2.5
                                  ${(cart.length === 0 || isProcessing) ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:-translate-y-0.5'}`}
                    >
                        {isProcessing ? (
                            <>
                                <Spinner />
                                <span>Processing Transaction...</span>
                            </>
                        ) : (
                            <>
                                <CreditCardIcon />
                                <span>Complete Sale & Pay</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Printable Receipt Offscreen Container */}
            <PrintableReceipt data={lastSale} />
        </div>
    );
};

export default POSTerminalPage;