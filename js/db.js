// Database Layer - Session storage persistence
const SESSION_USERS_KEY = 'golf_app_users';
const SESSION_BOOKINGS_KEY = 'golf_app_bookings';
const SESSION_KEY = 'golf_app_session';
const SESSION_FAILED_LOGINS_KEY = 'golf_app_failed_login_attempts';

class AppDatabase {
    constructor() {
        this.usersKey = SESSION_USERS_KEY;
        this.bookingsKey = SESSION_BOOKINGS_KEY;
        this.sessionKey = SESSION_KEY;
        this.failedLoginsKey = SESSION_FAILED_LOGINS_KEY;
    }

    getSessionData(key) {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    setSessionData(key, value) {
        if (value === null || value === undefined) {
            sessionStorage.removeItem(key);
            return;
        }
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    async getUsers() {
        return this.getSessionData(this.usersKey) || [];
    }

    async getUser(email) {
        if (!email) return null;
        const users = await this.getUsers();
        return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    async saveUser(user) {
        const users = await this.getUsers();
        const index = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        this.setSessionData(this.usersKey, users);
        return user;
    }

    async getBookings(memberId = null) {
        const bookings = this.getSessionData(this.bookingsKey) || [];
        bookings.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });
        return memberId ? bookings.filter(b => b.memberId === memberId) : bookings;
    }

    async saveBooking(booking) {
        const newBooking = { ...booking };
        newBooking.id = newBooking.id || 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newBooking.createdAt = newBooking.createdAt || new Date().toISOString();

        const bookings = this.getSessionData(this.bookingsKey) || [];
        const index = bookings.findIndex(b => b.id === newBooking.id);
        if (index >= 0) {
            bookings[index] = newBooking;
        } else {
            bookings.push(newBooking);
        }
        this.setSessionData(this.bookingsKey, bookings);

        return newBooking;
    }

    async deleteBooking(id) {
        const bookings = this.getSessionData(this.bookingsKey) || [];
        this.setSessionData(this.bookingsKey, bookings.filter(b => b.id !== id));
        return true;
    }

    getCurrentUser() {
        const data = this.getSessionData(this.sessionKey);
        if (!data) return null;
        if (data.loginTime && data.sessionTimeout && Date.now() - data.loginTime > data.sessionTimeout) {
            this.setCurrentUser(null);
            return null;
        }
        return data;
    }

    setCurrentUser(user) {
        if (user) {
            this.setSessionData(this.sessionKey, user);
        } else {
            this.setSessionData(this.sessionKey, null);
        }
    }

    clear() {
        this.setSessionData(this.sessionKey, null);
    }
}

// Global instance
const db = new AppDatabase();
