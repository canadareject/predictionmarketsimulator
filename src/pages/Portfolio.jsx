import { useState, useEffect } from 'react';
import { fetchWallet } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Portfolio() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWallet()
            .then(setWallet)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state"><div className="spinner" /><p>Loading portfolio...</p></div>
            </div>
        );
    }

    const openBets = wallet?.bets?.filter((b) => b.market.status === 'OPEN') || [];
    const closedBets = wallet?.bets?.filter((b) => b.market.status === 'RESOLVED') || [];
    const totalInvested = openBets.reduce((s, b) => s + b.amount, 0);

    return (
        <div className="page page-portfolio">
            <header className="page-header">
                <h1 className="page-title">Your Portfolio</h1>
            </header>

            <div className="portfolio-stats">
                <div className="stat-card">
                    <span className="stat-card-label">Available Balance</span>
                    <span className="stat-card-value">${wallet?.balance?.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-card-label">In Active Bets</span>
                    <span className="stat-card-value">${totalInvested.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-card-label">Total Value</span>
                    <span className="stat-card-value highlight">${(wallet?.balance + totalInvested).toFixed(2)}</span>
                </div>
            </div>

            <div className="detail-card">
                <h2>Active Positions ({openBets.length})</h2>
                {openBets.length === 0 ? (
                    <p className="empty-text">No active bets. Go explore the markets!</p>
                ) : (
                    <div className="bets-table">
                        <div className="bets-table-header">
                            <span>Market</span>
                            <span>Position</span>
                            <span>Amount</span>
                            <span>Bought At</span>
                        </div>
                        {openBets.map((bet) => (
                            <div key={bet.id} className="bets-table-row">
                                <span className="bet-market">{bet.market.title}</span>
                                <span className="bet-option">{bet.option.name}</span>
                                <span className="bet-amount">${bet.amount.toFixed(2)}</span>
                                <span className="bet-prob">{bet.boughtAtProbability.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {closedBets.length > 0 && (
                <div className="detail-card" style={{ marginTop: '1.5rem' }}>
                    <h2>Closed Positions ({closedBets.length})</h2>
                    <div className="bets-table">
                        <div className="bets-table-header">
                            <span>Market</span>
                            <span>Position</span>
                            <span>Amount</span>
                            <span>Status</span>
                        </div>
                        {closedBets.map((bet) => (
                            <div key={bet.id} className="bets-table-row">
                                <span className="bet-market">{bet.market.title}</span>
                                <span className="bet-option">{bet.option.name}</span>
                                <span className="bet-amount">${bet.amount.toFixed(2)}</span>
                                <span className="bet-status">Resolved</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
