# 4chill.ch – Golf Simulator Club

**Booking system for golf simulator reservation with PWA support**

---

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Features](#features)
3. [Technologie-Stack](#technologie-stack)
4. [Installation & Setup](#installation--setup)
5. [Verwendung](#verwendung)
6. [PWA Konformität](#pwa-konformität)
7. [Architektur](#architektur)
8. [API Dokumentation](#api-dokumentation)
9. [Sicherheit](#sicherheit)
10. [Projektstruktur](#projektstruktur)
11. [Fehlerbehandlung](#fehlerbehandlung)
12. [Erweiterung & Entwicklung](#erweiterung--entwicklung)
13. [Support](#support)

---

## Überblick

4chill.ch ist eine moderne Progressive Web App (PWA) für die Verwaltung von Spielzeiten am Golf-Simulator. Die Anwendung ermöglicht Clubmitgliedern, Buchungen zu erstellen, zu bearbeiten und zu verwalten – mit Unterstützung für Offline-Funktionalität und Installation auf dem Home-Screen.

**Live:** http://localhost:3000 (nach `npm start`)

---

## Features

- ✅ **Benutzerregistrierung & Login** mit Email-Validierung und Passworthashing
- ✅ **Kalender-Buchungssystem** mit Doppelung-Prävention
- ✅ **Intelligente Standard-Zeiten** (18:00–19:00, automatische Verschiebung bei Konflikten)
- ✅ **Profilverwaltung** mit Benutzerbearbeitung
- ✅ **PWA-Unterstützung** mit Service Worker und Offline-Fähigkeit
- ✅ **Grayscale Design** (barrierenarme, kontrastreiche Benutzeroberfläche)
- ✅ **Responsive Design** für Desktop, Tablet und Mobile
- ✅ **JSON-basierte Persistenz** via Node.js + Express
- ✅ **Rate-Limiting** für Login-Versuche
- ✅ **Content Security Policy** für erhöhte Sicherheit

---

## Technologie-Stack

### Frontend
- **HTML5** – Semantische Struktur
- **CSS3** – Grayscale Design System (CSS Custom Properties)
- **Vanilla JavaScript (ES6+)** – Keine Frameworks
- **Service Worker** – PWA Offline-Funktionalität

### Backend
- **GitHub API** – Persistenz direkt über GitHub-Dateien und Git-Commits
- **Keine Node.js-Serverkomponente** – die Anwendung läuft als statische Website
- **JSON** – Flat-File Persistenz über `data/users.json` und `data/bookings.json` in GitHub

### Build & Deployment
- **npm** – Package Management
- **Git** – Versionskontrolle

---

## Installation & Setup

### Voraussetzungen
- Kein Node.js erforderlich
- Ein GitHub Personal Access Token mit `repo`- oder `public_repo`-Zugriff

### Schritt 1: Projekt klonen oder extrahieren
```bash
cd /path/to/golf
```

### Schritt 2: Öffnen Sie die Website als statische Seite
- Verwenden Sie einen beliebigen Static-Host, z. B. GitHub Pages, Netlify oder einen lokalen Static Server
- Alternativ können Sie die Seiten direkt in einem Browser öffnen, wenn CORS und HTTPS-Konfiguration dies zulassen

### Schritt 3: GitHub-Konfiguration eintragen
- Geben Sie auf der Login- oder Registrierungsseite Ihren GitHub Owner, Repository, Branch und Token ein
- Die App speichert Daten anschließend über die GitHub API direkt in `data/users.json` und `data/bookings.json`

---

## Verwendung

### 1. Anmeldung
1. Klicken Sie auf **"Anmelden"** in der Navigationsleiste
2. Geben Sie Email und Passwort ein
3. Klicken Sie **"Anmelden"**

### 2. Registrierung
1. Klicken Sie auf **"Registrieren"** in der Anmeldeseite
2. Füllen Sie das Formular aus:
   - Vorname, Nachname (erforderlich)
   - Email (muss eindeutig sein)
   - Passwort (mindestens 8 Zeichen empfohlen)
   - Telefon (optional)
3. Klicken Sie **"Registrieren"**

### 3. Buchung erstellen
1. Gehen Sie zu **"Kalender"** im Dashboard
2. Wählen Sie ein Datum aus dem Kalender
3. Die Startzeit und Endzeit werden automatisch gesetzt:
   - Standard: **18:00 – 19:00** (eine Stunde)
   - Falls diese Zeit bereits gebucht: Automatische Verschiebung auf die nächste verfügbare Stunde
4. Geben Sie optional Notizen ein (z. B. Gästename)
5. Klicken Sie **"Buchen"**
6. Sie sehen einen grünen Bestätigungshaken: **✅ Buchung erfolgreich gespeichert!**

### 4. Duplizierungsprävention
- Das System prüft automatisch, ob die gewählte Zeit bereits gebucht ist
- **Fehlermeldung:** "Um diese Zeit gibt es bereits eine Buchung (HH:MM - HH:MM)"
- Wählen Sie eine andere Zeit

### 5. Profil bearbeiten
1. Gehen Sie zum **Dashboard**
2. Klicken Sie **"Profil bearbeiten"**
3. Ändern Sie Ihre Daten:
   - Spitzname (optional)
   - Vorname, Nachname
   - Telefon
4. Klicken Sie **"Speichern"**

### 6. Buchung löschen
1. Klicken Sie auf **"Meine Buchungen"** im Dashboard
2. Klicken Sie **"Löschen"** neben einer Buchung
3. Bestätigen Sie die Aktion

### 7. Abmelden
- Klicken Sie in der Navigationsleiste auf **"Abmelden"**
- Sie werden zur Startseite weitergeleitet

---

## PWA Konformität

Die Anwendung erfüllt alle **PWA-Standards** der Google PWA Checklist:

### ✅ Installierbar
- `manifest.json` mit allen erforderlichen Eigenschaften
- Icons in SVG-Format (maskierbar für adaptive Icons)
- `start_url: "/"` richtig konfiguriert
- `display: "standalone"` für App-ähnliches Erlebnis

### ✅ Responsive
- Mobile-first Design
- Viewport Meta-Tag konfiguriert
- Responsive CSS Grid & Flexbox Layout
- Touch-freundliche UI (Buttons, Eingabefelder)

### ✅ Sicher (HTTPS)
- HTTPS-Umleitung im Service Worker
- Content Security Policy (CSP) Header
- Sichere Cookie-Attribute (Session-Token nur in localStorage)

### ✅ Service Worker
- Offline-Funktionalität mit Cache-First-Strategie
- Statische Assets gecacht (HTML, CSS, JS, Images)
- **API-Anfragen werden NICHT gecacht** – ermöglicht Server-Sync
- Automatische Cache-Updates beim Service Worker Update

### ✅ Verbesserungen
- Fast Loading: Assets sind optimiert
- Works Offline: Service Worker cacht Seiten & Ressourcen
- Web App Manifest: Installierbar auf Home-Screen

### Installation (Desktop)
1. Öffnen Sie http://localhost:3000
2. Adressleiste: Klicken Sie auf **"App installieren"** oder **"Zum Home-Screen hinzufügen"**
3. Die App wird auf Ihrem Gerät installiert

### Installation (Mobil – iOS)
1. Öffnen Sie http://localhost:3000 in Safari
2. Tippen Sie auf **Teilen** > **Zum Home-Screen hinzufügen**
3. Bestätigen Sie mit **Hinzufügen**

### Installation (Mobil – Android)
1. Öffnen Sie http://localhost:3000 in Chrome
2. Das Browser-Popup sollte erscheinen: **"Zum Home-Screen"**
3. Tippen Sie darauf und bestätigen Sie

---

## Architektur

### Schichten-Architektur

```
┌─────────────────────────────────────┐
│   Presentation (HTML + CSS + SVG)   │
├─────────────────────────────────────┤
│   Business Logic (JavaScript ES6)   │
│   ├─ auth.js (Login/Registrierung)  │
│   ├─ calendar.js (Buchungen)        │
│   ├─ dashboard.js (Profilverwaltung)│
│   └─ app.js (globale Funktionen)    │
├─────────────────────────────────────┤
│   Data Access Layer (db.js)         │
│   ├─ Async/Await API Wrapper       │
│   └─ localStorage Session Management│
├─────────────────────────────────────┤
│   REST API (Express server.js)      │
│   ├─ GET/POST /api/users           │
│   └─ GET/POST/DELETE /api/bookings │
├─────────────────────────────────────┤
│   Persistence (JSON Files)          │
│   ├─ data/users.json               │
│   └─ data/bookings.json            │
└─────────────────────────────────────┘
```

### Komponenten

#### **db.js – Datenzugriff**
Abstrahiert alle Datenbankaufrufe hinter einer einheitlichen API:

```javascript
class AppDatabase {
    // Benutzer (async, persistiert via API)
    async getUser(email)
    async getUsers()
    async saveUser(user)
    
    // Sitzung (localStorage, synchron)
    getCurrentUser()  // Liest aus localStorage
    setCurrentUser(user)  // Schreibt in localStorage
    
    // Buchungen (async, persistiert via API)
    async getBookings(memberId?)
    async saveBooking(booking)
    async deleteBooking(id)
}
```

**Hybrid-Ansatz:**
- **Benutzer & Buchungen:** Async via Express API → JSON Files
- **Sitzung:** Synchron via localStorage (Session-Token)

#### **auth.js – Authentifizierung**
- Login mit Email/Passwort
- Registrierung neuer Benutzer
- Passwort-Hashing (PBKDF2-inspiriert, 10.000 Iterationen)
- Rate-Limiting (max. 5 fehlgeschlagene Versuche in 15 Minuten)
- Email-Validierung

#### **calendar.js – Buchungsverwaltung**
- Monats-Kalender mit Übersichts-Ansicht
- Dynamische Zeitfenster-Generierung (HH:00, HH:15, HH:30, HH:45)
- Intelligente Standardzeiten (18:00–19:00, automatische Verschiebung)
- Duplizierungsprävention mit Fehleranzeige
- Buchungsliste mit Lösch-Funktion

#### **dashboard.js – Profilverwaltung**
- Benutzerprofilanzeige
- Profil-Bearbeitung
- Buchungsstatistiken:
  - Gesamtanzahl Buchungen
  - Buchungen diesen Monat
- Erfolgs-/Fehlermeldungen

#### **service-worker.js – PWA Offline**
- Cache-First-Strategie für statische Assets
- Netzwerk-First für API-Aufrufe (`/api/*` wird nicht gecacht)
- Automatische Cache-Invalidation bei Updates
- HTTPS-Umleitung
- Security-Header auf Responses

#### **server.js – Express Backend**
```javascript
// Port 3000, JSON-Persistierung
GET  /api/users              // Alle Benutzer abrufen
POST /api/users              // Benutzer speichern/aktualisieren
GET  /api/bookings           // Alle Buchungen (optional: ?memberId=...)
POST /api/bookings           // Buchung erstellen
DELETE /api/bookings/:id     // Buchung löschen
```

---

## API Dokumentation

Alle Anfragen erfolgen über das lokale Netzwerk zu `http://localhost:3000`.

### Benutzer API

#### `GET /api/users`
Alle Benutzer abrufen.

**Response:**
```json
[
  {
    "id": "user_001",
    "email": "member@example.com",
    "firstName": "Max",
    "lastName": "Mustermann",
    "nickname": "MaxM",
    "phone": "+41 79 123 45 67",
    "memberNumber": "MEM-001",
    "joinDate": "2026-05-09",
    "status": "active",
    "passwordHash": "...",
    "createdAt": "2026-05-09T10:30:00Z"
  }
]
```

#### `POST /api/users`
Benutzer erstellen oder aktualisieren.

**Request-Body:**
```json
{
  "email": "new.user@example.com",
  "firstName": "Max",
  "lastName": "Mustermann",
  "nickname": "MaxM",
  "phone": "+41 79 987 65 43",
  "memberNumber": "MEM-001",
  "passwordHash": "...",
  "joinDate": "2026-05-09"
}
```

**Response:** Das gespeicherte Benutzer-Objekt

---

### Buchungen API

#### `GET /api/bookings`
Alle Buchungen abrufen (optional nach Mitglied filtern).

**Query-Parameter:**
- `memberId` (optional): Nur Buchungen eines Mitglieds

**Beispiel:**
```
GET /api/bookings?memberId=user_001
```

**Response:**
```json
[
  {
    "id": "booking_1715256600000_abc123def456",
    "memberId": "user_001",
    "date": "2026-05-15",
    "startTime": "18:00",
    "endTime": "19:00",
    "duration": 60,
    "notes": "Trainingsstunde",
    "createdAt": "2026-05-09T10:30:00Z"
  }
]
```

#### `POST /api/bookings`
Neue Buchung erstellen.

**Request-Body:**
```json
{
  "memberId": "user_001",
  "date": "2026-05-15",
  "startTime": "18:00",
  "endTime": "19:00",
  "duration": 60,
  "notes": "Optional: Notizen zur Buchung"
}
```

**Response:** Das gespeicherte Buchung-Objekt mit `id`

#### `DELETE /api/bookings/:id`
Buchung löschen.

**Beispiel:**
```
DELETE /api/bookings/booking_1715256600000_abc123def456
```

**Response:**
```json
{ "success": true }
```

---

## Sicherheit

### Passwort-Hashing
- PBKDF2-inspirierter Algorithmus mit statischem Salt
- 10.000 Iterationen pro Login-Versuch
- **⚠️ Hinweis:** Für Production sollte bcrypt/Argon2 verwendet werden

### Rate-Limiting
- Max. 5 fehlgeschlagene Login-Versuche pro 15 Minuten
- IP-unabhängig (auf Basis der Email)
- Automatisches Zurücksetzen

### Content Security Policy (CSP)
```
default-src 'self';
style-src 'self' 'unsafe-inline';
script-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
```

Erlaubt nur:
- Interne Skripte
- Interne Stylesheets
- Interne Bilder
- Lokale Schriftarten
- Anfragen an `/api/*`

### Session-Management
- Token in localStorage (nicht Cookie)
- Session-Timeout nach Konfiguration
- Automatisches Logout bei abgelaufener Sitzung
- Session wird beim Browserlöschungen gelöscht

### Data Protection
- JSON-Dateien im `/data`-Verzeichnis (nicht öffentlich erreichbar)
- Keine sensitiven Daten in localStorage außer Session-Token
- Sichere Übertragung (HTTPS in Production)

---

## Projektstruktur

```
golf/
├── index.html              # Startseite
├── login.html              # Login-Seite
├── register.html           # Registrierungs-Seite
├── calendar.html           # Buchungskalender
├── dashboard.html          # Profil & Verwaltung
├── manifest.json           # PWA Manifest
├── service-worker.js       # PWA Offline-Cache
├── server.js               # Express Backend
├── package.json            # npm Dependencies
│
├── css/
│   └── styles.css          # Grayscale Design System
│
├── js/
│   ├── app.js              # Globale Funktionen
│   ├── auth.js             # Login/Registrierung
│   ├── calendar.js         # Buchungs-Kalender
│   ├── dashboard.js        # Profilverwaltung
│   └── db.js               # Datenzugriff-Layer
│
├── icons/                  # SVG Icons
│   ├── icon-192x192.svg
│   ├── icon-512x512.svg
│   ├── icon-maskable-192x192.svg
│   ├── icon-maskable-512x512.svg
│   ├── logo.svg
│   ├── calendar-icon.svg
│   ├── golf-course.svg
│   ├── booking-calendar.svg
│   └── simulator.svg
│
├── images/                 # Raster-Bilder
│   ├── achilles-logo-images.jpg
│   ├── markusspiske-golf-1486354_1920.jpg
│   └── moneyfool-golf-2217600_1920.jpg
│
├── data/                   # Runtime: Persistierte JSON-Dateien
│   ├── users.json          # Benutzer-Datenbank
│   └── bookings.json       # Buchungs-Datenbank
│
├── README.md               # Diese Datei
├── QUICKSTART.md           # Schnelleinstieg
├── ARCHITECTURE.md         # Detaillierte Architektur
├── SECURITY.md             # Sicherheits-Richtlinien
└── IMAGES.md               # Bildquellen & Lizenzen
```

---

## Fehlerbehandlung

### Häufige Fehler & Lösungen

#### ❌ "Verbindungsfehler. Bitte Server starten."
**Ursache:** Der Express-Server läuft nicht.  
**Lösung:**
```bash
npm start
```

#### ❌ "Benutzer oder Passwort ungültig"
**Ursache:** Email oder Passwort falsch oder Benutzer existiert nicht.  
**Lösung:** Überprüfen Sie Email/Passwort oder registrieren Sie ein neues Konto.

#### ❌ "Um diese Zeit gibt es bereits eine Buchung"
**Ursache:** Das gewählte Zeitfenster ist bereits gebucht.  
**Lösung:** Wählen Sie eine andere Zeit, die vom System angezeigt wird.

#### ❌ "Zu viele Anmeldeversuche. Bitte später versuchen."
**Ursache:** Zu viele fehlgeschlagene Login-Versuche.  
**Lösung:** Warten Sie 15 Minuten und versuchen Sie es erneut.

#### ❌ Service Worker funktioniert nicht
**Ursache:** Nur über HTTPS oder localhost verfügbar.  
**Lösung:** 
- Lokal: Verwenden Sie http://localhost:3000
- Production: Verwenden Sie HTTPS

---

## Erweiterung & Entwicklung

### Neue Features hinzufügen

#### 1. Neue Seite
1. Erstellen Sie eine neue HTML-Datei (z. B. `reports.html`)
2. Fügen Sie Navigation in alle HTML-Dateien ein
3. Erstellen Sie `js/reports.js` für Business Logic
4. Aktualisieren Sie `service-worker.js` Cache-Liste

#### 2. Neue API-Endpoints
1. Fügen Sie Endpoints in `server.js` hinzu:
```javascript
app.get('/api/reports', (req, res) => {
    // Logik
    res.json(data);
});
```
2. Erstellen Sie Wrapper-Methoden in `db.js`:
```javascript
async getReports() {
    const res = await fetch('/api/reports');
    return res.ok ? res.json() : [];
}
```
3. Verwenden Sie in JavaScript:
```javascript
const reports = await db.getReports();
```

#### 3. Neue Datenbank-Tabelle
1. Erstellen Sie neue JSON-Datei in `/data` (z. B. `reports.json`)
2. Initialisieren Sie in `server.js`:
```javascript
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, '[]');
```
3. Implementieren Sie CRUD-Operationen

### Umgebungsvariablen
Erstellen Sie `.env` (nicht commiten):
```
PORT=3000
DATA_DIR=./data
DEBUG=false
```

Laden Sie in `server.js`:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

### Testing
Für Unit-Tests verwenden Sie Jest:
```bash
npm install --save-dev jest
npm test
```

---

## Support

### Dokumentation
- 📖 [QUICKSTART.md](QUICKSTART.md) – Schnelleinstieg
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) – Detaillierte Architektur
- 🔒 [SECURITY.md](SECURITY.md) – Sicherheits-Richtlinien
- 🖼️ [IMAGES.md](IMAGES.md) – Bildquellen & Lizenzen

### Community
- Issues auf GitHub: [Link eintragen]
- Fragen: kontakt@4chill.ch

### License
MIT License – Siehe LICENSE.txt

---

**Zuletzt aktualisiert:** Mai 2026  
**Version:** 1.0.0 (PWA-konform)  
**Status:** Production-ready ✅
