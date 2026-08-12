import { useState, useEffect } from 'react';
import { registerUser, updateUser, type UserResponse } from '../../services/userService';

// Native SVG Icons (Article VII Compliance - Zero Third-Party Dependencies)
const CloseIcon = () => (
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.13 3.937C21.268 11.057 17.478 14 13 14c-.62 0-1.222-.057-1.8-.165m-3.8-3.8a3 3 0 114.243 4.243M3 3l18 18" />
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

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: UserResponse | null;
}

const UserModal = ({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        role: 'Pharmacist'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            setShowPassword(false);
            if (userToEdit) {
                setFormData({
                    userName: userToEdit.userName,
                    email: userToEdit.email || '', 
                    password: '', 
                    role: userToEdit.role
                });
            } else {
                setFormData({
                    userName: '',
                    email: '',
                    password: '',
                    role: 'Pharmacist'
                });
            }
        }
    }, [isOpen, userToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (userToEdit) {
                const payload: any = {
                    userName: formData.userName,
                    email: formData.email,
                    role: formData.role
                };
                
                if (formData.password.trim()) {
                    payload.password = formData.password;
                }

                await updateUser(userToEdit.id, payload);
            } else {
                await registerUser({
                    userName: formData.userName,
                    password: formData.password,
                    role: formData.role
                });
            }
            
            onSuccess(); 
            onClose();
        } catch (err: any) {
             console.error("Full Error Object:", err);
             const msg = err.response?.data?.message || err.response?.data?.title || "Operation failed. Check server connection.";
             setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {userToEdit ? 'Edit User Credentials' : 'Register New Employee'}
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
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Username */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Username</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all"
                            value={formData.userName}
                            onChange={e => setFormData({...formData, userName: e.target.value})}
                            placeholder="Enter account username"
                        />
                    </div>

                    {/* Password with Masking Toggle */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Password {userToEdit && <span className="text-slate-400 font-normal text-[11px] uppercase ml-1">(Leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                            <input 
                                required={!userToEdit}
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder={userToEdit ? "••••••••" : "Enter temporary account password"}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center min-w-[44px]"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Role Selector */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Role Privilege</label>
                        <select 
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all cursor-pointer"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Pharmacist">Pharmacist (POS & Sales Access)</option>
                            <option value="Admin">Admin (Full System Privilege)</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !formData.userName.trim()} 
                            className={`px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 ${
                                (loading || !formData.userName.trim()) ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:-translate-y-0.5'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Spinner />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{userToEdit ? 'Update Account' : 'Create Staff Account'}</span>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default UserModal;