import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, type UserResponse } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import UserModal from './UserModal';

// Native SVG Icons (Article VII Compliance - Zero External Dependencies)
const UserPlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const Spinner = () => (
    <svg className="w-6 h-6 animate-spin text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UserManagementPage = () => {
    const { user: currentUser } = useAuth();
    
    // State
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this user account?")) return;
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete user. Verify administrator privileges.");
        }
    };

    const handleEdit = (user: UserResponse) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    // Construct Image URL
    // Update the getImageUrl helper:
    const getImageUrl = (path?: string) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        const backendRoot = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') 
            : 'http://localhost:5297';

        return `${backendRoot}/${path.replace(/^\/+/, '')}`;
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto antialiased">
            
            {/* HEADER & ACCESS CONTROL HUB */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Administer pharmacy staff accounts, role assignments, and system credentials</p>
                </div>

                <button 
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:-translate-y-0.5 shrink-0 self-start sm:self-auto"
                >
                    <UserPlusIcon />
                    <span>Register New Employee</span>
                </button>
            </header>

            {/* USERS DIRECTORY TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                <th className="py-3.5 px-6">ID</th>
                                <th className="py-3.5 px-6">User Account</th>
                                <th className="py-3.5 px-6">Role Privilege</th>
                                <th className="py-3.5 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Spinner />
                                            <p className="text-xs font-semibold">Loading Staff Directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                    {/* Monospace User ID */}
                                    <td className="py-3.5 px-6 font-mono font-bold text-slate-400 text-xs">
                                        #{u.id}
                                    </td>
                                    
                                    {/* User Identity Column with Avatar */}
                                    <td className="py-3.5 px-6">
                                        <div className="flex items-center gap-3.5">
                                            {/* Profile Avatar Shell */}
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                                {u.profileImagePath ? (
                                                    <img 
                                                        src={getImageUrl(u.profileImagePath)!} 
                                                        alt={u.userName} 
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-extrabold text-slate-600 text-xs">
                                                        {u.userName.substring(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Username & Email Meta */}
                                            <div className="flex flex-col space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        {u.userName}
                                                    </span>
                                                    {u.userName === currentUser?.username && (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">{u.email || 'No email registered'}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role Badge */}
                                    <td className="py-3.5 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider
                                            ${u.role === 'Admin' 
                                                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}
                                        >
                                            <ShieldCheckIcon />
                                            <span>{u.role}</span>
                                        </span>
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="py-3.5 px-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleEdit(u)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                                title="Edit User Credentials"
                                            >
                                                <EditIcon />
                                                <span>Edit</span>
                                            </button>
                                            
                                            {u.userName !== currentUser?.username ? (
                                                <button 
                                                    onClick={() => handleDelete(u.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold transition-all"
                                                    title="Remove Staff Account"
                                                >
                                                    <TrashIcon />
                                                    <span>Delete</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-300 font-medium px-2">Active Session</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Directory Footer Summary */}
                {!loading && (
                    <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 text-xs font-semibold text-slate-500 flex justify-between items-center">
                        <span>Total Registered Staff Accounts: <strong className="text-slate-900">{users.length}</strong></span>
                    </div>
                )}
            </div>  

            {/* USER REGISTRATION / UPDATE MODAL */}
            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchUsers();
                }}
                userToEdit={selectedUser}
            />
        </div>
    );
};

export default UserManagementPage;