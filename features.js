// ==========================================
// COSMIC CURIOSITY - ENHANCED FEATURES v2
// Features: Night Mode, Gamification, Calendar, Share, Weather, PWA
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
                --bg-card: #1a0505 !important;
                --bg-hover: #2a0a0a !important;
                --accent-glow: #cc3333 !important;
                --accent-warm: #cc3333 !important;
                --accent-cool: #cc3333 !important;
                --accent-rose: #cc3333 !important;
                --accent-green: #cc3333 !important;
                --text-primary: #ff6666 !important;
                --text-secondary: #cc4444 !important;
                --text-dim: #993333 !important;
                --border: rgba(180,60,60,0.4) !important;
            }
            
            /* Ensure buttons and interactive elements are readable */
            body.night-mode .location-btn,
            body.night-mode .zip-submit-btn,
            body.night-mode button[type="submit"] {
                background: linear-gradient(135deg, #cc3333, #ff5555) !important;
                color: #1a0000 !important;
            }
            
            /* Cards need more contrast */
            body.night-mode .glass-card,
            body.night-mode .location-card,
            body.night-mode .sky-summary-card,
            body.night-mode .event-item,
            body.night-mode .news-card,
            body.night-mode .gallery-item {
                background: rgba(30, 10, 10, 0.9) !important;
                border-color: rgba(180, 60, 60, 0.3) !important;
            }
            
            /* Nav links */
            body.night-mode nav a {
                color: #cc4444 !important;
            }
            body.night-mode nav a:hover,
            body.night-mode nav a.active {
                color: #ff6666 !important;
                background: rgba(180, 60, 60, 0.2) !important;
            }
            
            /* Mobile nav */
            body.night-mode .mobile-bottom-nav {
                background: rgba(15, 5, 5, 0.98) !important;
                border-color: rgba(180, 60, 60, 0.3) !important;
            }
            body.night-mode .mobile-bottom-nav a {
                color: #aa3333 !important;
            }
            body.night-mode .mobile-bottom-nav a.active {
                color: #ff6666 !important;
            }
            
            /* Badges and tags */
            body.night-mode .visibility-badge,
            body.night-mode .event-tag,
            body.night-mode .news-category {
                background: rgba(180, 60, 60, 0.2) !important;
                color: #ff6666 !important;
            }
            
            /* Input fields */
            body.night-mode input,
            body.night-mode .zip-input {
                background: #1a0505 !important;
                border-color: rgba(180, 60, 60, 0.4) !important;
                color: #ff6666 !important;
            }
            body.night-mode input::placeholder {
                color: #883333 !important;
            }
            
            /* Stat values */
            body.night-mode .stat-value,
            body.night-mode .condition-value,
            body.night-mode .sky-object-name {
                color: #ff6666 !important;
            }
            
            /* Labels and secondary text - ensure minimum contrast */
            body.night-mode .stat-label,
            body.night-mode .condition-label,
            body.night-mode .event-date,
            body.night-mode .privacy-note,
            body.night-mode .summary-highlight-label {
                color: #aa4444 !important;
            }
            
            /* Moon and icons */
            body.night-mode .moon-display,
            body.night-mode .summary-highlight-icon {
                filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(-50deg) saturate(3);
            }
            
            /* Images - strong red filter */
            body.night-mode img:not(.logo-icon img),
            body.night-mode .news-image,
            body.night-mode .gallery-item img,
            body.night-mode .apod-hero {
                filter: grayscale(100%) brightness(0.3) sepia(100%) hue-rotate(-50deg) saturate(5);
            }
            
            /* Background elements */
            body.night-mode .nebula { opacity: 0.02; }
            body.night-mode .star-field { opacity: 0.3; }
            
            /* Toggle button */
            .night-toggle-btn {
                display: flex; align-items: center; justify-content: center; gap: 0.35rem;
                padding: 0.4rem 0.75rem; border-radius: 20px;
                border: 1px solid var(--border, rgba(255,255,255,0.08));
                background: transparent; cursor: pointer;
                font-size: 0.75rem; font-weight: 500;
                color: var(--text-secondary);
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            .night-toggle-btn svg {
                width: 16px; height: 16px;
                stroke: currentColor; fill: none;
                stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
            }
            .night-toggle-btn:hover { 
                background: var(--bg-hover, #0f0f25); 
                border-color: #ef4444;
                color: #ef4444;
            }
            body.night-mode .night-toggle-btn { 
                background: rgba(180, 60, 60, 0.3); 
                border-color: #ff5555; 
                color: #ff6666;
            }
            
            /* Ensure hero text is readable */
            body.night-mode .hero h1,
            body.night-mode .hero em {
                color: #ff6666 !important;
                text-shadow: 0 0 30px rgba(255, 80, 80, 0.3);
            }
            body.night-mode .hero-subtitle {
                color: #cc4444 !important;
            }
            
            /* Section headers */
            body.night-mode .section-header h2 {
                color: #ff6666 !important;
            }
            body.night-mode .section-header p {
                color: #aa4444 !important;
            }
            
            @media (max-width: 768px) {
                .night-toggle-btn span { display: none; }
                .night-toggle-btn { padding: 0.5rem; border-radius: 50%; }
            }
        `;
        document.head.appendChild(style);
        
        // Create button with eye icon
        const btn = document.createElement('button');
        btn.className = 'night-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle night vision mode - uses red light to preserve dark-adapted eyes for stargazing');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Night Vision</span>
        `;
        btn.title = 'Night Vision Mode\nUses red light to preserve your dark-adapted eyes while stargazing';
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
        Toast.show('👁️ Night Vision ON — Red light preserves dark-adapted eyes', 'info');
    },
    
    disable() {
        this.enabled = false;
        document.body.classList.remove('night-mode');
        localStorage.setItem('nightMode', 'false');
        Toast.show('Night Vision OFF — Normal colors restored', 'info');
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
        this.todayCompleted = localStorage.getItem('challengeCompletedDate') === this.today;
        
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
            <div id="challenge-card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 1.25rem 1.5rem; max-width: 500px; margin: 1.5rem auto 0; text-align: left; position: relative; overflow: hidden;">
                <div id="celebration-container" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden;"></div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <span style="font-size: 1.5rem;">${this.current.badge}</span>
                    <div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 0.65rem; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">Tonight's Challenge</div>
                        <div style="font-size: 1rem; font-weight: 600;">${this.current.title}</div>
                    </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary, #9898b0); margin-bottom: 1rem; line-height: 1.5;">${this.current.desc}</p>
                <button id="challenge-btn" onclick="Challenges.complete()" style="padding: 0.5rem 1.25rem; border-radius: 20px; border: ${this.todayCompleted ? '1px solid #10b981' : 'none'}; background: ${this.todayCompleted ? 'transparent' : 'linear-gradient(135deg, #10b981, #06b6d4)'}; color: ${this.todayCompleted ? '#10b981' : 'white'}; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.3s ease; ${this.todayCompleted ? '' : 'box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);'}">${this.todayCompleted ? '✓ Completed!' : 'I Did It!'}</button>
            </div>
        `;
    },
    
    complete() {
        if (this.todayCompleted) return;
        this.todayCompleted = true;
        localStorage.setItem('challengeCompletedDate', this.today);
        
        // Trigger celebration animation
        this.celebrate();
        
        // Update button with animation
        const btn = document.getElementById('challenge-btn');
        if (btn) {
            btn.style.transform = 'scale(1.1)';
            btn.style.background = 'transparent';
            btn.style.border = '1px solid #10b981';
            btn.style.color = '#10b981';
            btn.style.boxShadow = 'none';
            btn.textContent = '✓ Completed!';
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 300);
        }
        
        Toast.show(`🎉 Amazing! Challenge complete!`, 'success');
    },
    
    celebrate() {
        const container = document.getElementById('celebration-container');
        if (!container) return;
        
        // Create shooting stars, sparkles, and confetti
        const particles = [];
        const emojis = ['⭐', '✨', '🌟', '💫', '🎉', '🌙', '☄️', '🪐', '🚀'];
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const startX = Math.random() * 100;
            const startY = 100 + Math.random() * 20;
            const endY = -20 - Math.random() * 30;
            const duration = 1 + Math.random() * 1.5;
            const delay = Math.random() * 0.5;
            const drift = (Math.random() - 0.5) * 100;
            const rotation = Math.random() * 720 - 360;
            
            particle.textContent = emoji;
            particle.style.cssText = `
                position: absolute;
                left: ${startX}%;
                bottom: 0;
                font-size: ${0.8 + Math.random() * 1.2}rem;
                opacity: 0;
                animation: celebrateParticle ${duration}s ease-out ${delay}s forwards;
                --endY: ${endY}%;
                --drift: ${drift}px;
                --rotation: ${rotation}deg;
            `;
            
            container.appendChild(particle);
            particles.push(particle);
        }
        
        // Add keyframes if not already added
        if (!document.getElementById('celebrate-keyframes')) {
            const style = document.createElement('style');
            style.id = 'celebrate-keyframes';
            style.textContent = `
                @keyframes celebrateParticle {
                    0% { 
                        opacity: 1; 
                        transform: translateY(0) translateX(0) rotate(0deg) scale(0.5); 
                    }
                    50% { 
                        opacity: 1; 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(var(--endY)) translateX(var(--drift)) rotate(var(--rotation)) scale(1.2); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Clean up particles after animation
        setTimeout(() => {
            particles.forEach(p => p.remove());
        }, 3000);
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
                url: 'https://cosmiccuriosity.io/#events'
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
        const url = 'https://cosmiccuriosity.io/#events';
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
// ==========================================
// 5. EQUIPMENT FILTER
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
            // Skip if already has our new actions OR has existing action buttons
            if (content.querySelector('.event-actions-new') || content.querySelector('.event-actions')) return;
            
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
window.EquipmentFilter = EquipmentFilter;
window.BestNight = BestNight;
window.PWA = PWA;
window.Location = Location;
window.QuickWins = QuickWins;
