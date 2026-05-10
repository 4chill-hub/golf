# 4chill.ch – Golf Simulator Club

**Session-basierte PWA für Golf-Simulator-Buchungen**

- **Live Demo:** https://4chill-hub.gitlab.io/golf/
- **Technologie:** HTML5, CSS3, Vanilla JavaScript, Service Worker
- **Persistenz:** `sessionStorage` (Browser-Session, keine dauerhafte Speicherung)
- **Deployment:** statische Website / GitLab Pages

## Was die App bietet

- Benutzerregistrierung & Login
- Kalenderbasierte Buchungen mit Konfliktprüfung
- Dashboard mit Profil und Buchungsstatistiken
- Einfache Buchungsverwaltung (Erstellen, Anzeigen, Löschen)
- Installierbare PWA mit Offline-Unterstützung

## Kurzstart

1. Projekt öffnen:
   ```bash
   cd /workspaces/golf
   ```
2. Lokalen Webserver starten:
   ```bash
   python -m http.server 8000
   ```
3. Browser öffnen:
   ```text
   http://localhost:8000
   ```

## Wichtige Dateien

- `index.html`
- `login.html`
- `register.html`
- `dashboard.html`
- `calendar.html`
- `css/styles.css`
- `js/app.js`
- `js/auth.js`
- `js/db.js`
- `js/dashboard.js`
- `js/calendar.js`
- `service-worker.js`
- `manifest.json`

## Hinweise

- Die App speichert Daten nur während der Browser-Sitzung.
- Nach Schließen des Tabs/Browsers sind Anmeldung, Nutzer und Buchungen gelöscht.
- Es ist keine externe API oder GitHub-Persistenz erforderlich.

## Deployment

- Als statische Website hosten.
- GitLab Pages: https://4chill-hub.gitlab.io/golf/

