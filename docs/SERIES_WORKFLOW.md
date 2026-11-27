# OpenMotion Studio – productie van series

GitHub is de bron van waarheid. De bestaande renderer, projects/<slug>/project.json,
assets en #studio/<slug>-links blijven ongewijzigd.

## Series

Lees series/catalog.json. De catalogus bevat bestaande afleveringen (legacy mapping),
een actieve templateversie en versiehistorie. Elke versie heeft een zelfstandig
series/<id>/template-v<versie>.json met een bevroren voorbeeld van de bestaande scènes,
brandKit, formaat, fps, richtduur, audio/caption-instellingen en productie-instructies.
Een template is een referentie, geen renderbaar project. Wijzig een gepubliceerde
templateversie niet achteraf: maak een nieuw versiebestand en zet activeVersion om.
Bestaande afleveringen behouden hun eigen JSON en versie. Nieuwe afleveringen nemen
de standaardwaarden over via de prompt/import en materialiseren eigen projectdata.

## Nieuwe aflevering

1. Lees de catalogus, actieve template en eventueel referenceProject.
2. Bekijk alle bestaande projectbestanden van de serie en kies een vrij nummer.
3. Schrijf onderwerp, script, storyboard, bronnen en vereiste assets. Volg bestaande
   renderer- en audioregels. Kopieer geen episode-specifieke beelden of tekst blind.
4. Maak projects/<unieke-slug>/project.json met het bestaande schema en:
   kind = video, seriesId, season (positief geheel getal), episodeNumber (positief
   geheel getal), templateVersion en optioneel productionStatus.
   Status: concept, script, production, review, approved, exported, published.
5. Voeg een episode toe door uitsluitend het nieuwe projectbestand te committen;
   de manifestgenerator ontdekt de aflevering automatisch. Laat legacy mapping staan.
6. Controleer bronnen, scène-inhoud, assets en vrije nummering vóór publicatie.
   Normale main-push publiceert via bestaande Pages workflow. Geen aparte check-Actions
   of automatische MP4-render. Exporteer vanuit de Studio zoals voorheen.

Voorbeeld van toegevoegde velden:
```json
{"kind":"video","seriesId":"inside-your-mind","season":1,"episodeNumber":6,"templateVersion":"1.0","productionStatus":"review"}
```

## Nieuwe serie

Gebruik een unieke ID, voeg een catalogusrecord en versie 1.0 toe, maak een template
op het opgegeven templatePath. Voeg minimaal titel, beschrijving, actieve versie,
format, fps, durationSec, brandKit, instructions en referenceProject (of null) toe.
Gebruik episodes: [] voor nieuwe series; nieuwe projectmetadata is leidend.
Why Things Work is voorlopig leeg: de eerste aflevering staat nog niet op main.

## Bibliotheek

De manifestgenerator genereert statische SVG-titelkaarten in public/thumbnails.
Dit zijn grafische posters, geen gerenderde videoframes. Live preview blijft in Studio.
Gebruik kind=template voor voorbeelden en kind=experiment voor het archief. De
bestaande voorbeelden en legacy video's zijn expliciet ingedeeld in de catalogus.
Voor een los project is seriesId niet nodig. Bij een onbekende of dubbele
afleveringsreferentie stopt de manifestbuild met een duidelijke fout.

De UI maakt prompts voor ChatGPT/GitHub en gebruikt de bestaande JSON-import.
Er is geen directe schrijffunctie voor serietemplates in de browser, zodat GitHub
en templateversies de bron van waarheid blijven. Statusbeheer en exporthistorie
zijn volgende fase.
