# 4chill.ch - PWA Architektur Guide

## 🏗 System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                       HTML Pages                            │
│  index.html | login.html | register.html | calendar.html   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐      ┌─────────┐       ┌──────────┐
   │ CSS     │      │JavaScript│      │Service   │
   │styles.css      │ app.js   │      │Worker    │
   │         │      │auth.js   │      │          │
   └─────────┘      │db.js     │      └──────────┘
                    │calendar.js
                    │dashboard.js
                    └─────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   ┌─────────────┐               ┌────────────────┐
   │ LocalStorage │              │ IndexedDB      │
   │(User Data)  │              │ (optional)     │
   │(Bookings)   │              │(cache)         │
   │(Session)    │              │                │
   └─────────────┘              └────────────────┘
        │                              │
        └──────────────┬───────────────┘
                       ▼
            ┌──────────────────────┐
            │   Browser Storage    │
            │    Persistence       │
            └──────────────────────┘
```

## 📱 PWA Features

### 1. **Service Worker**
- **Datei**: `service-worker.js`
- **Funktion**: 
  - Caching von Ressourcen
  - Offline-Funktionalität
  - Background Sync
- **Cache Strategy**: Cache-First for static, Network-First for dynamic

### 2. **Web App Manifest**
- **Datei**: `manifest.json`
- **Konfiguriert**:
  - App-Name und Icons
  - Start-URL und Display-Mode
  - Themenfarbe
  - Installierbarkeit

### 3. **LocalStorage Database**
- **Benutzer**: `golf_app_users`
- **Session**: `golf_app_session`
- **Buchungen**: `golf_app_bookings`

## 🔄 Datenfluss

```
User Registration:
┌──────────────┐
│ register.html│
└──────┬───────┘
       │ (form submit)
       ▼
┌──────────────┐
│ auth.js      │ (validate & hash)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ db.js        │ (saveUser)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ LocalStorage     │ (golf_app_users)
└──────────────────┘
```

```
User Login:
┌──────────────┐
│ login.html   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ auth.js      │ (verify credentials)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ db.js        │ (setCurrentUser)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ LocalStorage     │ (golf_app_session)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ dashboard.html   │ (protected route)
└──────────────────┘
```

```
Booking Creation:
┌──────────────┐
│ calendar.html│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ calendar.js      │ (form validation)
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ db.js        │ (saveBooking)
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ LocalStorage         │ (golf_app_bookings)
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│ Render Calendar  │ (re-render UI)
└──────────────────┘
```

## 🔐 Authentifizierungsflow

```
1. Registration:
   Input: firstName, lastName, email, password
   ↓
   Validate email format
   Validate password length (min 8 chars)
   ↓
   Hash password (simple browser hash)
   ↓
   Create user object with metadata
   ↓
   Save to LocalStorage
   ↓
   Auto-login: setCurrentUser()
   ↓
   Redirect to dashboard

2. Login:
   Input: email, password
   ↓
   Get user from LocalStorage by email
   ↓
   Compare password hash
   ↓
   If match: setCurrentUser()
   ↓
   Redirect to dashboard
   ↓
   If no match: Show error

3. Session Management:
   On page load:
   ↓
   Check LocalStorage for session
   ↓
   If exists: Load user context
   ↓
   If not: Redirect to login
   ↓
   On logout: Clear session, redirect home
```

## 💾 Datenspeicherung

### LocalStorage Schema

```javascript
// golf_app_users - Array of User Objects
[
    {
        id: "user_1234567890_abc123",
        email: "user@example.com",
        firstName: "Max",
        lastName: "Müller",
        phone: "+41 79 123 45 67",
        memberNumber: "MEM-1234567890",
        joinDate: "2024-05-09",
        status: "active",
        passwordHash: "a1b2c3d4e5f6g7h8",
        createdAt: "2024-05-09T10:30:00Z"
    }
]

// golf_app_session - Current User Object
{
    id: "user_1234567890_abc123",
    email: "user@example.com",
    firstName: "Max",
    lastName: "Müller",
    memberNumber: "MEM-1234567890",
    phone: "+41 79 123 45 67",
    joinDate: "2024-05-09"
}

// golf_app_bookings - Array of Booking Objects
[
    {
        id: "booking_1234567890_abc123",
        memberId: "user_1234567890_abc123",
        date: "2024-05-15",
        startTime: "09:00",
        endTime: "10:30",
        duration: 90,
        notes: "Mit Freund",
        createdAt: "2024-05-09T10:30:00Z"
    }
]
```

## 🎯 Komponenten-Übersicht

### HTML Pages
| Datei | Zweck | Auth erforderlich |
|-------|-------|------------------|
| index.html | Landing Page | Nein |
| login.html | Anmeldung | Nein |
| register.html | Registrierung | Nein |
| dashboard.html | Profil & Stats | Ja |
| calendar.html | Buchungen | Ja |

### JavaScript Module
| Datei | Verantwortung |
|-------|--------------|
| app.js | Navigation, globale Events, Service Worker |
| auth.js | Login/Register Logik, Passwort-Hashing |
| db.js | LocalStorage Abstraction, CRUD |
| calendar.js | Kalender-Rendering, Buchungen |
| dashboard.js | Profil-Anzeige, Statistiken |

### CSS
| Aspekt | Details |
|--------|---------|
| Mobile-First | Breakpoints: 480px, 768px |
| Responsive | CSS Grid & Flexbox |
| Theming | CSS Custom Properties (:root) |
| Accessibility | WCAG 2.1 AA |

## 🚀 Performance-Optimierung

### Caching-Strategie
```
┌─────────────────────────────────────────┐
│        User Request                      │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │ Check Cache?   │
         └───────┬────────┘
         ┌───────┴────────┐
         │                │
    YES  │                │ NO
    ▼    │                ▼
 ┌──────┐│         ┌──────────┐
 │Return││         │Fetch from│
 │from  ││         │Network   │
 │Cache ││         └────┬─────┘
 └──────┘│              │
         │         ┌────▼────┐
         │         │ Cache   │
         │         │Response │
         │         └────┬────┘
         │              │
         └───────┬──────┘
                 │
         ┌───────▼────────┐
         │ Return to User │
         └────────────────┘
```

## 🔄 Offline-Mode

```
Online:
User Action → Fetch from Network → Update Cache → Display

Offline:
User Action → Check Cache → Serve from Cache → Display
             (User Action logs in memory)

Re-connect:
Sync queued actions → Update Server → Refresh UI
```

## 🐛 Debugging

### Browser Console
```javascript
// Benutzer anschauen
JSON.parse(localStorage.getItem('golf_app_users'))

// Session checken
localStorage.getItem('golf_app_session')

// Alle Buchungen anschauen
JSON.parse(localStorage.getItem('golf_app_bookings'))

// Spezifische Buchungen filtern
const bookings = JSON.parse(localStorage.getItem('golf_app_bookings'));
bookings.filter(b => b.date === '2024-05-15')

// Alles löschen
localStorage.clear()
```

### Service Worker Debugging
```
Chrome DevTools → Application → Service Workers
┌─ Status
├─ Active and running
├─ Activated
└─ Updates

Chrome DevTools → Application → Cache Storage
├─ 4chill-v1
│  ├─ index.html
│  ├─ css/styles.css
│  ├─ js/app.js
│  └─ ...
```

## 📈 Erweiterungsmöglichkeiten

1. **Backend Integration**
   - Airtable API
   - Firebase Realtime Database
   - REST API

2. **Erweiterte Features**
   - Benachrichtigungen
   - Push-Notifikationen
   - Sync mit mehreren Geräten
   - Cloud Backup

3. **Sicherheit**
   - End-to-End Encryption
   - Two-Factor Authentication
   - Advanced Password Hashing (bcrypt)

---

**Architektur Version**: 1.0 | **Datum**: Mai 2024
