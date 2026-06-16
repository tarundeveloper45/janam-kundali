/**
 * Vedic Astrology Calculation Engine
 * Uses JPL Keplerian elements (1800-2050 AD) for accurate planet positions
 * Implements Lahiri Ayanamsa (Chitrapaksha) for sidereal calculations
 * Reference: JPL Solar System Dynamics / Meeus "Astronomical Algorithms" 2nd ed.
 */

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
];

export const NAKSHATRAS = [
  { name: 'Ashwini',            lord: 'Ketu',    deity: 'Ashwini Kumaras',   symbol: 'Horse Head'           },
  { name: 'Bharani',            lord: 'Venus',   deity: 'Yama',              symbol: 'Yoni'                 },
  { name: 'Krittika',           lord: 'Sun',     deity: 'Agni',              symbol: 'Blade / Flame'        },
  { name: 'Rohini',             lord: 'Moon',    deity: 'Brahma',            symbol: 'Chariot'              },
  { name: 'Mrigashira',         lord: 'Mars',    deity: 'Soma',              symbol: "Deer's Head"          },
  { name: 'Ardra',              lord: 'Rahu',    deity: 'Rudra',             symbol: 'Teardrop / Diamond'   },
  { name: 'Punarvasu',          lord: 'Jupiter', deity: 'Aditi',             symbol: 'Quiver of Arrows'     },
  { name: 'Pushya',             lord: 'Saturn',  deity: 'Brihaspati',        symbol: 'Flower / Circle'      },
  { name: 'Ashlesha',           lord: 'Mercury', deity: 'Sarpas',            symbol: 'Coiled Serpent'       },
  { name: 'Magha',              lord: 'Ketu',    deity: 'Pitrs',             symbol: 'Throne Room'          },
  { name: 'Purva Phalguni',     lord: 'Venus',   deity: 'Bhaga',             symbol: 'Swinging Hammock'     },
  { name: 'Uttara Phalguni',    lord: 'Sun',     deity: 'Aryaman',           symbol: 'Bed / Legs of Cot'   },
  { name: 'Hasta',              lord: 'Moon',    deity: 'Savitar',           symbol: 'Hand / Fist'          },
  { name: 'Chitra',             lord: 'Mars',    deity: 'Vishvakarma',       symbol: 'Bright Jewel'         },
  { name: 'Swati',              lord: 'Rahu',    deity: 'Vayu',              symbol: 'Sword / Coral'        },
  { name: 'Vishakha',           lord: 'Jupiter', deity: 'Indra and Agni',    symbol: 'Triumphal Arch'       },
  { name: 'Anuradha',           lord: 'Saturn',  deity: 'Mitra',             symbol: 'Lotus Flower'         },
  { name: 'Jyeshtha',           lord: 'Mercury', deity: 'Indra',             symbol: 'Circular Amulet'      },
  { name: 'Mula',               lord: 'Ketu',    deity: 'Nirriti',           symbol: "Lion's Tail / Roots"  },
  { name: 'Purva Ashadha',      lord: 'Venus',   deity: 'Apas',              symbol: 'Elephant Tusk'        },
  { name: 'Uttara Ashadha',     lord: 'Sun',     deity: 'Vishvedevas',       symbol: "Elephant's Tusk"      },
  { name: 'Shravana',           lord: 'Moon',    deity: 'Vishnu',            symbol: 'Three Footprints'     },
  { name: 'Dhanishtha',         lord: 'Mars',    deity: 'Eight Vasus',       symbol: 'Drum / Flute'         },
  { name: 'Shatabhisha',        lord: 'Rahu',    deity: 'Varuna',            symbol: 'Empty Circle'         },
  { name: 'Purva Bhadrapada',   lord: 'Jupiter', deity: 'Ajaikapada',        symbol: 'Sword / Two-faced Man'},
  { name: 'Uttara Bhadrapada',  lord: 'Saturn',  deity: 'Ahirbudhnya',       symbol: 'Twins / Snake in Water'},
  { name: 'Revati',             lord: 'Mercury', deity: 'Pushan',            symbol: 'Fish / Pair of Fish'  },
];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function rad(deg: number): number { return deg * Math.PI / 180; }
function deg(r: number): number   { return r * 180 / Math.PI; }

function normalize(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

// ─── Julian Day ────────────────────────────────────────────────────────────────

export function julianDay(
  year: number, month: number, day: number,
  hour = 0, minute = 0, second = 0
): number {
  const h = hour + minute / 60 + second / 3600;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + h / 24 + B - 1524.5;
}

function Tcy(jd: number): number { return (jd - 2451545.0) / 36525; }

// ─── Lahiri Ayanamsa ──────────────────────────────────────────────────────────
// Rate: 50.2564"/yr  = 1.39601°/century.  At J2000.0: 23.853°
export function lahiriAyanamsa(jd: number): number {
  const t = Tcy(jd);
  return 23.85 + 1.3971 * t;   // degrees, Chitrapaksha / Lahiri
}

// ─── Sun (high-accuracy Meeus Ch. 25) ─────────────────────────────────────────

export function sunLongitudeTropical(jd: number): number {
  const t = Tcy(jd);
  const L0 = normalize(280.46646  + 36000.76983 * t + 0.0003032 * t * t);
  const M  = normalize(357.52911  + 35999.05029 * t - 0.0001537 * t * t);
  const Mr = rad(M);
  const C  = (1.9146 - 0.004817*t - 0.000014*t*t) * Math.sin(Mr)
           + (0.019993 - 0.000101*t) * Math.sin(2*Mr)
           +  0.00029 * Math.sin(3*Mr);
  const omega = 125.04 - 1934.136 * t;
  return normalize(L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega)));
}

// ─── Moon (Meeus Ch. 47, 60-term table) ──────────────────────────────────────

export function moonLongitudeTropical(jd: number): number {
  const t = Tcy(jd);
  const L_ = normalize(218.3164477 + 481267.88123421*t - 0.0015786*t*t + t*t*t/538841 - t*t*t*t/65194000);
  const D  = normalize(297.8501921 + 445267.1114034*t  - 0.0018819*t*t + t*t*t/545868 - t*t*t*t/113065000);
  const M  = normalize(357.5291092 + 35999.0502909*t   - 0.0001536*t*t + t*t*t/24490000);
  const Mp = normalize(134.9633964 + 477198.8675055*t  + 0.0087414*t*t + t*t*t/69699   - t*t*t*t/14712000);
  const F  = normalize(93.2720950  + 483202.0175233*t  - 0.0036539*t*t - t*t*t/3526000 + t*t*t*t/863310000);
  const A1 = normalize(119.75 + 131.849*t);
  const A2 = normalize( 53.09 + 479264.290*t);
  const E  = 1 - 0.002516*t - 0.0000074*t*t;

  const Dr = rad(D), Mr = rad(M), Mpr = rad(Mp), Fr = rad(F);

  const tbl: number[][] = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
    [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
    [2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
    [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
    [4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
    [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
    [2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
    [0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
    [2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
    [2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
    [4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
    [1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
    [0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294],
  ];

  let sumL = 0;
  for (const [d,m,mp,f,c] of tbl) {
    let coeff = c;
    if (Math.abs(m)===1) coeff *= E;
    if (Math.abs(m)===2) coeff *= E*E;
    sumL += coeff * Math.sin(d*Dr + m*Mr + mp*Mpr + f*Fr);
  }
  sumL += 3958*Math.sin(rad(A1)) + 1962*Math.sin(rad(L_)-Fr) + 318*Math.sin(rad(A2));

  return normalize(L_ + sumL/1000000);
}

// ─── JPL Keplerian elements (1800-2050 AD) ───────────────────────────────────
// Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html (Table 1, 1800–2050)
// Each row: [a0, adot, e0, edot, I0, Idot, L0, Ldot, w0, wdot, Om0, Omdot]
// units: AU, AU/cy, deg, deg/cy

const JPL: Record<string, number[]> = {
  Mercury: [0.38709927, 0.00000037, 0.20563593, 0.00001906,  7.00497902,-0.00594749, 252.25032350, 149472.67411175,  77.45779628, 0.16047689,  48.33076593,-0.12534081],
  Venus:   [0.72333566, 0.00000390, 0.00677672,-0.00004107,  3.39467605,-0.00078890, 181.97909950,  58517.81538729, 131.60246718, 0.00268329,  76.67984255,-0.27769418],
  Earth:   [1.00000261, 0.00000562, 0.01671123,-0.00004392, -0.00001531,-0.01294668, 100.46457166,  35999.37244981, 102.93768193, 0.32327364,   0.0,         0.0        ],
  Mars:    [1.52371034, 0.00001847, 0.09339410, 0.00007882,  1.84969142,-0.00813131,  -4.55343205,  19140.30268499, -23.94362959, 0.44441088,  49.55953891,-0.29257343],
  Jupiter: [5.20288700,-0.00011607, 0.04838624,-0.00013253,  1.30439695,-0.00183714,  34.39644051,   3034.74612775,  14.72847983, 0.21252668, 100.47390909, 0.20469106],
  Saturn:  [9.53667594,-0.00125060, 0.05386179,-0.00050991,  2.48599187, 0.00193609,  49.95424423,   1222.49362201,  92.59887831,-0.41897216, 113.66242448,-0.28867794],
};

interface Vec3 { x: number; y: number; z: number }

/** Solve Kepler's equation iteratively */
function solveKepler(M: number, e: number): number {
  let E = M + e * Math.sin(rad(M)) * (1 + e * Math.cos(rad(M)));
  for (let i = 0; i < 10; i++) {
    const dE = (M - E + e * deg(Math.sin(rad(E)))) / (1 - e * Math.cos(rad(E)));
    E += dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

/** Heliocentric ecliptic (J2000) rectangular coordinates in AU */
function helioEcliptic(name: string, t: number): Vec3 {
  const [a0,adot,e0,edot,I0,Idot,L0,Ldot,w0,wdot,Om0,Omdot] = JPL[name];
  const a  = a0  + adot  * t;
  const e  = e0  + edot  * t;
  const I  = I0  + Idot  * t;
  const L  = normalize(L0  + Ldot  * t);
  const wt = w0  + wdot  * t;      // longitude of perihelion = ω̃
  const Om = Om0 + Omdot * t;      // longitude of ascending node

  const M  = normalize(L - wt);    // mean anomaly
  const E  = solveKepler(M, e);    // eccentric anomaly (degrees)

  const xp = a * (Math.cos(rad(E)) - e);
  const yp = a * Math.sqrt(1 - e*e) * Math.sin(rad(E));

  // argument of perihelion ω = ω̃ - Ω
  const omega = wt - Om;
  const Ir = rad(I);
  const omr = rad(omega);
  const Omr = rad(Om);

  // Rotate to ecliptic
  const cosOm = Math.cos(Omr), sinOm = Math.sin(Omr);
  const cosI  = Math.cos(Ir),  sinI  = Math.sin(Ir);
  const cosOmega = Math.cos(omr), sinOmega = Math.sin(omr);

  const x = xp * (cosOm*cosOmega - sinOm*sinOmega*cosI)
           - yp * (cosOm*sinOmega + sinOm*cosOmega*cosI);
  const y = xp * (sinOm*cosOmega + cosOm*sinOmega*cosI)
           - yp * (sinOm*sinOmega - cosOm*cosOmega*cosI);
  const z = xp * sinOmega*sinI + yp * cosOmega*sinI;

  return { x, y, z };
}

/** Geocentric ecliptic tropical longitude for a planet, in degrees 0-360 */
function planetGeocentricLon(name: string, jd: number): number {
  const t = Tcy(jd);
  const p = helioEcliptic(name, t);
  const e = helioEcliptic('Earth', t);
  return normalize(deg(Math.atan2(p.y - e.y, p.x - e.x)));
}

/** All planetary geocentric tropical longitudes */
export function allPlanetLongitudes(jd: number): Record<string, number> {
  return {
    Sun:     sunLongitudeTropical(jd),
    Moon:    moonLongitudeTropical(jd),
    Mercury: planetGeocentricLon('Mercury', jd),
    Venus:   planetGeocentricLon('Venus',   jd),
    Mars:    planetGeocentricLon('Mars',    jd),
    Jupiter: planetGeocentricLon('Jupiter', jd),
    Saturn:  planetGeocentricLon('Saturn',  jd),
    Rahu:    lunarNodeRahu(jd),
    Ketu:    normalize(lunarNodeRahu(jd) + 180),
  };
}

/** Mean descending lunar node (Rahu moves retrograde) */
function lunarNodeRahu(jd: number): number {
  const t = Tcy(jd);
  const Om = normalize(125.04452 - 1934.136261*t + 0.0020708*t*t + t*t*t/450000);
  // Apply main nutational correction
  const D  = normalize(297.8501921 + 445267.1114034*t);
  const Mp = normalize(134.9633964 + 477198.8675055*t);
  const F  = normalize( 93.2720950 + 483202.0175233*t);
  const trueNode = Om
    - 1.4979 * Math.sin(rad(2*(D - F)))
    - 0.1500 * Math.sin(rad(Mp))
    - 0.1226 * Math.sin(rad(2*D))
    + 0.1176 * Math.sin(rad(2*F))
    - 0.0801 * Math.sin(rad(2*(Mp - F)));
  return normalize(trueNode);
}

// ─── Local Sidereal Time ──────────────────────────────────────────────────────

function gmstDegrees(jd: number): number {
  const t = Tcy(jd);
  return normalize(
    280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * t * t
    - t * t * t / 38710000
  );
}

export function localSiderealTimeDeg(jd: number, longitude: number): number {
  return normalize(gmstDegrees(jd) + longitude);
}

// ─── Ascendant (Lagna) ────────────────────────────────────────────────────────
// Standard spherical astronomy formula

function obliquity(jd: number): number {
  const t = Tcy(jd);
  return 23.439291111 - 0.013004167*t - 0.0000001639*t*t + 0.0000005036*t*t*t;
}

export function ascendantTropical(jd: number, latDeg: number, lonDeg: number): number {
  const lst  = localSiderealTimeDeg(jd, lonDeg);
  const eps  = obliquity(jd);
  const lstR = rad(lst);
  const latR = rad(latDeg);
  const epsR = rad(eps);

  // tan(Asc) = –cos(RAMC) / (sin(ε)·tan(φ) + cos(ε)·sin(RAMC))
  // Algorithm from Duffett-Smith "Practical Astronomy with your Calculator":
  //   A = atan2(num, den)
  //   if A < 0: A += 180      (place in correct half)
  //   if cos(RAMC) < 0: A += 180   (quadrant correction for western RAMC)
  const num = -Math.cos(lstR);
  const den =  Math.sin(epsR) * Math.tan(latR) + Math.cos(epsR) * Math.sin(lstR);
  let asc = deg(Math.atan2(num, den));
  if (asc < 0) asc += 180;
  if (Math.cos(lstR) < 0) asc += 180;
  return normalize(asc);
}

// ─── Retrograde detection ─────────────────────────────────────────────────────

export function isRetrograde(name: string, jd: number): boolean {
  if (name === 'Sun' || name === 'Moon') return false;
  if (name === 'Rahu' || name === 'Ketu') return true; // always retrograde by definition

  const jd1 = jd - 0.5;
  const jd2 = jd + 0.5;

  let lon1: number, lon2: number;
  if (name === 'Mercury' || name === 'Venus' || name === 'Mars' || name === 'Jupiter' || name === 'Saturn') {
    lon1 = planetGeocentricLon(name, jd1);
    lon2 = planetGeocentricLon(name, jd2);
  } else {
    return false;
  }

  let diff = lon2 - lon1;
  if (diff >  180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// ─── Nakshatra ────────────────────────────────────────────────────────────────

export interface NakshatraResult {
  name: string; pada: number; lord: string; deity: string; symbol: string; index: number;
}

export function getNakshatra(siderealLon: number): NakshatraResult {
  const lon = normalize(siderealLon);
  const width = 360 / 27;
  const idx = Math.floor(lon / width);
  const pada = Math.floor((lon % width) / (width / 4)) + 1;
  const nak = NAKSHATRAS[idx % 27];
  return { name: nak.name, pada, lord: nak.lord, deity: nak.deity, symbol: nak.symbol, index: idx % 27 };
}

// ─── Planet metadata ──────────────────────────────────────────────────────────

const PLANETS_META = [
  { name: 'Sun',     nameHindi: 'Surya',  symbol: '☉' },
  { name: 'Moon',    nameHindi: 'Chandra',symbol: '☽' },
  { name: 'Mars',    nameHindi: 'Mangal', symbol: '♂' },
  { name: 'Mercury', nameHindi: 'Budha',  symbol: '☿' },
  { name: 'Jupiter', nameHindi: 'Guru',   symbol: '♃' },
  { name: 'Venus',   nameHindi: 'Shukra', symbol: '♀' },
  { name: 'Saturn',  nameHindi: 'Shani',  symbol: '♄' },
  { name: 'Rahu',    nameHindi: 'Rahu',   symbol: '☊' },
  { name: 'Ketu',    nameHindi: 'Ketu',   symbol: '☋' },
];

// ─── Main Kundali computation ─────────────────────────────────────────────────

export interface PlanetData {
  name: string; nameHindi: string; symbol: string;
  sign: string; signIndex: number; house: number;
  degree: number; degreeFull: number;
  isRetrograde: boolean; nakshatra: string; nakshatraPada: number; lord: string;
}

export interface KundaliData {
  ascendant:   { sign: string; signIndex: number; degree: number; degreeFull: number };
  planets:     PlanetData[];
  houses:      { number: number; sign: string; signIndex: number; degree: number; lord: string }[];
  moonSign:    string;
  sunSign:     string;
  nakshatra:   NakshatraResult;
}

export function computeKundali(
  year: number, month: number, day: number,
  hour: number, minute: number,
  latDeg: number, lonDeg: number,
  tzOffsetHours: number
): KundaliData {
  // Convert local time to UTC, then to JD
  const utcH = hour - tzOffsetHours;
  const jd = julianDay(year, month, day, utcH, minute, 0);

  const ayan = lahiriAyanamsa(jd);

  // Tropical → sidereal conversion
  const toSid = (trop: number) => normalize(trop - ayan);

  // Ascendant
  const ascTrop = ascendantTropical(jd, latDeg, lonDeg);
  const ascSid  = toSid(ascTrop);
  const ascSign = Math.floor(ascSid / 30);

  // Whole-sign houses
  const houses = Array.from({ length: 12 }, (_, i) => {
    const sIdx = (ascSign + i) % 12;
    return { number: i + 1, sign: SIGNS[sIdx], signIndex: sIdx, degree: ascSid % 30, lord: SIGN_LORDS[sIdx] };
  });

  const tropical = allPlanetLongitudes(jd);

  const planets: PlanetData[] = PLANETS_META.map(p => {
    const tropLon = tropical[p.name];
    const sidLon  = toSid(tropLon);
    const sIdx    = Math.floor(sidLon / 30);
    const houseNo = (sIdx - ascSign + 12) % 12 + 1;
    const nak     = getNakshatra(sidLon);
    return {
      name: p.name, nameHindi: p.nameHindi, symbol: p.symbol,
      sign: SIGNS[sIdx], signIndex: sIdx,
      house: houseNo, degree: sidLon % 30, degreeFull: sidLon,
      isRetrograde: isRetrograde(p.name, jd),
      nakshatra: nak.name, nakshatraPada: nak.pada, lord: SIGN_LORDS[sIdx],
    };
  });

  const moon = planets.find(p => p.name === 'Moon')!;
  const sun  = planets.find(p => p.name === 'Sun')!;

  return {
    ascendant: { sign: SIGNS[ascSign], signIndex: ascSign, degree: ascSid % 30, degreeFull: ascSid },
    planets,
    houses,
    moonSign: moon.sign,
    sunSign:  sun.sign,
    nakshatra: getNakshatra(moon.degreeFull),
  };
}

// ─── Yoga detection ───────────────────────────────────────────────────────────

export interface YogaResult { name: string; description: string; isPresent: boolean }

export function computeYogas(planets: PlanetData[], ascSignIndex: number): YogaResult[] {
  const g = (n: string) => planets.find(p => p.name === n)!;
  const sun = g('Sun'); const moon = g('Moon'); const mars = g('Mars');
  const mercury = g('Mercury'); const jupiter = g('Jupiter');
  const venus = g('Venus'); const saturn = g('Saturn'); const rahu = g('Rahu');

  const same  = (a: PlanetData, b: PlanetData) => a.house === b.house;
  const kendra = (h: number) => [1,4,7,10].includes(h);
  const trikona = (h: number) => [1,5,9].includes(h);
  const dusthana = (h: number) => [6,8,12].includes(h);

  const yogas: YogaResult[] = [];

  yogas.push({ name: 'Gaja Kesari Yoga',
    description: 'Jupiter and Moon in mutual kendra — wisdom, fame, and prosperity throughout life.',
    isPresent: kendra(((moon.house - jupiter.house + 12) % 12) + 1) || same(moon, jupiter) });

  yogas.push({ name: 'Budha-Aditya Yoga',
    description: 'Sun and Mercury in the same house — sharp intellect, eloquence, and leadership.',
    isPresent: same(sun, mercury) });

  yogas.push({ name: 'Chandra-Mangala Yoga',
    description: 'Moon and Mars conjunct — courage, strong will, and wealth through enterprise.',
    isPresent: same(moon, mars) });

  yogas.push({ name: 'Hamsa Yoga',
    description: 'Jupiter in own or exalted sign in a kendra — wisdom, spiritual inclination, noble character.',
    isPresent: kendra(jupiter.house) && [8, 11, 3].includes(jupiter.signIndex) });

  yogas.push({ name: 'Malavya Yoga',
    description: 'Venus in own or exalted sign in a kendra — beauty, luxury, artistic achievement.',
    isPresent: kendra(venus.house) && [1, 6, 11].includes(venus.signIndex) });

  yogas.push({ name: 'Shasha Yoga',
    description: 'Saturn in own or exalted sign in a kendra — discipline, authority, large-scale enterprise.',
    isPresent: kendra(saturn.house) && [9, 10, 6].includes(saturn.signIndex) });

  yogas.push({ name: 'Ruchaka Yoga',
    description: 'Mars in own or exalted sign in a kendra — courage, military success, leadership.',
    isPresent: kendra(mars.house) && [0, 7, 9].includes(mars.signIndex) });

  yogas.push({ name: 'Saraswati Yoga',
    description: 'Jupiter, Venus, and Mercury all in kendras or trikonas — exceptional creativity and learning.',
    isPresent: (kendra(jupiter.house)||trikona(jupiter.house)) &&
               (kendra(venus.house)  ||trikona(venus.house))   &&
               (kendra(mercury.house)||trikona(mercury.house)) });

  yogas.push({ name: 'Raja Yoga',
    description: 'Lord of a kendra and lord of a trikona conjunct — authority, success, and high social standing.',
    isPresent: (() => {
      for (const p1 of planets) {
        for (const p2 of planets) {
          if (p1 === p2) continue;
          if (!same(p1, p2)) continue;
          const h1 = (p1.signIndex - ascSignIndex + 12) % 12 + 1;
          const h2 = (p2.signIndex - ascSignIndex + 12) % 12 + 1;
          if ((kendra(h1) && trikona(h2)) || (trikona(h1) && kendra(h2))) {
            if (SIGN_LORDS[p1.signIndex] === p1.name && SIGN_LORDS[p2.signIndex] === p2.name) return true;
          }
        }
      }
      return false;
    })() });

  yogas.push({ name: 'Dhana Yoga',
    description: 'Lords of 2nd and 11th house well-placed — strong financial prosperity and wealth accumulation.',
    isPresent: (() => {
      const l2 = SIGN_LORDS[(ascSignIndex + 1) % 12];
      const l11 = SIGN_LORDS[(ascSignIndex + 10) % 12];
      const p2  = planets.find(p => p.name === l2);
      const p11 = planets.find(p => p.name === l11);
      if (!p2 || !p11) return false;
      return same(p2, p11) ||
             (kendra(p2.house) && trikona(p11.house)) ||
             (trikona(p2.house) && kendra(p11.house));
    })() });

  yogas.push({ name: 'Kemadruma Yoga',
    description: 'Moon stands alone with no planets in adjacent houses — self-reliance forged through solitude.',
    isPresent: (() => {
      const mh = moon.house;
      const prev = mh === 1 ? 12 : mh - 1;
      const next = mh === 12 ? 1 : mh + 1;
      return !planets.some(p => !['Moon','Rahu','Ketu'].includes(p.name) && (p.house===prev||p.house===next||p.house===mh));
    })() });

  yogas.push({ name: 'Viparita Raja Yoga',
    description: 'Lords of dusthana houses in each other\'s houses — triumph over adversity, unexpected rise to power.',
    isPresent: (() => {
      const l6  = planets.find(p => p.name === SIGN_LORDS[(ascSignIndex+5)%12]);
      const l8  = planets.find(p => p.name === SIGN_LORDS[(ascSignIndex+7)%12]);
      const l12 = planets.find(p => p.name === SIGN_LORDS[(ascSignIndex+11)%12]);
      const inD = (p: PlanetData | undefined): boolean => !!p && dusthana(p.house);
      return (inD(l6)&&inD(l8)) || (inD(l6)&&inD(l12)) || (inD(l8)&&inD(l12));
    })() });

  return yogas;
}

// ─── Timezone offset helper ────────────────────────────────────────────────────

export function getTimezoneOffset(timezone: string, date: Date): number {
  try {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const loc = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (loc.getTime() - utc.getTime()) / 3600000;
  } catch {
    return 5.5; // fallback IST
  }
}
