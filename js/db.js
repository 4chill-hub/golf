// Database Layer - uses JSON API (server.js) with localStorage session management
class AppDatabase {
    constructor() {
        this.sessionKey = 'golf_app_session';
    }

    // --- Users (async, persisted to JSON file via API) ---
    async getUser(email) {
        const users = await this.getUsers();
        return users.find(u => u.email === email) || null;
    }

    async getUsers() {
        const res = await fetch('/api/users');
        return res.ok ? res.json() : [];
    }

    async saveUser(user) {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        return res.ok ? res.json() : null;
    }

    // --- Session (localStorage, sync) ---
    getCurrentUser() {
        const data = localStorage.getItem(this.sessionKey);
        if (!data) return null;
        const user = JSON.parse(data);
        if (user.loginTime && user.sessionTimeout) {
            if (Date.now() - user.loginTime > user.sessionTimeout) {
                this.setCurrentUser(null);
                return null;
            }
        }
        return user;
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.sessionKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.sessionKey);
        }
    }

    // --- Bookings (async, persisted to JSON file via API) ---
    async getBookings(memberId = null) {
        const url = memberId ? `/api/bookings?memberId=${encodeURIComponent(memberId)}` : '/api/bookings';
        const res = await fetch(url);
        return res.ok ? res.json() : [];
    }

    async saveBooking(booking) {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });
        return res.ok ? res.json() : null;
    }

    async deleteBooking(id) {
        const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
        return res.ok;
    }

    // --- Utility ---
    clear() {
        localStorage.removeItem(this.sessionKey);
    }
}

// Global instance
const db = new AppDatabase();

