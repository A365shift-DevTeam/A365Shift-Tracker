import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            navigate('/');
        } catch (error) {
            console.error("Signup Error:", error);
            setError(`Failed to create an account: ${error.message}`);
        }

        setLoading(false);
    }

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="p-5 text-center" style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                <h2 className="mb-4" style={{ color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.3px' }}>Create Account<span style={{ color: 'var(--accent-secondary)' }}>.</span></h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="Confirm Password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    </div>
                    <button disabled={loading} type="submit" className="btn-neon w-100 mb-3">
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-3">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}
