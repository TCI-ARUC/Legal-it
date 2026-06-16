# Afbeeldingen

Plaats hier de beeldbestanden die op de site gebruikt worden.

## Homepage hero
- **Bestanden:** `hero-notariskantoor.webp` (primair) + `hero-notariskantoor.jpg` (fallback). `Notariskantoor-hero.png` = origineel/bron (wordt niet geserveerd).
- **Gebruikt in:** `index.html` (hero, rechterkolom)
- **Verhouding:** ~4:5 (staand). Beeld wordt met `object-fit: cover` bijgesneden.
- **Aanbevolen formaat:** minimaal 800 × 1000 px (liefst 1200 × 1500 px voor scherpe weergave op retina-schermen).

Zolang dit bestand ontbreekt, valt de hero terug op de bestaande placeholder.

## Logo
- **Header:** `logo-legal-it-header.webp` (+ `.png` fallback) — bijgesneden versie (merk + LEGAL IT, zonder tagline).
- **Footer:** `logo-legal-it.webp` (+ `.png` fallback) — volledige versie met tagline.
- **Bron:** `Logo Legal IT.png` (origineel) en `Logo-recolored-source.png` (achtergrond gelijkgetrokken aan site-navy #0B1F3A). Beide worden niet geserveerd.
- Gebruikt in header en footer van alle pagina's via een `<picture>`-element.

## Placeholder-afbeeldingen (vervangbaar)
On-brand placeholders (navy + gouden lijn-icoon, of lichte logokaart). Vervang ze door echte foto's/logo's met dezelfde bestandsnaam en verhouding:

| Bestand | Pagina | Verhouding |
|---|---|---|
| `ph-specialist.webp` | index (specialist aan het werk) | 3:4 |
| `ph-team-kantoor.webp` | over-ons (team/kantoor) | 4:5 |
| `ph-portret-1..4.webp` | over-ons (teamportretten) | 3:4 |
| `ph-werkplek-teams.webp` | diensten (werkplek/Teams) | 5:4 |
| `ph-security-dashboard.webp` | diensten (security) | 5:4 |
| `ph-datacenter-backup.webp` | diensten (datacenter/back-up) | 5:4 |
| `ph-netwerk-kantoor.webp` | diensten (netwerk/kantoor) | 5:4 |
| `ph-support-contact.webp` | diensten (support/contact) | 5:4 |
| `partner-donna-james.webp` | partners (logo Donna James) | 16:10 |
| `partner-nobilex.webp` | partners (logo Nobilex) | 16:10 |

Beeld wordt met `object-fit: cover` getoond; houd dezelfde verhouding aan voor de beste pasvorm.
