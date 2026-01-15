// ==========================================
// COSMIC CURIOSITY - INTERACTIVE STAR MAP
// Canvas-based sky visualization
// ==========================================

const StarMap = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 800,
    centerX: 400,
    centerY: 400,
    radius: 380,
    
    // Display settings
    settings: {
        showGrid: true,
        showConstellations: true,
        showConstellationLines: true,
        showPlanets: true,
        showDeepSky: false,
        showLabels: true,
        showMilkyWay: true,
        timeOffset: 0, // hours from now
        theme: 'dark' // dark, red, blue
    },
    
    // Star catalog (bright stars)
    stars: [
        { name: 'Sirius', ra: 101.29, dec: -16.72, mag: -1.46 },
        { name: 'Canopus', ra: 95.99, dec: -52.70, mag: -0.72 },
        { name: 'Arcturus', ra: 213.92, dec: 19.18, mag: -0.05 },
        { name: 'Vega', ra: 279.23, dec: 38.78, mag: 0.03 },
        { name: 'Capella', ra: 79.17, dec: 46.00, mag: 0.08 },
        { name: 'Rigel', ra: 78.63, dec: -8.20, mag: 0.13 },
        { name: 'Procyon', ra: 114.83, dec: 5.22, mag: 0.34 },
        { name: 'Betelgeuse', ra: 88.79, dec: 7.41, mag: 0.42 },
        { name: 'Altair', ra: 297.70, dec: 8.87, mag: 0.76 },
        { name: 'Aldebaran', ra: 68.98, dec: 16.51, mag: 0.85 },
        { name: 'Spica', ra: 201.30, dec: -11.16, mag: 0.97 },
        { name: 'Antares', ra: 247.35, dec: -26.43, mag: 1.06 },
        { name: 'Pollux', ra: 116.33, dec: 28.03, mag: 1.14 },
        { name: 'Fomalhaut', ra: 344.41, dec: -29.62, mag: 1.16 },
        { name: 'Deneb', ra: 310.36, dec: 45.28, mag: 1.25 },
        { name: 'Regulus', ra: 152.09, dec: 11.97, mag: 1.35 },
        { name: 'Castor', ra: 113.65, dec: 31.89, mag: 1.58 },
        { name: 'Polaris', ra: 37.95, dec: 89.26, mag: 1.98 },
        // Add more stars for richer display
        { ra: 81.28, dec: 6.35, mag: 1.64 }, // Bellatrix
        { ra: 84.05, dec: -1.20, mag: 1.70 }, // Alnilam
        { ra: 81.12, dec: -1.94, mag: 1.77 }, // Alnitak
        { ra: 77.29, dec: 8.87, mag: 2.06 }, // Mintaka
        { ra: 165.93, dec: 61.75, mag: 1.79 }, // Dubhe
        { ra: 200.98, dec: 54.93, mag: 1.77 }, // Alioth
        { ra: 193.51, dec: 55.96, mag: 1.86 }, // Mizar
        { ra: 206.88, dec: 49.31, mag: 1.85 }, // Alkaid
        { ra: 166.00, dec: 56.38, mag: 2.37 }, // Merak
        { ra: 178.46, dec: 53.69, mag: 2.44 }, // Phecda
        { ra: 183.86, dec: 57.03, mag: 3.31 }, // Megrez
    ],
    
    // Random background stars
    bgStars: [],
    
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Star map container not found');
            return;
        }
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'starmap-canvas';
        this.canvas.style.cssText = 'width: 100%; max-width: 800px; aspect-ratio: 1; border-radius: 50%; cursor: grab;';
        container.appendChild(this.canvas);
        
        // Set up canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Generate background stars
        this.generateBgStars();
        
        // Set up interactions
        this.setupInteractions();
        
        // Initial render
        this.render();
        
        // Auto-update every minute
        setInterval(() => this.render(), 60000);
        
        return this;
    },
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width * dpr;
        this.height = rect.width * dpr; // Keep square
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = this.width / 2 - 20;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(dpr, dpr);
        this.render();
    },
    
    generateBgStars() {
        this.bgStars = [];
        for (let i = 0; i < 500; i++) {
            this.bgStars.push({
                ra: Math.random() * 360,
                dec: (Math.random() - 0.5) * 180,
                mag: 3 + Math.random() * 3,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    },
    
    setupInteractions() {
        let isDragging = false;
        let lastX, lastY;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastX;
            this.settings.timeOffset += dx * 0.02; // 1 hour per 50px drag
            lastX = e.clientX;
            lastY = e.clientY;
            this.render();
        });
        
        window.addEventListener('mouseup', () => {
            isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            lastX = e.touches[0].clientX;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - lastX;
            this.settings.timeOffset += dx * 0.02;
            lastX = e.touches[0].clientX;
            this.render();
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Click on objects
        this.canvas.addEventListener('click', (e) => {
            if (Math.abs(e.clientX - lastX) > 5) return; // Was dragging
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleClick(x, y);
        });
    },
    
    handleClick(x, y) {
        const date = this.getDisplayDate();
        const scale = this.canvas.getBoundingClientRect().width / this.width;
        const clickX = x / scale;
        const clickY = y / scale;
        
        // Check planets
        const planets = AstroEngine.getAllPlanets(date);
        for (const planet of planets) {
            if (planet.altitude < 0) continue;
            const pos = AstroEngine.horizontalToCanvas(planet.altitude, planet.azimuth, this.centerX, this.centerY, this.radius);
            const dist = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
            if (dist < 20) {
                this.showObjectInfo(planet, 'planet');
                return;
            }
        }
        
        // Check bright stars
        for (const star of this.stars) {
            if (!star.name) continue;
            const horizontal = AstroEngine.equatorialToHorizontal(star.ra, star.dec, date);
            if (horizontal.altitude < 0) continue;
            const pos = AstroEngine.horizontalToCanvas(horizontal.altitude, horizontal.azimuth, this.centerX, this.centerY, this.radius);
            const dist = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
            if (dist < 15) {
                this.showObjectInfo({ ...star, ...horizontal }, 'star');
                return;
            }
        }
        
        // Check constellations
        for (const c of AstroEngine.constellations) {
            const horizontal = AstroEngine.equatorialToHorizontal(c.ra, c.dec, date);
            if (horizontal.altitude < 0) continue;
            const pos = AstroEngine.horizontalToCanvas(horizontal.altitude, horizontal.azimuth, this.centerX, this.centerY, this.radius);
            const dist = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
            if (dist < 30) {
                this.showObjectInfo({ ...c, ...horizontal }, 'constellation');
                return;
            }
        }
    },
    
    showObjectInfo(obj, type) {
        // Create or update info panel
        let panel = document.getElementById('starmap-info');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'starmap-info';
            panel.style.cssText = 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; max-width: 300px; z-index: 10;';
            this.canvas.parentElement.style.position = 'relative';
            this.canvas.parentElement.appendChild(panel);
        }
        
        let content = '';
        if (type === 'planet') {
            content = `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 1.5rem; color: ${obj.color}">${obj.symbol}</span>
                    <span style="font-size: 1.1rem; font-weight: 600;">${obj.name}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    <div>Magnitude: ${obj.magnitude.toFixed(1)}</div>
                    <div>Altitude: ${obj.altitude.toFixed(1)}°</div>
                    <div>Azimuth: ${obj.azimuth.toFixed(1)}°</div>
                    <div>In: ${obj.constellation || 'Unknown'}</div>
                </div>
            `;
        } else if (type === 'star') {
            content = `
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">⭐ ${obj.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    <div>Magnitude: ${obj.mag.toFixed(2)}</div>
                    <div>Altitude: ${obj.altitude.toFixed(1)}°</div>
                </div>
            `;
        } else if (type === 'constellation') {
            content = `
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">✨ ${obj.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    <div>${obj.mythology || ''}</div>
                    <div style="margin-top: 0.5rem;">Best visible at ${obj.altitude.toFixed(0)}° altitude</div>
                </div>
            `;
        }
        
        panel.innerHTML = content + `<button onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: var(--text-dim); cursor: pointer;">×</button>`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => panel.remove(), 5000);
    },
    
    getDisplayDate() {
        const date = new Date();
        date.setTime(date.getTime() + this.settings.timeOffset * 3600000);
        return date;
    },
    
    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const date = this.getDisplayDate();
        const scale = this.canvas.getBoundingClientRect().width / this.width * (window.devicePixelRatio || 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground(ctx);
        
        // Draw horizon circle
        this.drawHorizon(ctx);
        
        // Draw grid
        if (this.settings.showGrid) {
            this.drawGrid(ctx);
        }
        
        // Draw Milky Way (simplified)
        if (this.settings.showMilkyWay) {
            this.drawMilkyWay(ctx, date);
        }
        
        // Draw background stars
        this.drawBackgroundStars(ctx, date);
        
        // Draw constellation lines
        if (this.settings.showConstellationLines) {
            this.drawConstellationLines(ctx, date);
        }
        
        // Draw bright stars
        this.drawBrightStars(ctx, date);
        
        // Draw deep sky objects
        if (this.settings.showDeepSky) {
            this.drawDeepSkyObjects(ctx, date);
        }
        
        // Draw planets
        if (this.settings.showPlanets) {
            this.drawPlanets(ctx, date);
        }
        
        // Draw Moon
        this.drawMoon(ctx, date);
        
        // Draw cardinal directions
        this.drawCardinals(ctx);
        
        // Draw time indicator
        this.drawTimeIndicator(ctx, date);
    },
    
    drawBackground(ctx) {
        // Create radial gradient for sky
        const gradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.radius
        );
        
        if (this.settings.theme === 'red') {
            gradient.addColorStop(0, '#1a0505');
            gradient.addColorStop(1, '#0a0000');
        } else if (this.settings.theme === 'blue') {
            gradient.addColorStop(0, '#0a1525');
            gradient.addColorStop(1, '#050a15');
        } else {
            gradient.addColorStop(0, '#0a0a1a');
            gradient.addColorStop(1, '#050510');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.fill();
    },
    
    drawHorizon(ctx) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    },
    
    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Altitude circles
        for (let alt = 30; alt < 90; alt += 30) {
            const r = this.radius * (90 - alt) / 90;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Azimuth lines
        for (let az = 0; az < 360; az += 30) {
            const theta = (az - 180) * AstroEngine.DEG_TO_RAD;
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(
                this.centerX + this.radius * Math.sin(theta),
                this.centerY - this.radius * Math.cos(theta)
            );
            ctx.stroke();
        }
    },
    
    drawMilkyWay(ctx, date) {
        // Simplified Milky Way band
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 80;
        ctx.lineCap = 'round';
        
        const points = [
            { ra: 0, dec: -30 },
            { ra: 60, dec: -20 },
            { ra: 120, dec: 10 },
            { ra: 180, dec: 60 },
            { ra: 270, dec: 30 },
            { ra: 300, dec: -30 },
            { ra: 360, dec: -30 }
        ];
        
        ctx.beginPath();
        let started = false;
        
        for (const p of points) {
            const horizontal = AstroEngine.equatorialToHorizontal(p.ra, p.dec, date);
            if (horizontal.altitude < -20) continue;
            
            const pos = AstroEngine.horizontalToCanvas(
                Math.max(-10, horizontal.altitude),
                horizontal.azimuth,
                this.centerX, this.centerY, this.radius
            );
            
            if (!started) {
                ctx.moveTo(pos.x, pos.y);
                started = true;
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
    },
    
    drawBackgroundStars(ctx, date) {
        const time = Date.now() / 1000;
        
        for (const star of this.bgStars) {
            const horizontal = AstroEngine.equatorialToHorizontal(star.ra, star.dec, date);
            if (horizontal.altitude < 0) continue;
            
            const pos = AstroEngine.horizontalToCanvas(horizontal.altitude, horizontal.azimuth, this.centerX, this.centerY, this.radius);
            
            // Twinkle effect
            const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + star.twinkle);
            const size = Math.max(0.5, (6 - star.mag) / 3);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.4})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    drawConstellationLines(ctx, date) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;
        
        for (const c of AstroEngine.constellations) {
            const starPositions = c.stars.map(([ra, dec]) => {
                const horizontal = AstroEngine.equatorialToHorizontal(ra, dec, date);
                return {
                    ...horizontal,
                    canvas: AstroEngine.horizontalToCanvas(horizontal.altitude, horizontal.azimuth, this.centerX, this.centerY, this.radius)
                };
            });
            
            for (const [i, j] of c.lines) {
                if (starPositions[i].altitude < 0 || starPositions[j].altitude < 0) continue;
                
                ctx.beginPath();
                ctx.moveTo(starPositions[i].canvas.x, starPositions[i].canvas.y);
                ctx.lineTo(starPositions[j].canvas.x, starPositions[j].canvas.y);
                ctx.stroke();
            }
            
            // Constellation label
            if (this.settings.showLabels) {
                const centerHorizontal = AstroEngine.equatorialToHorizontal(c.ra, c.dec, date);
                if (centerHorizontal.altitude > 10) {
                    const pos = AstroEngine.horizontalToCanvas(centerHorizontal.altitude, centerHorizontal.azimuth, this.centerX, this.centerY, this.radius);
                    ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
                    ctx.font = '11px "DM Sans", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(c.name, pos.x, pos.y - 15);
                }
            }
        }
    },
    
    drawBrightStars(ctx, date) {
        for (const star of this.stars) {
            const horizontal = AstroEngine.equatorialToHorizontal(star.ra, star.dec, date);
            if (horizontal.altitude < 0) continue;
            
            const pos = AstroEngine.horizontalToCanvas(horizontal.altitude, horizontal.azimuth, this.centerX, this.centerY, this.radius);
            const size = Math.max(1, (3 - star.mag) * 1.5);
            
            // Glow effect for brightest stars
            if (star.mag < 1) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Star name
            if (star.name && this.settings.showLabels && star.mag < 1.5) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '10px "DM Sans", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(star.name, pos.x, pos.y + size + 12);
            }
        }
    },
    
    drawDeepSkyObjects(ctx, date) {
        const objects = AstroEngine.getVisibleMessierObjects(date, 5);
        
        for (const obj of objects) {
            const pos = AstroEngine.horizontalToCanvas(obj.altitude, obj.azimuth, this.centerX, this.centerY, this.radius);
            
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
            ctx.lineWidth = 1;
            
            if (obj.type.includes('Galaxy')) {
                // Ellipse for galaxies
                ctx.beginPath();
                ctx.ellipse(pos.x, pos.y, 8, 4, Math.PI / 4, 0, Math.PI * 2);
                ctx.stroke();
            } else if (obj.type.includes('Nebula')) {
                // Circle with cross for nebulae
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // Dotted circle for clusters
                ctx.setLineDash([2, 2]);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            if (this.settings.showLabels) {
                ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
                ctx.font = '9px "Space Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(obj.id, pos.x, pos.y + 14);
            }
        }
    },
    
    drawPlanets(ctx, date) {
        const planets = AstroEngine.getAllPlanets(date);
        
        for (const planet of planets) {
            if (planet.altitude < 0) continue;
            
            const pos = AstroEngine.horizontalToCanvas(planet.altitude, planet.azimuth, this.centerX, this.centerY, this.radius);
            const size = Math.max(4, (3 - planet.magnitude) * 2);
            
            // Glow
            ctx.fillStyle = planet.color + '40';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size * 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Planet
            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Label
            if (this.settings.showLabels) {
                ctx.fillStyle = planet.color;
                ctx.font = 'bold 11px "DM Sans", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(planet.symbol + ' ' + planet.name, pos.x, pos.y + size + 14);
            }
        }
    },
    
    drawMoon(ctx, date) {
        const moon = AstroEngine.getMoonPosition(date);
        const phase = AstroEngine.getMoonPhase(date);
        const horizontal = AstroEngine.equatorialToHorizontal(moon.ra, moon.dec, date);
        
        if (horizontal.altitude < 0) return;
        
        const pos = AstroEngine.horizontalToCanvas(horizontal.altitude, horizontal.azimuth, this.centerX, this.centerY, this.radius);
        const size = 12;
        
        // Glow
        ctx.fillStyle = 'rgba(255, 255, 200, 0.15)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon body
        ctx.fillStyle = '#ffffee';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Phase shadow (simplified)
        if (phase.illumination < 95) {
            ctx.fillStyle = '#222';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            const shadowOffset = (1 - phase.illumination / 100) * size * 2;
            ctx.arc(pos.x + (phase.elongation < 180 ? -shadowOffset : shadowOffset) / 2, pos.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Label
        if (this.settings.showLabels) {
            ctx.fillStyle = '#ffffcc';
            ctx.font = 'bold 11px "DM Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${phase.emoji} Moon`, pos.x, pos.y + size + 14);
        }
    },
    
    drawCardinals(ctx) {
        const directions = [
            { az: 0, label: 'N', color: '#ef4444' },
            { az: 90, label: 'E', color: '#ffffff' },
            { az: 180, label: 'S', color: '#ffffff' },
            { az: 270, label: 'W', color: '#ffffff' }
        ];
        
        ctx.font = 'bold 14px "Space Mono", monospace';
        ctx.textAlign = 'center';
        
        for (const d of directions) {
            const theta = (d.az - 180) * AstroEngine.DEG_TO_RAD;
            const x = this.centerX + (this.radius + 15) * Math.sin(theta);
            const y = this.centerY - (this.radius + 15) * Math.cos(theta);
            
            ctx.fillStyle = d.color;
            ctx.fillText(d.label, x, y + 5);
        }
    },
    
    drawTimeIndicator(ctx, date) {
        const timeStr = date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${dateStr} ${timeStr}`, this.centerX, 30);
        
        if (this.settings.timeOffset !== 0) {
            const offset = this.settings.timeOffset > 0 ? `+${this.settings.timeOffset.toFixed(1)}h` : `${this.settings.timeOffset.toFixed(1)}h`;
            ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
            ctx.fillText(offset, this.centerX, 48);
        }
    },
    
    setTimeOffset(hours) {
        this.settings.timeOffset = hours;
        this.render();
    },
    
    resetTime() {
        this.settings.timeOffset = 0;
        this.render();
    },
    
    toggleSetting(key) {
        this.settings[key] = !this.settings[key];
        this.render();
    },
    
    setTheme(theme) {
        this.settings.theme = theme;
        this.render();
    }
};

window.StarMap = StarMap;
