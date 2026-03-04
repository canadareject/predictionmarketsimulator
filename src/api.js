const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
    }
    return res.json();
}

export async function register(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
    }
    return res.json();
}

export async function fetchMarkets() {
    const res = await fetch(`${API_BASE}/markets`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch markets');
    return res.json();
}

export async function fetchMarket(id) {
    const res = await fetch(`${API_BASE}/markets/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch market');
    return res.json();
}

export async function createMarket(data) {
    const res = await fetch(`${API_BASE}/markets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create market');
    }
    return res.json();
}

export async function resolveMarket(marketId, winningOptionId) {
    const res = await fetch(`${API_BASE}/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ winningOptionId }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to resolve market');
    }
    return res.json();
}

export async function placeBet(marketId, optionId, amount) {
    const res = await fetch(`${API_BASE}/bets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ marketId, optionId, amount }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to place bet');
    }
    return res.json();
}

export async function fetchWallet() {
    const res = await fetch(`${API_BASE}/user/wallet`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return res.json();
}
