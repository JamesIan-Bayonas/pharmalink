import { useState, useEffect } from 'react';
import { createCategory, updateCategory, type Category } from '../../services/categoryService';

// Native SVG Icons (Article VII Compliance - Zero Third-Party Dependencies)
const CloseIcon = () => (
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const AlertCircleIcon = () => (
    <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Spinner = () => (
    <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categoryToEdit?: Category | null;
}

const CategoryModal = ({ isOpen, onClose, onSuccess, categoryToEdit }: CategoryModalProps) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (categoryToEdit) {
                setName(categoryToEdit.name);
            } else {
                setName('');
            }
        }
    }, [isOpen, categoryToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setLoading(true);
        setError('');

        try {
            if (categoryToEdit) {
                await updateCategory(categoryToEdit.id, { name: name.trim() });
            } else {
                await createCategory({ name: name.trim() });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError("Failed to save category. The classification name may already exist.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {categoryToEdit ? 'Edit Category Classification' : 'Add New Category'}
                    </h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                {/* Error Banner */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5">
                        <AlertCircleIcon />
                        <p className="text-xs font-semibold text-rose-700">{error}</p>
                    </div>
                )}

                {/* Form Controls */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Category Name
                        </label>
                        <input 
                            autoFocus
                            type="text" 
                            required
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Analgesics, Antibiotics, Syrups"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !name.trim()}
                            className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 ${
                                (loading || !name.trim()) ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:-translate-y-0.5'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Spinner />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{categoryToEdit ? 'Update Category' : 'Create Category'}</span>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default CategoryModal;