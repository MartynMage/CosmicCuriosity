// ==========================================
// COSMIC CURIOSITY - ASTRONOMY ENGINE v3
// Core astronomical calculations and data
// ==========================================

const AstroEngine = {
    // Constants
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    J2000: 2451545.0, // Julian date for J2000.0 epoch
    
    // Observer location (default: Kansas City - center of US)
    observer: {
        lat: 39.0997,
        lng: -94.5786,
        timezone: -6,
        elevation: 250
    },
    
    setLocation(lat, lng, timezone = null) {
        this.observer.lat = lat;
        this.observer.lng = lng;
        if (timezone !== null) this.observer.timezone = timezone;
        localStorage.setItem('astroLocation', JSON.stringify(this.observer));
    },
    
    loadLocation() {
        const saved = localStorage.getItem('astroLocation');
        if (saved) this.observer = JSON.parse(saved);
    },
    
    // ==========================================
    // TIME CALCULATIONS
    // ==========================================
    
    getJulianDate(date = new Date()) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate() + date.getUTCHours()/24 + date.getUTCMinutes()/1440 + date.getUTCSeconds()/86400;
        
        let jy = y, jm = m;
        if (m <= 2) { jy--; jm += 12; }
        
        const a = Math.floor(jy / 100);
        const b = 2 - a + Math.floor(a / 4);
        
        return Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + b - 1524.5;
    },
    
    getLocalSiderealTime(date = new Date()) {
        const jd = this.getJulianDate(date);
        const t = (jd - this.J2000) / 36525;
        let lst = 280.46061837 + 360.98564736629 * (jd - this.J2000) + 0.000387933 * t * t;
        lst = lst + this.observer.lng;
        lst = ((lst % 360) + 360) % 360;
        return lst;
    },
    
    // ==========================================
    // COORDINATE TRANSFORMATIONS
    // ==========================================
    
    equatorialToHorizontal(ra, dec, date = new Date()) {
        const lst = this.getLocalSiderealTime(date);
        const ha = (lst - ra + 360) % 360;
        
        const haRad = ha * this.DEG_TO_RAD;
        const decRad = dec * this.DEG_TO_RAD;
        const latRad = this.observer.lat * this.DEG_TO_RAD;
        
        const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
        const alt = Math.asin(sinAlt) * this.RAD_TO_DEG;
        
        const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(alt * this.DEG_TO_RAD));
        let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * this.RAD_TO_DEG;
        
        if (Math.sin(haRad) > 0) az = 360 - az;
        
        return { altitude: alt, azimuth: az };
    },
    
    horizontalToCanvas(alt, az, centerX, centerY, radius) {
        // Convert horizon coords to canvas coords (stereographic projection)
        const r = radius * (90 - alt) / 90;
        const theta = (az - 180) * this.DEG_TO_RAD;
        return {
            x: centerX + r * Math.sin(theta),
            y: centerY - r * Math.cos(theta)
        };
    },
    
    // ==========================================
    // SUN CALCULATIONS
    // ==========================================
    
    getSunPosition(date = new Date()) {
        const jd = this.getJulianDate(date);
        const n = jd - this.J2000;
        
        let L = (280.460 + 0.9856474 * n) % 360;
        let g = (357.528 + 0.9856003 * n) % 360;
        if (L < 0) L += 360;
        if (g < 0) g += 360;
        
        const gRad = g * this.DEG_TO_RAD;
        const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
        const epsilon = 23.439 - 0.0000004 * n;
        
        const lambdaRad = lambda * this.DEG_TO_RAD;
        const epsilonRad = epsilon * this.DEG_TO_RAD;
        
        const ra = Math.atan2(Math.cos(epsilonRad) * Math.sin(lambdaRad), Math.cos(lambdaRad)) * this.RAD_TO_DEG;
        const dec = Math.asin(Math.sin(epsilonRad) * Math.sin(lambdaRad)) * this.RAD_TO_DEG;
        
        return { ra: (ra + 360) % 360, dec, longitude: lambda };
    },
    
    getSunTimes(date = new Date()) {
        const jd = this.getJulianDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
        const n = jd - this.J2000;
        
        const Jstar = n - this.observer.lng / 360;
        const M = (357.5291 + 0.98560028 * Jstar) % 360;
        const C = 1.9148 * Math.sin(M * this.DEG_TO_RAD) + 0.02 * Math.sin(2 * M * this.DEG_TO_RAD);
        const lambda = (M + C + 180 + 102.9372) % 360;
        
        const Jtransit = this.J2000 + Jstar + 0.0053 * Math.sin(M * this.DEG_TO_RAD) - 0.0069 * Math.sin(2 * lambda * this.DEG_TO_RAD);
        
        const dec = Math.asin(Math.sin(lambda * this.DEG_TO_RAD) * Math.sin(23.44 * this.DEG_TO_RAD));
        const cosOmega = (Math.sin(-0.83 * this.DEG_TO_RAD) - Math.sin(this.observer.lat * this.DEG_TO_RAD) * Math.sin(dec)) / 
                         (Math.cos(this.observer.lat * this.DEG_TO_RAD) * Math.cos(dec));
        
        if (cosOmega > 1) return { sunrise: null, sunset: null, polar: 'night' };
        if (cosOmega < -1) return { sunrise: null, sunset: null, polar: 'day' };
        
        const omega = Math.acos(cosOmega) * this.RAD_TO_DEG;
        const Jrise = Jtransit - omega / 360;
        const Jset = Jtransit + omega / 360;
        
        const toDate = (jd) => {
            const date = new Date((jd - 2440587.5) * 86400000);
            return date;
        };
        
        return {
            sunrise: toDate(Jrise),
            sunset: toDate(Jset),
            solarNoon: toDate(Jtransit),
            polar: false
        };
    },
    
    getTwilightTimes(date = new Date()) {
        // Civil (-6°), Nautical (-12°), Astronomical (-18°)
        const angles = { civil: -6, nautical: -12, astronomical: -18 };
        const result = {};
        
        for (const [name, angle] of Object.entries(angles)) {
            const jd = this.getJulianDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
            const n = jd - this.J2000;
            const Jstar = n - this.observer.lng / 360;
            const M = (357.5291 + 0.98560028 * Jstar) % 360;
            const C = 1.9148 * Math.sin(M * this.DEG_TO_RAD);
            const lambda = (M + C + 180 + 102.9372) % 360;
            const Jtransit = this.J2000 + Jstar + 0.0053 * Math.sin(M * this.DEG_TO_RAD) - 0.0069 * Math.sin(2 * lambda * this.DEG_TO_RAD);
            const dec = Math.asin(Math.sin(lambda * this.DEG_TO_RAD) * Math.sin(23.44 * this.DEG_TO_RAD));
            const cosOmega = (Math.sin(angle * this.DEG_TO_RAD) - Math.sin(this.observer.lat * this.DEG_TO_RAD) * Math.sin(dec)) / 
                             (Math.cos(this.observer.lat * this.DEG_TO_RAD) * Math.cos(dec));
            
            if (Math.abs(cosOmega) <= 1) {
                const omega = Math.acos(cosOmega) * this.RAD_TO_DEG;
                result[name + 'Dawn'] = new Date((Jtransit - omega / 360 - 2440587.5) * 86400000);
                result[name + 'Dusk'] = new Date((Jtransit + omega / 360 - 2440587.5) * 86400000);
            }
        }
        
        return result;
    },
    
    // ==========================================
    // MOON CALCULATIONS
    // ==========================================
    
    getMoonPosition(date = new Date()) {
        const jd = this.getJulianDate(date);
        const T = (jd - this.J2000) / 36525;
        
        // Moon's mean longitude
        let L = 218.3164477 + 481267.88123421 * T;
        // Moon's mean anomaly
        let M = 134.9633964 + 477198.8675055 * T;
        // Moon's argument of latitude
        let F = 93.2720950 + 483202.0175233 * T;
        // Mean elongation of the Moon
        let D = 297.8501921 + 445267.1114034 * T;
        // Sun's mean anomaly
        let Ms = 357.5291092 + 35999.0502909 * T;
        
        L = L % 360; M = M % 360; F = F % 360; D = D % 360; Ms = Ms % 360;
        
        // Simplified longitude calculation
        let longitude = L 
            + 6.289 * Math.sin(M * this.DEG_TO_RAD)
            + 1.274 * Math.sin((2*D - M) * this.DEG_TO_RAD)
            + 0.658 * Math.sin(2*D * this.DEG_TO_RAD)
            + 0.214 * Math.sin(2*M * this.DEG_TO_RAD)
            - 0.186 * Math.sin(Ms * this.DEG_TO_RAD);
        
        let latitude = 5.128 * Math.sin(F * this.DEG_TO_RAD);
        
        // Distance in km
        let distance = 385001 - 20905 * Math.cos(M * this.DEG_TO_RAD);
        
        // Convert to equatorial
        const epsilon = 23.439;
        const lambdaRad = longitude * this.DEG_TO_RAD;
        const betaRad = latitude * this.DEG_TO_RAD;
        const epsilonRad = epsilon * this.DEG_TO_RAD;
        
        const ra = Math.atan2(
            Math.sin(lambdaRad) * Math.cos(epsilonRad) - Math.tan(betaRad) * Math.sin(epsilonRad),
            Math.cos(lambdaRad)
        ) * this.RAD_TO_DEG;
        
        const dec = Math.asin(
            Math.sin(betaRad) * Math.cos(epsilonRad) + Math.cos(betaRad) * Math.sin(epsilonRad) * Math.sin(lambdaRad)
        ) * this.RAD_TO_DEG;
        
        return { ra: (ra + 360) % 360, dec, distance, longitude: longitude % 360, latitude };
    },
    
    getMoonPhase(date = new Date()) {
        const sun = this.getSunPosition(date);
        const moon = this.getMoonPosition(date);
        
        let elongation = moon.longitude - sun.longitude;
        if (elongation < 0) elongation += 360;
        
        const illumination = (1 - Math.cos(elongation * this.DEG_TO_RAD)) / 2 * 100;
        
        let phase, emoji;
        if (elongation < 22.5) { phase = 'New Moon'; emoji = '🌑'; }
        else if (elongation < 67.5) { phase = 'Waxing Crescent'; emoji = '🌒'; }
        else if (elongation < 112.5) { phase = 'First Quarter'; emoji = '🌓'; }
        else if (elongation < 157.5) { phase = 'Waxing Gibbous'; emoji = '🌔'; }
        else if (elongation < 202.5) { phase = 'Full Moon'; emoji = '🌕'; }
        else if (elongation < 247.5) { phase = 'Waning Gibbous'; emoji = '🌖'; }
        else if (elongation < 292.5) { phase = 'Last Quarter'; emoji = '🌗'; }
        else if (elongation < 337.5) { phase = 'Waning Crescent'; emoji = '🌘'; }
        else { phase = 'New Moon'; emoji = '🌑'; }
        
        // Days since new moon (synodic month = 29.53 days)
        const synodicMonth = 29.530588853;
        const lunation = elongation / 360 * synodicMonth;
        
        return { phase, emoji, illumination, age: lunation, elongation };
    },
    
    getMoonTimes(date = new Date()) {
        // Simplified moon rise/set calculation
        const moon = this.getMoonPosition(date);
        const horizontal = this.equatorialToHorizontal(moon.ra, moon.dec, date);
        
        // Approximate rise/set times
        const lst = this.getLocalSiderealTime(date);
        const ha = Math.acos(-Math.tan(this.observer.lat * this.DEG_TO_RAD) * Math.tan(moon.dec * this.DEG_TO_RAD));
        
        if (isNaN(ha)) {
            return { rise: null, set: null, alwaysUp: moon.dec > 0, alwaysDown: moon.dec < 0 };
        }
        
        const haHours = ha * this.RAD_TO_DEG / 15;
        const transit = (moon.ra - lst + 360) % 360 / 15;
        
        const riseHour = (transit - haHours + 24) % 24;
        const setHour = (transit + haHours + 24) % 24;
        
        const baseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        return {
            rise: new Date(baseDate.getTime() + riseHour * 3600000),
            set: new Date(baseDate.getTime() + setHour * 3600000),
            transit: new Date(baseDate.getTime() + transit * 3600000)
        };
    },
    
    // ==========================================
    // PLANET CALCULATIONS
    // ==========================================
    
    planets: {
        mercury: { a: 0.387, e: 0.206, i: 7.00, L: 252.25, omega: 77.46, Omega: 48.33, period: 87.97, symbol: '☿', color: '#b0b0b0' },
        venus: { a: 0.723, e: 0.007, i: 3.39, L: 181.98, omega: 131.53, Omega: 76.68, period: 224.70, symbol: '♀', color: '#e6c87a' },
        mars: { a: 1.524, e: 0.093, i: 1.85, L: 355.43, omega: 336.04, Omega: 49.56, period: 686.98, symbol: '♂', color: '#e07040' },
        jupiter: { a: 5.203, e: 0.048, i: 1.30, L: 34.33, omega: 14.75, Omega: 100.56, period: 4332.59, symbol: '♃', color: '#d4a574' },
        saturn: { a: 9.537, e: 0.054, i: 2.49, L: 50.08, omega: 92.43, Omega: 113.72, period: 10759.22, symbol: '♄', color: '#e8d4a0' },
        uranus: { a: 19.19, e: 0.047, i: 0.77, L: 314.20, omega: 170.96, Omega: 74.00, period: 30688.5, symbol: '♅', color: '#a0d4e0' },
        neptune: { a: 30.07, e: 0.009, i: 1.77, L: 304.22, omega: 44.97, Omega: 131.79, period: 60182, symbol: '♆', color: '#4060c0' }
    },
    
    getPlanetPosition(name, date = new Date()) {
        const planet = this.planets[name.toLowerCase()];
        if (!planet) return null;
        
        const jd = this.getJulianDate(date);
        const T = (jd - this.J2000) / 36525;
        const d = jd - this.J2000;
        
        // Mean anomaly
        const M = (planet.L + 360 * d / planet.period) % 360;
        const MRad = M * this.DEG_TO_RAD;
        
        // Eccentric anomaly (simplified)
        let E = M + planet.e * this.RAD_TO_DEG * Math.sin(MRad);
        for (let i = 0; i < 5; i++) {
            E = M + planet.e * this.RAD_TO_DEG * Math.sin(E * this.DEG_TO_RAD);
        }
        
        // True anomaly
        const v = 2 * Math.atan(Math.sqrt((1 + planet.e) / (1 - planet.e)) * Math.tan(E * this.DEG_TO_RAD / 2)) * this.RAD_TO_DEG;
        
        // Heliocentric distance
        const r = planet.a * (1 - planet.e * Math.cos(E * this.DEG_TO_RAD));
        
        // Heliocentric ecliptic coordinates
        const lonH = (v + planet.omega) % 360;
        const latH = planet.i * Math.sin((lonH - planet.Omega) * this.DEG_TO_RAD);
        
        // Get Earth position for geocentric conversion
        const earthPos = this.getEarthPosition(date);
        
        // Convert to geocentric (simplified)
        const xH = r * Math.cos(latH * this.DEG_TO_RAD) * Math.cos(lonH * this.DEG_TO_RAD);
        const yH = r * Math.cos(latH * this.DEG_TO_RAD) * Math.sin(lonH * this.DEG_TO_RAD);
        const zH = r * Math.sin(latH * this.DEG_TO_RAD);
        
        const xG = xH - earthPos.x;
        const yG = yH - earthPos.y;
        const zG = zH - earthPos.z;
        
        const lonG = Math.atan2(yG, xG) * this.RAD_TO_DEG;
        const latG = Math.atan2(zG, Math.sqrt(xG*xG + yG*yG)) * this.RAD_TO_DEG;
        const distG = Math.sqrt(xG*xG + yG*yG + zG*zG);
        
        // Convert to equatorial
        const epsilon = 23.439;
        const ra = Math.atan2(
            Math.sin(lonG * this.DEG_TO_RAD) * Math.cos(epsilon * this.DEG_TO_RAD) - Math.tan(latG * this.DEG_TO_RAD) * Math.sin(epsilon * this.DEG_TO_RAD),
            Math.cos(lonG * this.DEG_TO_RAD)
        ) * this.RAD_TO_DEG;
        
        const dec = Math.asin(
            Math.sin(latG * this.DEG_TO_RAD) * Math.cos(epsilon * this.DEG_TO_RAD) + 
            Math.cos(latG * this.DEG_TO_RAD) * Math.sin(epsilon * this.DEG_TO_RAD) * Math.sin(lonG * this.DEG_TO_RAD)
        ) * this.RAD_TO_DEG;
        
        // Calculate magnitude (simplified)
        const phaseAngle = Math.abs(lonG - this.getSunPosition(date).longitude);
        const baseMag = { mercury: -0.4, venus: -4.4, mars: -2.0, jupiter: -2.7, saturn: -0.5, uranus: 5.3, neptune: 7.8 };
        const mag = baseMag[name.toLowerCase()] + 5 * Math.log10(r * distG);
        
        return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            ra: (ra + 360) % 360,
            dec,
            distance: distG,
            magnitude: mag,
            symbol: planet.symbol,
            color: planet.color,
            constellation: this.getConstellation((ra + 360) % 360, dec)
        };
    },
    
    getEarthPosition(date = new Date()) {
        const jd = this.getJulianDate(date);
        const d = jd - this.J2000;
        const M = (357.5291 + 0.98560028 * d) % 360;
        const MRad = M * this.DEG_TO_RAD;
        const C = 1.9148 * Math.sin(MRad) + 0.02 * Math.sin(2 * MRad);
        const L = (280.46 + 0.9856474 * d) % 360;
        const lon = (L + C) % 360;
        const r = 1.00014 - 0.01671 * Math.cos(MRad);
        
        return {
            x: r * Math.cos(lon * this.DEG_TO_RAD),
            y: r * Math.sin(lon * this.DEG_TO_RAD),
            z: 0
        };
    },
    
    getAllPlanets(date = new Date()) {
        return Object.keys(this.planets).map(name => {
            const pos = this.getPlanetPosition(name, date);
            const horizontal = this.equatorialToHorizontal(pos.ra, pos.dec, date);
            return { ...pos, ...horizontal, visible: horizontal.altitude > 0 };
        });
    },
    
    // ==========================================
    // CONSTELLATION DATA
    // ==========================================
    
    constellations: [
        { name: 'Orion', abbr: 'Ori', ra: 85, dec: 0, stars: [[88.79, 7.41], [81.28, 6.35], [78.63, -8.20], [88.05, -0.30], [84.05, -1.20], [81.12, -1.94], [77.29, 8.87]], lines: [[0,3],[3,4],[4,5],[5,2],[1,3],[4,6]], mythology: 'The Hunter, placed in the sky by Zeus' },
        { name: 'Ursa Major', abbr: 'UMa', ra: 165, dec: 55, stars: [[165.93, 61.75], [166.00, 56.38], [178.46, 53.69], [183.86, 57.03], [193.51, 55.96], [200.98, 54.93], [206.88, 49.31]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,0]], mythology: 'The Great Bear, Callisto transformed by Zeus' },
        { name: 'Cassiopeia', abbr: 'Cas', ra: 15, dec: 60, stars: [[2.29, 59.15], [10.13, 56.54], [14.18, 60.72], [21.45, 60.24], [28.60, 63.67]], lines: [[0,1],[1,2],[2,3],[3,4]], mythology: 'The vain queen, punished for her boasting' },
        { name: 'Leo', abbr: 'Leo', ra: 155, dec: 15, stars: [[152.09, 11.97], [148.19, 26.01], [146.46, 14.57], [151.83, 16.76], [154.17, 19.84], [168.53, 20.52], [177.26, 14.57]], lines: [[0,2],[2,3],[3,4],[4,1],[3,5],[5,6]], mythology: 'The Nemean Lion, slain by Hercules' },
        { name: 'Scorpius', abbr: 'Sco', ra: 250, dec: -30, stars: [[247.35, -26.43], [252.54, -26.11], [253.08, -38.05], [258.04, -43.24], [262.69, -37.10], [264.33, -43.00], [265.62, -39.03]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]], mythology: 'The scorpion that killed Orion' },
        { name: 'Cygnus', abbr: 'Cyg', ra: 310, dec: 40, stars: [[305.56, 40.26], [311.55, 33.97], [305.25, 45.28], [310.36, 45.28], [313.69, 51.19]], lines: [[0,1],[0,2],[2,3],[3,4]], mythology: 'The Swan, Zeus in disguise' },
        { name: 'Gemini', abbr: 'Gem', ra: 105, dec: 25, stars: [[113.65, 31.89], [116.33, 28.03], [99.43, 16.40], [106.03, 20.57], [100.98, 25.13], [109.29, 21.98]], lines: [[0,1],[0,4],[4,5],[5,3],[3,2]], mythology: 'The twins Castor and Pollux' },
        { name: 'Taurus', abbr: 'Tau', ra: 65, dec: 18, stars: [[68.98, 16.51], [84.41, 21.14], [67.17, 19.18], [64.95, 15.63], [60.17, 12.49]], lines: [[0,1],[0,2],[2,3],[3,4]], mythology: 'The bull, Zeus in disguise' },
        { name: 'Virgo', abbr: 'Vir', ra: 195, dec: -5, stars: [[201.30, -11.16], [186.65, -16.52], [184.98, -17.54], [177.67, 14.57], [194.01, 10.96]], lines: [[0,1],[1,2],[0,3],[3,4]], mythology: 'The maiden goddess of harvest' },
        { name: 'Aquarius', abbr: 'Aqr', ra: 335, dec: -10, stars: [[331.45, -0.32], [339.66, -0.02], [343.66, -7.58], [346.19, -18.87], [339.39, -9.09]], lines: [[0,1],[1,2],[2,3],[1,4]], mythology: 'The water bearer, Ganymede' }
    ],
    
    getConstellation(ra, dec) {
        // Simple nearest constellation finder
        let nearest = null;
        let minDist = Infinity;
        
        for (const c of this.constellations) {
            const dist = Math.sqrt((ra - c.ra) ** 2 + (dec - c.dec) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = c.name;
            }
        }
        
        return nearest;
    },
    
    getVisibleConstellations(date = new Date()) {
        return this.constellations.map(c => {
            const horizontal = this.equatorialToHorizontal(c.ra, c.dec, date);
            return {
                ...c,
                ...horizontal,
                visible: horizontal.altitude > 10
            };
        }).filter(c => c.visible).sort((a, b) => b.altitude - a.altitude);
    },
    
    // ==========================================
    // METEOR SHOWERS
    // ==========================================
    
    meteorShowers: [
        { name: 'Quadrantids', peak: '01-03', zhr: 120, radiantRA: 230, radiantDec: 49, velocity: 41, parent: '2003 EH1' },
        { name: 'Lyrids', peak: '04-22', zhr: 18, radiantRA: 271, radiantDec: 34, velocity: 49, parent: 'Thatcher' },
        { name: 'Eta Aquariids', peak: '05-06', zhr: 50, radiantRA: 338, radiantDec: -1, velocity: 66, parent: 'Halley' },
        { name: 'Delta Aquariids', peak: '07-30', zhr: 20, radiantRA: 340, radiantDec: -16, velocity: 41, parent: '96P/Machholz' },
        { name: 'Perseids', peak: '08-12', zhr: 100, radiantRA: 48, radiantDec: 58, velocity: 59, parent: 'Swift-Tuttle' },
        { name: 'Draconids', peak: '10-08', zhr: 10, radiantRA: 262, radiantDec: 54, velocity: 20, parent: '21P/Giacobini-Zinner' },
        { name: 'Orionids', peak: '10-21', zhr: 20, radiantRA: 95, radiantDec: 16, velocity: 66, parent: 'Halley' },
        { name: 'Leonids', peak: '11-17', zhr: 15, radiantRA: 152, radiantDec: 22, velocity: 71, parent: 'Tempel-Tuttle' },
        { name: 'Geminids', peak: '12-14', zhr: 150, radiantRA: 112, radiantDec: 33, velocity: 35, parent: '3200 Phaethon' },
        { name: 'Ursids', peak: '12-22', zhr: 10, radiantRA: 217, radiantDec: 76, velocity: 33, parent: '8P/Tuttle' }
    ],
    
    getActiveShowers(date = new Date()) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const currentDate = month * 100 + day;
        
        return this.meteorShowers.filter(shower => {
            const [m, d] = shower.peak.split('-').map(Number);
            const peakDate = m * 100 + d;
            const diff = Math.abs(currentDate - peakDate);
            return diff < 10 || diff > 355; // Within 10 days of peak
        }).map(shower => {
            const horizontal = this.equatorialToHorizontal(shower.radiantRA, shower.radiantDec, date);
            const [m, d] = shower.peak.split('-').map(Number);
            return {
                ...shower,
                ...horizontal,
                radiantVisible: horizontal.altitude > 0,
                peakDate: new Date(date.getFullYear(), m - 1, d)
            };
        });
    },
    
    // ==========================================
    // DEEP SKY OBJECTS (Messier Catalog)
    // ==========================================
    
    messierObjects: [
        { id: 'M1', name: 'Crab Nebula', type: 'Supernova Remnant', ra: 83.63, dec: 22.01, mag: 8.4, size: 6, constellation: 'Taurus' },
        { id: 'M8', name: 'Lagoon Nebula', type: 'Emission Nebula', ra: 270.92, dec: -24.38, mag: 6.0, size: 90, constellation: 'Sagittarius' },
        { id: 'M13', name: 'Great Globular Cluster', type: 'Globular Cluster', ra: 250.42, dec: 36.46, mag: 5.8, size: 20, constellation: 'Hercules' },
        { id: 'M27', name: 'Dumbbell Nebula', type: 'Planetary Nebula', ra: 299.90, dec: 22.72, mag: 7.5, size: 8, constellation: 'Vulpecula' },
        { id: 'M31', name: 'Andromeda Galaxy', type: 'Spiral Galaxy', ra: 10.68, dec: 41.27, mag: 3.4, size: 190, constellation: 'Andromeda' },
        { id: 'M42', name: 'Orion Nebula', type: 'Emission Nebula', ra: 83.82, dec: -5.39, mag: 4.0, size: 85, constellation: 'Orion' },
        { id: 'M45', name: 'Pleiades', type: 'Open Cluster', ra: 56.87, dec: 24.12, mag: 1.6, size: 110, constellation: 'Taurus' },
        { id: 'M51', name: 'Whirlpool Galaxy', type: 'Spiral Galaxy', ra: 202.47, dec: 47.20, mag: 8.4, size: 11, constellation: 'Canes Venatici' },
        { id: 'M57', name: 'Ring Nebula', type: 'Planetary Nebula', ra: 283.40, dec: 33.03, mag: 8.8, size: 1.4, constellation: 'Lyra' },
        { id: 'M81', name: "Bode's Galaxy", type: 'Spiral Galaxy', ra: 148.89, dec: 69.07, mag: 6.9, size: 27, constellation: 'Ursa Major' },
        { id: 'M101', name: 'Pinwheel Galaxy', type: 'Spiral Galaxy', ra: 210.80, dec: 54.35, mag: 7.9, size: 29, constellation: 'Ursa Major' },
        { id: 'M104', name: 'Sombrero Galaxy', type: 'Spiral Galaxy', ra: 189.99, dec: -11.62, mag: 8.0, size: 9, constellation: 'Virgo' }
    ],
    
    getVisibleMessierObjects(date = new Date(), minAlt = 20) {
        return this.messierObjects.map(obj => {
            const horizontal = this.equatorialToHorizontal(obj.ra, obj.dec, date);
            return { ...obj, ...horizontal, visible: horizontal.altitude > minAlt };
        }).filter(obj => obj.visible).sort((a, b) => a.mag - b.mag);
    }
};

// Initialize location from storage
AstroEngine.loadLocation();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AstroEngine;
}

window.AstroEngine = AstroEngine;
