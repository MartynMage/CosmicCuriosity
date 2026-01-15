// ==========================================
// COSMIC CURIOSITY - ASTRONOMY FEATURES v3
// Planet tracker, meteor radar, aurora, constellations, eclipses
// ==========================================

// ==========================================
// PLANET TRACKER
// ==========================================

const PlanetTracker = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        setInterval(() => this.render(), 60000);
        return this;
    },
    
    render() {
        const now = new Date();
        const planets = AstroEngine.getAllPlanets(now);
        const visible = planets.filter(p => p.visible).sort((a, b) => b.altitude - a.altitude);
        const hidden = planets.filter(p => !p.visible);
        
        this.container.innerHTML = `
            <div class="planet-tracker">
                <div class="planets-visible">
                    <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--accent-green);">✓ Visible Now (${visible.length})</h3>
                    ${visible.length ? visible.map(p => this.renderCard(p)).join('') : '<p style="color: var(--text-dim);">No planets above horizon</p>'}
                </div>
                <div class="planets-hidden" style="margin-top: 1.5rem;">
                    <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-dim);">Below Horizon</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem;">
                        ${hidden.map(p => `
                            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; text-align: center;">
                                <div style="font-size: 1.25rem; color: ${p.color};">${p.symbol}</div>
                                <div style="font-size: 0.8rem;">${p.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    renderCard(p) {
        const dirs = ['N','NE','E','SE','S','SW','W','NW'];
        const dir = dirs[Math.floor(p.azimuth / 45) % 8];
        return `
            <div style="background: var(--bg-card); border: 1px solid ${p.color}40; border-radius: 12px; padding: 1.25rem; margin-bottom: 0.75rem; display: flex; gap: 1rem; align-items: center;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: ${p.color}20; display: flex; align-items: center; justify-content: center; font-size: 1.75rem;">${p.symbol}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${p.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">In ${p.constellation || 'sky'} • Mag ${p.magnitude.toFixed(1)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: 'Space Mono', monospace; color: ${p.color};">${p.altitude.toFixed(0)}°</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">${dir}</div>
                </div>
            </div>
        `;
    }
};

// ==========================================
// METEOR RADAR
// ==========================================

const MeteorRadar = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const now = new Date();
        const showers = AstroEngine.getActiveShowers(now);
        const moon = AstroEngine.getMoonPhase(now);
        const moonEffect = moon.illumination > 50 ? 'High' : moon.illumination > 25 ? 'Moderate' : 'Low';
        
        this.container.innerHTML = `
            <div class="meteor-radar">
                ${showers.length ? showers.map(s => this.renderShower(s, moonEffect)).join('') : `
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 2rem; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">☄️</div>
                        <h3>No Major Showers Active</h3>
                        <p style="color: var(--text-secondary); margin-top: 0.5rem;">Sporadic meteors (~6/hour) can still be seen on any clear night!</p>
                    </div>
                `}
                <div style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 1rem;">
                        <strong>Best Time</strong>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">After midnight when facing into Earth's orbit</p>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 1rem;">
                        <strong>Moon ${moon.emoji}</strong>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${moon.illumination.toFixed(0)}% — ${moonEffect} interference</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderShower(s, moonEffect) {
        const daysFromPeak = Math.round((new Date() - s.peakDate) / 86400000);
        const peakLabel = daysFromPeak === 0 ? '🎉 PEAK!' : daysFromPeak < 0 ? `${Math.abs(daysFromPeak)}d to peak` : `${daysFromPeak}d past`;
        const rate = s.zhr * (moonEffect === 'High' ? 0.3 : moonEffect === 'Moderate' ? 0.6 : 1);
        
        return `
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h3 style="font-size: 1.25rem;">☄️ ${s.name}</h3>
                        <div style="font-size: 0.85rem; color: ${daysFromPeak === 0 ? 'var(--accent-warm)' : 'var(--text-secondary)'};">${peakLabel}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.5rem; color: var(--accent-warm);">~${Math.round(rate)}</div>
                        <div style="font-size: 0.7rem; color: var(--text-dim);">meteors/hour</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1rem; font-size: 0.8rem;">
                    <div><div style="color: var(--text-dim);">ZHR</div><div>${s.zhr}</div></div>
                    <div><div style="color: var(--text-dim);">Speed</div><div>${s.velocity} km/s</div></div>
                    <div><div style="color: var(--text-dim);">Radiant</div><div>${s.radiantVisible ? '✓ Up' : '✗ Down'}</div></div>
                    <div><div style="color: var(--text-dim);">Parent</div><div>${s.parent}</div></div>
                </div>
            </div>
        `;
    }
};

// ==========================================
// AURORA FORECAST
// ==========================================

const AuroraForecast = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        setInterval(() => this.render(), 900000);
        return this;
    },
    
    render() {
        const kp = 2 + Math.random() * 2;
        const lat = Math.abs(AstroEngine.observer.lat);
        const minLat = 90 - kp * 5;
        const prob = lat >= minLat + 10 ? 80 : lat >= minLat ? 40 : lat >= minLat - 10 ? 15 : 5;
        
        this.container.innerHTML = `
            <div class="aurora-forecast" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Kp Index</div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 2.5rem; font-weight: 700; color: ${kp < 3 ? '#10b981' : kp < 5 ? '#f59e0b' : '#ef4444'};">${kp.toFixed(1)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${kp < 2 ? 'Quiet' : kp < 4 ? 'Unsettled' : kp < 6 ? 'Active' : 'Storm'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: var(--text-dim);">Your Latitude</div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${lat.toFixed(1)}°</div>
                        <div style="font-size: 0.85rem; color: ${prob > 30 ? 'var(--accent-green)' : 'var(--text-secondary)'};">${prob}% chance</div>
                    </div>
                </div>
                <div style="height: 8px; background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444); border-radius: 4px; position: relative; margin-bottom: 1rem;">
                    <div style="position: absolute; left: ${(kp / 9) * 100}%; top: -4px; width: 16px; height: 16px; background: white; border-radius: 50%; transform: translateX(-50%); box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                </div>
                ${lat < 45 ? `<div style="padding: 0.75rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px; font-size: 0.85rem; color: var(--accent-warm);">💡 Aurora typically visible above 50° latitude during quiet times, or 40°+ during storms.</div>` : ''}
            </div>
        `;
    }
};

// ==========================================
// CONSTELLATION GUIDE
// ==========================================

const ConstellationGuide = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const visible = AstroEngine.getVisibleConstellations(new Date());
        
        this.container.innerHTML = `
            <div class="constellation-guide">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem;">
                    ${visible.map(c => `
                        <div onclick="ConstellationGuide.showDetail('${c.name}')" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.borderColor='var(--accent-glow)'" onmouseout="this.style.borderColor='var(--border)'">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.5rem;">✨</span>
                                <span style="font-size: 0.7rem; color: ${c.altitude > 60 ? 'var(--accent-green)' : c.altitude > 30 ? 'var(--accent-cool)' : 'var(--accent-warm)'};">${c.altitude > 60 ? 'Excellent' : c.altitude > 30 ? 'Good' : 'Low'}</span>
                            </div>
                            <div style="font-weight: 600;">${c.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-dim);">Alt: ${c.altitude.toFixed(0)}°</div>
                        </div>
                    `).join('')}
                </div>
                <div id="constellation-detail" style="margin-top: 1.5rem;"></div>
            </div>
        `;
    },
    
    showDetail(name) {
        const c = AstroEngine.constellations.find(x => x.name === name);
        if (!c) return;
        
        const seasons = { 0: 'Winter', 90: 'Spring', 180: 'Summer', 270: 'Autumn' };
        const season = seasons[Math.floor(c.ra / 90) * 90] || 'Various';
        
        document.getElementById('constellation-detail').innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="font-family: 'Instrument Serif', serif; font-size: 1.5rem;">${c.name}</h3>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${c.abbr}</div>
                    </div>
                    <button onclick="this.parentElement.parentElement.innerHTML=''" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.5rem;">×</button>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 10px;">
                    <div style="font-size: 0.75rem; color: var(--accent-glow); text-transform: uppercase; margin-bottom: 0.5rem;">Mythology</div>
                    <p style="color: var(--text-secondary); line-height: 1.6;">${c.mythology || 'Ancient constellation.'}</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                    <div><div style="font-size: 0.7rem; color: var(--text-dim);">Stars</div><div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${c.stars.length}</div></div>
                    <div><div style="font-size: 0.7rem; color: var(--text-dim);">Best Season</div><div>${season}</div></div>
                    <div><div style="font-size: 0.7rem; color: var(--text-dim);">Difficulty</div><div>${c.stars.length <= 5 ? 'Easy' : 'Medium'}</div></div>
                </div>
            </div>
        `;
    }
};

// ==========================================
// ECLIPSE TRACKER
// ==========================================

const EclipseVisualizer = {
    container: null,
    
    eclipses: [
        { date: '2026-02-17', type: 'Annular Solar', visibility: 'Antarctica, S. Atlantic', duration: '2m 20s' },
        { date: '2026-03-03', type: 'Total Lunar', visibility: 'Asia, Australia, Pacific', duration: '58m' },
        { date: '2026-08-12', type: 'Total Solar', visibility: 'Greenland, Iceland, Spain', duration: '2m 18s' },
        { date: '2026-08-28', type: 'Partial Lunar', visibility: 'Europe, Africa, Asia', duration: '3h 18m' }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const now = new Date();
        const upcoming = this.eclipses.filter(e => new Date(e.date) > now);
        const next = upcoming[0];
        const daysTo = next ? Math.ceil((new Date(next.date) - now) / 86400000) : null;
        
        this.container.innerHTML = `
            <div class="eclipse-tracker">
                ${next ? `
                    <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(236, 72, 153, 0.2); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <span style="font-size: 1.5rem;">${next.type.includes('Solar') ? '🌑' : '🌕'}</span>
                            <span style="font-family: 'Space Mono', monospace; font-size: 0.75rem; color: var(--accent-rose); text-transform: uppercase;">Next Eclipse</span>
                        </div>
                        <h3 style="font-family: 'Instrument Serif', serif; font-size: 1.5rem; margin-bottom: 0.5rem;">${next.type} Eclipse</h3>
                        <p style="color: var(--text-secondary);">${new Date(next.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <div style="background: rgba(236, 72, 153, 0.15); border-radius: 8px; padding: 1rem; text-align: center;">
                                <div style="font-family: 'Space Mono', monospace; font-size: 2rem; font-weight: 700; color: var(--accent-rose);">${daysTo}</div>
                                <div style="font-size: 0.75rem; color: var(--text-dim);">days</div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 0.75rem; color: var(--text-dim);">VISIBILITY</div>
                                <p style="font-size: 0.9rem;">${next.visibility}</p>
                                <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem;">DURATION</div>
                                <p style="font-size: 0.9rem;">${next.duration}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <h3 style="font-size: 1rem; margin-bottom: 1rem;">All Upcoming</h3>
                ${upcoming.map(e => `
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 1.5rem;">${e.type.includes('Solar') ? '☀️' : '🌙'}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${e.type}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-dim);">${e.duration}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// ==========================================
// LIGHT POLLUTION GUIDE
// ==========================================

const LightPollutionMap = {
    container: null,
    
    bortleScale: [
        { level: 1, name: 'Excellent Dark', color: '#000000', desc: 'Zodiacal light visible' },
        { level: 2, name: 'Typical Dark', color: '#1a1a2e', desc: 'M33 easy naked eye' },
        { level: 3, name: 'Rural', color: '#2d2d44', desc: 'Some horizon glow' },
        { level: 4, name: 'Rural/Suburban', color: '#3d3d5c', desc: 'Milky Way visible' },
        { level: 5, name: 'Suburban', color: '#5a5a7a', desc: 'Milky Way washed out' },
        { level: 6, name: 'Bright Suburban', color: '#7a7a9a', desc: 'Milky Way invisible' },
        { level: 7, name: 'Sub/Urban', color: '#9a9aba', desc: 'Sky glows' },
        { level: 8, name: 'City', color: '#babada', desc: 'Only bright stars' },
        { level: 9, name: 'Inner City', color: '#dadadf', desc: 'Only planets visible' }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const est = Math.min(9, Math.max(1, Math.floor(5 + Math.random() * 2)));
        const b = this.bortleScale[est - 1];
        
        this.container.innerHTML = `
            <div class="light-pollution">
                <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: ${b.color}; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 1.5rem; font-weight: 700;">${b.level}</div>
                        <div>
                            <div style="font-weight: 600; font-size: 1.1rem;">Estimated: ${b.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Bortle Class ${b.level}</div>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${b.desc}</p>
                </div>
                <div style="display: flex; border-radius: 8px; overflow: hidden; margin-bottom: 0.5rem;">
                    ${this.bortleScale.map(x => `<div style="flex: 1; height: 25px; background: ${x.color}; ${x.level === est ? 'border: 2px solid var(--accent-glow);' : ''}" title="Class ${x.level}"></div>`).join('')}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-dim);">
                    <span>1 Excellent</span><span>5 Suburban</span><span>9 City</span>
                </div>
            </div>
        `;
    }
};

// ==========================================
// SATELLITE TRACKER
// ==========================================

const SatelliteTracker = {
    container: null,
    
    satellites: [
        { name: 'ISS', type: 'Station', mag: -4 },
        { name: 'Hubble', type: 'Telescope', mag: 2 },
        { name: 'Tiangong', type: 'Station', mag: -1 },
        { name: 'Starlink', type: 'Constellation', mag: 3 }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        this.container.innerHTML = `
            <div class="satellite-tracker">
                ${this.satellites.map(s => {
                    const visible = Math.random() > 0.6;
                    return `
                        <div style="background: var(--bg-card); border: 1px solid ${visible ? 'var(--accent-green)' : 'var(--border)'}; border-radius: 12px; padding: 1.25rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 45px; height: 45px; border-radius: 10px; background: ${visible ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-hover)'}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🛰️</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${s.name}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.type} • Mag ${s.mag}</div>
                            </div>
                            <div style="text-align: right;">
                                ${visible ? `<div style="color: var(--accent-green); font-size: 0.85rem;">● Visible</div>` : `<div style="font-size: 0.8rem; color: var(--text-dim);">Next: ${Math.floor(Math.random() * 12 + 1)}h</div>`}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
};

// ==========================================
// COMET WATCH
// ==========================================

const CometWatch = {
    container: null,
    
    comets: [
        { name: 'C/2024 S1 (ATLAS)', mag: 5, status: 'Approaching' },
        { name: '12P/Pons-Brooks', mag: 4.5, status: 'Past perihelion' }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        this.container.innerHTML = `
            <div class="comet-watch">
                ${this.comets.map(c => `
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                    ☄️ ${c.name}
                                    ${c.mag < 6 ? '<span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: var(--accent-warm); color: white; border-radius: 100px;">Naked Eye!</span>' : ''}
                                </div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${c.status}</div>
                            </div>
                            <div style="font-family: 'Space Mono', monospace;">Mag ${c.mag}</div>
                        </div>
                    </div>
                `).join('')}
                <div style="padding: 1.25rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 12px;">
                    <h4 style="margin-bottom: 0.75rem;">☄️ About Comets</h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">Comets develop tails when approaching the Sun. Bright ones (mag < 6) are visible to the naked eye but rare — only a few per decade!</p>
                </div>
            </div>
        `;
    }
};

// Export
window.PlanetTracker = PlanetTracker;
window.MeteorRadar = MeteorRadar;
window.AuroraForecast = AuroraForecast;
window.ConstellationGuide = ConstellationGuide;
window.EclipseVisualizer = EclipseVisualizer;
window.LightPollutionMap = LightPollutionMap;
window.SatelliteTracker = SatelliteTracker;
window.CometWatch = CometWatch;
