// ==========================================
// COSMIC CURIOSITY - UX IMPROVEMENTS v3
// Sidebar nav, loading states, smart cards, micro-interactions
// ==========================================

// ==========================================
// 1. SIDEBAR NAVIGATION SYSTEM
// ==========================================

const ToolsSidebar = {
    isOpen: window.innerWidth > 1024,
    currentTool: 'planets',
    initializedTools: {},
    
    categories: [
        {
            name: 'Sky Tonight',
            icon: '🌙',
            tools: [
                { id: 'planets', name: 'Planets', icon: '🪐', description: 'Track all 8 planets' },
                { id: 'constellations', name: 'Constellations', icon: '⭐', description: 'Star patterns guide' },
                { id: 'satellites', name: 'Satellites', icon: '🛰️', description: 'ISS & satellite passes' },
                { id: 'comets', name: 'Comets', icon: '☄️', description: 'Current bright comets' }
            ]
        },
        {
            name: 'Events & Phenomena',
            icon: '✨',
            tools: [
                { id: 'meteors', name: 'Meteor Showers', icon: '🌠', description: 'Active shower radar' },
                { id: 'aurora', name: 'Aurora Forecast', icon: '🌌', description: 'Northern lights tracker' },
                { id: 'eclipses', name: 'Eclipses', icon: '🌑', description: 'Solar & lunar eclipses' },
                { id: 'calendar', name: 'Sky Calendar', icon: '📅', description: '2026 celestial events' }
            ]
        },
        {
            name: 'Conditions & Planning',
            icon: '📊',
            tools: [
                { id: 'golden', name: 'Golden Hour', icon: '🌅', description: 'Photography times' },
                { id: 'seeing', name: 'Seeing Forecast', icon: '👁️', description: 'Atmospheric conditions' },
                { id: 'pollution', name: 'Light Pollution', icon: '🌃', description: 'Bortle scale guide' },
                { id: 'tides', name: 'Tides', icon: '🌊', description: 'Lunar tide tracker' }
            ]
        },
        {
            name: 'Solar & Space',
            icon: '☀️',
            tools: [
                { id: 'sun', name: 'Live Sun Data', icon: '☀️', description: 'Solar activity monitor' },
                { id: 'history', name: 'Space History', icon: '🚀', description: 'This day in history' },
                { id: 'exoplanets', name: 'Exoplanets', icon: '🌍', description: 'Worlds beyond' }
            ]
        },
        {
            name: 'Equipment',
            icon: '🔭',
            tools: [
                { id: 'telescope', name: 'Telescope Control', icon: '🔭', description: 'GoTo mount interface' },
                { id: 'feeds', name: 'Live Feeds', icon: '📡', description: 'Remote telescopes' }
            ]
        }
    ],
    
    init() {
        this.injectStyles();
        this.render();
        this.setupEventListeners();
        this.handleResize();
        this.checkUrlHash();
        
        // Initialize first tool after a short delay
        setTimeout(() => this.showTool('planets'), 300);
        
        return this;
    },
    
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'tools-sidebar-styles';
        style.textContent = `
            /* ===== TOOLS SECTION LAYOUT ===== */
            .tools-section {
                display: flex;
                gap: 0;
                min-height: 80vh;
                position: relative;
            }
            
            /* ===== SIDEBAR ===== */
            .tools-sidebar {
                width: 280px;
                min-width: 280px;
                background: var(--bg-card);
                border-right: 1px solid var(--border);
                border-radius: 16px 0 0 16px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .tools-sidebar.collapsed {
                width: 60px;
                min-width: 60px;
            }
            
            .sidebar-header {
                padding: 1.25rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .sidebar-title {
                font-family: 'Space Mono', monospace;
                font-size: 0.7rem;
                color: var(--text-dim);
                text-transform: uppercase;
                letter-spacing: 0.1em;
                white-space: nowrap;
                overflow: hidden;
            }
            
            .sidebar-toggle {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px solid var(--border);
                background: var(--bg-hover);
                color: var(--text-secondary);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .sidebar-toggle:hover {
                background: var(--accent-glow);
                color: white;
                border-color: var(--accent-glow);
            }
            
            .sidebar-content {
                flex: 1;
                overflow-y: auto;
                padding: 0.75rem;
            }
            
            .sidebar-content::-webkit-scrollbar {
                width: 4px;
            }
            
            .sidebar-content::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .sidebar-content::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 2px;
            }
            
            /* Category */
            .sidebar-category {
                margin-bottom: 0.5rem;
            }
            
            .category-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.6rem 0.75rem;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            
            .category-header:hover {
                background: var(--bg-hover);
            }
            
            .category-icon {
                font-size: 1rem;
                width: 24px;
                text-align: center;
                flex-shrink: 0;
            }
            
            .category-name {
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--text-dim);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
            }
            
            .category-chevron {
                font-size: 0.7rem;
                color: var(--text-dim);
                transition: transform 0.2s ease;
            }
            
            .category-header.expanded .category-chevron {
                transform: rotate(90deg);
            }
            
            .category-tools {
                display: none;
                padding-left: 0.5rem;
            }
            
            .category-tools.expanded {
                display: block;
            }
            
            /* Tool Item */
            .sidebar-tool {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                margin: 0.25rem 0;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid transparent;
            }
            
            .sidebar-tool:hover {
                background: var(--bg-hover);
                transform: translateX(4px);
            }
            
            .sidebar-tool.active {
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
                border-color: rgba(99, 102, 241, 0.3);
            }
            
            .sidebar-tool.active .tool-icon {
                transform: scale(1.1);
            }
            
            .tool-icon {
                font-size: 1.25rem;
                width: 28px;
                text-align: center;
                flex-shrink: 0;
                transition: transform 0.2s ease;
            }
            
            .tool-info {
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }
            
            .tool-name {
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .tool-desc {
                font-size: 0.75rem;
                color: var(--text-dim);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .sidebar-tool.active .tool-name {
                color: var(--accent-glow);
            }
            
            /* Badge for active/new */
            .tool-badge {
                font-size: 0.6rem;
                padding: 0.15rem 0.4rem;
                border-radius: 100px;
                background: var(--accent-warm);
                color: white;
                text-transform: uppercase;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .tool-badge.live {
                background: #10b981;
                animation: pulse-badge 2s infinite;
            }
            
            @keyframes pulse-badge {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            
            /* Collapsed state */
            .tools-sidebar.collapsed .sidebar-title,
            .tools-sidebar.collapsed .category-name,
            .tools-sidebar.collapsed .category-chevron,
            .tools-sidebar.collapsed .tool-info,
            .tools-sidebar.collapsed .tool-badge {
                display: none;
            }
            
            .tools-sidebar.collapsed .category-header,
            .tools-sidebar.collapsed .sidebar-tool {
                justify-content: center;
                padding: 0.75rem 0.5rem;
            }
            
            .tools-sidebar.collapsed .category-tools {
                display: block;
                padding-left: 0;
            }
            
            .tools-sidebar.collapsed .sidebar-tool:hover {
                transform: scale(1.1);
            }
            
            /* ===== MAIN CONTENT AREA ===== */
            .tools-main {
                flex: 1;
                min-width: 0;
                background: var(--bg-card);
                border-radius: 0 16px 16px 0;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .tools-main-header {
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .current-tool-title {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .current-tool-title .icon {
                font-size: 1.5rem;
            }
            
            .current-tool-title h3 {
                font-family: 'Instrument Serif', serif;
                font-size: 1.5rem;
                font-weight: 400;
            }
            
            .current-tool-title .desc {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }
            
            .tools-main-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .tool-action-btn {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--border);
                background: transparent;
                color: var(--text-secondary);
                font-family: inherit;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .tool-action-btn:hover {
                background: var(--bg-hover);
                color: var(--text-primary);
            }
            
            .tool-action-btn.primary {
                background: var(--accent-glow);
                border-color: var(--accent-glow);
                color: white;
            }
            
            .tool-action-btn.primary:hover {
                filter: brightness(1.1);
            }
            
            .tools-main-content {
                flex: 1;
                padding: 1.5rem;
                overflow-y: auto;
            }
            
            /* ===== LOADING STATES ===== */
            .tool-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
            }
            
            .loading-spinner {
                width: 48px;
                height: 48px;
                border: 3px solid var(--border);
                border-top-color: var(--accent-glow);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-text {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            /* Skeleton loaders */
            .skeleton {
                background: linear-gradient(90deg, var(--bg-hover) 25%, var(--bg-card) 50%, var(--bg-hover) 75%);
                background-size: 200% 100%;
                animation: skeleton-shimmer 1.5s infinite;
                border-radius: 8px;
            }
            
            @keyframes skeleton-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-card {
                height: 120px;
                margin-bottom: 1rem;
            }
            
            .skeleton-line {
                height: 16px;
                margin-bottom: 0.5rem;
            }
            
            .skeleton-line.short {
                width: 60%;
            }
            
            /* ===== MOBILE STYLES ===== */
            @media (max-width: 1024px) {
                .tools-section {
                    flex-direction: column;
                }
                
                .tools-sidebar {
                    width: 100%;
                    min-width: 100%;
                    border-radius: 16px 16px 0 0;
                    border-right: none;
                    border-bottom: 1px solid var(--border);
                    max-height: 60px;
                    overflow: hidden;
                }
                
                .tools-sidebar.mobile-open {
                    max-height: 70vh;
                }
                
                .tools-main {
                    border-radius: 0 0 16px 16px;
                }
                
                .sidebar-content {
                    padding: 0.5rem;
                }
            }
            
            /* ===== MICRO-INTERACTIONS ===== */
            .hover-lift {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .hover-lift:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
            
            .press-effect:active {
                transform: scale(0.98);
            }
            
            .count-up {
                display: inline-block;
            }
            
            /* ===== CARD SYSTEM ===== */
            .card {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: 12px;
                transition: all 0.2s ease;
            }
            
            .card-primary {
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-card) 100%);
                border-color: rgba(99, 102, 241, 0.15);
            }
            
            .card-success {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%);
                border-color: rgba(16, 185, 129, 0.15);
            }
            
            .card-warning {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card) 100%);
                border-color: rgba(245, 158, 11, 0.15);
            }
            
            .card-danger {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-card) 100%);
                border-color: rgba(239, 68, 68, 0.15);
            }
            
            /* ===== TOOL PANEL TRANSITIONS ===== */
            .tool-panel {
                animation: fadeSlideIn 0.3s ease forwards;
            }
            
            @keyframes fadeSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    render() {
        const container = document.getElementById('tools');
        console.log('ToolsSidebar render - container:', container);
        if (!container) {
            console.error('Tools container not found!');
            return;
        }
        
        container.innerHTML = `
            <div class="section-header fade-in">
                <div class="section-label">Professional Features</div>
                <h2 class="section-title">Advanced Astronomy Tools</h2>
            </div>
            
            <!-- Tonight's Pick Smart Card -->
            <div id="tonights-pick" class="fade-in" style="margin-bottom: 2rem;"></div>
            
            <!-- Tools Layout -->
            <div class="tools-section fade-in">
                <!-- Sidebar -->
                <div class="tools-sidebar ${this.isOpen ? '' : 'collapsed'}" id="tools-sidebar">
                    <div class="sidebar-header">
                        <span class="sidebar-title">Tools</span>
                        <button class="sidebar-toggle" onclick="ToolsSidebar.toggle()" aria-label="Toggle sidebar">
                            <span id="sidebar-toggle-icon">${this.isOpen ? '◀' : '▶'}</span>
                        </button>
                    </div>
                    <div class="sidebar-content">
                        ${this.categories.map((cat, i) => this.renderCategory(cat, i === 0)).join('')}
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="tools-main">
                    <div class="tools-main-header" id="tools-header">
                        <div class="current-tool-title">
                            <span class="icon" id="current-tool-icon">🪐</span>
                            <div>
                                <h3 id="current-tool-name">Planets</h3>
                                <div class="desc" id="current-tool-desc">Track all 8 planets</div>
                            </div>
                        </div>
                        <div class="tools-main-actions">
                            <button class="tool-action-btn" onclick="ToolsSidebar.refresh()">
                                🔄 Refresh
                            </button>
                        </div>
                    </div>
                    <div class="tools-main-content" id="tools-content">
                        ${this.renderLoading()}
                    </div>
                </div>
            </div>
            
            <!-- Time Slider -->
            <div id="time-slider-container" class="fade-in" style="margin-top: 2rem;"></div>
        `;
        
        // Render smart card
        TonightsPick.render('tonights-pick');
        
        // Render time slider
        TimeSlider.render('time-slider-container');
    },
    
    renderCategory(category, expanded = false) {
        return `
            <div class="sidebar-category">
                <div class="category-header ${expanded ? 'expanded' : ''}" onclick="ToolsSidebar.toggleCategory(this)">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                    <span class="category-chevron">▶</span>
                </div>
                <div class="category-tools ${expanded ? 'expanded' : ''}">
                    ${category.tools.map(tool => this.renderToolItem(tool)).join('')}
                </div>
            </div>
        `;
    },
    
    renderToolItem(tool) {
        const isActive = tool.id === this.currentTool;
        const badge = this.getToolBadge(tool.id);
        
        return `
            <div class="sidebar-tool ${isActive ? 'active' : ''}" 
                 data-tool="${tool.id}"
                 onclick="ToolsSidebar.showTool('${tool.id}')"
                 title="${tool.name}: ${tool.description}">
                <span class="tool-icon">${tool.icon}</span>
                <div class="tool-info">
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-desc">${tool.description}</div>
                </div>
                ${badge ? `<span class="tool-badge ${badge.class}">${badge.text}</span>` : ''}
            </div>
        `;
    },
    
    getToolBadge(toolId) {
        // Dynamic badges based on conditions
        const now = new Date();
        const hour = now.getHours();
        
        if (toolId === 'meteors' && window.AstroEngine) {
            const showers = AstroEngine.getActiveShowers(now);
            if (showers.length > 0) return { text: 'Active', class: 'live' };
        }
        
        if (toolId === 'golden' && (hour >= 5 && hour <= 8 || hour >= 16 && hour <= 20)) {
            return { text: 'Now', class: 'live' };
        }
        
        if (toolId === 'aurora') {
            return { text: 'New', class: '' };
        }
        
        return null;
    },
    
    renderLoading() {
        return `
            <div class="tool-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading tool...</div>
            </div>
        `;
    },
    
    renderSkeleton() {
        return `
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-card"></div>
        `;
    },
    
    toggle() {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById('tools-sidebar');
        const icon = document.getElementById('sidebar-toggle-icon');
        
        if (this.isOpen) {
            sidebar.classList.remove('collapsed');
            icon.textContent = '◀';
        } else {
            sidebar.classList.add('collapsed');
            icon.textContent = '▶';
        }
        
        // Save preference
        localStorage.setItem('sidebarOpen', this.isOpen);
    },
    
    toggleCategory(header) {
        header.classList.toggle('expanded');
        header.nextElementSibling.classList.toggle('expanded');
    },
    
    showTool(toolId) {
        // Update URL hash
        history.replaceState(null, '', `#tools/${toolId}`);
        
        // Update current tool
        this.currentTool = toolId;
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-tool').forEach(el => {
            el.classList.toggle('active', el.dataset.tool === toolId);
        });
        
        // Get tool info
        let toolInfo = null;
        for (const cat of this.categories) {
            const found = cat.tools.find(t => t.id === toolId);
            if (found) { toolInfo = found; break; }
        }
        
        // Update header
        if (toolInfo) {
            document.getElementById('current-tool-icon').textContent = toolInfo.icon;
            document.getElementById('current-tool-name').textContent = toolInfo.name;
            document.getElementById('current-tool-desc').textContent = toolInfo.description;
        }
        
        // Show loading state
        const content = document.getElementById('tools-content');
        content.innerHTML = this.renderLoading();
        
        // Initialize tool after brief delay (for loading UX)
        setTimeout(() => {
            this.initTool(toolId);
        }, 300);
    },
    
    initTool(toolId) {
        const content = document.getElementById('tools-content');
        
        // Create container for tool
        content.innerHTML = `<div id="tool-${toolId}" class="tool-panel"></div>`;
        
        const toolMap = {
            'planets': () => window.PlanetTracker?.init(`tool-${toolId}`),
            'meteors': () => window.MeteorRadar?.init(`tool-${toolId}`),
            'aurora': () => window.AuroraForecast?.init(`tool-${toolId}`),
            'constellations': () => window.ConstellationGuide?.init(`tool-${toolId}`),
            'eclipses': () => window.EclipseVisualizer?.init(`tool-${toolId}`),
            'calendar': () => window.AnnualCalendar?.init(`tool-${toolId}`),
            'golden': () => window.GoldenHourCalc?.init(`tool-${toolId}`),
            'seeing': () => window.SeeingForecast?.init(`tool-${toolId}`),
            'history': () => window.SpaceHistory?.init(`tool-${toolId}`),
            'sun': () => window.LiveSunData?.init(`tool-${toolId}`),
            'tides': () => window.TideTracker?.init(`tool-${toolId}`),
            'satellites': () => window.SatelliteTracker?.init(`tool-${toolId}`),
            'comets': () => window.CometWatch?.init(`tool-${toolId}`),
            'pollution': () => window.LightPollutionMap?.init(`tool-${toolId}`),
            'telescope': () => window.TelescopeControl?.init(`tool-${toolId}`),
            'exoplanets': () => window.ExoplanetExplorer?.init(`tool-${toolId}`),
            'feeds': () => window.LiveFeeds?.init(`tool-${toolId}`)
        };
        
        if (toolMap[toolId]) {
            toolMap[toolId]();
        } else {
            content.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔧</div>
                    <h3>Tool Coming Soon</h3>
                    <p style="color: var(--text-secondary);">This feature is under development.</p>
                </div>
            `;
        }
        
        this.initializedTools[toolId] = true;
    },
    
    refresh() {
        this.initializedTools[this.currentTool] = false;
        this.showTool(this.currentTool);
        if (window.Toast) Toast.show('🔄 Refreshed!', 'success');
    },
    
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Handle hash changes
        window.addEventListener('hashchange', () => this.checkUrlHash());
    },
    
    handleResize() {
        const isMobile = window.innerWidth <= 1024;
        const sidebar = document.getElementById('tools-sidebar');
        
        if (isMobile && sidebar) {
            sidebar.classList.remove('collapsed');
        }
    },
    
    checkUrlHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#tools/')) {
            const toolId = hash.replace('#tools/', '');
            if (this.categories.some(c => c.tools.some(t => t.id === toolId))) {
                this.showTool(toolId);
            }
        }
    }
};

// ==========================================
// 2. TONIGHT'S PICK SMART CARD
// ==========================================

const TonightsPick = {
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const pick = this.getTopPick();
        
        container.innerHTML = `
            <div class="card card-primary hover-lift" style="padding: 1.5rem; cursor: pointer;" onclick="ToolsSidebar.showTool('${pick.toolId}')">
                <div style="display: flex; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap;">
                    <div style="font-size: 3rem; line-height: 1;">${pick.icon}</div>
                    <div style="flex: 1; min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <span style="font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--accent-glow); text-transform: uppercase; letter-spacing: 0.1em;">✨ Tonight's Top Pick</span>
                            <span style="font-size: 0.65rem; padding: 0.2rem 0.5rem; background: rgba(16, 185, 129, 0.15); color: #10b981; border-radius: 100px;">Visible Now</span>
                        </div>
                        <h3 style="font-family: 'Instrument Serif', serif; font-size: 1.5rem; margin-bottom: 0.5rem;">${pick.title}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${pick.description}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-family: 'Space Mono', monospace; font-size: 1.75rem; color: var(--accent-glow);">${pick.value}</div>
                        <div style="font-size: 0.75rem; color: var(--text-dim);">${pick.valueLabel}</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">
                        <strong>Best time:</strong> ${pick.bestTime} &nbsp;•&nbsp; <strong>Direction:</strong> ${pick.direction}
                    </span>
                    <span style="color: var(--accent-glow); font-size: 0.9rem;">View in ${pick.toolName} →</span>
                </div>
            </div>
        `;
    },
    
    getTopPick() {
        const hour = new Date().getHours();
        const isNight = hour >= 19 || hour <= 5;
        
        // Dynamic picks based on time and conditions
        const picks = [
            {
                icon: '🪐',
                title: 'Jupiter is at its brightest!',
                description: 'The king of planets dominates the evening sky. Its four Galilean moons are easily visible through binoculars.',
                value: '-2.7',
                valueLabel: 'Magnitude',
                bestTime: '8 PM - 2 AM',
                direction: 'East → South',
                toolId: 'planets',
                toolName: 'Planet Tracker',
                priority: isNight ? 10 : 5
            },
            {
                icon: '🌙',
                title: 'Waxing Gibbous Moon',
                description: 'Great night for lunar observing! Look for the Tycho crater and the Sea of Tranquility.',
                value: '78%',
                valueLabel: 'Illumination',
                bestTime: 'After sunset',
                direction: 'Southeast',
                toolId: 'planets',
                toolName: 'Planet Tracker',
                priority: 8
            },
            {
                icon: '🌌',
                title: 'Aurora Watch Active',
                description: 'Elevated solar activity means increased aurora chances for northern latitudes tonight.',
                value: 'Kp 4',
                valueLabel: 'Geomagnetic',
                bestTime: '11 PM - 3 AM',
                direction: 'Northern horizon',
                toolId: 'aurora',
                toolName: 'Aurora Forecast',
                priority: 7
            },
            {
                icon: '🌅',
                title: 'Golden Hour in 2 hours',
                description: 'Perfect conditions for astrophotography and landscape shots. Warm, soft light ahead.',
                value: '5:42',
                valueLabel: 'PM Start',
                bestTime: 'Next 2 hours',
                direction: 'Western sky',
                toolId: 'golden',
                toolName: 'Golden Hour',
                priority: !isNight ? 9 : 3
            }
        ];
        
        // Sort by priority and return top
        picks.sort((a, b) => b.priority - a.priority);
        return picks[0];
    }
};

// ==========================================
// 3. TIME TRAVEL SLIDER
// ==========================================

const TimeSlider = {
    currentOffset: 0, // hours from now
    
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const now = new Date();
        const hours = [];
        for (let i = 0; i <= 12; i++) {
            const time = new Date(now.getTime() + i * 3600000);
            hours.push({
                offset: i,
                label: i === 0 ? 'Now' : time.toLocaleTimeString('en', { hour: 'numeric' }),
                isNight: time.getHours() >= 19 || time.getHours() <= 5
            });
        }
        
        container.innerHTML = `
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <div style="font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em;">Time Travel</div>
                        <div style="font-size: 1rem; color: var(--text-primary);">See the sky at different times</div>
                    </div>
                    <div style="font-family: 'Space Mono', monospace; font-size: 1.25rem; color: var(--accent-glow);" id="time-display">
                        ${now.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                </div>
                
                <div style="position: relative; padding: 0.5rem 0;">
                    <input type="range" min="0" max="12" value="0" 
                           style="width: 100%; height: 8px; -webkit-appearance: none; background: linear-gradient(90deg, var(--accent-glow) 0%, var(--accent-cool) 100%); border-radius: 4px; cursor: pointer;"
                           oninput="TimeSlider.update(this.value)"
                           id="time-slider">
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.7rem; color: var(--text-dim);">
                        ${hours.filter((_, i) => i % 3 === 0).map(h => `
                            <span style="color: ${h.isNight ? 'var(--accent-glow)' : 'var(--text-dim)'};">${h.label}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="TimeSlider.setTime(0)" class="tool-action-btn press-effect" style="flex: 1;">Now</button>
                    <button onclick="TimeSlider.setTime(2)" class="tool-action-btn press-effect" style="flex: 1;">+2h</button>
                    <button onclick="TimeSlider.setTime(6)" class="tool-action-btn press-effect" style="flex: 1;">+6h</button>
                    <button onclick="TimeSlider.setTime(12)" class="tool-action-btn press-effect" style="flex: 1;">+12h</button>
                </div>
            </div>
        `;
    },
    
    update(offset) {
        this.currentOffset = parseInt(offset);
        const futureTime = new Date(Date.now() + this.currentOffset * 3600000);
        document.getElementById('time-display').textContent = 
            futureTime.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
        
        // Could trigger tool updates here
        // window.dispatchEvent(new CustomEvent('timechange', { detail: { offset: this.currentOffset } }));
    },
    
    setTime(hours) {
        document.getElementById('time-slider').value = hours;
        this.update(hours);
    }
};

// ==========================================
// 4. MOBILE BOTTOM NAVIGATION
// ==========================================

const MobileNav = {
    init() {
        if (window.innerWidth > 768) return;
        
        const nav = document.createElement('div');
        nav.id = 'mobile-bottom-nav';
        nav.innerHTML = `
            <a href="#tonight" class="mobile-nav-item">
                <span class="mobile-nav-icon">🌙</span>
                <span class="mobile-nav-label">Tonight</span>
            </a>
            <a href="#tools" onclick="ToolsSidebar.showTool('planets')" class="mobile-nav-item">
                <span class="mobile-nav-icon">🪐</span>
                <span class="mobile-nav-label">Planets</span>
            </a>
            <a href="#tools" class="mobile-nav-item mobile-nav-center">
                <span class="mobile-nav-icon">🔭</span>
                <span class="mobile-nav-label">Tools</span>
            </a>
            <a href="#tools" onclick="ToolsSidebar.showTool('meteors')" class="mobile-nav-item">
                <span class="mobile-nav-icon">☄️</span>
                <span class="mobile-nav-label">Meteors</span>
            </a>
            <a href="#events" class="mobile-nav-item">
                <span class="mobile-nav-icon">📅</span>
                <span class="mobile-nav-label">Events</span>
            </a>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #mobile-bottom-nav {
                display: none;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(10, 10, 26, 0.95);
                backdrop-filter: blur(20px);
                border-top: 1px solid var(--border);
                padding: 0.5rem 0.25rem calc(0.5rem + env(safe-area-inset-bottom));
                z-index: 1000;
                justify-content: space-around;
            }
            
            @media (max-width: 768px) {
                #mobile-bottom-nav {
                    display: flex;
                }
                
                body {
                    padding-bottom: 70px;
                }
            }
            
            .mobile-nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
                padding: 0.5rem;
                color: var(--text-secondary);
                text-decoration: none;
                border-radius: 8px;
                transition: all 0.2s ease;
                min-width: 60px;
            }
            
            .mobile-nav-item:active {
                transform: scale(0.95);
                background: var(--bg-hover);
            }
            
            .mobile-nav-icon {
                font-size: 1.25rem;
            }
            
            .mobile-nav-label {
                font-size: 0.65rem;
                font-weight: 500;
            }
            
            .mobile-nav-center {
                background: var(--accent-glow);
                color: white;
                border-radius: 12px;
                margin-top: -1rem;
                padding: 0.75rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(nav);
        
        return this;
    }
};

// ==========================================
// 5. MICRO-INTERACTIONS & ANIMATIONS
// ==========================================

const MicroInteractions = {
    init() {
        // Add hover lift to all cards
        this.observeNewElements();
        
        // Count-up animation for numbers
        this.initCountUp();
        
        // Button press effects
        this.initPressEffects();
        
        return this;
    },
    
    observeNewElements() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // Add hover-lift to cards
                        node.querySelectorAll?.('.card, [style*="border-radius: 12px"], [style*="border-radius: 16px"]')
                            .forEach(el => {
                                if (!el.classList.contains('hover-lift')) {
                                    el.classList.add('hover-lift');
                                }
                            });
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    },
    
    initCountUp() {
        const countUp = (el, target, duration = 1000) => {
            const start = 0;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                const current = Math.floor(start + (target - start) * eased);
                
                el.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        };
        
        // Expose globally
        window.countUp = countUp;
    },
    
    initPressEffects() {
        document.addEventListener('mousedown', (e) => {
            if (e.target.matches('button, .press-effect')) {
                e.target.style.transform = 'scale(0.98)';
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.target.matches('button, .press-effect')) {
                e.target.style.transform = '';
            }
        });
    }
};

// ==========================================
// 6. PROGRESS/ACHIEVEMENT SYSTEM
// ==========================================

const Achievements = {
    achievements: [
        { id: 'first_visit', name: 'First Light', desc: 'Welcome to CosmicCuriosity!', icon: '🌟', unlocked: true },
        { id: 'planet_viewer', name: 'Planet Spotter', desc: 'View all visible planets', icon: '🪐', unlocked: false },
        { id: 'meteor_watcher', name: 'Meteor Hunter', desc: 'Check during a meteor shower', icon: '☄️', unlocked: false },
        { id: 'night_owl', name: 'Night Owl', desc: 'Use the app after midnight', icon: '🦉', unlocked: false },
        { id: 'eclipse_tracker', name: 'Eclipse Chaser', desc: 'Track an upcoming eclipse', icon: '🌑', unlocked: false }
    ],
    
    check() {
        const hour = new Date().getHours();
        
        // Night owl achievement
        if (hour >= 0 && hour <= 4) {
            this.unlock('night_owl');
        }
        
        // Load from localStorage
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const unlocked = JSON.parse(saved);
            this.achievements.forEach(a => {
                if (unlocked.includes(a.id)) a.unlocked = true;
            });
        }
    },
    
    unlock(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            
            // Save
            const unlocked = this.achievements.filter(a => a.unlocked).map(a => a.id);
            localStorage.setItem('achievements', JSON.stringify(unlocked));
            
            // Show notification
            if (window.Toast) {
                Toast.show(`🏆 Achievement: ${achievement.name}!`, 'success', 5000);
            }
        }
    },
    
    getProgress() {
        const unlocked = this.achievements.filter(a => a.unlocked).length;
        return {
            unlocked,
            total: this.achievements.length,
            percent: Math.round((unlocked / this.achievements.length) * 100)
        };
    }
};

// ==========================================
// INITIALIZE ALL UX IMPROVEMENTS
// ==========================================

const UXImprovements = {
    init() {
        console.log('🎨 Initializing UX improvements...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    },
    
    setup() {
        // Initialize all modules
        ToolsSidebar.init();
        MobileNav.init();
        MicroInteractions.init();
        Achievements.check();
        
        console.log('✨ UX improvements loaded!');
    }
};

// Auto-initialize
UXImprovements.init();

// Export modules
window.ToolsSidebar = ToolsSidebar;
window.TonightsPick = TonightsPick;
window.TimeSlider = TimeSlider;
window.MobileNav = MobileNav;
window.MicroInteractions = MicroInteractions;
window.Achievements = Achievements;
