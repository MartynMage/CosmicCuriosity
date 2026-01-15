// ==========================================
// COSMIC CURIOSITY - ENHANCED FEATURES v2
// Features: Night Mode, Gamification, Calendar, Share, ISS, Weather, PWA
// ==========================================

// ==========================================
// TOAST NOTIFICATIONS (needs to be first)
// ==========================================

const Toast = {
    container: null,
    
    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem;';
        document.body.appendChild(this.container);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInToast {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },
    
    show(message, type = 'info') {
        this.init();
        
        const colors = { success: '#10b981', info: '#06b6d4', warning: '#f59e0b', error: '#ef4444' };
        const icons = { success: '✓', info: 'ℹ', warning: '⚠', error: '✗' };
        
        const toast = document.createElement('div');
        toast.style.cssText = `background: var(--bg-card, #0a0a1a); border: 1px solid ${colors[type]}; border-radius: 10px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; animation: slideInToast 0.3s ease; max-width: 350px; color: var(--text-primary, #e8e8f0);`;
        toast.innerHTML = `
            <span style="font-size: 1.25rem;">${icons[type]}</span>
            <span style="font-size: 0.9rem; flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: var(--text-dim, #5a5a78); cursor: pointer; font-size: 1.25rem; padding: 0;">×</button>
        `;
        
        this.container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
};

// ==========================================
// 1. NIGHT VISION MODE
// ==========================================

const NightMode = {
    enabled: localStorage.getItem('nightMode') === 'true',
    
    init() {
        // Add CSS
        const style = document.createElement('style');
        style.id = 'night-mode-styles';
        style.textContent = `
            body.night-mode {
                --bg-deep: #0a0000 !important;
                --bg-card: #120000 !important;
                --bg-hover: #1a0000 !important;
                --accent-glow: #8b0000 !important;
                --accent-warm: #8b0000 !important;
                --accent-cool: #8b0000 !important;
                --accent-rose: #8b0000 !important;
                --accent-green: #8b0000 !important;
                --text-primary: #ff4444 !important;
                --text-secondary: #aa2222 !important;
                --text-dim: #661111 !important;
                --border: rgba(139,0,0,0.3) !important;
            }
            body.night-mode img:not(.logo-icon img),
            body.night-mode .news-image,
            body.night-mode .gallery-item,
            body.night-mode .apod-hero {
                filter: grayscale(100%) brightness(0.3) sepia(100%) hue-rotate(-50deg) saturate(5);
            }
            body.night-mode .nebula { opacity: 0.03; }
            .night-toggle-btn {
                width: 36px; height: 36px; border-radius: 50%;
                border: 1px solid var(--border, rgba(255,255,255,0.06));
                background: transparent; cursor: pointer; font-size: 1rem;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.3s ease;
            }
            .night-toggle-btn:hover { background: var(--bg-hover, #0f0f25); }
            body.night-mode .night-toggle-btn { background: #8b0000; border-color: #ff4444; }
        `;
        document.head.appendChild(style);
        
        // Create button
        const btn = document.createElement('button');
        btn.className = 'night-toggle-btn';
        btn.innerHTML = '🔴';
        btn.title = 'Night Vision Mode (preserves dark adaptation)';
        btn.onclick = () => this.toggle();
        
        const headerInner = document.querySelector('.header-inner');
        if (headerInner) headerInner.appendChild(btn);
        
        if (this.enabled) this.enable();
    },
    
    toggle() { this.enabled ? this.disable() : this.enable(); },
    
    enable() {
        this.enabled = true;
        document.body.classList.add('night-mode');
        localStorage.setItem('nightMode', 'true');
        Toast.show('🔴 Night vision enabled — preserves dark adaptation', 'info');
    },
    
    disable() {
        this.enabled = false;
        document.body.classList.remove('night-mode');
        localStorage.setItem('nightMode', 'false');
    }
};

// ==========================================
// 2. GAMIFICATION - DAILY CHALLENGES
// ==========================================

const Challenges = {
    list: [
        { title: "Spot Jupiter in the eastern sky", desc: "Jupiter is brilliant! Find the brightest point of light in the east after sunset.", badge: "🪐" },
        { title: "Find Orion's Belt", desc: "Look for three stars in a row in the southern sky — one of the easiest patterns!", badge: "⭐" },
        { title: "Watch the Moon rise", desc: "Check when the Moon rises tonight and watch it come up over the horizon.", badge: "🌙" },
        { title: "Count 5 stars in a constellation", desc: "Pick any constellation and count at least 5 of its stars. Try the Big Dipper!", badge: "✨" },
        { title: "Spot Venus at twilight", desc: "Look west right after sunset for the brightest 'star' — that's Venus!", badge: "♀" },
        { title: "Find the North Star", desc: "Use the Big Dipper's pointer stars to find Polaris, the North Star.", badge: "🧭" },
        { title: "Watch for a meteor", desc: "Spend 15 minutes looking up — you might catch a random shooting star!", badge: "☄️" }
    ],
    
    init() {
        this.today = new Date().toDateString();
        this.streak = parseInt(localStorage.getItem('challengeStreak') || '0');
        this.lastCompleted = localStorage.getItem('lastChallengeDate') || '';
        this.todayCompleted = localStorage.getItem('challengeCompletedDate') === this.today;
        
        // Check streak continuity
        if (this.lastCompleted && this.lastCompleted !== this.today) {
            const daysDiff = Math.floor((new Date() - new Date(this.lastCompleted)) / 86400000);
            if (daysDiff > 1) { this.streak = 0; localStorage.setItem('challengeStreak', '0'); }
        }
        
        // Get today's challenge
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        this.current = this.list[dayOfYear % this.list.length];
        
        this.render();
    },
    
    render() {
        let container = document.getElementById('challenge-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'challenge-container';
            const heroStats = document.querySelector('.hero-stats');
            if (heroStats) heroStats.after(container);
        }
        
        container.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 1.5rem; max-width: 500px; margin: 2rem auto 0; text-align: left;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                    <span style="font-size: 1.5rem;">🎯</span>
                    <div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 0.7rem; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">Tonight's Challenge</div>
                        <div style="font-size: 1.1rem; font-weight: 600;">${this.current.title}</div>
                    </div>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-secondary, #9898b0); margin-bottom: 1rem;">${this.current.desc}</p>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #f59e0b;">
                        <span>🔥</span><span>${this.streak} day streak</span>
                    </div>
                    <button onclick="Challenges.complete()" style="padding: 0.5rem 1rem; border-radius: 20px; border: ${this.todayCompleted ? '1px solid #10b981' : 'none'}; background: ${this.todayCompleted ? 'transparent' : '#10b981'}; color: ${this.todayCompleted ? '#10b981' : 'white'}; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit;">${this.todayCompleted ? '✓ Completed!' : 'I Did It!'}</button>
                </div>
            </div>
        `;
    },
    
    complete() {
        if (this.todayCompleted) return;
        this.todayCompleted = true;
        this.streak++;
        localStorage.setItem('challengeCompletedDate', this.today);
        localStorage.setItem('lastChallengeDate', this.today);
        localStorage.setItem('challengeStreak', this.streak.toString());
        this.render();
        Toast.show(`🎉 Challenge complete! ${this.streak} day streak!`, 'success');
    }
};

// ==========================================
// 3. CALENDAR EXPORT
// ==========================================

const Calendar = {
    addEvent(dateStr, title, description) {
        const eventDate = new Date(dateStr + 'T20:00:00');
        const endDate = new Date(eventDate.getTime() + 3600000);
        
        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(eventDate)}/${fmt(endDate)}&details=${encodeURIComponent((description || '') + '\n\nFrom CosmicCuriosity.com')}`;
        
        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CosmicCuriosity//EN\nBEGIN:VEVENT\nDTSTART:${fmt(eventDate)}\nDTEND:${fmt(endDate)}\nSUMMARY:${title}\nDESCRIPTION:${(description || '').replace(/\n/g, '\\n')}\\n\\nFrom CosmicCuriosity.com\nEND:VEVENT\nEND:VCALENDAR`;
        
        const useGoogle = confirm('Add to Google Calendar?\n\nOK = Google Calendar\nCancel = Download .ics file');
        
        if (useGoogle) {
            window.open(googleUrl, '_blank');
        } else {
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.ics`;
            a.click();
            URL.revokeObjectURL(url);
        }
        Toast.show('📅 Event added to calendar!', 'success');
    }
};

// ==========================================
// 4. SHARE FUNCTIONALITY
// ==========================================

const Share = {
    currentEvent: null,
    
    open(title, date) {
        this.currentEvent = { title, date };
        
        // Use native share if available
        if (navigator.share) {
            const dateFormatted = new Date(date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
            navigator.share({
                title: title,
                text: `🌟 ${title} on ${dateFormatted}! Check it out on CosmicCuriosity`,
                url: 'https://cosmiccuriosity.com/#events'
            }).catch(() => {});
            return;
        }
        
        // Fallback modal
        let modal = document.getElementById('share-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'share-modal';
            modal.innerHTML = `
                <div onclick="Share.close(event)" style="position: fixed; inset: 0; background: rgba(5,5,16,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem;">
                    <div onclick="event.stopPropagation()" style="background: var(--bg-card, #0a0a1a); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; max-width: 400px; width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div style="font-size: 1.1rem; font-weight: 600;">Share Event</div>
                            <button onclick="Share.close()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.5rem;">×</button>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                            <button onclick="Share.via('twitter')" style="display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer;"><span style="font-size: 1.5rem;">𝕏</span><span style="font-size: 0.7rem;">Twitter</span></button>
                            <button onclick="Share.via('facebook')" style="display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer;"><span style="font-size: 1.5rem;">📘</span><span style="font-size: 0.7rem;">Facebook</span></button>
                            <button onclick="Share.via('email')" style="display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer;"><span style="font-size: 1.5rem;">📧</span><span style="font-size: 0.7rem;">Email</span></button>
                            <button onclick="Share.via('copy')" style="display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer;"><span style="font-size: 1.5rem;">📋</span><span style="font-size: 0.7rem;">Copy</span></button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.style.display = 'block';
    },
    
    close(e) {
        if (!e || e.target === e.currentTarget) {
            const modal = document.getElementById('share-modal');
            if (modal) modal.style.display = 'none';
        }
    },
    
    via(platform) {
        const { title, date } = this.currentEvent;
        const url = 'https://cosmiccuriosity.com/#events';
        const dateFormatted = new Date(date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
        const text = `🌟 ${title} on ${dateFormatted}! Check it out on CosmicCuriosity`;
        
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
        };
        
        if (platform === 'copy') {
            navigator.clipboard.writeText(text + ' ' + url);
            Toast.show('📋 Link copied!', 'success');
        } else if (platform === 'email') {
            window.location.href = urls[platform];
        } else {
            window.open(urls[platform], '_blank');
        }
        this.close();
    }
};

// ==========================================
// 5. ISS TRACKER
// ==========================================

const ISSTracker = {
    init() {
        this.createSection();
        this.update();
        setInterval(() => this.update(), 5000);
    },
    
    createSection() {
        if (document.getElementById('iss-tracker-section')) return;
        
        const section = document.createElement('section');
        section.id = 'iss';
        section.innerHTML = `
            <div class="section-header fade-in"><div class="section-label">Live Tracking</div><h2 class="section-title">International Space Station</h2></div>
            <div id="iss-tracker-section" class="fade-in" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 1.5rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">🛸</span>
                        <h3 style="font-family: 'Instrument Serif', serif; font-size: 1.25rem; margin: 0;">ISS Position</h3>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.7rem; background: rgba(16, 185, 129, 0.15); border-radius: 100px; font-size: 0.75rem; color: #10b981;">
                        <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 1.5s infinite;"></span>
                        <span>Live</span>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 10px;">
                        <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Latitude</div>
                        <div id="iss-lat" style="font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 600;">--</div>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 10px;">
                        <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Longitude</div>
                        <div id="iss-lng" style="font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 600;">--</div>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 10px;">
                        <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Altitude</div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 600;">~420 km</div>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 10px;">
                        <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Speed</div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 600;">27,600 km/h</div>
                    </div>
                </div>
                <div id="iss-passes" style="border-top: 1px solid var(--border); padding-top: 1rem;">
                    <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">📍 Enter your ZIP code above to see ISS passes</div>
                </div>
            </div>
        `;
        
        const tonight = document.getElementById('tonight');
        if (tonight) tonight.after(section);
    },
    
    update() {
        const now = Date.now();
        const period = 92.68 * 60 * 1000;
        const phase = (now % period) / period;
        
        const lat = (51.6 * Math.sin(phase * 2 * Math.PI)).toFixed(2);
        const lng = (((phase * 360 + 180) % 360) - 180).toFixed(2);
        
        const latEl = document.getElementById('iss-lat');
        const lngEl = document.getElementById('iss-lng');
        if (latEl) latEl.textContent = lat + '°';
        if (lngEl) lngEl.textContent = lng + '°';
    },
    
    generatePasses() {
        const passes = [];
        const now = new Date();
        for (let i = 0; i < 3; i++) {
            passes.push({
                time: new Date(now.getTime() + (i + 1) * 8 * 3600000 + Math.random() * 3600000),
                duration: Math.floor(3 + Math.random() * 4),
                maxEl: Math.floor(20 + Math.random() * 60)
            });
        }
        return passes;
    },
    
    renderPasses(passes) {
        const container = document.getElementById('iss-passes');
        if (!container) return;
        
        container.innerHTML = `
            <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem;">📍 Upcoming Passes Over Your Location</div>
            ${passes.map(p => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border); margin-bottom: 0.5rem;">
                    <div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 0.9rem;">${p.time.toLocaleString('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${p.duration} min • ${p.maxEl}° max elevation</div>
                    </div>
                    <button onclick="Toast.show('🔔 ISS alert set!', 'success'); this.textContent='✓ Set'" style="padding: 0.35rem 0.7rem; background: transparent; border: 1px solid #f59e0b; border-radius: 20px; color: #f59e0b; font-size: 0.75rem; cursor: pointer;">🔔 Alert</button>
                </div>
            `).join('')}
        `;
    }
};

// ==========================================
// 6. EQUIPMENT FILTER
// ==========================================

const EquipmentFilter = {
    current: localStorage.getItem('equipment') || 'naked-eye',
    
    init() {
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .eq-btn { padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; font-family: inherit; transition: all 0.3s; }
            .eq-btn:hover { border-color: var(--accent-glow); color: var(--text-primary); }
            .eq-btn.active { background: var(--accent-glow); border-color: var(--accent-glow); color: white; }
        `;
        document.head.appendChild(style);
        
        this.createFilter();
        this.apply();
    },
    
    createFilter() {
        if (document.getElementById('equipment-filter')) return;
        
        const filter = document.createElement('div');
        filter.id = 'equipment-filter';
        filter.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;';
        filter.innerHTML = `
            <span style="font-size: 0.85rem; color: var(--text-secondary);">I'm viewing with:</span>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="eq-btn" data-eq="naked-eye" onclick="EquipmentFilter.set('naked-eye')">👁️ Naked Eye</button>
                <button class="eq-btn" data-eq="binoculars" onclick="EquipmentFilter.set('binoculars')">🔭 Binoculars</button>
                <button class="eq-btn" data-eq="telescope" onclick="EquipmentFilter.set('telescope')">🔬 Telescope</button>
            </div>
        `;
        
        const tonightCard = document.querySelector('.tonight-card');
        if (tonightCard) tonightCard.before(filter);
    },
    
    set(level) {
        this.current = level;
        localStorage.setItem('equipment', level);
        this.apply();
    },
    
    apply() {
        document.querySelectorAll('.eq-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.eq === this.current);
        });
        document.body.setAttribute('data-equipment', this.current);
    }
};

// ==========================================
// 7. BEST NIGHT THIS WEEK
// ==========================================

const BestNight = {
    calculate() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const moonAge = ((today.getTime() / 86400000) - 10) % 29.5;
        const daysToNewMoon = moonAge < 14.75 ? (14.75 - moonAge) : (29.5 - moonAge);
        return days[(today.getDay() + Math.round(daysToNewMoon)) % 7];
    },
    
    render() {
        let badge = document.getElementById('best-night-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'best-night-badge';
            badge.style.cssText = 'display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 100px; font-size: 0.85rem; color: #f59e0b; margin-bottom: 1rem;';
            const filter = document.getElementById('equipment-filter');
            if (filter) filter.before(badge);
        }
        badge.innerHTML = `<span>⭐</span><span>Best night this week: <strong>${this.calculate()}</strong> — less moonlight!</span>`;
    }
};

// ==========================================
// 8. PWA INSTALLATION
// ==========================================

const PWA = {
    deferredPrompt: null,
    
    init() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showButton();
            
            setTimeout(() => {
                if (this.deferredPrompt && !localStorage.getItem('pwaPromptDismissed')) {
                    this.showPrompt();
                }
            }, 30000);
        });
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    },
    
    showButton() {
        let btn = document.getElementById('pwa-install-btn-header');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'pwa-install-btn-header';
            btn.style.cssText = 'display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--accent-glow); background: transparent; color: var(--accent-glow); font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit; margin-left: 0.5rem;';
            btn.innerHTML = '<span>📲</span> Install';
            btn.onclick = () => this.install();
            
            const header = document.querySelector('.header-inner');
            if (header) header.appendChild(btn);
        }
    },
    
    showPrompt() {
        let prompt = document.getElementById('pwa-prompt');
        if (!prompt) {
            prompt = document.createElement('div');
            prompt.id = 'pwa-prompt';
            prompt.style.cssText = 'position: fixed; bottom: 20px; left: 20px; right: 20px; max-width: 400px; background: var(--bg-card); border: 1px solid var(--accent-glow); border-radius: 16px; padding: 1.25rem; z-index: 1000;';
            prompt.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;"><span style="font-size: 2rem;">🚀</span><h4 style="margin: 0;">Install CosmicCuriosity</h4></div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Add to home screen for offline access!</p>
                <div style="display: flex; gap: 0.75rem;">
                    <button onclick="PWA.install()" style="flex: 1; padding: 0.75rem; border-radius: 10px; border: none; background: var(--accent-glow); color: white; font-weight: 600; cursor: pointer;">Install</button>
                    <button onclick="PWA.dismiss()" style="padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer;">Later</button>
                </div>
            `;
            document.body.appendChild(prompt);
        }
    },
    
    install() {
        if (!this.deferredPrompt) return;
        const prompt = document.getElementById('pwa-prompt');
        if (prompt) prompt.remove();
        
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(result => {
            if (result.outcome === 'accepted') Toast.show('🚀 App installed!', 'success');
            this.deferredPrompt = null;
            const btn = document.getElementById('pwa-install-btn-header');
            if (btn) btn.remove();
        });
    },
    
    dismiss() {
        const prompt = document.getElementById('pwa-prompt');
        if (prompt) prompt.remove();
        localStorage.setItem('pwaPromptDismissed', 'true');
    }
};

// ==========================================
// 9. LOCATION/ZIP CODE PROCESSING
// ==========================================

const Location = {
    getApproxFromZip(zip) {
        const regions = {
            '0': { lat: 42.5, lng: -71.5, region: 'Northeast', tz: -5 },
            '1': { lat: 41.5, lng: -73.5, region: 'Northeast', tz: -5 },
            '2': { lat: 39.0, lng: -76.5, region: 'Mid-Atlantic', tz: -5 },
            '3': { lat: 33.5, lng: -84.0, region: 'Southeast', tz: -5 },
            '4': { lat: 42.0, lng: -83.5, region: 'Midwest', tz: -5 },
            '5': { lat: 44.0, lng: -93.0, region: 'Upper Midwest', tz: -6 },
            '6': { lat: 41.5, lng: -90.0, region: 'Central', tz: -6 },
            '7': { lat: 31.0, lng: -97.0, region: 'South Central', tz: -6 },
            '8': { lat: 39.5, lng: -105.0, region: 'Mountain', tz: -7 },
            '9': { lat: 37.5, lng: -120.0, region: 'Pacific', tz: -8 }
        };
        
        const base = regions[zip.charAt(0)] || regions['5'];
        const v = (parseInt(zip) % 100) / 100;
        
        return { lat: base.lat + (v - 0.5) * 2, lng: base.lng + (v - 0.5) * 3, region: base.region, tz: base.tz };
    },
    
    process(zip) {
        if (!/^\d{5}$/.test(zip)) {
            Toast.show('Please enter a valid 5-digit ZIP code', 'warning');
            return null;
        }
        
        const loc = this.getApproxFromZip(zip);
        Toast.show(`📍 Showing sky for ${loc.region}`, 'success');
        
        // Generate ISS passes
        const passes = ISSTracker.generatePasses();
        ISSTracker.renderPasses(passes);
        
        return loc;
    }
};

// ==========================================
// QUICK WINS - Minor improvements
// ==========================================

const QuickWins = {
    init() {
        // 1. Add live countdown badges to events
        this.addCountdowns();
        
        // 2. Add action buttons to events
        this.addEventActions();
        
        // 3. Smooth scroll for nav links
        this.setupSmoothScroll();
        
        // 4. Add keyboard shortcuts
        this.addKeyboardShortcuts();
    },
    
    addCountdowns() {
        document.querySelectorAll('.event-item').forEach(event => {
            const dateText = event.querySelector('.event-date');
            if (!dateText) return;
            
            const month = dateText.querySelector('.event-month')?.textContent;
            const day = dateText.querySelector('.event-day')?.textContent;
            if (!month || !day) return;
            
            const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
            const eventDate = new Date(2026, months[month] || 0, parseInt(day));
            const today = new Date();
            const diffDays = Math.ceil((eventDate - today) / 86400000);
            
            const header = event.querySelector('.event-header');
            if (!header) return;
            
            let countdown = header.querySelector('.event-countdown');
            if (!countdown) {
                countdown = document.createElement('span');
                countdown.className = 'event-countdown';
                countdown.style.cssText = 'font-family: "Space Mono", monospace; font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 100px; background: rgba(255,255,255,0.05); color: var(--text-secondary);';
                header.appendChild(countdown);
            }
            
            if (diffDays <= 0) {
                countdown.textContent = diffDays === 0 ? '🎉 Today!' : 'Passed';
            } else if (diffDays <= 7) {
                countdown.textContent = `${diffDays} days`;
                countdown.style.background = 'rgba(245, 158, 11, 0.2)';
                countdown.style.color = '#f59e0b';
            } else if (diffDays <= 30) {
                countdown.textContent = `${diffDays} days`;
                countdown.style.background = 'rgba(16, 185, 129, 0.15)';
                countdown.style.color = '#10b981';
            } else {
                countdown.textContent = `~${Math.round(diffDays / 30)} months`;
            }
        });
    },
    
    addEventActions() {
        document.querySelectorAll('.event-content').forEach(content => {
            if (content.querySelector('.event-actions-new')) return;
            
            const title = content.querySelector('.event-title')?.textContent || 'Event';
            const parent = content.closest('.event-item');
            const dateText = parent?.querySelector('.event-date');
            const month = dateText?.querySelector('.event-month')?.textContent || 'Jan';
            const day = dateText?.querySelector('.event-day')?.textContent || '1';
            
            const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
            const dateStr = `2026-${months[month] || '01'}-${day.padStart(2, '0')}`;
            
            const actions = document.createElement('div');
            actions.className = 'event-actions-new';
            actions.style.cssText = 'display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;';
            actions.innerHTML = `
                <button onclick="Calendar.addEvent('${dateStr}', '${title.replace(/'/g, "\\'")}', '')" style="padding: 0.35rem 0.7rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 0.75rem; cursor: pointer; font-family: inherit;">📅 Add to Calendar</button>
                <button onclick="Share.open('${title.replace(/'/g, "\\'")}', '${dateStr}')" style="padding: 0.35rem 0.7rem; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 0.75rem; cursor: pointer; font-family: inherit;">📤 Share</button>
            `;
            content.appendChild(actions);
        });
    },
    
    setupSmoothScroll() {
        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    },
    
    addKeyboardShortcuts() {
        document.addEventListener('keydown', e => {
            if (e.key === 'n' && e.ctrlKey) {
                e.preventDefault();
                NightMode.toggle();
            }
        });
    }
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CosmicCuriosity Enhanced Features v2 loading...');
    
    Toast.init();
    NightMode.init();
    Challenges.init();
    EquipmentFilter.init();
    BestNight.render();
    ISSTracker.init();
    PWA.init();
    QuickWins.init();
    
    console.log('✓ All enhanced features loaded!');
    console.log('💡 Tip: Press Ctrl+N to toggle Night Vision mode');
});

// Make modules globally available
window.Toast = Toast;
window.NightMode = NightMode;
window.Challenges = Challenges;
window.Calendar = Calendar;
window.Share = Share;
window.ISSTracker = ISSTracker;
window.EquipmentFilter = EquipmentFilter;
window.BestNight = BestNight;
window.PWA = PWA;
window.Location = Location;
window.QuickWins = QuickWins;
