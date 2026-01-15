// ==========================================
// COSMIC CURIOSITY - UI & ADVANCED FEATURES v3
// Themes, animations, sounds, telescope, exoplanets
// ==========================================

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

const Toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem;';
            document.body.appendChild(this.container);
        }
        return this;
    },
    
    show(message, type = 'info', duration = 3000) {
        this.init();
        const colors = {
            success: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' },
            warning: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
            error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
            info: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1' }
        };
        const c = colors[type] || colors.info;
        const toast = document.createElement('div');
        toast.style.cssText = `padding: 0.75rem 1.25rem; background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 10px; color: var(--text-primary); font-size: 0.9rem; animation: slideIn 0.3s ease; backdrop-filter: blur(10px);`;
        toast.textContent = message;
        this.container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, duration);
    }
};

// ==========================================
// THEME MANAGER
// ==========================================

const ThemeManager = {
    themes: {
        dark: { name: 'Dark (Default)', bgDeep: '#050510', bgCard: '#0a0a1a', bgHover: '#0f0f25', accentGlow: '#6366f1', textPrimary: '#e8e8f0', textSecondary: '#9898b0' },
        midnight: { name: 'Midnight Blue', bgDeep: '#0a0a1f', bgCard: '#0f0f2a', bgHover: '#151535', accentGlow: '#3b82f6', textPrimary: '#e0e7ff', textSecondary: '#94a3b8' },
        nebula: { name: 'Nebula Purple', bgDeep: '#0f0515', bgCard: '#1a0a20', bgHover: '#25102a', accentGlow: '#a855f7', textPrimary: '#faf5ff', textSecondary: '#c4b5fd' },
        light: { name: 'Light Mode', bgDeep: '#f8fafc', bgCard: '#ffffff', bgHover: '#f1f5f9', accentGlow: '#4f46e5', textPrimary: '#1e293b', textSecondary: '#64748b' },
        red: { name: 'Night Vision', bgDeep: '#0a0000', bgCard: '#120000', bgHover: '#1a0000', accentGlow: '#8b0000', textPrimary: '#ff4444', textSecondary: '#aa2222' }
    },
    
    current: localStorage.getItem('theme') || 'dark',
    
    init() {
        this.apply(this.current);
        this.createSelector();
        return this;
    },
    
    createSelector() {
        const existing = document.getElementById('theme-selector');
        if (existing) existing.remove();
        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        selector.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 100;';
        selector.innerHTML = `
            <button onclick="ThemeManager.togglePanel()" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border); cursor: pointer; font-size: 1.25rem; display: flex; align-items: center; justify-content: center;" title="Change Theme">🎨</button>
            <div id="theme-panel" style="display: none; position: absolute; bottom: 50px; left: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem; min-width: 160px;">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <button onclick="ThemeManager.apply('${key}')" style="display: block; width: 100%; padding: 0.5rem 0.75rem; background: ${key === this.current ? 'var(--accent-glow)' : 'transparent'}; border: none; border-radius: 6px; color: ${key === this.current ? 'white' : 'var(--text-secondary)'}; text-align: left; cursor: pointer; font-family: inherit; margin-bottom: 0.25rem; font-size: 0.85rem;">${theme.name}</button>
                `).join('')}
            </div>
        `;
        document.body.appendChild(selector);
    },
    
    togglePanel() {
        const panel = document.getElementById('theme-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    },
    
    apply(themeKey) {
        const theme = this.themes[themeKey];
        if (!theme) return;
        this.current = themeKey;
        localStorage.setItem('theme', themeKey);
        const root = document.documentElement;
        root.style.setProperty('--bg-deep', theme.bgDeep);
        root.style.setProperty('--bg-card', theme.bgCard);
        root.style.setProperty('--bg-hover', theme.bgHover);
        root.style.setProperty('--accent-glow', theme.accentGlow);
        root.style.setProperty('--text-primary', theme.textPrimary);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        document.body.style.background = theme.bgDeep;
        document.body.style.color = theme.textPrimary;
        this.createSelector();
        if (window.Toast) Toast.show(`🎨 Theme: ${theme.name}`, 'info');
    }
};

// ==========================================
// ANIMATED BACKGROUND
// ==========================================

const AnimatedBackground = {
    canvas: null, ctx: null, particles: [],
    enabled: localStorage.getItem('animBg') !== 'false',
    
    init() {
        if (!this.enabled) return;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'animated-bg';
        this.canvas.style.cssText = 'position: fixed; top: -20px; left: -20px; width: calc(100% + 40px); height: calc(100% + 40px); pointer-events: none; z-index: 0;';
        document.body.prepend(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateParticles();
        this.animate();
        return this;
    },
    
    resize() {
        this.canvas.width = window.innerWidth + 40;
        this.canvas.height = window.innerHeight + 40;
        this.ctx = this.canvas.getContext('2d');
    },
    
    generateParticles() {
        const count = Math.floor((window.innerWidth * window.innerHeight) / 10000);
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.4 + 0.2,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    },
    
    animate() {
        if (!this.ctx || !this.enabled) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() / 1000;
        for (const p of this.particles) {
            const twinkle = Math.sin(time * 2 + p.twinklePhase) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        requestAnimationFrame(() => this.animate());
    },
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('animBg', this.enabled);
        if (this.enabled) this.init();
        else if (this.canvas) { this.canvas.remove(); this.canvas = null; }
    }
};

// ==========================================
// SOUND MANAGER
// ==========================================

const SoundManager = {
    enabled: localStorage.getItem('sounds') === 'true',
    audioCtx: null,
    
    init() {
        document.addEventListener('click', () => {
            if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }, { once: true });
        this.createControls();
        return this;
    },
    
    createControls() {
        const existing = document.getElementById('sound-controls');
        if (existing) existing.remove();
        const controls = document.createElement('div');
        controls.id = 'sound-controls';
        controls.style.cssText = 'position: fixed; bottom: 20px; left: 70px; z-index: 100;';
        controls.innerHTML = `<button onclick="SoundManager.toggle()" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card); border: 1px solid ${this.enabled ? 'var(--accent-glow)' : 'var(--border)'}; cursor: pointer; font-size: 1.25rem; display: flex; align-items: center; justify-content: center;" title="Toggle Sounds">${this.enabled ? '🔊' : '🔇'}</button>`;
        document.body.appendChild(controls);
    },
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sounds', this.enabled);
        this.createControls();
        if (this.enabled) this.play('notification');
    },
    
    play(soundName) {
        if (!this.enabled || !this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(soundName === 'notification' ? 440 : 800, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.15);
    }
};

// ==========================================
// TELESCOPE CONTROL
// ==========================================

const TelescopeControl = {
    container: null, connected: false, currentRA: 0, currentDec: 0,
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        this.container.innerHTML = `
            <div class="telescope-control">
                <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <div style="font-size: 1.1rem; font-weight: 600;">🔭 GoTo Mount</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">ASCOM/INDI Compatible</div>
                        </div>
                        <button onclick="TelescopeControl.toggleConnection()" style="padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid ${this.connected ? 'var(--accent-green)' : 'var(--accent-glow)'}; background: ${this.connected ? 'rgba(16,185,129,0.2)' : 'transparent'}; color: ${this.connected ? '#10b981' : 'var(--accent-glow)'}; cursor: pointer; font-family: inherit;">${this.connected ? '● Connected' : 'Connect'}</button>
                    </div>
                    
                    ${this.connected ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="padding: 1rem; background: var(--bg-hover); border-radius: 10px;">
                                <div style="font-size: 0.7rem; color: var(--text-dim);">RA</div>
                                <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${Math.floor(this.currentRA/15)}h ${Math.floor((this.currentRA/15%1)*60)}m</div>
                            </div>
                            <div style="padding: 1rem; background: var(--bg-hover); border-radius: 10px;">
                                <div style="font-size: 0.7rem; color: var(--text-dim);">Dec</div>
                                <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem;">${this.currentDec >= 0 ? '+' : ''}${Math.floor(this.currentDec)}° ${Math.floor(Math.abs(this.currentDec%1)*60)}'</div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                            <div></div>
                            <button onclick="TelescopeControl.nudge(0, 1)" style="padding: 0.75rem; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 1.25rem;">↑</button>
                            <div></div>
                            <button onclick="TelescopeControl.nudge(-1, 0)" style="padding: 0.75rem; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 1.25rem;">←</button>
                            <button onclick="TelescopeControl.stop()" style="padding: 0.75rem; background: var(--accent-rose); border: none; border-radius: 8px; cursor: pointer; color: white; font-weight: 600;">STOP</button>
                            <button onclick="TelescopeControl.nudge(1, 0)" style="padding: 0.75rem; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 1.25rem;">→</button>
                            <div></div>
                            <button onclick="TelescopeControl.nudge(0, -1)" style="padding: 0.75rem; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 1.25rem;">↓</button>
                            <div></div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">🔭</div>
                            <p style="color: var(--text-secondary);">Connect your GoTo telescope to slew automatically</p>
                            <input type="text" placeholder="192.168.x.x:port" style="margin-top: 1rem; padding: 0.75rem 1rem; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: 'Space Mono', monospace; width: 200px;">
                        </div>
                    `}
                </div>
            </div>
        `;
    },
    
    toggleConnection() {
        this.connected = !this.connected;
        if (this.connected) { this.currentRA = 180 + Math.random() * 30; this.currentDec = 30 + Math.random() * 20; Toast.show('🔭 Telescope connected!', 'success'); }
        else Toast.show('🔭 Disconnected', 'info');
        this.render();
    },
    
    nudge(dRA, dDec) { this.currentRA += dRA * 0.5; this.currentDec += dDec * 0.5; this.render(); },
    stop() { Toast.show('⏹️ Mount stopped', 'warning'); }
};

// ==========================================
// EXOPLANET EXPLORER
// ==========================================

const ExoplanetExplorer = {
    container: null,
    exoplanets: [
        { name: 'Proxima Centauri b', distance: 4.24, type: 'Rocky', habitable: true, mass: 1.17, discovered: 2016, star: 'Proxima Centauri' },
        { name: 'TRAPPIST-1e', distance: 39.6, type: 'Rocky', habitable: true, mass: 0.77, discovered: 2017, star: 'TRAPPIST-1' },
        { name: 'Kepler-442b', distance: 112, type: 'Super-Earth', habitable: true, mass: 2.34, discovered: 2015, star: 'Kepler-442' },
        { name: 'K2-18b', distance: 124, type: 'Mini-Neptune', habitable: true, mass: 8.63, discovered: 2015, star: 'K2-18' },
        { name: 'HD 189733 b', distance: 64.5, type: 'Hot Jupiter', habitable: false, mass: 364, discovered: 2005, star: 'HD 189733' },
        { name: '51 Pegasi b', distance: 50.9, type: 'Hot Jupiter', habitable: false, mass: 150, discovered: 1995, star: '51 Pegasi' }
    ],
    filter: 'all',
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const filtered = this.filter === 'all' ? this.exoplanets : this.filter === 'habitable' ? this.exoplanets.filter(p => p.habitable) : this.exoplanets.filter(p => !p.habitable);
        const typeColors = { 'Rocky': '#10b981', 'Super-Earth': '#06b6d4', 'Mini-Neptune': '#3b82f6', 'Hot Jupiter': '#ef4444' };
        
        this.container.innerHTML = `
            <div class="exoplanet-explorer">
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <div style="padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; text-align: center;">
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.5rem; color: var(--accent-glow);">5,500+</div>
                        <div style="font-size: 0.75rem; color: var(--text-dim);">Confirmed Exoplanets</div>
                    </div>
                    <div style="padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; text-align: center;">
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.5rem; color: #10b981;">60+</div>
                        <div style="font-size: 0.75rem; color: var(--text-dim);">Potentially Habitable</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                    ${['all', 'habitable', 'other'].map(f => `
                        <button onclick="ExoplanetExplorer.setFilter('${f}')" style="padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid ${f === this.filter ? 'var(--accent-glow)' : 'var(--border)'}; background: ${f === this.filter ? 'var(--accent-glow)' : 'transparent'}; color: ${f === this.filter ? 'white' : 'var(--text-secondary)'}; cursor: pointer; font-family: inherit; font-size: 0.85rem;">${f === 'all' ? 'All' : f === 'habitable' ? '🌍 Habitable' : 'Other'}</button>
                    `).join('')}
                </div>
                
                <div style="display: grid; gap: 1rem;">
                    ${filtered.map(p => `
                        <div style="background: var(--bg-card); border: 1px solid ${p.habitable ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}; border-radius: 12px; padding: 1.25rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                                <div>
                                    <div style="font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                        ${p.name}
                                        ${p.habitable ? '<span style="font-size: 0.7rem; padding: 0.15rem 0.4rem; background: rgba(16, 185, 129, 0.15); color: #10b981; border-radius: 100px;">Habitable Zone</span>' : ''}
                                    </div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Orbits ${p.star}</div>
                                </div>
                                <div style="padding: 0.25rem 0.6rem; border-radius: 100px; background: ${typeColors[p.type] || '#6366f1'}20; color: ${typeColors[p.type] || '#6366f1'}; font-size: 0.75rem;">${p.type}</div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; font-size: 0.8rem;">
                                <div><div style="color: var(--text-dim);">Distance</div><div style="font-family: 'Space Mono', monospace;">${p.distance} ly</div></div>
                                <div><div style="color: var(--text-dim);">Mass</div><div style="font-family: 'Space Mono', monospace;">${p.mass} M⊕</div></div>
                                <div><div style="color: var(--text-dim);">Discovered</div><div style="font-family: 'Space Mono', monospace;">${p.discovered}</div></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    setFilter(f) { this.filter = f; this.render(); }
};

// ==========================================
// LIVE TELESCOPE FEEDS
// ==========================================

const LiveFeeds = {
    container: null,
    feeds: [
        { name: 'Slooh', url: 'https://www.slooh.com', status: 'live', location: 'Canary Islands' },
        { name: 'Virtual Telescope', url: 'https://www.virtualtelescope.eu', status: 'scheduled', location: 'Italy' },
        { name: 'MicroObservatory', url: 'https://mo-www.cfa.harvard.edu', status: 'available', location: 'Arizona' }
    ],
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        return this;
    },
    
    render() {
        const statusColors = { live: '#10b981', scheduled: '#f59e0b', available: '#06b6d4' };
        this.container.innerHTML = `
            <div class="live-feeds" style="display: grid; gap: 1rem;">
                ${this.feeds.map(f => `
                    <a href="${f.url}" target="_blank" style="display: block; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; text-decoration: none; color: inherit;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-weight: 600;">${f.name}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">📍 ${f.location}</div>
                            </div>
                            <div style="padding: 0.25rem 0.6rem; border-radius: 100px; background: ${statusColors[f.status]}20; color: ${statusColors[f.status]}; font-size: 0.75rem; text-transform: uppercase;">${f.status}</div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }
};

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 't') ThemeManager.togglePanel?.();
            if (e.key === 's') SoundManager.toggle?.();
            if (e.key === '?') Toast.show('Shortcuts: T=Theme, S=Sound, ?=Help', 'info', 5000);
            if (e.key === 'Escape') document.querySelectorAll('[id$="-panel"]').forEach(p => p.style.display = 'none');
        });
        return this;
    }
};

// ==========================================
// ADD CSS ANIMATIONS
// ==========================================

const addAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
    `;
    document.head.appendChild(style);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addAnimations);
else addAnimations();

// Export
window.ThemeManager = ThemeManager;
window.AnimatedBackground = AnimatedBackground;
window.SoundManager = SoundManager;
window.TelescopeControl = TelescopeControl;
window.ExoplanetExplorer = ExoplanetExplorer;
window.LiveFeeds = LiveFeeds;
window.Toast = Toast;
window.KeyboardShortcuts = KeyboardShortcuts;
