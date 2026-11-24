import { OpenMotionProject } from '../types/openmotion';

/** Eight data-driven vertical videos. The matching GitHub project JSON is generated from this data. */
export const SHORTS_REELS_TEMPLATES: OpenMotionProject[] = [
  {
    "schemaVersion": "1.0",
    "id": "short-memory-explainer",
    "slug": "short-memory-explainer",
    "title": "Explain It in 30 Seconds — Memory",
    "description": "Psychology explainer in five scenes",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-memory-explainer/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "MEMORY NOTES",
      "primaryColor": "#7C63DA",
      "accentColor": "#F4C76B",
      "backgroundColor": "#101320",
      "surfaceColor": "#192333",
      "textColor": "#FFFFFF",
      "mutedColor": "#C2CBDF",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 3,
        "text": "Why do we forget?",
        "style": "karaoke"
      },
      {
        "startSec": 3,
        "endSec": 10,
        "text": "Your brain selects what to remember.",
        "style": "karaoke"
      },
      {
        "startSec": 10,
        "endSec": 22,
        "text": "Retrieval strengthens useful connections.",
        "style": "karaoke"
      },
      {
        "startSec": 22,
        "endSec": 27,
        "text": "Practice recalling, not only rereading.",
        "style": "karaoke"
      },
      {
        "startSec": 27,
        "endSec": 30,
        "text": "Try recalling tomorrow.",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "question",
        "name": "Question",
        "durationSec": 3,
        "layout": "hero-kinetic",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Why do we forget?",
        "eyebrow": "THE HUMAN MIND"
      },
      {
        "id": "encoding",
        "name": "Encoding",
        "durationSec": 7,
        "layout": "faceless-explainer",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Your brain selects what to remember.",
        "explainer": {
          "chapter": "01 ENCODING",
          "visualType": "funnel",
          "visualLabels": [
            "Attention",
            "Encoding",
            "Storage"
          ],
          "voiceoverWords": [
            "01",
            "encoding"
          ]
        }
      },
      {
        "id": "retrieval",
        "name": "Retrieval",
        "durationSec": 12,
        "layout": "faceless-explainer",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Retrieval strengthens useful connections.",
        "explainer": {
          "chapter": "02 RETRIEVAL",
          "visualType": "network-ripple",
          "visualLabels": [
            "Cue",
            "Recall",
            "Repeat",
            "Retain"
          ],
          "voiceoverWords": [
            "02",
            "retrieval"
          ]
        }
      },
      {
        "id": "practice",
        "name": "Practice",
        "durationSec": 5,
        "layout": "metric-spotlight",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Practice recalling, not only rereading.",
        "metrics": [
          {
            "label": "PRACTICE",
            "value": "2 min",
            "delta": "Quick self-test"
          }
        ]
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 3,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Try recalling tomorrow.",
        "ctaText": "Save the tip"
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-edinburgh-facts",
    "slug": "short-edinburgh-facts",
    "title": "3 Surprising Facts — Edinburgh",
    "description": "City facts in vertical editorial animation",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-edinburgh-facts/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "EDINBURGH FACTS",
      "primaryColor": "#EF7351",
      "accentColor": "#F7CA85",
      "backgroundColor": "#192434",
      "surfaceColor": "#192333",
      "textColor": "#FFFFFF",
      "mutedColor": "#C2CBDF",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 2,
        "text": "3 Edinburgh facts",
        "style": "karaoke"
      },
      {
        "startSec": 2,
        "endSec": 7,
        "text": "Old and New Towns are UNESCO-listed.",
        "style": "karaoke"
      },
      {
        "startSec": 7,
        "endSec": 12,
        "text": "The Royal Mile links castle and palace.",
        "style": "karaoke"
      },
      {
        "startSec": 12,
        "endSec": 17,
        "text": "Arthur’s Seat is a volcanic hill.",
        "style": "karaoke"
      },
      {
        "startSec": 17,
        "endSec": 20,
        "text": "Which fact surprised you?",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "hook",
        "name": "Hook",
        "durationSec": 2,
        "layout": "hero-kinetic",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "3 Edinburgh facts",
        "eyebrow": "CITY NOTES"
      },
      {
        "id": "heritage",
        "name": "Heritage",
        "durationSec": 5,
        "layout": "metric-spotlight",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Old and New Towns are UNESCO-listed.",
        "metrics": [
          {
            "label": "UNESCO INSCRIPTION",
            "value": "1995"
          }
        ]
      },
      {
        "id": "royal-mile",
        "name": "Royal Mile",
        "durationSec": 5,
        "layout": "paper-cutout",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "The Royal Mile links castle and palace.",
        "paperChapters": [
          "Edinburgh Castle",
          "St Giles’ Cathedral",
          "Holyroodhouse"
        ],
        "imageUrl": "assets/edinburgh/01-edinburgh-castle.jpg"
      },
      {
        "id": "volcano",
        "name": "Volcano",
        "durationSec": 5,
        "layout": "feature-cards",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Arthur’s Seat is a volcanic hill.",
        "items": [
          {
            "title": "Arthur’s Seat",
            "detail": "A volcanic landscape in Holyrood Park"
          },
          {
            "title": "Hilltop views",
            "detail": "Look across the city"
          }
        ],
        "imageUrl": "assets/edinburgh/03-canongate-royal-mile.jpg"
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 3,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Which fact surprised you?",
        "ctaText": "Save for later"
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-multitasking-myth",
    "slug": "short-multitasking-myth",
    "title": "Myth vs Fact — Multitasking",
    "description": "Research-based short comparison",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-multitasking-myth/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "MIND CHECK",
      "primaryColor": "#E95C73",
      "accentColor": "#6CD9C7",
      "backgroundColor": "#151324",
      "surfaceColor": "#192333",
      "textColor": "#FFFFFF",
      "mutedColor": "#C2CBDF",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 4,
        "text": "Multitasking makes you faster?",
        "style": "karaoke"
      },
      {
        "startSec": 4,
        "endSec": 10,
        "text": "Task switching uses mental effort.",
        "style": "karaoke"
      },
      {
        "startSec": 10,
        "endSec": 15,
        "text": "Focus on one demanding task.",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "myth-or-fact",
        "name": "Myth or Fact",
        "durationSec": 4,
        "layout": "before-after",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Multitasking makes you faster?",
        "comparison": {
          "beforeLabel": "MYTH",
          "beforeTitle": "Do it all at once",
          "beforePoints": [
            "Switch rapidly",
            "Split focus"
          ],
          "afterLabel": "FACT",
          "afterTitle": "Switching takes time",
          "afterPoints": [
            "More effort",
            "More mistakes"
          ]
        }
      },
      {
        "id": "explanation",
        "name": "Explanation",
        "durationSec": 6,
        "layout": "faceless-explainer",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Task switching uses mental effort.",
        "explainer": {
          "chapter": "TASK SWITCHING",
          "visualType": "balance-scale",
          "visualLabels": [
            "Task A",
            "Task B"
          ],
          "voiceoverWords": [
            "task",
            "switching"
          ]
        }
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 5,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Focus on one demanding task.",
        "ctaText": "Try a focus block"
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-data-story",
    "slug": "short-data-story",
    "title": "Animated Data Story — Population Index",
    "description": "Illustrative numerical dataset, not official population data",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-data-story/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "DATA STORY",
      "primaryColor": "#44A9AA",
      "accentColor": "#F5B763",
      "backgroundColor": "#0B2130",
      "surfaceColor": "#192333",
      "textColor": "#FFFFFF",
      "mutedColor": "#C2CBDF",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 3,
        "text": "How does a city grow over time?",
        "style": "karaoke"
      },
      {
        "startSec": 3,
        "endSec": 14,
        "text": "Population index example",
        "style": "karaoke"
      },
      {
        "startSec": 14,
        "endSec": 23,
        "text": "Compare periods, not only totals.",
        "style": "karaoke"
      },
      {
        "startSec": 23,
        "endSec": 27,
        "text": "Always verify the original dataset.",
        "style": "karaoke"
      },
      {
        "startSec": 27,
        "endSec": 30,
        "text": "Explore the data.",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "question",
        "name": "Question",
        "durationSec": 3,
        "layout": "hero-kinetic",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "How does a city grow over time?",
        "eyebrow": "ILLUSTRATIVE DATA"
      },
      {
        "id": "chart",
        "name": "Chart",
        "durationSec": 11,
        "layout": "live-line-chart",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Population index example",
        "chartSeries": {
          "label": "Illustrative population index",
          "unit": " points",
          "points": [
            {
              "xLabel": "1920",
              "value": 100
            },
            {
              "xLabel": "1940",
              "value": 110
            },
            {
              "xLabel": "1960",
              "value": 139
            },
            {
              "xLabel": "1980",
              "value": 153
            },
            {
              "xLabel": "2000",
              "value": 172
            },
            {
              "xLabel": "2020",
              "value": 201
            }
          ]
        }
      },
      {
        "id": "comparison",
        "name": "Comparison",
        "durationSec": 9,
        "layout": "data-rings",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Compare periods, not only totals.",
        "rings": [
          {
            "label": "Index growth",
            "percent": 67,
            "sublabel": "Illustrative"
          }
        ],
        "bars": [
          {
            "label": "1920",
            "value": 100,
            "maxValue": 201,
            "displayValue": "100"
          },
          {
            "label": "2020",
            "value": 201,
            "maxValue": 201,
            "displayValue": "201"
          }
        ]
      },
      {
        "id": "source",
        "name": "Source",
        "durationSec": 4,
        "layout": "quote-spotlight",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Always verify the original dataset.",
        "quote": {
          "text": "Replace sample values with sourced observations.",
          "author": "OpenMotion Data",
          "role": "Editorial guidance"
        }
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 3,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Explore the data.",
        "ctaText": "Edit chart values"
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-edinburgh-documentary",
    "slug": "short-edinburgh-documentary",
    "title": "Historical Mini Documentary — Old Town",
    "description": "Historical editorial story with paper collage and timeline",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-edinburgh-documentary/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "CITY ARCHIVE",
      "primaryColor": "#A84E3D",
      "accentColor": "#B99B71",
      "backgroundColor": "#F2E9DB",
      "surfaceColor": "#FFFDF7",
      "textColor": "#25232B",
      "mutedColor": "#555965",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 4,
        "text": "EDINBURGH OLD TOWN",
        "style": "karaoke"
      },
      {
        "startSec": 4,
        "endSec": 12,
        "text": "A stronghold above the city.",
        "style": "karaoke"
      },
      {
        "startSec": 12,
        "endSec": 20,
        "text": "The town developed along a ridge.",
        "style": "karaoke"
      },
      {
        "startSec": 20,
        "endSec": 26,
        "text": "Explore the closes and the Royal Mile.",
        "style": "karaoke"
      },
      {
        "startSec": 26,
        "endSec": 30,
        "text": "Explore Edinburgh on foot.",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "opening",
        "name": "Opening",
        "durationSec": 4,
        "layout": "poster-editorial",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "EDINBURGH OLD TOWN",
        "posterMeta": {
          "issue": "HERITAGE / 01",
          "location": "EDINBURGH SCOTLAND",
          "tagline": "A CITY OF MANY CENTURIES",
          "accentWord": "OLD TOWN"
        }
      },
      {
        "id": "castle",
        "name": "Castle",
        "durationSec": 8,
        "layout": "paper-cutout",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "A stronghold above the city.",
        "paperChapters": [
          "Castle Rock",
          "Medieval burgh",
          "Old Town streets"
        ],
        "imageUrl": "assets/edinburgh/01-edinburgh-castle.jpg"
      },
      {
        "id": "timeline",
        "name": "Timeline",
        "durationSec": 8,
        "layout": "timeline-roadmap",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "The town developed along a ridge.",
        "timeline": [
          {
            "date": "MEDIEVAL",
            "title": "Castle and burgh",
            "detail": "Growth around a hilltop stronghold"
          },
          {
            "date": "16–17C",
            "title": "Dense town",
            "detail": "Tenements and closes"
          },
          {
            "date": "TODAY",
            "title": "Heritage",
            "detail": "UNESCO-listed historic core"
          }
        ],
        "imageUrl": "assets/edinburgh/02-st-giles-cathedral.jpg"
      },
      {
        "id": "details",
        "name": "Details",
        "durationSec": 6,
        "layout": "paper-cutout",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Explore the closes and the Royal Mile.",
        "paperChapters": [
          "Old stone tenements",
          "St Giles’ Cathedral",
          "The Royal Mile"
        ],
        "imageUrl": "assets/edinburgh/03-canongate-royal-mile.jpg"
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 4,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Explore Edinburgh on foot.",
        "ctaText": "View city guide"
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-scotland-road-trip",
    "slug": "short-scotland-road-trip",
    "title": "Premium Travel Route Reel — Scotland by Campervan",
    "description": "30-second premium Scottish Highlands route movie with OpenFreeMap vector basemap, OSRM road routing, animated campervan, cinematic camera and licensed Wikimedia Commons photography.",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-scotland-road-trip/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "SCOTLAND / THE OPEN ROAD",
      "primaryColor": "#D74936",
      "accentColor": "#E2C48F",
      "backgroundColor": "#E7E8DE",
      "surfaceColor": "#173D37",
      "textColor": "#F8F7EF",
      "mutedColor": "#AFC9BE",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 4,
        "text": "Scotland by campervan",
        "style": "minimal",
        "position": 0.85
      },
      {
        "startSec": 4,
        "endSec": 12,
        "text": "Glen Coe. Beneath towering mountains.",
        "style": "minimal",
        "position": 0.42
      },
      {
        "startSec": 12,
        "endSec": 19,
        "text": "Eilean Donan. Where three sea lochs meet.",
        "style": "minimal",
        "position": 0.42
      },
      {
        "startSec": 19,
        "endSec": 26,
        "text": "Portree. The harbour at the edge of Skye.",
        "style": "minimal",
        "position": 0.42
      },
      {
        "startSec": 26,
        "endSec": 30,
        "text": "Explore the Highlands.",
        "style": "minimal",
        "position": 0.48
      }
    ],
    "scenes": [
      {
        "id": "opening",
        "name": "01 / Edinburgh opening",
        "durationSec": 4,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "FROM CITY TO HIGHLANDS",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_2000-1.jpg?width=1200",
              "photoAuthor": "Libasstref",
              "photoLicense": "CC0 1.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_2000-1.jpg"
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Glencoe%2C_Scotland.jpg?width=1200",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg"
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg?width=1200",
              "photoAuthor": "Gillfoto",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Portree_harbour.jpg?width=1200",
              "photoAuthor": "Clem_nat",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Portree_harbour.jpg"
            }
          ],
          "route": {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [
                  -3.1999,
                  55.9486
                ],
                [
                  -5.004,
                  56.681
                ],
                [
                  -5.5168,
                  57.2743
                ],
                [
                  -6.1945,
                  57.4129
                ]
              ]
            },
            "properties": {
              "status": "routing-needed",
              "source": "Illustrative stop positions, NOT the driving route"
            }
          },
          "chapter": "opening",
          "focusStopIndex": 0,
          "mapCenter": [
            -4.6,
            56.75
          ],
          "mapZoom": 7,
          "routeProgressFrom": 0,
          "routeProgressTo": 0.04,
          "roadMatched": false
        }
      },
      {
        "id": "glencoe",
        "name": "02 / Glen Coe arrival",
        "durationSec": 8,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "GLEN COE / A82",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_2000-1.jpg?width=1200",
              "photoAuthor": "Libasstref",
              "photoLicense": "CC0 1.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_2000-1.jpg"
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Glencoe%2C_Scotland.jpg?width=1200",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg"
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg?width=1200",
              "photoAuthor": "Gillfoto",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Portree_harbour.jpg?width=1200",
              "photoAuthor": "Clem_nat",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Portree_harbour.jpg"
            }
          ],
          "route": {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [
                  -3.1999,
                  55.9486
                ],
                [
                  -5.004,
                  56.681
                ],
                [
                  -5.5168,
                  57.2743
                ],
                [
                  -6.1945,
                  57.4129
                ]
              ]
            },
            "properties": {
              "status": "routing-needed",
              "source": "Illustrative stop positions, NOT the driving route"
            }
          },
          "chapter": "drive",
          "focusStopIndex": 1,
          "mapCenter": [
            -4.68,
            56.66
          ],
          "mapZoom": 8,
          "routeProgressFrom": 0,
          "routeProgressTo": 0.43,
          "roadMatched": false
        }
      },
      {
        "id": "eilean-donan",
        "name": "03 / Eilean Donan",
        "durationSec": 7,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "EILEAN DONAN / A87",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_2000-1.jpg?width=1200",
              "photoAuthor": "Libasstref",
              "photoLicense": "CC0 1.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_2000-1.jpg"
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Glencoe%2C_Scotland.jpg?width=1200",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg"
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg?width=1200",
              "photoAuthor": "Gillfoto",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Portree_harbour.jpg?width=1200",
              "photoAuthor": "Clem_nat",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Portree_harbour.jpg"
            }
          ],
          "route": {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [
                  -3.1999,
                  55.9486
                ],
                [
                  -5.004,
                  56.681
                ],
                [
                  -5.5168,
                  57.2743
                ],
                [
                  -6.1945,
                  57.4129
                ]
              ]
            },
            "properties": {
              "status": "routing-needed",
              "source": "Illustrative stop positions, NOT the driving route"
            }
          },
          "chapter": "drive",
          "focusStopIndex": 2,
          "mapCenter": [
            -5.4,
            57.14
          ],
          "mapZoom": 8.4,
          "routeProgressFrom": 0.43,
          "routeProgressTo": 0.79,
          "roadMatched": false
        }
      },
      {
        "id": "portree",
        "name": "04 / Portree on Skye",
        "durationSec": 7,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "PORTREE / ISLE OF SKYE",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_2000-1.jpg?width=1200",
              "photoAuthor": "Libasstref",
              "photoLicense": "CC0 1.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_2000-1.jpg"
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Glencoe%2C_Scotland.jpg?width=1200",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg"
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg?width=1200",
              "photoAuthor": "Gillfoto",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Portree_harbour.jpg?width=1200",
              "photoAuthor": "Clem_nat",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Portree_harbour.jpg"
            }
          ],
          "route": {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [
                  -3.1999,
                  55.9486
                ],
                [
                  -5.004,
                  56.681
                ],
                [
                  -5.5168,
                  57.2743
                ],
                [
                  -6.1945,
                  57.4129
                ]
              ]
            },
            "properties": {
              "status": "routing-needed",
              "source": "Illustrative stop positions, NOT the driving route"
            }
          },
          "chapter": "drive",
          "focusStopIndex": 3,
          "mapCenter": [
            -6.02,
            57.39
          ],
          "mapZoom": 8.5,
          "routeProgressFrom": 0.79,
          "routeProgressTo": 1,
          "roadMatched": false
        }
      },
      {
        "id": "finale",
        "name": "05 / Complete road trip",
        "durationSec": 4,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "THE OPEN ROAD",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_2000-1.jpg?width=1200",
              "photoAuthor": "Libasstref",
              "photoLicense": "CC0 1.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_2000-1.jpg"
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Glencoe%2C_Scotland.jpg?width=1200",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg"
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg?width=1200",
              "photoAuthor": "Gillfoto",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Highland_-_Eilean_Donan_Castle_-_20240525001946.jpg"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Portree_harbour.jpg?width=1200",
              "photoAuthor": "Clem_nat",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Portree_harbour.jpg"
            }
          ],
          "route": {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [
                  -3.1999,
                  55.9486
                ],
                [
                  -5.004,
                  56.681
                ],
                [
                  -5.5168,
                  57.2743
                ],
                [
                  -6.1945,
                  57.4129
                ]
              ]
            },
            "properties": {
              "status": "routing-needed",
              "source": "Illustrative stop positions, NOT the driving route"
            }
          },
          "chapter": "finale",
          "focusStopIndex": -1,
          "mapCenter": [
            -4.88,
            56.88
          ],
          "mapZoom": 7,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false
        }
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-human-mind-book",
    "slug": "short-human-mind-book",
    "title": "Book in 30 Seconds — The Human Mind",
    "description": "Animated editorial book trailer for a psychology title",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-human-mind-book/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "THE HUMAN MIND",
      "primaryColor": "#6553B8",
      "accentColor": "#DFB956",
      "backgroundColor": "#EAE4D8",
      "surfaceColor": "#FFFDF7",
      "textColor": "#25232B",
      "mutedColor": "#555965",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 6,
        "text": "THE HUMAN MIND",
        "style": "karaoke"
      },
      {
        "startSec": 6,
        "endSec": 12,
        "text": "Memory. Attention. Emotion.",
        "style": "karaoke"
      },
      {
        "startSec": 12,
        "endSec": 19,
        "text": "Attention shapes what we remember.",
        "style": "karaoke"
      },
      {
        "startSec": 19,
        "endSec": 26,
        "text": "What shapes your decisions?",
        "style": "karaoke"
      },
      {
        "startSec": 26,
        "endSec": 30,
        "text": "THE HUMAN MIND",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "cover",
        "name": "Cover",
        "durationSec": 6,
        "layout": "poster-editorial",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "THE HUMAN MIND",
        "posterMeta": {
          "issue": "BOOK TRAILER",
          "location": "PSYCHOLOGY & COGNITION",
          "tagline": "IDEAS ABOUT HOW YOU THINK",
          "accentWord": "MIND"
        }
      },
      {
        "id": "chapters",
        "name": "Chapters",
        "durationSec": 6,
        "layout": "paper-cutout",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Memory. Attention. Emotion.",
        "paperChapters": [
          "Memory & attention",
          "Emotion & choice",
          "Habit & behaviour"
        ]
      },
      {
        "id": "diagram",
        "name": "Diagram",
        "durationSec": 7,
        "layout": "faceless-explainer",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Attention shapes what we remember.",
        "explainer": {
          "chapter": "MEMORY AND FOCUS",
          "visualType": "funnel",
          "visualLabels": [
            "Signals",
            "Attention",
            "Memory"
          ],
          "voiceoverWords": [
            "memory",
            "and",
            "focus"
          ]
        }
      },
      {
        "id": "quote",
        "name": "Quote",
        "durationSec": 7,
        "layout": "quote-spotlight",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "What shapes your decisions?",
        "quote": {
          "text": "Understand the questions behind daily choices.",
          "author": "The Human Mind",
          "role": "Book introduction"
        }
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 4,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "THE HUMAN MIND",
        "ctaText": "Read the first chapter"
      }
    ]
  },
  {
    "schemaVersion": "1.0",
    "id": "short-whiteboard-habits",
    "slug": "short-whiteboard-habits",
    "title": "Whiteboard Science — How Habits Form",
    "description": "Hand-drawn vector science lesson",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/short-whiteboard-habits/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "SCIENCE SKETCH",
      "primaryColor": "#24516C",
      "accentColor": "#F2B36F",
      "backgroundColor": "#FBF7ED",
      "surfaceColor": "#FFFDF7",
      "textColor": "#25232B",
      "mutedColor": "#555965",
      "fontFamily": "Bricolage Grotesque"
    },
    "audioTracks": [],
    "captions": [
      {
        "startSec": 0,
        "endSec": 4,
        "text": "How does a habit form?",
        "style": "karaoke"
      },
      {
        "startSec": 4,
        "endSec": 11,
        "text": "01 — Notice a cue",
        "style": "karaoke"
      },
      {
        "startSec": 11,
        "endSec": 18,
        "text": "02 — Repeat a response",
        "style": "karaoke"
      },
      {
        "startSec": 18,
        "endSec": 25,
        "text": "03 — Experience feedback",
        "style": "karaoke"
      },
      {
        "startSec": 25,
        "endSec": 30,
        "text": "Repeat small actions consistently.",
        "style": "karaoke"
      }
    ],
    "scenes": [
      {
        "id": "hook",
        "name": "Hook",
        "durationSec": 4,
        "layout": "hero-kinetic",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "How does a habit form?",
        "eyebrow": "WHITEBOARD SCIENCE"
      },
      {
        "id": "cue",
        "name": "Cue",
        "durationSec": 7,
        "layout": "whiteboard-science",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "01 — Notice a cue",
        "whiteboard": {
          "labels": [
            "CUE",
            "CONTEXT",
            "NOTICE"
          ],
          "strokes": [
            [
              [
                0.15,
                0.32
              ],
              [
                0.36,
                0.32
              ],
              [
                0.36,
                0.57
              ],
              [
                0.15,
                0.57
              ],
              [
                0.15,
                0.32
              ]
            ],
            [
              [
                0.36,
                0.45
              ],
              [
                0.7,
                0.45
              ]
            ],
            [
              [
                0.63,
                0.39
              ],
              [
                0.7,
                0.45
              ],
              [
                0.63,
                0.51
              ]
            ]
          ],
          "svgPaths": [
            {
              "d": "M 160 810 L 360 690 L 650 800",
              "length": 650
            }
          ]
        }
      },
      {
        "id": "routine",
        "name": "Routine",
        "durationSec": 7,
        "layout": "whiteboard-science",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "02 — Repeat a response",
        "whiteboard": {
          "labels": [
            "RESPONSE",
            "REPEAT",
            "ACTION"
          ],
          "strokes": [
            [
              [
                0.2,
                0.48
              ],
              [
                0.3,
                0.27
              ],
              [
                0.6,
                0.28
              ],
              [
                0.7,
                0.46
              ]
            ],
            [
              [
                0.7,
                0.46
              ],
              [
                0.62,
                0.42
              ],
              [
                0.67,
                0.36
              ]
            ],
            [
              [
                0.66,
                0.53
              ],
              [
                0.51,
                0.7
              ],
              [
                0.27,
                0.68
              ]
            ]
          ]
        }
      },
      {
        "id": "outcome",
        "name": "Outcome",
        "durationSec": 7,
        "layout": "whiteboard-science",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "03 — Experience feedback",
        "whiteboard": {
          "labels": [
            "OUTCOME",
            "FEEDBACK",
            "LEARNING"
          ],
          "strokes": [
            [
              [
                0.14,
                0.56
              ],
              [
                0.36,
                0.72
              ],
              [
                0.74,
                0.29
              ]
            ],
            [
              [
                0.74,
                0.29
              ],
              [
                0.65,
                0.32
              ]
            ],
            [
              [
                0.74,
                0.29
              ],
              [
                0.7,
                0.39
              ]
            ]
          ]
        }
      },
      {
        "id": "finale",
        "name": "Finale",
        "durationSec": 5,
        "layout": "outro-cta",
        "transition": "slide-up",
        "backdrop": "swiss-lines",
        "headline": "Repeat small actions consistently.",
        "ctaText": "Save the explainer"
      }
    ]
  }
];
