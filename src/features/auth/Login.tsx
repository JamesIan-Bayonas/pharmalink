import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import './Login.css';

const Mark = () => (
    <span className="login-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
            <rect x="15" y="5" width="10" height="30" rx="3" fill="currentColor" />
            <rect x="5" y="15" width="30" height="10" rx="3" fill="currentColor" />
        </svg>
    </span>
);

const EyeIcon = ({ hidden }: { hidden: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
        {hidden && <path d="M3 3 21 21" />}
    </svg>
);

const ThemeIcon = ({ theme }: { theme: 'light' | 'dark' }) => theme === 'dark' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.3 15.6A8.5 8.5 0 0 1 8.4 3.7 8.5 8.5 0 1 0 20.3 15.6Z" />
    </svg>
) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
);

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const applyPreset = (presetUser: string, presetPassword: string) => {
        setUsername(presetUser);
        setPassword(presetPassword);
        setError('');
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading || !username.trim() || !password.trim()) return;
        setError('');
        setIsLoading(true);

        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'We could not sign you in. Check your details and try again.');
            }
        } catch {
            setError('We could not reach the server. Check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page" data-theme={theme}>
            <aside className="login-story" aria-label="About PharmaLink">
                <div className="login-story-inner">
                    <div className="login-brand"><Mark /><span>Pharma<span className="login-brand-accent">Link</span></span></div>

                    <div className="login-story-content">
                        <span className="login-eyebrow">PHARMACY OPERATIONS</span>
                        <h1>Keep every shift<br /><span>in focus.</span></h1>
                        <p>One workspace for medicine inventory, sales, and the details that keep your pharmacy moving.</p>
                        <div className="login-story-rule" />
                        <div className="login-story-points">
                            <div><span className="login-story-number">01</span><span>Find the right medicine</span></div>
                            <div><span className="login-story-number">02</span><span>Manage stock with clarity</span></div>
                            <div><span className="login-story-number">03</span><span>Complete each sale confidently</span></div>
                        </div>
                    </div>

                    <p className="login-story-footer">PharmaLink · Pharmacy management</p>
                </div>
            </aside>

            <main className="login-main">
                <div className="login-form-wrap">
                    <div className="login-mobile-brand"><Mark /><span>Pharma<span className="login-brand-accent">Link</span></span></div>

                    <div className="login-form-heading">
                        <span className="login-form-eyebrow">STAFF ACCESS</span>
                        <h2>Welcome back</h2>
                        <p>Sign in to your PharmaLink account.</p>
                    </div>

                    {error && (
                        <div className="login-error" role="alert" id="login-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label htmlFor="login-username">Username</label>
                            <input
                                id="login-username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(event) => { setUsername(event.target.value); setError(''); }}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-password">Password</label>
                            <div className="login-password-wrap">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(event) => { setPassword(event.target.value); setError(''); }}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="login-reveal"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                ><EyeIcon hidden={showPassword} /></button>
                            </div>
                        </div>

                        <button type="submit" className="login-submit" disabled={isLoading || !username.trim() || !password.trim()}>
                            {isLoading ? <><span className="login-spinner" aria-hidden="true" />Signing in…</> : <>Sign in <span aria-hidden="true">→</span></>}
                        </button>
                    </form>

                    <div className="login-demo">
                        <p>Demo access</p>
                        <div className="login-demo-actions">
                            <button type="button" onClick={() => applyPreset('admin', 'Admin123!')}>Use admin account</button>
                            <button type="button" onClick={() => applyPreset('pharmacist', 'Pharmacist123!')}>Use pharmacist account</button>
                        </div>
                    </div>

                    <p className="login-form-footer">PharmaLink management system</p>
                </div>
            </main>

            <button
                className="login-theme-toggle"
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            ><ThemeIcon theme={theme} /></button>
        </div>
    );
};

export default Login;
