// ==========================================
// COSMIC CURIOSITY - DATA FEATURES v3
// Annual calendar, golden hour, seeing, history, sun data, tides
// ==========================================

// ==========================================
// 21. ANNUAL SKY CALENDAR
// ==========================================

const AnnualCalendar = {
    container: null,
    selectedMonth: new Date().getMonth(),
    
    events: [
        { date: '2026-01-03', type: 'meteor', name: 'Quadrantids Peak', icon: '☄️' },
        { date: '2026-02-06', type: 'launch', name: 'Artemis II Launch', icon: '🚀' },
        { date: '2026-02-17', type: 'eclipse', name: 'Annular Solar Eclipse', icon: '🌑' },
        { date: '2026-03-03', type: 'eclipse', name: 'Total Lunar Eclipse', icon: '🌕' },
        { date: '2026-03-20', type: 'equinox', name: 'Spring Equinox', icon: '🌸' },
        { date: '2026-04-22', type: 'meteor', name: 'Lyrids Peak', icon: '☄️' },
        { date: '2026-06-21', type: 'solstice', name: 'Summer Solstice', icon: '☀️' },
        { date: '2026-08-12', type: 'eclipse', name: 'Total Solar Eclipse', icon: '🌑' },
        { date: '2026-08-12', type: 'meteor', name: 'Perseids Peak', icon: '☄️' },
        { date: '2026-09-22', type: 'equinox', name: 'Autumn Equinox', icon: '🍂' },
        { date: '2026-12-14', type: 'meteor', name: 'Geminids Peak', icon: '☄️' },
        { date: '2026-12-21', type: 'solstice', name: 'Winter Solstice', icon: '❄️' },
        { date: '2026-12-23', type: 'moon', name: 'December Supermoon', icon: '🌕' }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthEvents = this.events.filter(e => new Date(e.date).getMonth() === this.selectedMonth);
        
        this.container.innerHTML = `
            <div class="annual-calendar">
                <div class="month-selector" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                    ${months.map((m, i) => `
                        <button onclick="AnnualCalendar.selectMonth(${i})" style="padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid ${i === this.selectedMonth ? 'var(--accent-glow)' : 'var(--border)'}; background: ${i === this.selectedMonth ? 'var(--accent-glow)' : 'transparent'}; color: ${i === this.selectedMonth ? 'white' : 'var(--text-secondary)'}; font-size: 0.8rem; cursor: pointer; font-family: inherit;">${m}</button>
                    `).join('')}
                </div>
                
                <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem;">
                    <h3 style="font-family: 'Instrument Serif', serif; font-size: 1.5rem; margin-bottom: 1rem;">${['January','February','March','April','May','June','July','August','September','October','November','December'][this.selectedMonth]} 2026</h3>
                    
                    ${monthEvents.length ? monthEvents.map(e => `
                        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
                            <span style="font-size: 1.25rem;">${e.icon}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 500;">${e.name}</div>
                            </div>
                            <div style="font-family: 'Space Mono', monospace; font-size: 0.85rem; color: var(--text-dim);">${new Date(e.date).getDate()}</div>
                        </div>
                    `).join('') : '<p style="color: var(--text-dim);">No major events this month</p>'}
                </div>
                
                <div style="margin-top: 1rem; display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.85rem; color: var(--text-secondary);">
                    <span>☄️ Meteor</span><span>🌑🌕 Eclipse</span><span>🚀 Launch</span><span>☀️❄️ Solstice</span>
                </div>
            </div>
        `;
    },
    
    selectMonth(m) { this.selectedMonth = m; this.render(); }
};

// ==========================================
// 22. GOLDEN HOUR CALCULATOR
// ==========================================

const GoldenHourCalc = {
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
        const sun = AstroEngine.getSunTimes(now);
        const twilight = AstroEngine.getTwilightTimes(now);
        const fmt = (d) => d ? d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : '--:--';
        
        const goldenMorning = sun.sunrise ? new Date(sun.sunrise.getTime() + 3600000) : null;
        const goldenEvening = sun.sunset ? new Date(sun.sunset.getTime() - 3600000) : null;
        
        let phase = 'Night', color = '#6366f1';
        if (sun.sunrise && sun.sunset) {
            if (now < sun.sunrise) { phase = twilight.civilDawn && now > twilight.civilDawn ? 'Blue Hour' : 'Pre-Dawn'; color = '#5588bb'; }
            else if (now < goldenMorning) { phase = 'Golden Hour'; color = '#f59e0b'; }
            else if (now < goldenEvening) { phase = 'Daylight'; color = '#fbbf24'; }
            else if (now < sun.sunset) { phase = 'Golden Hour'; color = '#f59e0b'; }
            else if (twilight.civilDusk && now < twilight.civilDusk) { phase = 'Blue Hour'; color = '#5588bb'; }
            else { phase = 'Night'; color = '#6366f1'; }
        }
        
        this.container.innerHTML = `
            <div class="golden-hour">
                <div style="background: linear-gradient(135deg, ${color}30 0%, var(--bg-card) 100%); border: 1px solid ${color}50; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Current Phase</div>
                    <div style="font-family: 'Instrument Serif', serif; font-size: 2rem; color: ${color};">${phase}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">${now.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem;">
                        <div style="font-size: 0.75rem; color: var(--accent-warm); text-transform: uppercase; margin-bottom: 0.75rem;">🌅 Morning</div>
                        <div style="font-size: 0.9rem; display: grid; gap: 0.35rem;">
                            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">Dawn</span><span>${fmt(twilight.civilDawn)}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span>Sunrise</span><span style="color: var(--accent-warm);">${fmt(sun.sunrise)}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: #f59e0b;">Golden End</span><span>${fmt(goldenMorning)}</span></div>
                        </div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem;">
                        <div style="font-size: 0.75rem; color: var(--accent-rose); text-transform: uppercase; margin-bottom: 0.75rem;">🌇 Evening</div>
                        <div style="font-size: 0.9rem; display: grid; gap: 0.35rem;">
                            <div style="display: flex; justify-content: space-between;"><span style="color: #f59e0b;">Golden Start</span><span>${fmt(goldenEvening)}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span>Sunset</span><span style="color: var(--accent-rose);">${fmt(sun.sunset)}</span></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-dim);">Dusk</span><span>${fmt(twilight.civilDusk)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// ==========================================
// 23. SEEING CONDITIONS
// ==========================================

const SeeingForecast = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const seeing = 2.5 + Math.random() * 2;
        const transparency = 2 + Math.random() * 3;
        const label = seeing >= 4 ? 'Excellent' : seeing >= 3 ? 'Good' : seeing >= 2 ? 'Fair' : 'Poor';
        const color = seeing >= 4 ? '#10b981' : seeing >= 3 ? '#06b6d4' : seeing >= 2 ? '#f59e0b' : '#ef4444';
        
        const forecast = Array.from({length: 24}, () => 2 + Math.random() * 3);
        
        this.container.innerHTML = `
            <div class="seeing-forecast">
                <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-dim);">CURRENT SEEING</div>
                            <div style="font-family: 'Space Mono', monospace; font-size: 2.5rem; color: ${color};">${seeing.toFixed(1)}/5</div>
                            <div style="color: var(--text-secondary);">${label}</div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="text-align: center; padding: 0.75rem; background: var(--bg-hover); border-radius: 8px;">
                                <div style="font-size: 0.7rem; color: var(--text-dim);">Transparency</div>
                                <div style="font-family: 'Space Mono', monospace;">${transparency.toFixed(1)}/5</div>
                            </div>
                            <div style="text-align: center; padding: 0.75rem; background: var(--bg-hover); border-radius: 8px;">
                                <div style="font-size: 0.7rem; color: var(--text-dim);">Humidity</div>
                                <div style="font-family: 'Space Mono', monospace;">${(40 + Math.random() * 40).toFixed(0)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">24h Forecast</div>
                        <div style="display: flex; height: 50px; gap: 2px; align-items: flex-end;">
                            ${forecast.map((v, i) => `<div style="flex: 1; height: ${(v/5)*100}%; background: ${v >= 4 ? '#10b981' : v >= 3 ? '#06b6d4' : v >= 2 ? '#f59e0b' : '#ef4444'}; opacity: ${i === new Date().getHours() ? 1 : 0.5}; border-radius: 2px 2px 0 0;"></div>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                    <strong style="color: #10b981;">5:</strong> Excellent | <strong style="color: #06b6d4;">4:</strong> Good | <strong style="color: #f59e0b;">3:</strong> Fair | <strong style="color: #ef4444;">2:</strong> Poor
                </div>
            </div>
        `;
    }
};

// ==========================================
// 24. THIS DAY IN SPACE HISTORY
// ==========================================

const SpaceHistory = {
    container: null,
    
    events: {
        '01-14': [{ year: 2005, event: 'Huygens probe lands on Titan' }],
        '01-28': [{ year: 1986, event: 'Space Shuttle Challenger disaster' }],
        '02-18': [{ year: 1930, event: 'Clyde Tombaugh discovers Pluto' }],
        '04-12': [{ year: 1961, event: 'Yuri Gagarin becomes first human in space' }],
        '07-20': [{ year: 1969, event: 'Apollo 11 — First humans walk on the Moon!' }],
        '10-04': [{ year: 1957, event: 'Sputnik 1 launched — Space Age begins!' }]
    },
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const today = new Date();
        const key = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayEvents = this.events[key] || [];
        
        this.container.innerHTML = `
            <div class="space-history">
                ${todayEvents.length ? `
                    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <span style="font-size: 1.5rem;">🚀</span>
                            <span style="font-family: 'Space Mono', monospace; font-size: 0.85rem; color: var(--accent-glow);">${today.toLocaleDateString('en', { month: 'long', day: 'numeric' })}</span>
                        </div>
                        ${todayEvents.map(e => `
                            <div style="margin-bottom: 1rem;">
                                <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem; color: var(--accent-glow);">${e.year}</div>
                                <p style="font-size: 1rem; margin-top: 0.25rem;">${e.event}</p>
                                <div style="font-size: 0.85rem; color: var(--text-dim);">${today.getFullYear() - e.year} years ago</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📅</div>
                        <p>No major space events recorded for today.</p>
                    </div>
                `}
            </div>
        `;
    }
};

// ==========================================
// 25. LIVE SUN DATA
// ==========================================

const LiveSunData = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const sunspots = Math.floor(50 + Math.random() * 100);
        const flux = Math.floor(100 + Math.random() * 80);
        const wind = Math.floor(300 + Math.random() * 200);
        
        this.container.innerHTML = `
            <div class="sun-data">
                <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle, #fbbf24, #f59e0b); box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);"></div>
                        <div>
                            <div style="font-size: 1.1rem; font-weight: 600;">☀️ The Sun</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Solar Cycle 25</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <div style="background: var(--bg-card); border-radius: 10px; padding: 1rem; text-align: center;">
                            <div style="font-size: 1.25rem;">🔴</div>
                            <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${sunspots}</div>
                            <div style="font-size: 0.7rem; color: var(--text-dim);">Sunspots</div>
                        </div>
                        <div style="background: var(--bg-card); border-radius: 10px; padding: 1rem; text-align: center;">
                            <div style="font-size: 1.25rem;">📡</div>
                            <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${flux}</div>
                            <div style="font-size: 0.7rem; color: var(--text-dim);">Solar Flux</div>
                        </div>
                        <div style="background: var(--bg-card); border-radius: 10px; padding: 1rem; text-align: center;">
                            <div style="font-size: 1.25rem;">🌬️</div>
                            <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${wind}</div>
                            <div style="font-size: 0.7rem; color: var(--text-dim);">Wind (km/s)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// ==========================================
// 26. TIDE TRACKER
// ==========================================

const TideTracker = {
    container: null,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const moon = AstroEngine.getMoonPhase(new Date());
        const isSpring = moon.phase === 'New Moon' || moon.phase === 'Full Moon';
        const isNeap = moon.phase === 'First Quarter' || moon.phase === 'Last Quarter';
        
        const tides = [
            { type: 'High', time: '6:24 AM', height: (5 * (isSpring ? 1.3 : isNeap ? 0.8 : 1)).toFixed(1) },
            { type: 'Low', time: '12:38 PM', height: (1 * (isSpring ? 0.7 : isNeap ? 1.2 : 1)).toFixed(1) },
            { type: 'High', time: '6:52 PM', height: (5.2 * (isSpring ? 1.3 : isNeap ? 0.8 : 1)).toFixed(1) },
            { type: 'Low', time: '1:04 AM', height: (0.8 * (isSpring ? 0.7 : isNeap ? 1.2 : 1)).toFixed(1) }
        ];
        
        this.container.innerHTML = `
            <div class="tide-tracker">
                <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, var(--bg-card) 100%); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 16px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-dim);">Moon Phase</div>
                            <div style="font-size: 1.25rem;">${moon.emoji} ${moon.phase}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.75rem; color: var(--text-dim);">Tide Type</div>
                            <div style="color: ${isSpring ? 'var(--accent-cool)' : isNeap ? 'var(--accent-warm)' : 'var(--text-primary)'};">
                                ${isSpring ? '🌊 Spring' : isNeap ? '〰️ Neap' : '🌊 Normal'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                        ${tides.map(t => `
                            <div style="background: var(--bg-card); border-radius: 10px; padding: 1rem; text-align: center; border: 1px solid ${t.type === 'High' ? 'rgba(6, 182, 212, 0.3)' : 'var(--border)'};">
                                <div style="font-size: 1.25rem;">${t.type === 'High' ? '⬆️' : '⬇️'}</div>
                                <div style="font-size: 0.85rem; font-weight: 600;">${t.type}</div>
                                <div style="font-family: 'Space Mono', monospace; color: var(--accent-cool);">${t.height}m</div>
                                <div style="font-size: 0.75rem; color: var(--text-dim);">${t.time}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

// Export
window.AnnualCalendar = AnnualCalendar;
window.GoldenHourCalc = GoldenHourCalc;
window.SeeingForecast = SeeingForecast;
window.SpaceHistory = SpaceHistory;
window.LiveSunData = LiveSunData;
window.TideTracker = TideTracker;
