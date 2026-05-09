# 🚀 4chill.ch Progressive Web App - Schnellstart

## ⚡ 5 Minuten Setup

### Schritt 1: Projekt öffnen
```bash
cd path/to/4chill-ch
```

### Schritt 2: Webserver starten

**Option A: Python (einfachste Methode)**
```bash
python -m http.server 8000
```

**Option B: Node.js**
```bash
npx http-server
```

**Option C: Ruby**
```bash
ruby -run -ehttpd . -p8000
```

### Schritt 3: Browser öffnen
```
http://localhost:8000
```

**Fertig! 🎉**

---

## 🧪 Test-Benutzer

### Neue Benutzer erstellen
1. Auf "Registrieren" klicken
2. Beliebige Daten eingeben
3. Login erfolgt automatisch

### Daten testen
```javascript
// Browser Console öffnen (F12)
localStorage.getItem('golf_app_users')    // Alle Benutzer
localStorage.getItem('golf_app_session')  // Aktuelle Anmeldung
localStorage.getItem('golf_app_bookings') // Alle Buchungen
```

---

## 📱 App installieren

### Android
1. Website in Chrome öffnen
2. URL-Leiste oben rechts: "⋮" (Menü)
3. "Auf dem Startbildschirm installieren"
4. Fertig - App ist wie normales App nutzbar

### iOS
1. Website in Safari öffnen
2. Unten: "Teilen"
3. "Zum Home-Bildschirm"
4. "Hinzufügen"
5. Fertig - App ist auf dem Home-Bildschirm

---

## 🎯 Erste Schritte

1. **Registrieren**
   - Auf "Registrieren" gehen
   - Daten eingeben
   - Passwort: min. 8 Zeichen

2. **Dashboard anschauen**
   - Persönliche Infos
   - Buchungs-Statistiken

3. **Kalender öffnen**
   - Datum auswählen
   - Startzeit & Endzeit eingeben
   - "Buchen" klicken

4. **Buchung verwalten**
   - In "Ihre Buchungen" sehen
   - "Löschen" zum Stornieren

---

## 📂 Projektstruktur (kurz)

```
4chill-ch/
├── index.html         ← Hier anfangen
├── login.html         ← Anmelden
├── register.html      ← Registrieren
├── dashboard.html     ← Dashboard
├── calendar.html      ← Kalender
│
├── css/styles.css     ← Styling
├── js/                ← JavaScript
│   ├── app.js         ← Grundfunktionen
│   ├── auth.js        ← Login/Register
│   ├── db.js          ← Datenverwaltung
│   ├── calendar.js    ← Kalender
│   └── dashboard.js   ← Dashboard
│
├── service-worker.js  ← Offline-Funktion
└── manifest.json      ← App-Konfiguration
```

---

## 🔧 Häufige Fragen

**Q: Werden meine Daten gespeichert?**
A: Ja, lokal im Browser (LocalStorage)

**Q: Kann ich offline arbeiten?**
A: Ja, die App funktioniert offline!

**Q: Wie lösche ich alle Daten?**
```javascript
localStorage.clear()  // Im Browser Console (F12)
```

**Q: Kann ich die Farben ändern?**
A: Ja, in `css/styles.css` - suchen Sie nach `--primary-color`

---

## 🚀 Deployment (optional)

### Vercel (kostenlos)
1. vercel.com öffnen
2. Projekt hochladen
3. Deploy - Fertig!

### GitHub Pages (kostenlos)
1. GitHub Repository erstellen
2. Dateien hochladen
3. Settings → Pages
4. Website ist live!

---

## 📞 Hilfe braucht?

- Fehler in Browser Console? → F12 drücken
- Service Worker Probleme? → Devtools → Application → Clear Storage
- Alte Daten? → `localStorage.clear()` im Console

---

**Viel Spaß mit 4chill.ch! ⛳**
