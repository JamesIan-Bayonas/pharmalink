import { useEffect, useState } from 'react';
import { updateMedicineStock, type Medicine } from '../../services/medicineService';
import ModalFrame from '../../components/common/ModalFrame';
import axios from 'axios';

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    medicine: Medicine | null;
}

const RestockModal = ({ isOpen, onClose, onSuccess, medicine }: RestockModalProps) => {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setError('');
        }
    }, [isOpen, medicine?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicine || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
            setError('Enter a whole number of units greater than zero.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // We pass the positive number here; the Service layer handles the negative conversion
            await updateMedicineStock(medicine.id, Number(quantity));
            onSuccess();
            onClose();
            setQuantity(''); // Reset
        } catch (caught: unknown) {
            const message = axios.isAxiosError<{ message?: string }>(caught) ? caught.response?.data?.message : undefined;
            setError(message || 'Stock could not be updated. Your quantity is still here; check the connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !medicine) return null;

    return (
        <ModalFrame titleId="restock-title" onClose={onClose} busy={loading} initialFocusSelector="#restock-quantity" size="sm">
                <h2 id="restock-title" className="text-xl font-bold text-gray-800 mb-2">Restock Inventory</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Adding stock for <span className="font-bold text-blue-600">{medicine.name}</span>
                </p>
                <p className="mb-4 text-sm text-gray-700">
                    Current: <strong>{medicine.stockQuantity} units</strong>
                    {typeof quantity === 'number' && quantity > 0 && <> · After restock: <strong>{medicine.stockQuantity + quantity} units</strong></>}
                </p>
                
                {error && <div role="alert" className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="restock-quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                        <input 
                            id="restock-quantity"
                            required
                            min="1"
                            step="1"
                            type="number" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 50"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                    </div>

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
                            disabled={loading}
                            className="workspace-primary-action px-4 py-2 rounded-lg font-bold"
                        >
                            {loading ? 'Updating...' : '+ Add Stock'}
                        </button>
                    </div>
                </form>
        </ModalFrame>
    );
};

export default RestockModal;
