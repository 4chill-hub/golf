# 📸 Bilder hinzufügen - 4chill.ch

## Platzhalter-Bilder

Momentan werden **Platzhalter-Grafiken** angezeigt, um zu zeigen, wo Bilder sein sollten.

## Bilder hinzufügen

### Schritt 1: Bilder in `/images` Verzeichnis kopieren

Legen Sie die folgenden Bilder in `images/` ab:

```
web/
└── images/
    ├── hero-golf.jpg           (1920x1440) - Startseite Hero-Section
    ├── simulator.jpg           (800x600)   - Feature Card: Premium Simulator
    ├── sunset-golfer.jpg       (800x600)   - Feature Card: Flexible Buchung
    ├── indoor-golf.jpg         (800x600)   - Login-Seite
    └── golf-equipment.jpg      (800x600)   - Register-Seite
```

### Schritt 2: HTML-Dateien aktualisieren

Nach dem Hinzufügen der Bilder, ersetzen Sie in den HTML-Dateien die Platzhalter-Divs mit echten `<img>`-Tags:

#### index.html - Hero Section
```html
<div class="hero-image">
    <img 
        src="images/hero-golf.jpg" 
        alt="Schöner Golfplatz mit grünem Fairway und Bäumen"
        loading="lazy"
        class="responsive-image"
    >
</div>
```

#### index.html - Feature Cards
```html
<!-- Premium Simulator -->
<div class="feature-icon-wrapper">
    <img 
        src="images/simulator.jpg" 
        alt="Indoor Golf Simulator mit Bildschirm" 
        loading="lazy"
        class="feature-image"
    >
</div>

<!-- Flexible Buchung -->
<div class="feature-icon-wrapper">
    <img 
        src="images/sunset-golfer.jpg" 
        alt="Golfer beim Tee-off bei Sonnenuntergang" 
        loading="lazy"
        class="feature-image"
    >
</div>
```

#### login.html
```html
<div class="auth-graphics">
    <img 
        src="images/indoor-golf.jpg" 
        alt="Indoor Golf Simulator" 
        loading="lazy"
        class="responsive-image"
    >
</div>
```

#### register.html
```html
<div class="auth-graphics">
    <img 
        src="images/golf-equipment.jpg" 
        alt="Golf-Ausrüstung" 
        loading="lazy"
        class="responsive-image"
    >
</div>
```

## 🖼️ Bilder-Empfehlungen

### Bildquellen
- **Kostenlos & lizenzfrei:**
  - [Unsplash](https://unsplash.com) - Golf, Simulator, Golfer
  - [Pexels](https://www.pexels.com) - Golf Bilder
  - [Pixabay](https://pixabay.com) - Golf Equipment

### Bildgröße & Optimierung
```
Hero Image:        1920×1440 (16:9 aspect ratio)
Feature Images:    800×600 (4:3 aspect ratio)
Auth Images:       800×1200 (2:3 aspect ratio)

Format:            JPEG/WebP
Maximale Größe:    400KB pro Bild
```

### Tools zur Bildoptimierung
```bash
# Mit ImageMagick:
convert hero-golf.jpg -resize 1920x1440 -quality 85 hero-golf-optimized.jpg

# Mit FFmpeg:
ffmpeg -i hero-golf.jpg -vf scale=1920:1440 hero-golf-optimized.jpg
```

## ⚡ Performance-Tipps

1. **WebP-Format verwenden** (besser als JPEG)
   - 25-35% kleinere Dateigröße
   - Schnelleres Laden

2. **Responsive Images** (verschiedene Größen für verschiedene Geräte)
   ```html
   <img 
       src="images/hero-golf-large.jpg"
       srcset="
           images/hero-golf-small.jpg 480w,
           images/hero-golf-medium.jpg 1024w,
           images/hero-golf-large.jpg 1920w"
       sizes="(max-width: 480px) 100vw, (max-width: 1024px) 100vw, 1920px"
       alt="Golfplatz"
   >
   ```

3. **Lazy Loading** (bereits im Code)
   ```html
   <img src="..." loading="lazy">
   ```

## 🔒 Sicherheit bei Bildern

Bilder sollten:
- ✅ Lokal gehostet sein (wie in diesem Projekt)
- ✅ Validierte Dateitypen (JPG, PNG, WebP)
- ✅ Größe limitiert (max. 5MB)
- ✅ ALT-Text für Barrierefreiheit

## 📝 Beispiele

### Mit lizenzfreien Bildern von Pixabay

Sie können diese Bilder direkt herunterladen und in `/images` speichern:

1. **Hero Image:**
   - Pixabay: "Golf Course at Sunset"
   - Dateiname: `hero-golf.jpg`

2. **Simulator:**
   - Pixabay: "Golf Simulator Screen"
   - Dateiname: `simulator.jpg`

3. **Sunset Golfer:**
   - Pixabay: "Golfer Teeing Off"
   - Dateiname: `sunset-golfer.jpg`

4. **Indoor Golf:**
   - Pixabay: "Indoor Golf Putting"
   - Dateiname: `indoor-golf.jpg`

5. **Equipment:**
   - Pixabay: "Golf Clubs"
   - Dateiname: `golf-equipment.jpg`

---

**Status:** Platzhalter aktiv. Ersetzen Sie diese durch echte Bilder für Production!
