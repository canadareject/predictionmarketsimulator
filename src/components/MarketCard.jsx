import { Link } from 'react-router-dom';

export default function MarketCard({ market }) {
    const totalPool = market.totalPool || market.options.reduce((s, o) => s + o.pool, 0);
    const topOption = market.options.reduce((a, b) => (a.probability > b.probability ? a : b), market.options[0]);

    return (
        <Link to={`/market/${market.id}`} className="market-card" id={`market-card-${market.id}`}>
            <div className="market-card-header">
                <span className={`market-status-dot ${market.status === 'OPEN' ? 'status-open' : 'status-resolved'}`} />
                <span className="market-status-label">{market.status}</span>
            </div>

            <h3 className="market-card-title">{market.title}</h3>

            <div className="market-card-odds">
                {market.options.map((option) => (
                    <div key={option.id} className="odds-bar-wrapper">
                        <div className="odds-bar-label">
                            <span>{option.name}</span>
                            <span className="odds-percent">{option.probability?.toFixed(1)}%</span>
                        </div>
                        <div className="odds-bar-track">
                            <div
                                className="odds-bar-fill"
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
                    </div>
                ))}
            </div>

            <div className="market-card-footer">
                <span className="pool-amount">${totalPool.toLocaleString()} pool</span>
                <span className="bet-count">{market._count?.bets || 0} trades</span>
            </div>
        </Link>
    );
}
