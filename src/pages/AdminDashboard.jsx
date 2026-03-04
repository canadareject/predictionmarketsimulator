import { useState, useEffect } from 'react';
import { fetchMarkets, createMarket, resolveMarket } from '../api';

export default function AdminDashboard() {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['Yes', 'No']);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadMarkets();
    }, []);

    const loadMarkets = async () => {
        try {
            const data = await fetchMarkets();
            setMarkets(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const validOptions = options.filter((o) => o.trim() !== '');
        if (validOptions.length < 2) {
            setMessage({ type: 'error', text: 'At least 2 options required' });
            return;
        }
        setCreating(true);
        setMessage({ type: '', text: '' });
        try {
            await createMarket({ title, description, options: validOptions });
            setMessage({ type: 'success', text: 'Market created successfully!' });
            setTitle('');
            setDescription('');
            setOptions(['Yes', 'No']);
            await loadMarkets();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setCreating(false);
        }
    };

    const handleResolve = async (marketId, winningOptionId) => {
        if (!confirm('Are you sure you want to resolve this market? This will distribute payouts.')) return;
        try {
            await resolveMarket(marketId, winningOptionId);
            setMessage({ type: 'success', text: 'Market resolved! Payouts distributed.' });
            await loadMarkets();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (idx) => setOptions(options.filter((_, i) => i !== idx));
    const updateOption = (idx, val) => setOptions(options.map((o, i) => (i === idx ? val : o)));

    const openMarkets = markets.filter((m) => m.status === 'OPEN');
    const resolvedMarkets = markets.filter((m) => m.status === 'RESOLVED');

    return (
        <div className="page page-admin">
            <header className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Create and manage prediction markets</p>
            </header>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="admin-grid">
                {/* Create market card */}
                <div className="detail-card create-market-card">
                    <h2>Create New Market</h2>
                    <form onSubmit={handleCreate} className="admin-form">
                        <div className="form-group">
                            <label htmlFor="market-title">Question / Title</label>
                            <input
                                id="market-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Will SpaceX land on Mars by 2030?"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="market-desc">Description</label>
                            <textarea
                                id="market-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the resolution criteria..."
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>Options</label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="option-input-row">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        required
                                    />
                                    {options.length > 2 && (
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeOption(idx)}>✕</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="btn btn-ghost btn-sm" onClick={addOption}>
                                + Add Option
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={creating}>
                            {creating ? 'Creating...' : 'Create Market'}
                        </button>
                    </form>
                </div>

                {/* Manage markets */}
                <div className="detail-card manage-markets-card">
                    <h2>Open Markets ({openMarkets.length})</h2>
                    {openMarkets.length === 0 ? (
                        <p className="empty-text">No open markets</p>
                    ) : (
                        <div className="admin-market-list">
                            {openMarkets.map((market) => (
                                <div key={market.id} className="admin-market-item">
                                    <div className="admin-market-info">
                                        <h4>{market.title}</h4>
                                        <span className="pool-amount">${market.totalPool.toLocaleString()} pool</span>
                                    </div>
                                    <div className="admin-market-actions">
                                        <span className="resolve-label">Resolve as:</span>
                                        {market.options.map((opt) => (
                                            <button
                                                key={opt.id}
                                                className="btn btn-sm btn-resolve"
                                                onClick={() => handleResolve(market.id, opt.id)}
                                            >
                                                {opt.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {resolvedMarkets.length > 0 && (
                        <>
                            <h2 style={{ marginTop: '2rem' }}>Resolved Markets ({resolvedMarkets.length})</h2>
                            <div className="admin-market-list">
                                {resolvedMarkets.map((market) => (
                                    <div key={market.id} className="admin-market-item resolved">
                                        <div className="admin-market-info">
                                            <h4>{market.title}</h4>
                                            <span className="resolved-winner">
                                                Winner: {market.options.find((o) => o.id === market.winningOptionId)?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
