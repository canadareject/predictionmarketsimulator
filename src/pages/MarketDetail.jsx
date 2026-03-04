import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMarket, placeBet } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MarketDetail() {
    const { id } = useParams();
    const { user, refreshBalance } = useAuth();
    const [market, setMarket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [placing, setPlacing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadMarket();
    }, [id]);

    const loadMarket = async () => {
        try {
            const data = await fetchMarket(id);
            setMarket(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBet = async (e) => {
        e.preventDefault();
        if (!selectedOption || !betAmount || parseFloat(betAmount) <= 0) return;

        setPlacing(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await placeBet(market.id, selectedOption, parseFloat(betAmount));
            setMessage({ type: 'success', text: `Bet placed! New balance: $${result.updatedBalance.toFixed(2)}` });
            setBetAmount('');
            setSelectedOption(null);
            await refreshBalance();
            await loadMarket();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading market...</p>
                </div>
            </div>
        );
    }

    if (!market) {
        return <div className="page"><div className="empty-state"><p>Market not found.</p></div></div>;
    }

    const totalPool = market.totalPool || market.options.reduce((s, o) => s + o.pool, 0);

    return (
        <div className="page page-market-detail">
            <div className="market-detail-grid">
                {/* Main content */}
                <div className="market-detail-main">
                    <div className="detail-card">
                        <div className="detail-header">
                            <span className={`market-status-dot ${market.status === 'OPEN' ? 'status-open' : 'status-resolved'}`} />
                            <span className="market-status-label">{market.status}</span>
                        </div>
                        <h1 className="detail-title">{market.title}</h1>
                        <p className="detail-description">{market.description}</p>

                        <div className="detail-stats">
                            <div className="stat">
                                <span className="stat-label">Total Pool</span>
                                <span className="stat-value">${totalPool.toLocaleString()}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Trades</span>
                                <span className="stat-value">{market.bets?.length || 0}</span>
                            </div>
                        </div>

                        {/* Probability visualization */}
                        <div className="probability-section">
                            <h3>Current Probabilities</h3>
                            {market.options.map((option) => (
                                <div key={option.id} className="prob-row">
                                    <div className="prob-info">
                                        <span className="prob-name">{option.name}</span>
                                        <span className="prob-value">{option.probability?.toFixed(1)}%</span>
                                    </div>
                                    <div className="prob-bar-track">
                                        <div
                                            className="prob-bar-fill"
                                            style={{
                                                width: `${option.probability || 50}%`,
                                                background: option.name.toLowerCase() === 'yes'
                                                    ? 'var(--color-green)'
                                                    : option.name.toLowerCase() === 'no'
                                                        ? 'var(--color-red)'
                                                        : 'var(--color-accent)',
                                            }}
                                        />
                                    </div>
                                    <span className="prob-pool">${option.pool.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent trades */}
                    {market.bets && market.bets.length > 0 && (
                        <div className="detail-card trades-card">
                            <h3>Recent Trades</h3>
                            <div className="trades-list">
                                {market.bets.map((bet) => (
                                    <div key={bet.id} className="trade-row">
                                        <span className="trade-user">{bet.user?.username}</span>
                                        <span className="trade-option">{market.options.find((o) => o.id === bet.optionId)?.name}</span>
                                        <span className="trade-amount">${bet.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - trading panel */}
                <div className="market-detail-sidebar">
                    {market.status === 'OPEN' && user ? (
                        <div className="detail-card trading-card">
                            <h3>Place a Trade</h3>

                            {message.text && (
                                <div className={`alert alert-${message.type}`}>{message.text}</div>
                            )}

                            <form onSubmit={handleBet}>
                                <div className="option-selector">
                                    {market.options.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`option-btn ${selectedOption === option.id ? 'option-selected' : ''}`}
                                            onClick={() => setSelectedOption(option.id)}
                                            style={{
                                                borderColor: selectedOption === option.id
                                                    ? (option.name.toLowerCase() === 'yes' ? 'var(--color-green)' : 'var(--color-red)')
                                                    : undefined,
                                            }}
                                        >
                                            <span className="option-btn-name">{option.name}</span>
                                            <span className="option-btn-prob">{option.probability?.toFixed(1)}%</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>Amount ($)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={user.balance}
                                        step="1"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                    />
                                    <div className="quick-amounts">
                                        {[10, 25, 50, 100].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                className="quick-amount-btn"
                                                onClick={() => setBetAmount(String(amt))}
                                            >
                                                ${amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    disabled={!selectedOption || !betAmount || placing}
                                >
                                    {placing ? 'Placing...' : 'Place Trade'}
                                </button>
                            </form>
                        </div>
                    ) : market.status === 'RESOLVED' ? (
                        <div className="detail-card">
                            <h3>Market Resolved</h3>
                            <p className="resolved-text">
                                Winner: <strong>{market.options.find((o) => o.id === market.winningOptionId)?.name || 'N/A'}</strong>
                            </p>
                        </div>
                    ) : (
                        <div className="detail-card">
                            <p><a href="/login">Login</a> to start trading</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
