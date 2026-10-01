import { useState, useEffect } from 'react';
import axios from 'axios';
import { createMedicine, updateMedicine, type CreateMedicineRequest, type Medicine } from '../../services/medicineService';
import { getAllCategories, type Category } from '../../services/categoryService';
import ModalFrame from '../../components/common/ModalFrame';

interface AddMedicineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Trigger to refresh the parent table
    medicineToEdit?: Medicine | null;
}

const AddMedicineModal = ({ isOpen, onClose, onSuccess, medicineToEdit }: AddMedicineModalProps) => {
    // Dropdown Data
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Form State
    const [formData, setFormData] = useState<CreateMedicineRequest>({
        name: '',
        categoryId: 0,
        price: 0,
        stockQuantity: 0,
        expiryDate: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [error, setError] = useState('');

    // Load Categories when Modal opens
    useEffect(() => {
        if (isOpen) {
            setError('');
            setCategoriesLoading(true);
            const loadCategories = async () => {
                try {
                    const data = await getAllCategories();
                    setCategories(data);
                    
                    if (medicineToEdit) {
                        // Pre-fill form if editing
                        setFormData({
                            name: medicineToEdit.name,
                            categoryId: medicineToEdit.categoryId,
                            price: medicineToEdit.price,
                            stockQuantity: medicineToEdit.stockQuantity,
                            expiryDate: medicineToEdit.expiryDate.split('T')[0],
                            description: medicineToEdit.description || ''
                        });
                    } else {
                        setFormData({
                            name: '',
                            categoryId: data.length > 0 ? data[0].id : 0,
                            price: 0,
                            stockQuantity: 0,
                            expiryDate: '',
                            description: ''
                        });
                    }
                } catch (err) {
                    console.error("Failed to load categories", err);
                    setCategories([]);
                    setError('Categories could not be loaded. Close this form and try again.');
                } finally {
                    setCategoriesLoading(false);
                }
            };
            loadCategories();
        }
    }, [isOpen, medicineToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (categoriesLoading || !categories.some(category => category.id === formData.categoryId)) {
            setError('Select an available category before saving.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            if (medicineToEdit) {
                 await updateMedicine(medicineToEdit.id, formData);
            } else {
                 await createMedicine(formData);
            }
            
            onSuccess(); // Tell parent to refresh
            onClose();   // Close modal
            // Reset Form
            setFormData({
                name: '', categoryId: categories[0]?.id || 0, price: 0, 
                stockQuantity: 0, expiryDate: '', description: ''
            });
        } catch (err: unknown) {
            const message = axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
            setError(message || "Failed to save medicine. Your entries are still here.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalFrame titleId="medicine-form-title" onClose={onClose} busy={loading} initialFocusSelector="#medicine-name">
                <h2 id="medicine-form-title" className="text-xl font-bold mb-4">
                    {medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                
                {error && <div role="alert" className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="medicine-name" className="block text-sm font-medium">Medicine Name</label>
                        <input 
                            id="medicine-name"
                            required
                            type="text" 
                            className="w-full border p-2 rounded"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <label htmlFor="medicine-category" className="block text-sm font-medium">Category</label>
                        <select 
                            id="medicine-category"
                            className="w-full border p-2 rounded"
                            value={formData.categoryId}
                            onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
                        >
                            <option value={0} disabled>{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price & Stock Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="medicine-price" className="block text-sm font-medium">Price (₱)</label>
                            <input 
                                id="medicine-price"
                                required
                                type="number" 
                                min="0"
                                step="0.01"
                                className="w-full border p-2 rounded"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label htmlFor="medicine-stock" className="block text-sm font-medium">Stock quantity</label>
                            <input 
                                id="medicine-stock"
                                required
                                type="number" 
                                min="0"
                                className="w-full border p-2 rounded"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})}
                            />
                            {medicineToEdit && <p className="mt-1 text-xs text-[var(--text-secondary)]">This replaces the count. Use Add stock for deliveries.</p>}
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label htmlFor="medicine-expiry" className="block text-sm font-medium">Expiry Date</label>
                        <input 
                            id="medicine-expiry"
                            required
                            type="date" 
                            className="w-full border p-2 rounded"
                            value={formData.expiryDate}
                            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || categoriesLoading || categories.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (medicineToEdit ? 'Update Medicine' : 'Save Medicine')}
                        </button>
                    </div>
                </form>
        </ModalFrame>
    );
};

export default AddMedicineModal;
