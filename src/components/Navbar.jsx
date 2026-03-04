import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">◆</span>
                    <span className="brand-text">PolyPredict</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Markets</Link>
                    {user && <Link to="/portfolio" className="nav-link">Portfolio</Link>}
                    {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <div className="wallet-badge">
                                <span className="wallet-icon">💰</span>
                                <span className="wallet-amount">${user.balance?.toFixed(2)}</span>
                            </div>
                            <div className="user-badge">
                                <span className="user-name">{user.username}</span>
                                {user.role === 'ADMIN' && <span className="admin-tag">ADMIN</span>}
                            </div>
                            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
