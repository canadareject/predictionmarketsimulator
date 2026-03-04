import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MarketDetail from './pages/MarketDetail';
import AdminDashboard from './pages/AdminDashboard';
import Portfolio from './pages/Portfolio';

function ProtectedRoute({ children, adminOnly }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" />;
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/market/:id" element={<MarketDetail />} />
            <Route
                path="/portfolio"
                element={
                    <ProtectedRoute>
                        <Portfolio />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute adminOnly>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter basename="/predictionmarketsimulator">
            <AuthProvider>
                <div className="app-shell">
                    <Navbar />
                    <main className="main-content">
                        <AppRoutes />
                    </main>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}
