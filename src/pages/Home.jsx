import { useState, useEffect } from 'react';
import { fetchMarkets } from '../api';
import MarketCard from '../components/MarketCard';

export default function Home() {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchMarkets()
            .then(setMarkets)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? markets : markets.filter((m) => m.status === filter);

    return (
        <div className="page page-home">
            <header className="page-header">
                <h1 className="page-title">Prediction Markets</h1>
                <p className="page-subtitle">Trade on the outcomes of real-world events with virtual currency</p>
            </header>

            <div className="filter-bar">
                {['ALL', 'OPEN', 'RESOLVED'].map((f) => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'ALL' ? '🌐 All' : f === 'OPEN' ? '🟢 Open' : '✅ Resolved'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading markets...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No markets found.</p>
                </div>
            ) : (
                <div className="market-grid">
                    {filtered.map((market) => (
                        <MarketCard key={market.id} market={market} />
                    ))}
                </div>
            )}
        </div>
    );
}
