import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Suspense, useState } from 'react'; 
import PageSkeleton from '../components/common/PageSkeleton'; 

// Native SVG Icons (Article VII Compliance - Zero Third-Party Dependencies)
const BrandLogoIcon = () => (
    <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const ProfileIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const DashboardIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
    </svg>
);

const PosIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const HistoryIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InventoryIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const CategoryIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 12h.01M7 17h.01M11 7h8M11 12h8M11 17h8" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const SignOutIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const MenuToggleIcon = () => (
    <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseDrawerIcon = () => (
    <svg className="w-6 h-6 text-slate-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'My Profile', path: '/profile', roles: ['Admin', 'Pharmacist'], icon: ProfileIcon },
        { label: 'Overview', path: '/dashboard', roles: ['Admin', 'Pharmacist'], icon: DashboardIcon },
        { label: 'POS Terminal', path: '/sales', roles: ['Admin', 'Pharmacist'], icon: PosIcon },
        { label: 'Sales History', path: '/history', roles: ['Admin', 'Pharmacist'], icon: HistoryIcon },
        { label: 'Inventory', path: '/inventory', roles: ['Admin'], icon: InventoryIcon },
        { label: 'Categories', path: '/categories', roles: ['Admin'], icon: CategoryIcon },
        { label: 'User Management', path: '/users', roles: ['Admin'], icon: UsersIcon },
    ];

    const visibleNavItems = navItems.filter(item => 
        user && item.roles.includes(user.role)
    );

    const currentRouteLabel = navItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="flex h-screen bg-slate-100/80 font-sans antialiased text-slate-900 overflow-hidden">
            
            {/* MOBILE DRAWER OVERLAY (< 1024px) */}
            {mobileOpen && (
                <div 
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                />
            )}

            {/* SIDEBAR CONTAINER (Desktop Fixed + Mobile Off-Canvas) */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 bg-slate-900 text-slate-300 flex flex-col justify-between
                border-r border-slate-800 shadow-2xl lg:shadow-none
                transform transition-transform duration-200 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* BRAND HEADER */}
                <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-400/20">
                            <BrandLogoIcon />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white leading-none">
                                Pharma<span className="text-blue-400">Link</span>
                            </h2>
                            <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                                Management System
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-slate-800"
                        aria-label="Close navigation"
                    >
                        <CloseDrawerIcon />
                    </button>
                </div>

                {/* NAVIGATION ROUTE LIST */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {visibleNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const IconComponent = item.icon;

                        return (
                            <Link 
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group
                                    ${isActive 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                                    }`}
                            >
                                <IconComponent />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* USER IDENTITY & SYSTEM ACTIONS */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
                    <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-3 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">
                                {user?.username || 'Authenticated User'}
                            </p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider
                                ${user?.role === 'Admin' 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`
                            }>
                                {user?.role || 'Guest'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-600 py-2.5 rounded-xl text-xs font-bold transition-all duration-150"
                    >
                        <SignOutIcon />
                        <span>Sign Out Account</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* SYSTEM TOP HEADER */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs flex items-center justify-between px-4 sm:px-6 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 border border-slate-200"
                            aria-label="Open mobile menu"
                        >
                            <MenuToggleIcon />
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                            {currentRouteLabel}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className="hidden sm:inline-block text-slate-400">Terminal Status:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Connected
                        </span>
                    </div>
                </header>

                {/* SCROLLABLE ROUTE CONTENT BOUNDARY */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Suspense key={location.pathname} fallback={<PageSkeleton />}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>

        </div>
    );
};

export default DashboardLayout;