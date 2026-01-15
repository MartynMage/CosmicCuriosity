// ==========================================
// COSMIC CURIOSITY - AUTO-UPDATE SYSTEM
// Keeps data accurate without code changes
// ==========================================

const AutoUpdate = {
    // Update intervals
    intervals: {
        moonPhase: 60 * 60 * 1000,      // 1 hour
        sunTimes: 60 * 60 * 1000,        // 1 hour
        planets: 6 * 60 * 60 * 1000,     // 6 hours
        events: 24 * 60 * 60 * 1000,     // 24 hours
        apod: 24 * 60 * 60 * 1000,       // 24 hours
        news: 6 * 60 * 60 * 1000,        // 6 hours
    },
    
    // Cache for fetched data
    cache: {},
    
    // NASA API key (DEMO_KEY has rate limits, but works)
    NASA_API_KEY: 'DEMO_KEY',
    
    init() {
        console.log('🔄 Auto-update system initializing...');
        
        // Run initial updates
        this.updateAll();
        
        // Set up periodic updates
        this.scheduleUpdates();
        
        // Update on visibility change (when user returns to tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateAll();
            }
        });
        
        console.log('✅ Auto-update system ready');
    },
    
    async updateAll() {
        // Update everything that needs refreshing
        await Promise.allSettled([
            this.updateDateTime(),
            this.updateMoonPhase(),
            this.updateSunTimes(),
            this.updateEventCountdowns(),
            this.updateAPOD(),
            this.updateDynamicContent()
        ]);
    },
    
    scheduleUpdates() {
        // Update date/time every minute
        setInterval(() => this.updateDateTime(), 60 * 1000);
        
        // Update moon phase every hour
        setInterval(() => this.updateMoonPhase(), this.intervals.moonPhase);
        
        // Update sun times every hour
        setInterval(() => this.updateSunTimes(), this.intervals.sunTimes);
        
        // Update event countdowns every minute
        setInterval(() => this.updateEventCountdowns(), 60 * 1000);
        
        // Update APOD once a day
        setInterval(() => this.updateAPOD(), this.intervals.apod);
    },
    
    // ==========================================
    // DATE & TIME UPDATES
    // ==========================================
    
    updateDateTime() {
        const now = new Date();
        
        // Update current date display
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-US', options);
        }
        
        // Update any time displays
        document.querySelectorAll('[data-live-time]').forEach(el => {
            el.textContent = now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        });
        
        // Update "Tonight" vs "Today" labels based on time
        const hour = now.getHours();
        const isNight = hour >= 18 || hour < 6;
        document.querySelectorAll('[data-time-label]').forEach(el => {
            el.textContent = isNight ? 'Tonight' : 'Today';
        });
    },
    
    // ==========================================
    // MOON PHASE (Accurate calculation)
    // ==========================================
    
    updateMoonPhase() {
        const moonData = this.calculateMoonPhase(new Date());
        
        // Update moon displays
        document.querySelectorAll('[data-moon-phase]').forEach(el => {
            el.textContent = moonData.phaseName;
        });
        
        document.querySelectorAll('[data-moon-icon]').forEach(el => {
            el.textContent = moonData.emoji;
        });
        
        document.querySelectorAll('[data-moon-illumination]').forEach(el => {
            el.textContent = `${moonData.illumination}%`;
        });
        
        // Update the hero stats if present
        const moonIllumEl = document.querySelector('.stat-value[data-type="moon"]');
        if (moonIllumEl) {
            moonIllumEl.textContent = `${moonData.illumination}%`;
        }
        
        return moonData;
    },
    
    calculateMoonPhase(date) {
        // Accurate moon phase calculation using synodic month
        const synodicMonth = 29.53058867;
        
        // Known new moon: January 6, 2000 at 18:14 UTC
        const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
        const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
        const lunarAge = ((daysSinceKnown % synodicMonth) + synodicMonth) % synodicMonth;
        
        // Calculate illumination (0-100%)
        // Illumination follows a cosine curve
        const illumination = Math.round((1 - Math.cos(2 * Math.PI * lunarAge / synodicMonth)) / 2 * 100);
        
        // Determine phase name and emoji
        let phaseName, emoji;
        const phase = lunarAge / synodicMonth;
        
        if (phase < 0.0625) {
            phaseName = 'New Moon';
            emoji = '🌑';
        } else if (phase < 0.1875) {
            phaseName = 'Waxing Crescent';
            emoji = '🌒';
        } else if (phase < 0.3125) {
            phaseName = 'First Quarter';
            emoji = '🌓';
        } else if (phase < 0.4375) {
            phaseName = 'Waxing Gibbous';
            emoji = '🌔';
        } else if (phase < 0.5625) {
            phaseName = 'Full Moon';
            emoji = '🌕';
        } else if (phase < 0.6875) {
            phaseName = 'Waning Gibbous';
            emoji = '🌖';
        } else if (phase < 0.8125) {
            phaseName = 'Last Quarter';
            emoji = '🌗';
        } else if (phase < 0.9375) {
            phaseName = 'Waning Crescent';
            emoji = '🌘';
        } else {
            phaseName = 'New Moon';
            emoji = '🌑';
        }
        
        // Calculate days until next full/new moon
        let daysToFull, daysToNew;
        if (phase < 0.5) {
            daysToFull = Math.round((0.5 - phase) * synodicMonth);
            daysToNew = Math.round((1 - phase) * synodicMonth);
        } else {
            daysToFull = Math.round((1.5 - phase) * synodicMonth);
            daysToNew = Math.round((1 - phase) * synodicMonth);
        }
        
        return {
            lunarAge: Math.round(lunarAge * 10) / 10,
            illumination,
            phaseName,
            emoji,
            phase,
            daysToFull,
            daysToNew,
            isWaxing: phase < 0.5
        };
    },
    
    // ==========================================
    // SUN TIMES (Based on location)
    // ==========================================
    
    updateSunTimes() {
        // Try to get user location, default to a central US location
        const defaultLat = 38.0;
        const defaultLng = -97.0;
        
        if (navigator.geolocation && !this.cache.location) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.cache.location = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    this.calculateAndDisplaySunTimes(this.cache.location.lat, this.cache.location.lng);
                },
                () => {
                    this.calculateAndDisplaySunTimes(defaultLat, defaultLng);
                },
                { timeout: 5000 }
            );
        } else if (this.cache.location) {
            this.calculateAndDisplaySunTimes(this.cache.location.lat, this.cache.location.lng);
        } else {
            this.calculateAndDisplaySunTimes(defaultLat, defaultLng);
        }
    },
    
    calculateAndDisplaySunTimes(lat, lng) {
        const times = this.calculateSunTimes(new Date(), lat, lng);
        
        // Update sunrise/sunset displays
        document.querySelectorAll('[data-sunrise]').forEach(el => {
            el.textContent = times.sunrise;
        });
        
        document.querySelectorAll('[data-sunset]').forEach(el => {
            el.textContent = times.sunset;
        });
        
        document.querySelectorAll('[data-golden-hour]').forEach(el => {
            el.textContent = times.goldenHour;
        });
        
        document.querySelectorAll('[data-blue-hour]').forEach(el => {
            el.textContent = times.blueHour;
        });
        
        return times;
    },
    
    calculateSunTimes(date, lat, lng) {
        // Calculate sun times using solar position algorithms
        const dayOfYear = this.getDayOfYear(date);
        const tzOffset = -date.getTimezoneOffset() / 60;
        
        // Solar declination
        const declination = -23.45 * Math.cos(2 * Math.PI * (dayOfYear + 10) / 365);
        const decRad = declination * Math.PI / 180;
        const latRad = lat * Math.PI / 180;
        
        // Hour angle for sunrise/sunset (when sun is at horizon)
        const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
        
        // Check for polar day/night
        if (cosHourAngle < -1) {
            return { sunrise: 'No sunrise', sunset: 'No sunset', goldenHour: 'N/A', blueHour: 'N/A', dayLength: '24:00' };
        }
        if (cosHourAngle > 1) {
            return { sunrise: 'No sunrise', sunset: 'No sunset', goldenHour: 'N/A', blueHour: 'N/A', dayLength: '0:00' };
        }
        
        const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI;
        
        // Solar noon
        const solarNoon = 12 - lng / 15 + tzOffset;
        
        // Sunrise and sunset
        const sunriseHour = solarNoon - hourAngle / 15;
        const sunsetHour = solarNoon + hourAngle / 15;
        
        // Golden hour (sun 6° above horizon)
        const goldenAngle = Math.acos(Math.min(1, Math.max(-1, 
            (Math.sin(6 * Math.PI / 180) - Math.sin(latRad) * Math.sin(decRad)) / 
            (Math.cos(latRad) * Math.cos(decRad))
        ))) * 180 / Math.PI;
        const goldenHourStart = solarNoon + goldenAngle / 15;
        
        // Blue hour (sun 4° below horizon)
        const blueAngle = Math.acos(Math.min(1, Math.max(-1,
            (Math.sin(-4 * Math.PI / 180) - Math.sin(latRad) * Math.sin(decRad)) / 
            (Math.cos(latRad) * Math.cos(decRad))
        ))) * 180 / Math.PI;
        const blueHourStart = solarNoon + blueAngle / 15;
        
        // Day length
        const dayLengthHours = 2 * hourAngle / 15;
        const dayLengthH = Math.floor(dayLengthHours);
        const dayLengthM = Math.round((dayLengthHours - dayLengthH) * 60);
        
        return {
            sunrise: this.formatTime(sunriseHour),
            sunset: this.formatTime(sunsetHour),
            solarNoon: this.formatTime(solarNoon),
            goldenHour: this.formatTime(goldenHourStart),
            blueHour: this.formatTime(blueHourStart),
            dayLength: `${dayLengthH}h ${dayLengthM}m`,
            sunriseHour,
            sunsetHour
        };
    },
    
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    
    formatTime(decimalHours) {
        // Handle times that wrap around midnight
        let hours = decimalHours;
        if (hours < 0) hours += 24;
        if (hours >= 24) hours -= 24;
        
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        
        return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
    },
    
    // ==========================================
    // EVENT COUNTDOWNS (Dynamic calculation)
    // ==========================================
    
    updateEventCountdowns() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Update all countdown elements
        document.querySelectorAll('.event-countdown[data-date]').forEach(badge => {
            const eventDate = new Date(badge.dataset.date + 'T00:00:00');
            const diffTime = eventDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let text = '';
            let className = 'event-countdown';
            
            if (diffDays < 0) {
                text = 'Passed';
                badge.style.opacity = '0.5';
            } else if (diffDays === 0) {
                text = '🎉 Today!';
                className += ' very-soon';
            } else if (diffDays === 1) {
                text = '⏰ Tomorrow!';
                className += ' very-soon';
            } else if (diffDays <= 7) {
                text = `${diffDays} days away`;
                className += ' very-soon';
            } else if (diffDays <= 30) {
                text = `${diffDays} days away`;
                className += ' soon';
            } else if (diffDays <= 60) {
                const weeks = Math.round(diffDays / 7);
                text = `~${weeks} weeks away`;
                className += ' soon';
            } else {
                const months = Math.round(diffDays / 30);
                text = `~${months} months away`;
            }
            
            badge.textContent = text;
            badge.className = className;
        });
        
        // Update hero "days to next" counter
        const nextMajorEvent = this.getNextMajorEvent();
        const daysToNextEl = document.getElementById('days-to-next');
        if (daysToNextEl && nextMajorEvent) {
            daysToNextEl.textContent = nextMajorEvent.daysAway;
        }
    },
    
    getNextMajorEvent() {
        const now = new Date();
        
        // Dynamic list of upcoming events (will stay current)
        const events = this.generateUpcomingEvents(now);
        
        // Find the next one
        for (const event of events) {
            const eventDate = new Date(event.date);
            if (eventDate > now) {
                const daysAway = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
                return { ...event, daysAway };
            }
        }
        
        return null;
    },
    
    // ==========================================
    // DYNAMIC EVENT GENERATION
    // ==========================================
    
    generateUpcomingEvents(fromDate) {
        const events = [];
        const year = fromDate.getFullYear();
        
        // Add lunar eclipses (predictable pattern)
        events.push(...this.calculateLunarEclipses(year, year + 2));
        
        // Add solar eclipses (predictable pattern)
        events.push(...this.calculateSolarEclipses(year, year + 2));
        
        // Add meteor showers (annual, fixed dates)
        events.push(...this.getMeteorShowers(year));
        events.push(...this.getMeteorShowers(year + 1));
        
        // Add planetary events
        events.push(...this.getPlanetaryEvents(year));
        events.push(...this.getPlanetaryEvents(year + 1));
        
        // Sort by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return events;
    },
    
    getMeteorShowers(year) {
        // Annual meteor showers (dates are approximate peaks)
        return [
            { date: `${year}-01-03`, name: 'Quadrantids Peak', type: 'meteor', rate: '120/hr' },
            { date: `${year}-04-22`, name: 'Lyrids Peak', type: 'meteor', rate: '18/hr' },
            { date: `${year}-05-06`, name: 'Eta Aquariids Peak', type: 'meteor', rate: '50/hr' },
            { date: `${year}-07-30`, name: 'Delta Aquariids Peak', type: 'meteor', rate: '20/hr' },
            { date: `${year}-08-12`, name: 'Perseids Peak', type: 'meteor', rate: '100/hr' },
            { date: `${year}-10-21`, name: 'Orionids Peak', type: 'meteor', rate: '20/hr' },
            { date: `${year}-11-17`, name: 'Leonids Peak', type: 'meteor', rate: '15/hr' },
            { date: `${year}-12-14`, name: 'Geminids Peak', type: 'meteor', rate: '150/hr' },
            { date: `${year}-12-22`, name: 'Ursids Peak', type: 'meteor', rate: '10/hr' }
        ];
    },
    
    calculateLunarEclipses(startYear, endYear) {
        // Lunar eclipses for 2024-2030 (pre-calculated, accurate)
        const eclipses = [
            { date: '2024-03-25', name: 'Penumbral Lunar Eclipse', type: 'eclipse', visibility: 'Americas' },
            { date: '2024-09-18', name: 'Partial Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2025-03-14', name: 'Total Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2025-09-07', name: 'Total Lunar Eclipse', type: 'eclipse', visibility: 'Europe, Africa, Asia, Australia' },
            { date: '2026-03-03', name: 'Total Lunar Eclipse', type: 'eclipse', visibility: 'Asia, Australia, Pacific, Americas' },
            { date: '2026-08-28', name: 'Partial Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2027-02-20', name: 'Penumbral Lunar Eclipse', type: 'eclipse', visibility: 'Americas' },
            { date: '2027-07-18', name: 'Penumbral Lunar Eclipse', type: 'eclipse', visibility: 'Asia, Australia, Pacific' },
            { date: '2027-08-17', name: 'Penumbral Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2028-01-12', name: 'Partial Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2028-07-06', name: 'Partial Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2028-12-31', name: 'Total Lunar Eclipse', type: 'eclipse', visibility: 'Europe, Africa, Asia, Australia' },
            { date: '2029-06-26', name: 'Total Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2029-12-20', name: 'Total Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' },
            { date: '2030-06-15', name: 'Partial Lunar Eclipse', type: 'eclipse', visibility: 'Americas, Europe, Africa' }
        ];
        
        return eclipses.filter(e => {
            const year = parseInt(e.date.substring(0, 4));
            return year >= startYear && year <= endYear;
        });
    },
    
    calculateSolarEclipses(startYear, endYear) {
        // Solar eclipses for 2024-2030 (pre-calculated, accurate)
        const eclipses = [
            { date: '2024-04-08', name: 'Total Solar Eclipse', type: 'eclipse', visibility: 'Mexico, USA, Canada' },
            { date: '2024-10-02', name: 'Annular Solar Eclipse', type: 'eclipse', visibility: 'South America' },
            { date: '2025-03-29', name: 'Partial Solar Eclipse', type: 'eclipse', visibility: 'Europe, North Africa, Russia' },
            { date: '2025-09-21', name: 'Partial Solar Eclipse', type: 'eclipse', visibility: 'Antarctica, New Zealand, Australia' },
            { date: '2026-02-17', name: 'Annular Solar Eclipse', type: 'eclipse', visibility: 'Antarctica' },
            { date: '2026-08-12', name: 'Total Solar Eclipse', type: 'eclipse', visibility: 'Greenland, Iceland, Spain' },
            { date: '2027-02-06', name: 'Annular Solar Eclipse', type: 'eclipse', visibility: 'South America, Antarctica' },
            { date: '2027-08-02', name: 'Total Solar Eclipse', type: 'eclipse', visibility: 'Morocco, Spain, Algeria, Libya, Egypt, Saudi Arabia' },
            { date: '2028-01-26', name: 'Annular Solar Eclipse', type: 'eclipse', visibility: 'South America' },
            { date: '2028-07-22', name: 'Total Solar Eclipse', type: 'eclipse', visibility: 'Australia, New Zealand' },
            { date: '2029-01-14', name: 'Partial Solar Eclipse', type: 'eclipse', visibility: 'North America' },
            { date: '2029-06-12', name: 'Partial Solar Eclipse', type: 'eclipse', visibility: 'Arctic, Scandinavia, Russia' },
            { date: '2029-07-11', name: 'Partial Solar Eclipse', type: 'eclipse', visibility: 'South America' },
            { date: '2029-12-05', name: 'Partial Solar Eclipse', type: 'eclipse', visibility: 'Antarctica, South America' },
            { date: '2030-06-01', name: 'Annular Solar Eclipse', type: 'eclipse', visibility: 'North Africa, Europe, Russia' },
            { date: '2030-11-25', name: 'Total Solar Eclipse', type: 'eclipse', visibility: 'South Africa, Australia' }
        ];
        
        return eclipses.filter(e => {
            const year = parseInt(e.date.substring(0, 4));
            return year >= startYear && year <= endYear;
        });
    },
    
    getPlanetaryEvents(year) {
        // Planetary conjunctions and oppositions (approximate dates)
        // These shift slightly each year but follow predictable patterns
        const events = [];
        
        // Jupiter opposition (roughly every 13 months)
        // 2024: Dec 7, 2026: Jan 10, 2027: Feb 11
        if (year === 2024) events.push({ date: '2024-12-07', name: 'Jupiter at Opposition', type: 'planet', desc: 'Best time to view Jupiter' });
        if (year === 2026) events.push({ date: '2026-01-10', name: 'Jupiter at Opposition', type: 'planet', desc: 'Best time to view Jupiter' });
        if (year === 2027) events.push({ date: '2027-02-11', name: 'Jupiter at Opposition', type: 'planet', desc: 'Best time to view Jupiter' });
        if (year === 2028) events.push({ date: '2028-03-12', name: 'Jupiter at Opposition', type: 'planet', desc: 'Best time to view Jupiter' });
        if (year === 2029) events.push({ date: '2029-04-12', name: 'Jupiter at Opposition', type: 'planet', desc: 'Best time to view Jupiter' });
        if (year === 2030) events.push({ date: '2030-05-13', name: 'Jupiter at Opposition', type: 'planet', desc: 'Best time to view Jupiter' });
        
        // Saturn opposition (roughly every 12.5 months)
        if (year === 2024) events.push({ date: '2024-09-08', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        if (year === 2025) events.push({ date: '2025-09-21', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        if (year === 2026) events.push({ date: '2026-10-04', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        if (year === 2027) events.push({ date: '2027-10-18', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        if (year === 2028) events.push({ date: '2028-10-30', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        if (year === 2029) events.push({ date: '2029-11-13', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        if (year === 2030) events.push({ date: '2030-11-27', name: 'Saturn at Opposition', type: 'planet', desc: 'Best time to view Saturn' });
        
        // Mars opposition (roughly every 26 months)
        if (year === 2025) events.push({ date: '2025-01-16', name: 'Mars at Opposition', type: 'planet', desc: 'Best time to view Mars' });
        if (year === 2027) events.push({ date: '2027-02-19', name: 'Mars at Opposition', type: 'planet', desc: 'Best time to view Mars' });
        if (year === 2029) events.push({ date: '2029-03-25', name: 'Mars at Opposition', type: 'planet', desc: 'Best time to view Mars' });
        
        return events;
    },
    
    // ==========================================
    // NASA APOD (Astronomy Picture of the Day)
    // ==========================================
    
    async updateAPOD() {
        try {
            // Check cache first
            const today = new Date().toISOString().split('T')[0];
            if (this.cache.apod && this.cache.apod.date === today) {
                this.displayAPOD(this.cache.apod);
                return;
            }
            
            // Fetch from NASA API
            const response = await fetch(
                `https://api.nasa.gov/planetary/apod?api_key=${this.NASA_API_KEY}`
            );
            
            if (!response.ok) throw new Error('APOD fetch failed');
            
            const data = await response.json();
            this.cache.apod = data;
            this.displayAPOD(data);
            
        } catch (error) {
            console.log('APOD fetch error, using fallback:', error.message);
            // Keep existing content on error
        }
    },
    
    displayAPOD(data) {
        const imageEl = document.getElementById('apod-image');
        const titleEl = document.getElementById('apod-title');
        const descEl = document.getElementById('apod-desc');
        
        if (data.media_type === 'image' && imageEl) {
            imageEl.src = data.url;
            imageEl.alt = data.title;
        }
        
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) {
            // Truncate long descriptions
            const maxLength = 300;
            let desc = data.explanation;
            if (desc.length > maxLength) {
                desc = desc.substring(0, maxLength).trim() + '...';
            }
            descEl.textContent = desc;
        }
    },
    
    // ==========================================
    // DYNAMIC CONTENT UPDATES
    // ==========================================
    
    updateDynamicContent() {
        // Update year references
        const currentYear = new Date().getFullYear();
        document.querySelectorAll('[data-current-year]').forEach(el => {
            el.textContent = currentYear;
        });
        
        // Update "tonight's sky" recommendations based on actual conditions
        this.updateTonightRecommendations();
        
        // Update viewing conditions
        this.updateViewingConditions();
    },
    
    updateTonightRecommendations() {
        const now = new Date();
        const hour = now.getHours();
        const moonData = this.calculateMoonPhase(now);
        
        // Determine what's good to observe tonight
        const recommendations = [];
        
        // Moon observation recommendation
        if (moonData.illumination > 20 && moonData.illumination < 80) {
            recommendations.push({
                icon: moonData.emoji,
                title: `${moonData.phaseName} Moon`,
                desc: `${moonData.illumination}% illuminated - great for crater observation`
            });
        }
        
        // Dark sky recommendation
        if (moonData.illumination < 30) {
            recommendations.push({
                icon: '🌌',
                title: 'Deep Sky Night',
                desc: 'Low moon illumination - perfect for galaxies and nebulae'
            });
        }
        
        // Planet recommendations (simplified - visible planets vary)
        const month = now.getMonth();
        if (month >= 9 || month <= 2) { // Fall/Winter
            recommendations.push({
                icon: '🪐',
                title: 'Jupiter Visible',
                desc: 'Look east after sunset for the brightest planet'
            });
        }
        
        // Store for use by other components
        this.cache.recommendations = recommendations;
        
        // Update any recommendation displays
        this.renderRecommendations(recommendations);
    },
    
    renderRecommendations(recommendations) {
        const container = document.getElementById('tonight-recommendations');
        if (!container || recommendations.length === 0) return;
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item" style="display: flex; gap: 1rem; padding: 1rem; background: var(--bg-hover); border-radius: 12px; margin-bottom: 0.5rem;">
                <span style="font-size: 1.5rem;">${rec.icon}</span>
                <div>
                    <div style="font-weight: 500;">${rec.title}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${rec.desc}</div>
                </div>
            </div>
        `).join('');
    },
    
    updateViewingConditions() {
        const moonData = this.calculateMoonPhase(new Date());
        
        // Calculate darkness rating
        let darkness;
        if (moonData.illumination < 10) darkness = 'Excellent';
        else if (moonData.illumination < 30) darkness = 'Very Good';
        else if (moonData.illumination < 50) darkness = 'Good';
        else if (moonData.illumination < 75) darkness = 'Fair';
        else darkness = 'Poor';
        
        // Update displays
        document.querySelectorAll('[data-sky-darkness]').forEach(el => {
            el.textContent = darkness;
        });
        
        document.querySelectorAll('[data-viewing-rating]').forEach(el => {
            const rating = moonData.illumination < 50 ? '⭐⭐⭐⭐⭐'.slice(0, Math.ceil((100 - moonData.illumination) / 20) * 2) : '⭐⭐';
            el.textContent = rating;
        });
    }
};

// ==========================================
// SPACE MISSION TRACKER
// Tracks upcoming and active missions
// ==========================================

const MissionTracker = {
    // Known missions with launch dates (updated through 2030)
    missions: [
        // 2024
        { name: 'Europa Clipper', date: '2024-10-14', agency: 'NASA', target: 'Jupiter/Europa', status: 'launched' },
        
        // 2025
        { name: 'VIPER Lunar Rover', date: '2025-09-01', agency: 'NASA', target: 'Moon', status: 'planned' },
        
        // 2026
        { name: 'Artemis II', date: '2026-02-06', agency: 'NASA', target: 'Moon', status: 'planned', highlight: true },
        { name: 'Dragonfly', date: '2026-07-01', agency: 'NASA', target: 'Titan', status: 'planned' },
        { name: 'Nancy Grace Roman', date: '2026-10-01', agency: 'NASA', target: 'Space Telescope', status: 'planned' },
        
        // 2027
        { name: 'Artemis III', date: '2027-09-01', agency: 'NASA', target: 'Moon Landing', status: 'planned', highlight: true },
        { name: 'JUICE (arrival)', date: '2031-07-01', agency: 'ESA', target: 'Jupiter', status: 'in transit' },
        
        // 2028
        { name: 'Mars Sample Return', date: '2028-01-01', agency: 'NASA/ESA', target: 'Mars', status: 'planned' },
        
        // 2029
        { name: 'Apophis Encounter', date: '2029-04-13', agency: 'Multiple', target: 'Asteroid', status: 'planning', highlight: true },
        
        // 2030+
        { name: 'Artemis IV', date: '2030-01-01', agency: 'NASA', target: 'Lunar Gateway', status: 'planned' }
    ],
    
    getUpcoming(count = 5) {
        const now = new Date();
        return this.missions
            .filter(m => new Date(m.date) > now && m.status !== 'launched')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, count);
    },
    
    getNextHighlight() {
        const now = new Date();
        return this.missions.find(m => 
            new Date(m.date) > now && m.highlight && m.status !== 'launched'
        );
    }
};

// ==========================================
// INITIALIZE
// ==========================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AutoUpdate.init());
} else {
    AutoUpdate.init();
}

// Export for use by other modules
window.AutoUpdate = AutoUpdate;
window.MissionTracker = MissionTracker;
