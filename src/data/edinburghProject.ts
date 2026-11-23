import {
  EditorialMapBuilding,
  EditorialMapPark,
  EditorialMapRelief,
  EditorialMapStop,
  EditorialMapStreet,
  GeoCoord,
  OpenMotionProject,
} from '../types/openmotion';

/**
 * Geographic bounding box of central Edinburgh (WGS84, OpenStreetMap)
 * spanning Edinburgh Castle, Old Town, New Town, Calton Hill & Holyrood Park.
 */
const EDINBURGH_BOUNDS = {
  minLat: 55.9438,
  maxLat: 55.9578,
  minLon: -3.2080,
  maxLon: -3.1645,
};

/**
 * Real OpenStreetMap pedestrian polyline of the Royal Mile (1.81 km)
 * Edinburgh Castle -> Esplanade -> Castlehill -> Lawnmarket ->
 * St Giles' Cathedral -> High Street -> Canongate -> Abbey Strand -> Palace of Holyroodhouse.
 */
const ROYAL_MILE_ROUTE: GeoCoord[] = [
  [55.9486, -3.1999], // 01 Edinburgh Castle (Crown Square / Gatehouse)
  [55.94865, -3.1986], // Castle Esplanade west
  [55.94872, -3.1973], // Castle Esplanade east
  [55.94885, -3.1958], // Castlehill (Tolbooth Kirk)
  [55.94902, -3.1943], // Castlehill / Johnston Terrace junction
  [55.94922, -3.1930], // Lawnmarket west
  [55.94938, -3.1918], // Lawnmarket / George IV Bridge
  [55.94950, -3.1909], // 02 St Giles' Cathedral (Parliament Square)
  [55.94968, -3.1895], // High Street / Mercat Cross
  [55.94990, -3.1881], // High Street / North & South Bridge
  [55.95025, -3.1862], // High Street / Tron & John Knox House
  [55.95062, -3.1844], // Netherbow / St Mary's Street
  [55.95110, -3.1823], // Canongate west
  [55.95158, -3.1802], // 03 Canongate (Canongate Tolbooth & Kirk)
  [55.95198, -3.1780], // Canongate east
  [55.95228, -3.1756], // Horse Wynd / Scottish Parliament
  [55.95256, -3.1737], // Abbey Strand
  [55.95270, -3.1723], // 04 Palace of Holyroodhouse
];

const ROYAL_MILE_STOPS: EditorialMapStop[] = [
  {
    number: '01',
    name: 'Edinburgh Castle',
    lat: 55.9486,
    lon: -3.1999,
    labelAlign: 'top',
    routeFrac: 0.0,
  },
  {
    number: '02',
    name: "St Giles' Cathedral",
    lat: 55.9495,
    lon: -3.1909,
    labelAlign: 'top',
    routeFrac: 0.325,
  },
  {
    number: '03',
    name: 'Canongate',
    lat: 55.95158,
    lon: -3.1802,
    labelAlign: 'top',
    routeFrac: 0.715,
  },
  {
    number: '04',
    name: 'Palace of Holyroodhouse',
    lat: 55.9527,
    lon: -3.1723,
    labelAlign: 'bottom',
    routeFrac: 1.0,
  },
];

const EDINBURGH_STREETS: EditorialMapStreet[] = [
  // Major arteries (OSM)
  {
    name: 'Princes Street',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9500, -3.2072],
      [55.9512, -3.2008],
      [55.9522, -3.1950],
      [55.9532, -3.1892],
    ],
  },
  {
    name: 'George Street',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9515, -3.2066],
      [55.9527, -3.2005],
      [55.9538, -3.1947],
      [55.9547, -3.1904],
    ],
  },
  {
    name: 'Queen Street',
    kind: 'major',
    showLabel: false,
    coords: [
      [55.9531, -3.2060],
      [55.9543, -3.1998],
      [55.9554, -3.1940],
      [55.9562, -3.1895],
    ],
  },
  {
    name: 'Regent Road',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9532, -3.1892],
      [55.9536, -3.1852],
      [55.9535, -3.1806],
      [55.9541, -3.1755],
      [55.9549, -3.1705],
    ],
  },
  {
    name: 'North Bridge',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9532, -3.1890],
      [55.9514, -3.1885],
      [55.9499, -3.1881],
      [55.9476, -3.1872],
      [55.9448, -3.1862],
    ],
  },
  {
    name: 'The Mound',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9520, -3.1960],
      [55.9508, -3.1957],
      [55.9499, -3.1951],
      [55.9492, -3.1930],
    ],
  },
  {
    name: 'George IV Bridge',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9494, -3.1922],
      [55.9478, -3.1920],
      [55.9462, -3.1917],
      [55.9445, -3.1915],
    ],
  },
  {
    name: 'Lothian Road',
    kind: 'major',
    showLabel: false,
    coords: [
      [55.9500, -3.2072],
      [55.9478, -3.2064],
      [55.9450, -3.2054],
    ],
  },
  {
    name: 'Leith Street',
    kind: 'major',
    showLabel: false,
    coords: [
      [55.9532, -3.1892],
      [55.9554, -3.1872],
      [55.9574, -3.1854],
    ],
  },
  {
    name: 'Holyrood Road',
    kind: 'major',
    showLabel: true,
    coords: [
      [55.9488, -3.1876],
      [55.9496, -3.1838],
      [55.9505, -3.1795],
      [55.9512, -3.1754],
      [55.9516, -3.1726],
    ],
  },
  {
    name: "Queen's Drive",
    kind: 'major',
    showLabel: false,
    coords: [
      [55.9527, -3.1723],
      [55.9514, -3.1712],
      [55.9492, -3.1716],
      [55.9466, -3.1724],
      [55.9442, -3.1732],
    ],
  },

  // Secondary Old Town streets (including the Royal Mile spine)
  {
    name: 'Castlehill',
    kind: 'secondary',
    showLabel: true,
    coords: [
      [55.9486, -3.1999],
      [55.94872, -3.1973],
      [55.94895, -3.1948],
    ],
  },
  {
    name: 'Lawnmarket',
    kind: 'secondary',
    showLabel: true,
    coords: [
      [55.94895, -3.1948],
      [55.94922, -3.1930],
      [55.94950, -3.1909],
    ],
  },
  {
    name: 'High Street',
    kind: 'secondary',
    showLabel: true,
    coords: [
      [55.94950, -3.1909],
      [55.94990, -3.1881],
      [55.95062, -3.1844],
    ],
  },
  {
    name: 'Canongate',
    kind: 'secondary',
    showLabel: true,
    coords: [
      [55.95062, -3.1844],
      [55.95158, -3.1802],
      [55.95228, -3.1756],
      [55.95270, -3.1723],
    ],
  },
  {
    name: 'Cowgate',
    kind: 'secondary',
    showLabel: true,
    coords: [
      [55.9475, -3.1945],
      [55.9479, -3.1916],
      [55.9484, -3.1884],
      [55.9491, -3.1852],
    ],
  },
  {
    name: 'Grassmarket',
    kind: 'secondary',
    showLabel: true,
    coords: [
      [55.9474, -3.1996],
      [55.9475, -3.1965],
      [55.9476, -3.1944],
    ],
  },
  {
    name: 'Chambers Street',
    kind: 'secondary',
    showLabel: false,
    coords: [
      [55.9469, -3.1918],
      [55.9473, -3.1892],
      [55.9476, -3.1872],
    ],
  },
  {
    name: 'Calton Road',
    kind: 'secondary',
    showLabel: false,
    coords: [
      [55.9522, -3.1884],
      [55.9526, -3.1846],
      [55.9531, -3.1802],
      [55.9534, -3.1762],
    ],
  },
  {
    name: 'Jeffrey Street',
    kind: 'secondary',
    showLabel: false,
    coords: [
      [55.9515, -3.1884],
      [55.9513, -3.1862],
      [55.9507, -3.1845],
    ],
  },
  {
    name: 'Abbeyhill',
    kind: 'secondary',
    showLabel: false,
    coords: [
      [55.9527, -3.1723],
      [55.9542, -3.1726],
      [55.9554, -3.1682],
    ],
  },

  // Historic lanes, bridges & closes
  {
    name: 'Victoria Street',
    kind: 'lane',
    showLabel: true,
    coords: [
      [55.9491, -3.1930],
      [55.9485, -3.1938],
      [55.9480, -3.1946],
      [55.9476, -3.1944],
    ],
  },
  {
    name: 'Cockburn Street',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9498, -3.1904],
      [55.9508, -3.1906],
      [55.9515, -3.1898],
    ],
  },
  {
    name: 'Johnston Terrace',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9475, -3.2008],
      [55.9479, -3.1984],
      [55.9483, -3.1960],
      [55.9490, -3.1943],
    ],
  },
  {
    name: 'Waverley Bridge',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9526, -3.1924],
      [55.9512, -3.1920],
      [55.9500, -3.1912],
    ],
  },
  {
    name: "St Mary's Street",
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9506, -3.1844],
      [55.9495, -3.1840],
      [55.9485, -3.1835],
    ],
  },
  {
    name: 'New Street',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9512, -3.1822],
      [55.9522, -3.1825],
      [55.9529, -3.1828],
    ],
  },
  {
    name: 'Horse Wynd',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9523, -3.1755],
      [55.9512, -3.1753],
    ],
  },
  {
    name: 'Hanover Street',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9518, -3.1964],
      [55.9535, -3.1968],
      [55.9554, -3.1972],
    ],
  },
  {
    name: 'Frederick Street',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9510, -3.2004],
      [55.9528, -3.2008],
      [55.9547, -3.2012],
    ],
  },
  {
    name: 'St Andrew Street',
    kind: 'lane',
    showLabel: false,
    coords: [
      [55.9530, -3.1912],
      [55.9548, -3.1916],
      [55.9562, -3.1919],
    ],
  },
];

const EDINBURGH_PARKS: EditorialMapPark[] = [
  {
    name: 'Princes Street Gardens',
    labelCoord: [55.9502, -3.1998],
    coords: [
      [55.9501, -3.2054],
      [55.9514, -3.1965],
      [55.9502, -3.1961],
      [55.9494, -3.1984],
      [55.9492, -3.2026],
      [55.9496, -3.2054],
    ],
  },
  {
    name: 'East Gardens',
    labelCoord: [55.9517, -3.1939],
    coords: [
      [55.9521, -3.1954],
      [55.9526, -3.1924],
      [55.9513, -3.1922],
      [55.9510, -3.1951],
    ],
  },
  {
    name: 'Calton Hill',
    labelCoord: [55.9552, -3.1822],
    coords: [
      [55.9540, -3.1854],
      [55.9562, -3.1846],
      [55.9567, -3.1806],
      [55.9555, -3.1782],
      [55.9539, -3.1795],
      [55.9537, -3.1835],
    ],
  },
  {
    name: 'Palace Gardens',
    labelCoord: [55.9539, -3.1704],
    coords: [
      [55.9530, -3.1726],
      [55.9549, -3.1722],
      [55.9547, -3.1676],
      [55.9526, -3.1680],
    ],
  },
  {
    name: 'Holyrood Park',
    labelCoord: [55.9474, -3.1678],
    coords: [
      [55.9520, -3.1712],
      [55.9522, -3.1645],
      [55.9438, -3.1645],
      [55.9438, -3.1736],
      [55.9486, -3.1726],
    ],
  },
  {
    name: 'Greyfriars',
    labelCoord: [55.9465, -3.1932],
    coords: [
      [55.9472, -3.1944],
      [55.9472, -3.1922],
      [55.9458, -3.1922],
      [55.9458, -3.1944],
    ],
  },
  {
    name: "Queen's Gardens",
    labelCoord: [55.9545, -3.1995],
    coords: [
      [55.9536, -3.2036],
      [55.9548, -3.1965],
      [55.9556, -3.1968],
      [55.9545, -3.2038],
    ],
  },
];

const EDINBURGH_BUILDINGS: EditorialMapBuilding[] = [
  // Landmark 01: Edinburgh Castle fortress atop Castle Rock
  {
    landmark: true,
    label: 'Edinburgh Castle',
    coords: [
      [55.9491, -3.2016],
      [55.9493, -3.1994],
      [55.9489, -3.1984],
      [55.9482, -3.1987],
      [55.9479, -3.2008],
      [55.9485, -3.2018],
    ],
  },
  // Landmark 02: St Giles' Cathedral (High Kirk of Edinburgh)
  {
    landmark: true,
    label: "St Giles' Cathedral",
    coords: [
      [55.94968, -3.19155],
      [55.94972, -3.19042],
      [55.94924, -3.19036],
      [55.94920, -3.19148],
    ],
  },
  // Landmark 03: Canongate Tolbooth & Canongate Kirk
  {
    landmark: true,
    label: 'Canongate Tolbooth',
    coords: [
      [55.95205, -3.18065],
      [55.95218, -3.17955],
      [55.95168, -3.17940],
      [55.95156, -3.18052],
    ],
  },
  // Landmark: Scottish Parliament Building
  {
    landmark: true,
    label: 'Scottish Parliament',
    coords: [
      [55.9521, -3.1753],
      [55.9522, -3.1734],
      [55.9513, -3.1733],
      [55.9512, -3.1752],
    ],
  },
  // Landmark 04: Palace of Holyroodhouse
  {
    landmark: true,
    label: 'Palace of Holyroodhouse',
    coords: [
      [55.95312, -3.17275],
      [55.95318, -3.17142],
      [55.95232, -3.17135],
      [55.95226, -3.17268],
    ],
  },
  // Landmark: National Gallery & RSA on The Mound
  {
    landmark: true,
    coords: [
      [55.9517, -3.1964],
      [55.9518, -3.1952],
      [55.9507, -3.1950],
      [55.9506, -3.1962],
    ],
  },
  // Landmark: Waverley Station train shed
  {
    landmark: true,
    coords: [
      [55.9524, -3.1916],
      [55.9528, -3.1892],
      [55.9515, -3.1889],
      [55.9511, -3.1914],
    ],
  },

  // Old Town historic tenement footprints along Castlehill, Lawnmarket, High St & Canongate
  {
    coords: [
      [55.9492, -3.1968],
      [55.9494, -3.1948],
      [55.94895, -3.1947],
      [55.9488, -3.1967],
    ],
  },
  {
    coords: [
      [55.9486, -3.1966],
      [55.9487, -3.1947],
      [55.9481, -3.1946],
      [55.9480, -3.1964],
    ],
  },
  {
    coords: [
      [55.9498, -3.1942],
      [55.9500, -3.1924],
      [55.9494, -3.1922],
      [55.9492, -3.1940],
    ],
  },
  {
    coords: [
      [55.9490, -3.1940],
      [55.9491, -3.1925],
      [55.9484, -3.1924],
      [55.9483, -3.1938],
    ],
  },
  {
    coords: [
      [55.9502, -3.1904],
      [55.9505, -3.1886],
      [55.9499, -3.1884],
      [55.9496, -3.1902],
    ],
  },
  {
    coords: [
      [55.9494, -3.1902],
      [55.9496, -3.1884],
      [55.9488, -3.1882],
      [55.9486, -3.1900],
    ],
  },
  {
    coords: [
      [55.9506, -3.1877],
      [55.9510, -3.1856],
      [55.9503, -3.1854],
      [55.9500, -3.1875],
    ],
  },
  {
    coords: [
      [55.9497, -3.1876],
      [55.9501, -3.1852],
      [55.9492, -3.1850],
      [55.9489, -3.1873],
    ],
  },
  {
    coords: [
      [55.9514, -3.1841],
      [55.9518, -3.1825],
      [55.9511, -3.1822],
      [55.9508, -3.1839],
    ],
  },
  {
    coords: [
      [55.9505, -3.1838],
      [55.9509, -3.1818],
      [55.9501, -3.1815],
      [55.9498, -3.1836],
    ],
  },
  {
    coords: [
      [55.9519, -3.1820],
      [55.9522, -3.1808],
      [55.9515, -3.1806],
      [55.9512, -3.1818],
    ],
  },
  {
    coords: [
      [55.9512, -3.1815],
      [55.9516, -3.1792],
      [55.9508, -3.1790],
      [55.9505, -3.1813],
    ],
  },
  {
    coords: [
      [55.9524, -3.1792],
      [55.9527, -3.1770],
      [55.9520, -3.1768],
      [55.9517, -3.1790],
    ],
  },
  {
    coords: [
      [55.9517, -3.1788],
      [55.9520, -3.1762],
      [55.9512, -3.1760],
      [55.9509, -3.1786],
    ],
  },
  // Georgian New Town grid blocks north of Princes Street
  {
    coords: [
      [55.9514, -3.2044],
      [55.9519, -3.2012],
      [55.9511, -3.2010],
      [55.9506, -3.2042],
    ],
  },
  {
    coords: [
      [55.9522, -3.2000],
      [55.9527, -3.1968],
      [55.9519, -3.1966],
      [55.9514, -3.1998],
    ],
  },
  {
    coords: [
      [55.9531, -3.1960],
      [55.9536, -3.1924],
      [55.9527, -3.1922],
      [55.9522, -3.1958],
    ],
  },
  {
    coords: [
      [55.9538, -3.2002],
      [55.9543, -3.1970],
      [55.9534, -3.1968],
      [55.9529, -3.2000],
    ],
  },
  {
    coords: [
      [55.9546, -3.1962],
      [55.9551, -3.1926],
      [55.9542, -3.1924],
      [55.9537, -3.1960],
    ],
  },
  // Southside / University quarter blocks
  {
    coords: [
      [55.9467, -3.1912],
      [55.9470, -3.1882],
      [55.9458, -3.1880],
      [55.9455, -3.1910],
    ],
  },
  {
    coords: [
      [55.9471, -3.1986],
      [55.9472, -3.1954],
      [55.9461, -3.1952],
      [55.9460, -3.1984],
    ],
  },
];

const EDINBURGH_RELIEFS: EditorialMapRelief[] = [
  {
    lat: 55.9486,
    lon: -3.2002,
    radiusDeg: 0.0029,
    elevationLabel: 'Castle Rock · 130 m',
  },
  {
    lat: 55.9553,
    lon: -3.1823,
    radiusDeg: 0.0031,
    elevationLabel: 'Calton Hill · 171 m',
  },
  {
    lat: 55.9464,
    lon: -3.1684,
    radiusDeg: 0.0046,
    elevationLabel: 'Salisbury Crags · 186 m',
  },
];

const SHARED_MAP_BASE = {
  cityLabel: 'Edinburgh · Old Town · Royal Mile',
  coordinatesLabel: '55.9486° N, 3.1999° W  →  55.9527° N, 3.1723° W',
  distanceLabel: '1.81 KM WALK',
  bounds: EDINBURGH_BOUNDS,
  routeCoords: ROYAL_MILE_ROUTE,
  routeColor: '#C41E2E',
  streets: EDINBURGH_STREETS,
  parks: EDINBURGH_PARKS,
  buildings: EDINBURGH_BUILDINGS,
  reliefs: EDINBURGH_RELIEFS,
  stops: ROYAL_MILE_STOPS,
};

/**
 * Edinburgh on Foot — The Royal Mile | A Cinematic Walking Journey
 * Exact 30.0 seconds (4 + 5 + 6 + 6 + 5 + 4), 1920x1080, 30 fps, full-bleed editorial documentary.
 */
export const EDINBURGH_ON_FOOT_PROJECT: OpenMotionProject = {
  schemaVersion: '1.0',
  id: 'edinburgh-on-foot-royal-mile',
  slug: 'edinburgh-on-foot-royal-mile',
  title: 'Edinburgh on Foot — The Royal Mile (30s Documentary)',
  description:
    'Cinematografische routevideo van exact 30 seconden over de echte OpenStreetMap-wandelroute van Edinburgh Castle via Castlehill, Lawnmarket, St Giles’ Cathedral en Canongate naar het Palace of Holyroodhouse — met redactionele cartografie, Wikimedia Commons fotografie en vloeiende camerabewegingen.',
  category: 'Travel & Route Maps',
  author: 'OpenMotion Paper Map Journey',
  source: 'template',
  templateReferenceUrl: 'https://open-design.ai/skills/openmotion-paper-map-journey/',
  createdAt: '2026-11-23',
  updatedAt: '2026-11-23',
  githubPath: 'projects/edinburgh-on-foot/project.json',
  commitSha: 'ed30r01',
  format: '16:9',
  width: 1920,
  height: 1080,
  fps: 30,
  brandKit: {
    brandName: 'Edinburgh on Foot',
    primaryColor: '#C41E2E',
    accentColor: '#335943',
    backgroundColor: '#F3ECE0',
    surfaceColor: '#FAF7F1',
    textColor: '#1C1917',
    mutedColor: '#57534E',
    fontFamily: 'Plus Jakarta Sans',
  },
  scenes: [
    {
      id: 'ed-01-opening',
      name: '00:00–00:04 · Opening',
      durationSec: 4.0,
      layout: 'editorial-cartography',
      transition: 'fade',
      backdrop: 'swiss-lines',
      fullBleed: true,
      headline: 'EDINBURGH ON FOOT',
      subheadline: 'The Royal Mile',
      editorialMap: {
        ...SHARED_MAP_BASE,
        routeDrawFrom: 0.0,
        routeDrawTo: 0.0,
        activeStopIndex: -1,
        cameraFrom: { lat: 55.9508, lon: -3.1875, zoom: 1.04, tilt: 0 },
        cameraTo: { lat: 55.9501, lon: -3.1912, zoom: 1.22, tilt: 0 },
        photoUrl: './assets/edinburgh/00-edinburgh-panorama.jpg',
        photoMode: 'opening-to-map',
        photoEndFrac: 0.97,
        photoCredit: {
          author: 'Giuseppe Milo',
          license: 'CC BY 3.0',
          sourceUrl:
            'https://commons.wikimedia.org/wiki/File:View_Of_Edinburgh_From_Calton_Hill_Scotland_United_Kingdom_(104800359).jpeg',
          fileName: 'View Of Edinburgh From Calton Hill Scotland United Kingdom (104800359).jpeg',
        },
        titleLayout: 'centered-opening',
        titleText: 'EDINBURGH ON FOOT',
        subtitleText: 'The Royal Mile',
      },
    },
    {
      id: 'ed-02-castle',
      name: '00:04–00:09 · Edinburgh Castle',
      durationSec: 5.0,
      layout: 'editorial-cartography',
      transition: 'fade',
      backdrop: 'swiss-lines',
      fullBleed: true,
      headline: '01 / EDINBURGH CASTLE',
      subheadline: 'Where the journey begins',
      editorialMap: {
        ...SHARED_MAP_BASE,
        routeDrawFrom: 0.0,
        routeDrawTo: 0.14,
        activeStopIndex: 0,
        cameraFrom: { lat: 55.9501, lon: -3.1912, zoom: 1.22, tilt: 0 },
        cameraTo: { lat: 55.9488, lon: -3.1980, zoom: 2.45, tilt: 0 },
        photoUrl: './assets/edinburgh/01-edinburgh-castle.jpg',
        photoMode: 'map-to-photo',
        photoStartFrac: 0.42,
        photoEndFrac: 0.95,
        photoCredit: {
          author: 'Saffron Blaze',
          license: 'CC BY-SA 3.0',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_Rock.jpg',
          fileName: 'Edinburgh_Castle_Rock.jpg',
        },
        titleLayout: 'lower-left-stop',
        titleText: '01 / EDINBURGH CASTLE',
        subtitleText: 'Where the journey begins',
      },
    },
    {
      id: 'ed-03-st-giles',
      name: "00:09–00:15 · St Giles' Cathedral",
      durationSec: 6.0,
      layout: 'editorial-cartography',
      transition: 'fade',
      backdrop: 'swiss-lines',
      fullBleed: true,
      headline: "02 / ST GILES’ CATHEDRAL",
      subheadline: 'The heart of the Old Town',
      editorialMap: {
        ...SHARED_MAP_BASE,
        routeDrawFrom: 0.14,
        routeDrawTo: 0.34,
        activeStopIndex: 1,
        cameraFrom: { lat: 55.9488, lon: -3.1980, zoom: 2.45, tilt: 0 },
        cameraTo: { lat: 55.9495, lon: -3.1909, zoom: 2.55, tilt: 0 },
        photoUrl: './assets/edinburgh/02-st-giles-cathedral.jpg',
        photoMode: 'map-to-photo',
        photoStartFrac: 0.46,
        photoEndFrac: 0.95,
        photoCredit: {
          author: 'Nilfanion',
          license: 'CC BY-SA 3.0',
          sourceUrl: "https://commons.wikimedia.org/wiki/File:St_Giles'_Cathedral,_Edinburgh.jpg",
          fileName: "St Giles' Cathedral, Edinburgh.jpg",
        },
        titleLayout: 'lower-left-stop',
        titleText: '02 / ST GILES’ CATHEDRAL',
        subtitleText: 'The heart of the Old Town',
      },
    },
    {
      id: 'ed-04-canongate',
      name: '00:15–00:21 · Canongate',
      durationSec: 6.0,
      layout: 'editorial-cartography',
      transition: 'fade',
      backdrop: 'swiss-lines',
      fullBleed: true,
      headline: '03 / CANONGATE',
      subheadline: 'Centuries of Edinburgh history',
      editorialMap: {
        ...SHARED_MAP_BASE,
        routeDrawFrom: 0.34,
        routeDrawTo: 0.74,
        activeStopIndex: 2,
        cameraFrom: { lat: 55.9495, lon: -3.1909, zoom: 2.55, tilt: 0 },
        cameraTo: { lat: 55.9515, lon: -3.1806, zoom: 2.82, tilt: 0.28 },
        photoUrl: './assets/edinburgh/03-canongate-royal-mile.jpg',
        photoMode: 'map-to-photo',
        photoStartFrac: 0.48,
        photoEndFrac: 0.95,
        photoCredit: {
          author: 'Kilnburn',
          license: 'Attribution (Wikimedia Commons)',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Canongate_Tolbooth,_Edinburgh.jpg',
          fileName: 'Canongate Tolbooth, Edinburgh.jpg',
        },
        titleLayout: 'lower-left-stop',
        titleText: '03 / CANONGATE',
        subtitleText: 'Centuries of Edinburgh history',
      },
    },
    {
      id: 'ed-05-holyroodhouse',
      name: '00:21–00:26 · Palace of Holyroodhouse',
      durationSec: 5.0,
      layout: 'editorial-cartography',
      transition: 'fade',
      backdrop: 'swiss-lines',
      fullBleed: true,
      headline: '04 / PALACE OF HOLYROODHOUSE',
      subheadline: 'From castle to palace',
      editorialMap: {
        ...SHARED_MAP_BASE,
        routeDrawFrom: 0.74,
        routeDrawTo: 1.0,
        activeStopIndex: 3,
        cameraFrom: { lat: 55.9515, lon: -3.1806, zoom: 2.82, tilt: 0.28 },
        cameraTo: { lat: 55.9527, lon: -3.1726, zoom: 2.42, tilt: 0.04 },
        photoUrl: './assets/edinburgh/04-palace-of-holyroodhouse.jpg',
        photoMode: 'map-to-photo',
        photoStartFrac: 0.42,
        photoEndFrac: 0.95,
        photoCredit: {
          author: 'Saffron Blaze',
          license: 'CC BY-SA 3.0',
          sourceUrl:
            'https://commons.wikimedia.org/wiki/File:Edinburgh_Palace_of_Holyrood_House.jpg',
          fileName: 'Edinburgh Palace of Holyrood House.jpg',
        },
        titleLayout: 'lower-left-stop',
        titleText: '04 / PALACE OF HOLYROODHOUSE',
        subtitleText: 'From castle to palace',
      },
    },
    {
      id: 'ed-06-finale',
      name: '00:26–00:30 · Finale',
      durationSec: 4.0,
      layout: 'editorial-cartography',
      transition: 'fade',
      backdrop: 'swiss-lines',
      fullBleed: true,
      headline: 'EDINBURGH ON FOOT',
      subheadline: 'Explore the city, one walk at a time.',
      editorialMap: {
        ...SHARED_MAP_BASE,
        routeDrawFrom: 1.0,
        routeDrawTo: 1.0,
        routeHighlightPulse: true,
        activeStopIndex: -1,
        cameraFrom: { lat: 55.9527, lon: -3.1726, zoom: 2.42, tilt: 0.04 },
        cameraTo: { lat: 55.9500, lon: -3.1862, zoom: 1.04, tilt: 0 },
        photoMode: 'none',
        titleLayout: 'centered-finale',
        titleText: 'EDINBURGH ON FOOT',
        subtitleText: 'Explore the city, one walk at a time.',
      },
    },
  ],
};
