const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf8');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// --- Helpers ---
function readJSON(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch { return []; }
}
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// --- Users API ---
app.get('/api/users', (req, res) => {
    res.json(readJSON(USERS_FILE));
});

app.post('/api/users', (req, res) => {
    const user = req.body;
    if (!user || !user.email) return res.status(400).json({ error: 'Invalid user data' });
    const users = readJSON(USERS_FILE);
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) { users[idx] = user; } else { users.push(user); }
    writeJSON(USERS_FILE, users);
    res.json(user);
});

// --- Bookings API ---
app.get('/api/bookings', (req, res) => {
    let bookings = readJSON(BOOKINGS_FILE);
    if (req.query.memberId) {
        bookings = bookings.filter(b => b.memberId === req.query.memberId);
    }
    bookings.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    const booking = req.body;
    if (!booking || !booking.date) return res.status(400).json({ error: 'Invalid booking data' });
    booking.id = booking.id || 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    booking.createdAt = booking.createdAt || new Date().toISOString();
    const bookings = readJSON(BOOKINGS_FILE);
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) { bookings[idx] = booking; } else { bookings.push(booking); }
    writeJSON(BOOKINGS_FILE, bookings);
    res.json(booking);
});

app.delete('/api/bookings/:id', (req, res) => {
    const bookings = readJSON(BOOKINGS_FILE);
    writeJSON(BOOKINGS_FILE, bookings.filter(b => b.id !== req.params.id));
    res.json({ success: true });
});

// Catch-all: serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Golf App läuft auf: http://localhost:${PORT}`);
});
