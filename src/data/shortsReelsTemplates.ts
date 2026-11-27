import { OpenMotionProject } from '../types/openmotion';

/** Ten data-driven vertical videos; matching project JSON is included in projects/. */
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
    "title": "Premium Travel Route Reel — Scotland / The Open Road",
    "description": "R6 editorial director's cut: direct cuts, genuine shaded relief, independent opening image, two portrait castle photographs, legible destination labels and original score.",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-27",
    "githubPath": "projects/short-scotland-road-trip/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 60,
    "brandKit": {
      "brandName": "SCOTLAND / THE OPEN ROAD",
      "primaryColor": "#AE674A",
      "accentColor": "#E2C48F",
      "backgroundColor": "#E7E8DE",
      "surfaceColor": "#173D37",
      "textColor": "#F8F7EF",
      "mutedColor": "#AFC9BE",
      "fontFamily": "Georgia"
    },
    "audioTracks": [],
    "captions": [],
    "scenes": [
      {
        "id": "opening",
        "name": "01 / Highlands cold open",
        "durationSec": 3,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "SCOTLAND'S ULTIMATE\nROAD TRIP",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
          "focusStopIndex": 1,
          "mapCenter": [
            -4.4,
            56.55
          ],
          "mapZoom": 7.1,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true,
          "openingPhoto": {
            "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/A82_heading_to_the_Pass_of_Glencoe_-_geograph.org.uk_-_7710150.jpg/1280px-A82_heading_to_the_Pass_of_Glencoe_-_geograph.org.uk_-_7710150.jpg",
            "photoAuthor": "Steven Brown",
            "photoLicense": "CC BY-SA 2.0",
            "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:A82_heading_to_the_Pass_of_Glencoe_-_geograph.org.uk_-_7710150.jpg",
            "label": "A82 · Pass of Glencoe",
            "photoFocus": [
              0.5,
              0.55
            ],
            "photoFit": "cover"
          }
        }
      },
      {
        "id": "route-intro",
        "name": "02 / Route introduction",
        "durationSec": 2,
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
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
            -4.82,
            56.96
          ],
          "mapZoom": 6.85,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": true,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "photo-edinburgh",
        "name": "03 / Edinburgh",
        "durationSec": 2.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Edinburgh",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
          "chapter": "photo",
          "focusStopIndex": 0,
          "mapCenter": [
            -4.4,
            56.55
          ],
          "mapZoom": 7.1,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "drive-glencoe",
        "name": "04 / Into the Highlands",
        "durationSec": 2.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Glen Coe",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
            -4.22,
            56.48
          ],
          "mapZoom": 7.15,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "photo-glencoe",
        "name": "05 / Glen Coe",
        "durationSec": 3.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Glen Coe",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
          "chapter": "photo",
          "focusStopIndex": 1,
          "mapCenter": [
            -4.22,
            56.48
          ],
          "mapZoom": 7.15,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "drive-eilean",
        "name": "06 / To Eilean Donan",
        "durationSec": 2.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Eilean Donan",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
            -5.14,
            57.03
          ],
          "mapZoom": 7.7,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "photo-eilean",
        "name": "07 / Eilean Donan",
        "durationSec": 3.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Eilean Donan",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
          "chapter": "photo",
          "focusStopIndex": 2,
          "mapCenter": [
            -5.14,
            57.03
          ],
          "mapZoom": 7.7,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "drive-portree",
        "name": "08 / Crossing to Skye",
        "durationSec": 2.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Isle of Skye",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
            -5.82,
            57.3
          ],
          "mapZoom": 8,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "photo-portree",
        "name": "09 / Isle of Skye",
        "durationSec": 4.5,
        "layout": "premium-travel-route",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "Isle of Skye",
        "fullBleed": true,
        "premiumTravel": {
          "stops": [
            {
              "name": "Edinburgh",
              "lat": 55.9486,
              "lon": -3.1999,
              "note": "Begin beneath Edinburgh Castle, where the Old Town rises above the city.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
          "chapter": "photo",
          "focusStopIndex": 3,
          "mapCenter": [
            -5.82,
            57.3
          ],
          "mapZoom": 8,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "editorialRevision": 6,
          "relief": true
        }
      },
      {
        "id": "finale",
        "name": "10 / Save this road trip",
        "durationSec": 3.5,
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
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Edinburgh_Castle_from_Princes_Street_%282026%29.jpg/1280px-Edinburgh_Castle_from_Princes_Street_%282026%29.jpg",
              "photoAuthor": "LibKat17",
              "photoLicense": "CC BY 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Princes_Street_(2026).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Edinburgh_old_town.jpg/1280px-Edinburgh_old_town.jpg",
                "photoAuthor": "Kidozh",
                "photoLicense": "CC BY-SA 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_old_town.jpg",
                "label": "Old Town",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Glen Coe",
              "lat": 56.681,
              "lon": -5.004,
              "note": "Drive past dramatic mountain walls and a glacial Highland valley.",
              "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Glencoe%2C_Scotland.jpg/1280px-Glencoe%2C_Scotland.jpg",
              "photoAuthor": "Saadtowheed",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Glencoe,_Scotland.jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg/1280px-The_Three_Sisters%2C_Glencoe%2C_Scotland.jpg",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:The_Three_Sisters,_Glencoe,_Scotland.jpg",
                "photoAuthor": "rboed",
                "photoLicense": "CC BY 2.0",
                "label": "Three Sisters of Glen Coe",
                "photoFocus": [
                  0.47,
                  0.48
                ],
                "photoFit": "cover"
              }
            },
            {
              "name": "Eilean Donan",
              "lat": 57.2743,
              "lon": -5.5168,
              "note": "A celebrated island castle stands where three sea lochs meet.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20210818_Eilean_Donan_Castle_causeway-9470.jpg/1365px-20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoAuthor": "Balon Greyjoy",
              "photoLicense": "CC BY-SA 3.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:20210818_Eilean_Donan_Castle_causeway-9470.jpg",
              "photoFocus": [
                0.49,
                0.42
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c8/2012_Eilean_Donan_Castle.JPG",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2012_Eilean_Donan_Castle.JPG",
                "photoAuthor": "Dakotsmom229",
                "photoLicense": "CC BY-SA 3.0",
                "label": "Stone walls above the loch",
                "photoFocus": [
                  0.44,
                  0.42
                ],
                "photoFit": "cover"
              },
              "label": "Across the causeway"
            },
            {
              "name": "Portree",
              "lat": 57.4129,
              "lon": -6.1945,
              "note": "Finish in Skye's colourful harbour town, surrounded by island scenery.",
              "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/2018_07_15_Schottland_%2884%29.jpg/1280px-2018_07_15_Schottland_%2884%29.jpg",
              "photoAuthor": "Bewahrerderwerte",
              "photoLicense": "CC BY-SA 4.0",
              "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:2018_07_15_Schottland_(84).jpg",
              "photoFocus": [
                0.5,
                0.5
              ],
              "photoFit": "cover",
              "secondaryPhoto": {
                "photoUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg/1280px-Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "photoAuthor": "Squirrel1113",
                "photoLicense": "CC BY 4.0",
                "photoSourceUrl": "https://commons.wikimedia.org/wiki/File:Quiraing%2C_Isle_of_Skye%2C_Scotland.jpg",
                "label": "The Quiraing · Isle of Skye",
                "photoFocus": [
                  0.5,
                  0.5
                ],
                "photoFit": "cover"
              }
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
            -4.82,
            56.96
          ],
          "mapZoom": 6.85,
          "routeProgressFrom": 0,
          "routeProgressTo": 1,
          "roadMatched": false,
          "markerStyle": "dot",
          "editorial": true,
          "seriesTitle": "THE OPEN ROAD COLLECTION · 001",
          "regionTitle": "SCOTLAND",
          "mapIntro": false,
          "cta": "SAVE THIS ROAD TRIP",
          "editorialRevision": 6,
          "relief": true
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
  },
  {
    "schemaVersion": "1.0",
    "id": "short-adhd-sleep-handdrawn-explainer",
    "slug": "adhd-sleep-handdrawn-explainer",
    "title": "ADHD & Slaap — Handgetekende Doodle Explainer",
    "description": "Bewerkbare 62-seconden verticale reconstructie van de stijl en verhaallijn uit een door de gebruiker aangeleverde Nederlandstalige TikTok. 26 getekende scènes: slapen, douche, ochtendstress, brein, executieve functies en tijdsblindheid. Alleen nieuwe Canvas-tekeningen, geen frames of muziek uit de bronvideo.",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "templateReferenceUrl": "https://vm.tiktok.com/ZGdXKhodS/",
    "createdAt": "2026-11-24",
    "updatedAt": "2026-11-24",
    "githubPath": "projects/adhd-sleep-handdrawn-explainer/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "SLAAP & ADHD — DOODLE EXPLAINER",
      "primaryColor": "#829D58",
      "accentColor": "#D65C55",
      "backgroundColor": "#F1E9DE",
      "surfaceColor": "#DDEBF2",
      "textColor": "#29282C",
      "mutedColor": "#8E8A8C",
      "fontFamily": "Bricolage Grotesque"
    },
    "scenes": [
      {
        "id": "01-intro-laat-wakker",
        "name": "Intro: laat wakker",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Waarom blijven mensen met ADHD",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "night",
          "mood": "surprised",
          "emphasis": [
            "ADHD"
          ],
          "extras": [
            "phone"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Waarom blijven mensen met ADHD",
          "pose": "alert"
        }
      },
      {
        "id": "02-tot-drie-uur",
        "name": "Tot drie uur",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "tot 3 uur 's nachts op?",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "night",
          "mood": "surprised",
          "emphasis": [
            "3 uur"
          ],
          "extras": [
            "phone"
          ],
          "clockText": "3:00",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "tot 3 uur 's nachts op?",
          "pose": "alert"
        }
      },
      {
        "id": "03-uit-bed-komen",
        "name": "Uit bed komen",
        "durationSec": 1,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "En komen ze moeilijk uit bed?",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "morning",
          "mood": "sleepy",
          "emphasis": [
            "moeilijk"
          ],
          "extras": [],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "En komen ze moeilijk uit bed?",
          "pose": "exhausted"
        }
      },
      {
        "id": "04-douche-vijf-minuten",
        "name": "Douche: vijf minuten",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "En maken ze van een douche",
        "fullBleed": true,
        "doodle": {
          "setting": "shower",
          "palette": "shower",
          "mood": "relaxed",
          "emphasis": [
            "douche"
          ],
          "extras": [],
          "clockText": "5 min",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "En maken ze van een douche",
          "pose": "neutral"
        }
      },
      {
        "id": "05-douche-tijd-verdwijnt",
        "name": "Douche: tijd verdwijnt",
        "durationSec": 1,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "op de een of andere manier 20 minuten?",
        "fullBleed": true,
        "doodle": {
          "setting": "shower",
          "palette": "shower",
          "mood": "surprised",
          "emphasis": [
            "20 minuten"
          ],
          "extras": [],
          "clockText": "20 min",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "op de een of andere manier 20 minuten?",
          "pose": "alert"
        }
      },
      {
        "id": "06-het-brein-zoekt-een-reden",
        "name": "Het brein zoekt een reden",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Daar zit een fascinerende reden achter.",
        "fullBleed": true,
        "doodle": {
          "setting": "brain",
          "palette": "cream",
          "mood": "happy",
          "emphasis": [
            "fascinerende"
          ],
          "extras": [
            "search"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Daar zit een fascinerende reden achter.",
          "pose": "neutral"
        }
      },
      {
        "id": "07-druk-van-overdag",
        "name": "Druk van overdag",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Voor veel mensen met ADHD",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "cream",
          "mood": "worried",
          "emphasis": [
            "ADHD"
          ],
          "extras": [
            "bell",
            "tasks",
            "alarm"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Voor veel mensen met ADHD",
          "pose": "neutral"
        }
      },
      {
        "id": "08-de-nacht",
        "name": "De nacht",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "is de nacht het moment",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "night",
          "mood": "relaxed",
          "emphasis": [
            "nacht"
          ],
          "extras": [
            "bell",
            "tasks"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "is de nacht het moment",
          "pose": "neutral"
        }
      },
      {
        "id": "09-wereld-eindelijk-stil",
        "name": "Wereld eindelijk stil",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "waarop de wereld eindelijk stil is.",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "night",
          "mood": "relaxed",
          "emphasis": [
            "stil"
          ],
          "extras": [
            "bell",
            "tasks"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "waarop de wereld eindelijk stil is.",
          "pose": "neutral"
        }
      },
      {
        "id": "10-geen-onderbrekingen",
        "name": "Geen onderbrekingen",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Geen onderbrekingen. Geen verwachtingen. Geen eisen.",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "night",
          "mood": "relaxed",
          "emphasis": [
            "onderbrekingen",
            "verwachtingen",
            "eisen"
          ],
          "extras": [],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Geen onderbrekingen. Geen verwachtingen. Geen eisen.",
          "pose": "neutral"
        }
      },
      {
        "id": "11-brein-voelt-zich-vrij",
        "name": "Brein voelt zich vrij",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Hun brein voelt zich eindelijk vrij.",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "night",
          "mood": "happy",
          "emphasis": [
            "vrij"
          ],
          "extras": [
            "free"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Hun brein voelt zich eindelijk vrij.",
          "pose": "relieved"
        }
      },
      {
        "id": "12-bedtijd-uitstellen",
        "name": "Bedtijd uitstellen",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Dus stellen ze het slapen uit, zelfs als ze moe zijn.",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "night",
          "mood": "surprised",
          "emphasis": [
            "slapen"
          ],
          "extras": [
            "free",
            "clock"
          ],
          "clockText": "3:00",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Dus stellen ze het slapen uit, zelfs als ze moe zijn.",
          "pose": "relieved"
        }
      },
      {
        "id": "13-de-ochtend-breekt-aan",
        "name": "De ochtend breekt aan",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Dan breekt de ochtend aan.",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "morning",
          "mood": "sleepy",
          "emphasis": [
            "ochtend"
          ],
          "extras": [],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Dan breekt de ochtend aan.",
          "pose": "exhausted"
        }
      },
      {
        "id": "14-meerdere-keren-snoozen",
        "name": "Meerdere keren snoozen",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Ze snoozen meerdere wekkers.",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "morning",
          "mood": "sleepy",
          "emphasis": [
            "snoozen"
          ],
          "extras": [
            "alarms"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Ze snoozen meerdere wekkers.",
          "pose": "exhausted"
        }
      },
      {
        "id": "15-overweldigd-wakker",
        "name": "Overweldigd wakker",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "En worden overweldigd wakker.",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "morning",
          "mood": "overwhelmed",
          "emphasis": [
            "overweldigd"
          ],
          "extras": [
            "alarms"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "En worden overweldigd wakker.",
          "pose": "alert"
        }
      },
      {
        "id": "16-taken-op-je-schouders",
        "name": "Taken op je schouders",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "En voelen het gewicht van alles wat moet.",
        "fullBleed": true,
        "doodle": {
          "setting": "bed",
          "palette": "morning",
          "mood": "worried",
          "emphasis": [
            "gewicht"
          ],
          "extras": [
            "tasks"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "En voelen het gewicht van alles wat moet.",
          "pose": "neutral"
        }
      },
      {
        "id": "17-aha-moment",
        "name": "Aha-moment",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Maar nu komt het...",
        "fullBleed": true,
        "doodle": {
          "setting": "brain",
          "palette": "cream",
          "mood": "happy",
          "emphasis": [
            "nu"
          ],
          "extras": [
            "lightbulb"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Maar nu komt het...",
          "pose": "neutral"
        }
      },
      {
        "id": "18-executieve-functies",
        "name": "Executieve functies",
        "durationSec": 4,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "ADHD heeft invloed op aandacht, executieve functies en tijdsbeleving.",
        "fullBleed": true,
        "doodle": {
          "setting": "checklist",
          "palette": "cream",
          "mood": "happy",
          "emphasis": [
            "aandacht",
            "executieve functies",
            "tijdsbeleving"
          ],
          "extras": [
            "aandacht",
            "executieve functies",
            "tijdsbeleving"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "ADHD heeft invloed op aandacht, executieve functies en tijdsbeleving.",
          "pose": "neutral"
        }
      },
      {
        "id": "19-vijf-minuten-douchen",
        "name": "Vijf minuten douchen",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Zelfs vijf minuten douchen",
        "fullBleed": true,
        "doodle": {
          "setting": "shower",
          "palette": "shower",
          "mood": "relaxed",
          "emphasis": [
            "vijf minuten"
          ],
          "extras": [],
          "clockText": "5 min",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Zelfs vijf minuten douchen",
          "pose": "neutral"
        }
      },
      {
        "id": "20-een-afleidingsval",
        "name": "Een afleidingsval",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "kan een afleidingsval worden.",
        "fullBleed": true,
        "doodle": {
          "setting": "shower",
          "palette": "shower",
          "mood": "happy",
          "emphasis": [
            "afleidingsval"
          ],
          "extras": [
            "music"
          ],
          "clockText": "2:07",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "kan een afleidingsval worden.",
          "pose": "neutral"
        }
      },
      {
        "id": "21-een-willekeurige-gedachte",
        "name": "Een willekeurige gedachte",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Een liedje of één willekeurige gedachte...",
        "fullBleed": true,
        "doodle": {
          "setting": "shower",
          "palette": "shower",
          "mood": "surprised",
          "emphasis": [
            "liedje",
            "gedachte"
          ],
          "extras": [
            "thought"
          ],
          "clockText": "3:02",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Een liedje of één willekeurige gedachte...",
          "pose": "alert"
        }
      },
      {
        "id": "22-twintig-minuten-kwijt",
        "name": "Twintig minuten kwijt",
        "durationSec": 4,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "En opeens zijn 20 minuten verdwenen.",
        "fullBleed": true,
        "doodle": {
          "setting": "shower",
          "palette": "shower",
          "mood": "surprised",
          "emphasis": [
            "20 minuten"
          ],
          "extras": [
            "thought"
          ],
          "clockText": "19:58",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "En opeens zijn 20 minuten verdwenen.",
          "pose": "alert"
        }
      },
      {
        "id": "23-tijdsblindheid",
        "name": "Tijdsblindheid",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Deze moeite met tijd wordt vaak tijdsblindheid genoemd.",
        "fullBleed": true,
        "doodle": {
          "setting": "clock",
          "palette": "gray",
          "mood": "worried",
          "emphasis": [
            "tijdsblindheid"
          ],
          "extras": [
            "label"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Deze moeite met tijd wordt vaak tijdsblindheid genoemd.",
          "pose": "neutral"
        }
      },
      {
        "id": "24-ochtendroutine",
        "name": "Ochtendroutine",
        "durationSec": 2,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "Daarom kan 's ochtends klaarmaken",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "cream",
          "mood": "worried",
          "emphasis": [
            "klaarmaken"
          ],
          "extras": [
            "essentials"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "Daarom kan 's ochtends klaarmaken",
          "pose": "neutral"
        }
      },
      {
        "id": "25-mentale-marathon",
        "name": "Mentale marathon",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "aanvoelen als een mentale marathon,",
        "fullBleed": true,
        "doodle": {
          "setting": "standing",
          "palette": "cream",
          "mood": "worried",
          "emphasis": [
            "mentale marathon"
          ],
          "extras": [
            "essentials",
            "start"
          ],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "aanvoelen als een mentale marathon,",
          "pose": "point"
        }
      },
      {
        "id": "26-voordat-de-dag-begint",
        "name": "Voordat de dag begint",
        "durationSec": 3,
        "layout": "doodle-explainer",
        "transition": "fade",
        "backdrop": "dot-matrix",
        "headline": "nog voordat de dag begonnen is.",
        "fullBleed": true,
        "doodle": {
          "setting": "outro",
          "palette": "morning",
          "mood": "happy",
          "emphasis": [
            "begonnen"
          ],
          "extras": [],
          "clockText": "",
          "shirtColor": "#829D58",
          "highlightColor": "#D65C55",
          "narration": "nog voordat de dag begonnen is.",
          "pose": "neutral"
        }
      }
    ],
    "captions": [],
    "audioTracks": []
  },
  {
    "schemaVersion": "1.0",
    "id": "bucket-list-001-sao-miguel",
    "slug": "bucket-list-001-sao-miguel",
    "title": "MY BUCKET LIST #001 · São Miguel, Azores",
    "description": "Bucket List 3.0 · 20 seconds, photographic cover, native globe flight, geographic photo reveal, safe-area typography, coastal finale and cover loop, original synchronized score.",
    "category": "Shorts & Reels",
    "author": "OpenMotion Studio",
    "source": "template",
    "createdAt": "2026-11-25",
    "updatedAt": "2026-11-27",
    "githubPath": "projects/bucket-list-001-sao-miguel/project.json",
    "format": "9:16",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "brandKit": {
      "brandName": "MY BUCKET LIST",
      "primaryColor": "#101B2B",
      "accentColor": "#D9B77A",
      "backgroundColor": "#101B2B",
      "surfaceColor": "#17283C",
      "textColor": "#F5F1E8",
      "mutedColor": "#B8C1C8",
      "fontFamily": "Bricolage Grotesque"
    },
    "scenes": [
      {
        "id": "destination-cover",
        "name": "01 / Destination cover",
        "durationSec": 1.5,
        "layout": "bucket-list-zoom",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "SÃO MIGUEL",
        "fullBleed": true,
        "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Miradouro_da_Boca_do_Inferno%2C_Lagoa_das_Sete_Cidades%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG/1280px-Miradouro_da_Boca_do_Inferno%2C_Lagoa_das_Sete_Cidades%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG",
        "bucketList": {
          "episode": 1,
          "destination": "São Miguel",
          "region": "Azores",
          "country": "Portugal",
          "latitude": 37.8533,
          "longitude": -25.7791,
          "startLongitude": -11,
          "startLatitude": 43,
          "chapter": "reason",
          "imageAuthor": "José Luís Ávila Silveira / Pedro Noronha e Costa",
          "imageLicense": "Public domain",
          "imageSourceUrl": "https://commons.wikimedia.org/wiki/File:Miradouro_da_Boca_do_Inferno,_Lagoa_das_Sete_Cidades,_ilha_de_São_Miguel,_Açores.JPG",
          "cover": true,
          "directorsCut": true
        }
      },
      {
        "id": "zoom",
        "name": "02 / Globe to Sete Cidades",
        "durationSec": 3.5,
        "layout": "bucket-list-zoom",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "BUCKET LIST #001 · AZORES",
        "fullBleed": true,
        "bucketList": {
          "episode": 1,
          "destination": "São Miguel",
          "region": "Azores",
          "country": "Portugal",
          "latitude": 37.8533,
          "longitude": -25.7791,
          "startLongitude": -11,
          "startLatitude": 43,
          "chapter": "zoom",
          "directorsCut": true
        }
      },
      {
        "id": "reason-crater",
        "name": "03 / Volcanic lakes",
        "durationSec": 4,
        "layout": "bucket-list-zoom",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "TWO LAKES. ONE VOLCANIC CRATER.",
        "fullBleed": true,
        "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Lagoa_das_Sete_Cidades%2C_S%C3%A3o_Miguel.jpg/1280px-Lagoa_das_Sete_Cidades%2C_S%C3%A3o_Miguel.jpg",
        "bucketList": {
          "episode": 1,
          "destination": "São Miguel",
          "region": "Azores",
          "country": "Portugal",
          "latitude": 37.8533,
          "longitude": -25.7791,
          "startLongitude": -11,
          "startLatitude": 43,
          "chapter": "reason",
          "reasonNumber": 1,
          "reasonTitle": "TWO LAKES. ONE VOLCANIC CRATER.",
          "reasonCopy": "SETE CIDADES · VOLCANIC CALDERA",
          "imageAuthor": "Samuel Monteiro Domingues",
          "imageLicense": "CC BY-SA 4.0",
          "imageSourceUrl": "https://commons.wikimedia.org/wiki/File:Lagoa_das_Sete_Cidades,_São_Miguel.jpg",
          "directorsCut": true
        }
      },
      {
        "id": "reason-forest",
        "name": "04 / Into the forest",
        "durationSec": 3.5,
        "layout": "bucket-list-zoom",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "FOREST TRAILS TO HIDDEN LAKES.",
        "fullBleed": true,
        "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Acesso_%C3%A0_Lagoa_Do_Congro_S%C3%A3o_Miguel.jpg/960px-Acesso_%C3%A0_Lagoa_Do_Congro_S%C3%A3o_Miguel.jpg",
        "bucketList": {
          "episode": 1,
          "destination": "São Miguel",
          "region": "Azores",
          "country": "Portugal",
          "latitude": 37.8533,
          "longitude": -25.7791,
          "startLongitude": -11,
          "startLatitude": 43,
          "chapter": "reason",
          "reasonNumber": 2,
          "reasonTitle": "FOREST TRAILS TO HIDDEN LAKES.",
          "reasonCopy": "LAGOA DO CONGRO · SÃO MIGUEL",
          "imageAuthor": "Órvil Fernando de Aragão Russo",
          "imageLicense": "CC BY-SA 4.0",
          "imageSourceUrl": "https://commons.wikimedia.org/wiki/File:Acesso_%C3%A0_Lagoa_Do_Congro_S%C3%A3o_Miguel.jpg",
          "imageFocusX": 0.55,
          "directorsCut": true
        }
      },
      {
        "id": "reason-viewpoint",
        "name": "05 / Above the island",
        "durationSec": 4,
        "layout": "bucket-list-zoom",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "SEE SETE CIDADES FROM ABOVE.",
        "fullBleed": true,
        "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Miradouro_da_Boca_do_Inferno%2C_Lagoa_das_Sete_Cidades%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG/1280px-Miradouro_da_Boca_do_Inferno%2C_Lagoa_das_Sete_Cidades%2C_ilha_de_S%C3%A3o_Miguel%2C_A%C3%A7ores.JPG",
        "bucketList": {
          "episode": 1,
          "destination": "São Miguel",
          "region": "Azores",
          "country": "Portugal",
          "latitude": 37.8533,
          "longitude": -25.7791,
          "startLongitude": -11,
          "startLatitude": 43,
          "chapter": "reason",
          "reasonNumber": 3,
          "reasonTitle": "SEE SETE CIDADES FROM ABOVE.",
          "reasonCopy": "BOCA DO INFERNO VIEWPOINT",
          "imageAuthor": "José Luís Ávila Silveira / Pedro Noronha e Costa",
          "imageLicense": "Public domain",
          "imageSourceUrl": "https://commons.wikimedia.org/wiki/File:Miradouro_da_Boca_do_Inferno,_Lagoa_das_Sete_Cidades,_ilha_de_São_Miguel,_Açores.JPG",
          "directorsCut": true
        }
      },
      {
        "id": "outro",
        "name": "06 / Coast to destination cover",
        "durationSec": 3.5,
        "layout": "bucket-list-zoom",
        "transition": "fade",
        "backdrop": "swiss-lines",
        "headline": "SÃO MIGUEL · SAVE THIS PLACE",
        "fullBleed": true,
        "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Aerial_view_of_Mosteiros%2C_S%C3%A3o_Miguel_Island%2C_Azores%2C_Portugal_%28PPL1-Corrected%29.jpg/1280px-Aerial_view_of_Mosteiros%2C_S%C3%A3o_Miguel_Island%2C_Azores%2C_Portugal_%28PPL1-Corrected%29.jpg",
        "bucketList": {
          "episode": 1,
          "destination": "São Miguel",
          "region": "Azores",
          "country": "Portugal",
          "latitude": 37.8533,
          "longitude": -25.7791,
          "startLongitude": -11,
          "startLatitude": 43,
          "chapter": "outro",
          "imageAuthor": "Jules Verne Times Two / julesvernex2.com",
          "imageLicense": "CC BY-SA 4.0",
          "imageSourceUrl": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Mosteiros,_S%C3%A3o_Miguel_Island,_Azores,_Portugal_(PPL1-Corrected).jpg",
          "imageFocusX": 0.36,
          "directorsCut": true
        }
      }
    ],
    "captions": [],
    "audioTracks": []
  }
];
