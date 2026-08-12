import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Native SVG Icons (Article VII Compliance - Zero Third-Party Icon Packages)
const UserIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.13 3.937C21.268 11.057 17.478 14 13 14c-.62 0-1.222-.057-1.8-.165m-3.8-3.8a3 3 0 114.243 4.243M3 3l18 18" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const AlertCircleIcon = () => (
    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Spinner = () => (
    <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid username or password credentials.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Server unresponsive. Please verify network connection and try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans antialiased selection:bg-blue-500 selection:text-white">
            
            {/* LEFT SIDE: BRAND EXPERIENCE (Hidden < 1024px) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center p-12 overflow-hidden border-r border-slate-800">
                
                {/* Background Grid Accent */}
                <div 
                    className="absolute inset-0 opacity-10 pointer-events-none" 
                    style={{ 
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`, 
                        backgroundSize: '28px 28px' 
                    }} 
                />

                {/* Decorative Glowing Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Brand Hero Content Container */}
                <div className="relative z-10 max-w-lg space-y-8">
                    
                    {/* Brand Pill */}
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
                        <ShieldCheckIcon />
                        <span className="text-xs font-semibold text-slate-200 tracking-wide">
                            HIPAA Compliant & Enterprise Secured
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Pharma<span className="text-blue-400">Link</span>
                        </h1>
                        <p className="text-lg text-slate-300 font-normal leading-relaxed">
                            Precision clinical inventory control, automated POS compliance, and real-time pharmacy network administration.
                        </p>
                    </div>

                    {/* Floating Status Glass Card */}
                    <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-lg shadow-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 font-mono font-bold text-lg">
                            Rx
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-slate-200">System Gateway Active</p>
                            <p className="text-xs text-slate-400">Encrypted JWT Session • Database Synchronized</p>
                        </div>
                    </div>

                    {/* Footer System Meta */}
                    <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <span>v2.4.0 High-Availability API</span>
                        <span>PharmaLink Architecture</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: AUTHENTICATION FORM (Mobile/Tablet/Desktop) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Header */}
                    <div className="space-y-2 text-center lg:text-left">
                        {/* Mobile Brand Badge */}
                        <div className="lg:hidden inline-block mb-3">
                            <span className="text-2xl font-black tracking-tight text-slate-900">
                                Pharma<span className="text-blue-600">Link</span>
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                            Welcome back
                        </h2>
                        <p className="text-sm sm:text-base text-slate-500 font-normal">
                            Please authenticate your account credentials to access the pharmacy terminal.
                        </p>
                    </div>

                    {/* Alert Boundary State */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50/80 border border-red-200/80 flex items-start gap-3 transition-all animate-in fade-in duration-200">
                            <AlertCircleIcon />
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-red-900 uppercase tracking-wider">Authentication Error</p>
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form Controls */}
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <div className="space-y-5">
                            
                            {/* Username Input */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <UserIcon />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (error) setError('');
                                        }}
                                        className="block w-full pl-11 pr-4 py-3.5 sm:py-3 bg-slate-50/50 border border-slate-300 rounded-xl
                                                 text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base
                                                 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white
                                                 transition-all duration-150"
                                        placeholder="Enter authorized username"
                                    />
                                </div>
                            </div>

                            {/* Password Input with Masking Toggle */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Password
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <LockIcon />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (error) setError('');
                                        }}
                                        className="block w-full pl-11 pr-12 py-3.5 sm:py-3 bg-slate-50/50 border border-slate-300 rounded-xl
                                                 text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base
                                                 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white
                                                 transition-all duration-150"
                                        placeholder="••••••••••••"
                                    />
                                    {/* Password Mask Toggle Button */}
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center min-w-[44px] min-h-[44px]"
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={isLoading || !username.trim() || !password.trim()}
                            className={`w-full py-3.5 sm:py-3 px-6 rounded-xl font-semibold text-sm sm:text-base text-white
                                      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                                      focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                                      shadow-lg shadow-blue-600/20 transition-all duration-150
                                      flex items-center justify-center gap-2.5
                                      ${(isLoading || !username.trim() || !password.trim()) ? 'opacity-60 cursor-not-allowed shadow-none' : 'hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    <span>Verifying Credentials...</span>
                                </>
                            ) : (
                                <span>Sign In to Terminal</span>
                            )}
                        </button>
                    </form>

                    {/* Universal Footer */}
                    <div className="pt-4 text-center border-t border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">
                            © 2026 PharmaLink Management System. All rights reserved.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Login;