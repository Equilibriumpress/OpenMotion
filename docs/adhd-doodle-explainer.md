# ADHD & Slaap — Handgetekende Doodle Explainer

## Referentie

TikTok-video door de gebruiker aangeleverd op 24 november 2026. Bronlink: https://vm.tiktok.com/ZGdXKhodS/

De bron duurt circa 62,27 seconden, heeft verticaal videoformaat (512×910, 30 fps) en bevat een Nederlandse voice-over. De video laat getekende personages en een geanimeerd brein zien op pastelachtergronden. Het verhaal behandelt laat opblijven, weinig rustmomenten, ochtendstress, douchen, executieve functies en tijdsblindheid.

Deze versie is een **reconstructie van de stijl en vertelstructuur**. Illustraties zijn nieuw getekende Canvas-vormen. Er is geen TikTok-watermerk, geen kopie van de laatste platform-outro en geen audio of videobeeld uit het bronbestand opgenomen.

## Openen

Open in OpenMotion Studio: **Shorts & Reels → ADHD & Slaap — Handgetekende Doodle Explainer**.

- Projectbestand: `projects/adhd-sleep-handdrawn-explainer/project.json`
- Renderlayout: `doodle-explainer`
- Broncode: `src/engine/doodleExplainerRenderer.ts`
- Geluid: `src/engine/doodleExplainerAudio.ts`
- Formaat: 1080 × 1920, 30 fps, 62 seconden
- 26 afzonderlijke scènes, volledig bewerkbare JSON

## Scèneopbouw

| Seconden | Animatie | Onderwerp |
|---|---|---|
| 0–4 | Bed bij maanlicht, telefoon en digitale klok | Laat opblijven |
| 4–5 | Bed bij daglicht | Moeilijk opstaan |
| 5–9 | Douche met druppels en lopend tijdlabel | Douchen duurt langer |
| 9–11 | Brein en vergrootglas | De verklaring |
| 11–20 | Persoon, bel, takenlijst, maan | Druk overdag, rust in de nacht |
| 20–25 | Vrolijk personage en klein brein | Gevoel van vrijheid en slaapuitstel |
| 25–33 | Wekkertjes, bed, takenlijst | Ochtendstress |
| 33–39 | Brein, lampje, ADHD-checklist | Aandacht en executieve functies |
| 39–47 | Douche, muzieknoot en gedachtewolk | Afleidingsval |
| 47–51 | Persoon naast klok | Tijdsblindheid |
| 51–59 | Persoon, dagelijkse benodigdheden en START-bord | Ochtendroutine |
| 59–62 | Neutralere afsluiting | Slaap en ADHD |

## Aanpassen in de Studio

Selecteer een scène en open het tabblad **Bewerken**. Naast de algemene titel, duur en kleuren zijn de volgende velden beschikbaar:

- Scène: bed, douche, brein, staand personage, checklist, klok of afsluiting
- Achtergrond: nacht, crème, blauw, ochtend, rustig of grijs
- Gezichtsuitdrukking: slaperig, ontspannen, blij, bezorgd, verrast of overweldigd
- Rode accentwoorden en kleine decoratieve illustraties
- Tijdlabel, truikleur en accentkleur
- Vrij bewerkbare Nederlandse verteltekst voor een voice-over

De Canvas-illustraties gebruiken vaste coördinaten en tijdafhankelijke animaties. Bij gelijke scènetijd krijgen preview en MP4 dezelfde frames.

## Geluid

Een originele zachte melodie wordt ter plekke met Web Audio opgebouwd. Deze wordt bij MP4-export toegevoegd als er geen externe audiotracks zijn. Met de audioknop in de Studio klinkt dezelfde muziek tijdens de preview. De bronvideo had gesproken Nederlands. De gesproken stem uit TikTok is **niet** hergebruikt of automatisch nagebootst.

De tekst voor een eigen voice-over staat per scène in `doodle.narration`. Voeg een opname toe onder **Audio timeline** om die mee te exporteren. Bij een eigen audiotrack wordt de ingebouwde melodie vervangen. Voor een verteller met identieke timing verdient een gecontroleerde, handmatig gesynchroniseerde opname de voorkeur.

## Redactionele kanttekening

De video is een korte uitleg, geen diagnose. Niet iedere persoon met ADHD ervaart dezelfde slaap- en ochtendproblemen. Tijdsblindheid is een populair beschrijvend begrip, geen zelfstandige medische diagnose. Redigeer en controleer de claims vóór bredere publicatie.

## Controleren

Er zijn geen GitHub Actions gestart. Inspecteer zelf de render op de apparaten waarop je wilt publiceren. Let op de handschriftfont die via Google Fonts wordt geladen, leesbaarheid op mobiele schermen, de 62 seconden timing en eventuele resolutiereductie door de browser-encoder.
