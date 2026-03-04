import { createContext, useContext, useState, useEffect } from 'react';
import { fetchWallet } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (token && stored) {
            setUser(JSON.parse(stored));
            // Refresh wallet data
            fetchWallet()
                .then((data) => {
                    const updated = { ...JSON.parse(stored), balance: data.balance };
                    setUser(updated);
                    localStorage.setItem('user', JSON.stringify(updated));
                })
                .catch(() => {
                    // Token expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                });
        }
        setLoading(false);
    }, []);

    const loginUser = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshBalance = async () => {
        try {
            const data = await fetchWallet();
            const updated = { ...user, balance: data.balance };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to refresh balance', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout, refreshBalance }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
