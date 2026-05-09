// Database Layer - GitHub file-based persistence with client-side session storage
const GITHUB_CONFIG_KEY = 'golf_app_github_config';
const SESSION_KEY = 'golf_app_session';

class AppDatabase {
    constructor() {
        this.sessionKey = SESSION_KEY;
        this.githubConfigKey = GITHUB_CONFIG_KEY;
        this.filePaths = {
            users: 'data/users.json',
            bookings: 'data/bookings.json'
        };
        this.committer = {
            name: 'Golf App',
            email: 'noreply@4chill.ch'
        };
    }

    getGitHubConfig() {
        const raw = localStorage.getItem(this.githubConfigKey);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    saveGitHubConfig(config) {
        localStorage.setItem(this.githubConfigKey, JSON.stringify(config));
    }

    requireGitHubConfig() {
        const config = this.getGitHubConfig();
        if (!config || !config.owner || !config.repo || !config.token) {
            throw new Error('GitHub-Konfiguration fehlt. Bitte Repository und Token eintragen.');
        }
        return {
            owner: config.owner,
            repo: config.repo,
            branch: config.branch || 'main',
            token: config.token
        };
    }

    async githubApi(path, options = {}) {
        const config = this.requireGitHubConfig();
        const headers = {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${config.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(`https://api.github.com/${path}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const details = await this.parseGitHubError(response);
            throw new Error(details);
        }

        return response;
    }

    async parseGitHubError(response) {
        let message = `GitHub API Fehler: ${response.status}`;
        try {
            const body = await response.json();
            if (body && body.message) {
                message = body.message;
            }
        } catch {
            // ignore parse failure
        }
        return message;
    }

    normalizePath(path) {
        return path.split('/').map(encodeURIComponent).join('/');
    }

    async fetchFile(filePath) {
        const config = this.requireGitHubConfig();
        const normalizedPath = this.normalizePath(filePath);
        const url = `repos/${config.owner}/${config.repo}/contents/${normalizedPath}?ref=${encodeURIComponent(config.branch)}`;
        const response = await fetch(`https://api.github.com/${url}`, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${config.token}`
            }
        });

        if (response.status === 404) {
            return { data: [], sha: null };
        }

        if (!response.ok) {
            throw new Error(await this.parseGitHubError(response));
        }

        const json = await response.json();
        const content = json.content ? this.decodeBase64(json.content) : '[]';
        let data = [];
        try {
            data = JSON.parse(content || '[]');
        } catch {
            data = [];
        }

        return { data, sha: json.sha };
    }

    async writeFile(filePath, data, message, sha = null) {
        const config = this.requireGitHubConfig();
        const normalizedPath = this.normalizePath(filePath);
        const body = {
            message,
            committer: this.committer,
            content: this.encodeBase64(JSON.stringify(data, null, 2)),
            branch: config.branch
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${normalizedPath}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${config.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(await this.parseGitHubError(response));
        }

        return response.json();
    }

    async updateJsonFile(filePath, updateCallback, message) {
        const file = await this.fetchFile(filePath);
        const updatedData = updateCallback(Array.isArray(file.data) ? file.data : []);

        try {
            return await this.writeFile(filePath, updatedData, message, file.sha);
        } catch (err) {
            if (err.message.includes('sha') || err.message.includes('Reference does not exist') || err.message.includes('Branch not found')) {
                const latest = await this.fetchFile(filePath);
                return this.writeFile(filePath, updateCallback(Array.isArray(latest.data) ? latest.data : []), message, latest.sha);
            }
            throw err;
        }
    }

    encodeBase64(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary);
    }

    decodeBase64(base64) {
        const cleaned = base64.replace(/\n/g, '');
        const binary = atob(cleaned);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    async getUsers() {
        const file = await this.fetchFile(this.filePaths.users);
        return Array.isArray(file.data) ? file.data : [];
    }

    async getUser(email) {
        if (!email) return null;
        const users = await this.getUsers();
        return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    async saveUser(user) {
        await this.updateJsonFile(this.filePaths.users, users => {
            const index = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
            if (index >= 0) {
                users[index] = user;
            } else {
                users.push(user);
            }
            return users;
        }, `Speichere Benutzer ${user.email}`);
        return user;
    }

    async getBookings(memberId = null) {
        const file = await this.fetchFile(this.filePaths.bookings);
        const bookings = Array.isArray(file.data) ? file.data : [];
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

        await this.updateJsonFile(this.filePaths.bookings, bookings => {
            const index = bookings.findIndex(b => b.id === newBooking.id);
            if (index >= 0) {
                bookings[index] = newBooking;
            } else {
                bookings.push(newBooking);
            }
            return bookings;
        }, `Speichere Buchung ${newBooking.id}`);

        return newBooking;
    }

    async deleteBooking(id) {
        await this.updateJsonFile(this.filePaths.bookings, bookings => bookings.filter(b => b.id !== id), `Lösche Buchung ${id}`);
        return true;
    }

    getCurrentUser() {
        const data = localStorage.getItem(this.sessionKey);
        if (!data) return null;
        try {
            const user = JSON.parse(data);
            if (user.loginTime && user.sessionTimeout && Date.now() - user.loginTime > user.sessionTimeout) {
                this.setCurrentUser(null);
                return null;
            }
            return user;
        } catch {
            return null;
        }
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.sessionKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.sessionKey);
        }
    }

    clear() {
        localStorage.removeItem(this.sessionKey);
    }
}

// Global instance
const db = new AppDatabase();
