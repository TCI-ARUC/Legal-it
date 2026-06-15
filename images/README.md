# Afbeeldingen

Plaats hier de beeldbestanden die op de site gebruikt worden.

## Homepage hero
- **Bestanden:** `hero-notariskantoor-gevel.webp` (primair) + `hero-notariskantoor-gevel.jpg` (fallback). `hero-notariskantoor-gevel.png` = origineel/bron (wordt niet geserveerd).
- **Gebruikt in:** `index.html` (hero, rechterkolom)
- **Verhouding:** ~4:5 (staand). Beeld wordt met `object-fit: cover` bijgesneden.
- **Aanbevolen formaat:** minimaal 800 × 1000 px (liefst 1200 × 1500 px voor scherpe weergave op retina-schermen).

Zolang dit bestand ontbreekt, valt de hero terug op de bestaande placeholder.

## Logo
- **Header:** `logo-legal-it-header.webp` (+ `.png` fallback) — bijgesneden versie (merk + LEGAL IT, zonder tagline).
- **Footer:** `logo-legal-it.webp` (+ `.png` fallback) — volledige versie met tagline.
- **Bron:** `Logo Legal IT.png` (origineel) en `Logo-recolored-source.png` (achtergrond gelijkgetrokken aan site-navy #0B1F3A). Beide worden niet geserveerd.
- Gebruikt in header en footer van alle pagina's via een `<picture>`-element.
