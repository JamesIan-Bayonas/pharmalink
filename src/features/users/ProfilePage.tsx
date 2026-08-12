// src/features/users/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadProfilePhoto, getMyProfile } from '../../services/userService';

// Native SVG Icons (Article VII Compliance - Zero External Dependencies)
const CameraIcon = () => (
    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const ProfilePage = () => {
    const { user } = useAuth();
    
    // Form State
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Image State
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [profileImageServerUrl, setProfileImageServerUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load Fresh Data on Mount 
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const profileData = await getMyProfile();
                
                setUserName(profileData.userName);

                if (profileData.profileImagePath) {
                    const baseUrl = "http://localhost:5297/"; 
                    setProfileImageServerUrl(`${baseUrl}${profileData.profileImagePath}`);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (selectedFile) {
                await uploadProfilePhoto(selectedFile);
            }

            if (password && password !== confirmPassword) {
                throw new Error("New password and confirmation do not match.");
            }

            await updateProfile({
                userName: userName,
                email: "placeholder@email.com",
                password: password || undefined 
            });

            setMessage({ type: 'success', text: 'Profile preferences updated successfully! Please re-login to synchronize token claims.' });
            setPassword('');
            setConfirmPassword('');
            
            const updatedProfile = await getMyProfile();
            if (updatedProfile.profileImagePath) {
                 const baseUrl = "http://localhost:5297/";
                 setProfileImageServerUrl(`${baseUrl}${updatedProfile.profileImagePath}`);
                 setPreviewImage(null);
            }

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || error.message || "Failed to update account settings." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 antialiased">
            
            {/* HEADER */}
            <header className="bg-white p-6 rounded-2xl border border-slate-200/80 border-l-4 border-l-purple-600 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage personal credentials, avatar representation, and account security</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                    user?.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                    <ShieldCheckIcon />
                    <span>{user?.role || 'User'}</span>
                </span>
            </header>

            {/* FORM CARD CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                
                {/* Status Banners */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
                        message.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200/80 text-rose-800'
                    }`}>
                        {message.type === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
                        <p className="text-xs font-semibold leading-relaxed">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* AVATAR UPLOAD SECTION */}
                    <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-slate-100">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 relative">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : profileImageServerUrl ? (
                                    <img src={profileImageServerUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600 text-3xl font-black">
                                        {userName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Camera Overlay Trigger */}
                            <label className="absolute -bottom-2 -right-2 p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-md border border-slate-200 cursor-pointer transition-all hover:scale-105">
                                <CameraIcon />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-700">Profile Photo</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, JPEG, and PNG formats (Max 2MB)</p>
                        </div>
                    </div>

                    {/* ACCOUNT DETAILS */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Account Details</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">System Role</label>
                                <input 
                                    disabled 
                                    type="text" 
                                    value={user?.role} 
                                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed" 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon />
                                    </div>
                                    <input 
                                        required
                                        type="text" 
                                        value={userName}
                                        onChange={e => setUserName(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECURITY CREDENTIALS */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Security & Credentials</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon />
                                    </div>
                                    <input 
                                        type="password" 
                                        placeholder="Blank keeps existing"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon />
                                    </div>
                                    <input 
                                        type="password" 
                                        placeholder="Re-enter new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAVE SUBMIT BUTTON */}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            disabled={loading || !userName.trim()}
                            className={`bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 ${
                                (loading || !userName.trim()) ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:-translate-y-0.5'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Spinner />
                                    <span>Saving Profile Changes...</span>
                                </>
                            ) : (
                                <span>Save Profile Preferences</span>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ProfilePage;