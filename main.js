/**
 * ULTRA-MODERN PORTFOLIO ENGINE
 * Dynamic content injection driven by the Django API.
 * Every DOM touch is null-guarded so one missing element never
 * breaks the rest of the page.
 */

let portfolioData = EMPTY_DATA();
let heroRoles = ['Full-Stack Developer'];

function EMPTY_DATA() {
    return {
        personal: {},
        socials: { links: [] },
        heroRoles: [],
        technologies: [],
        stats: { projects: 0, technologies: 0, certificates: 0, experienceMonths: 0, custom: [] },
        education: [],
        experience: [],
        skills: { categories: [], data: [] },
        certificates: [],
        workshops: [],
        projects: [],
        achievements: [],
        hobbies: [],
        services: [],
    };
}

/* ------------------------------------------------------------------
   UTILITIES
------------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);

function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function setText(id, value, fallback = '') {
    const el = $(id);
    if (!el) return;
    el.textContent = value == null || value === '' ? fallback : value;
}

function setSrc(id, value) {
    const el = $(id);
    if (el && value) el.src = value;
}

function setHref(id, value) {
    const el = $(id);
    if (el && value) el.href = value;
}

const SOCIAL_ICONS = {
    github: 'fa-brands fa-github',
    linkedin: 'fa-brands fa-linkedin-in',
    instagram: 'fa-brands fa-instagram',
    twitter: 'fa-brands fa-x-twitter',
    x: 'fa-brands fa-x-twitter',
    facebook: 'fa-brands fa-facebook-f',
    youtube: 'fa-brands fa-youtube',
    discord: 'fa-brands fa-discord',
    telegram: 'fa-brands fa-telegram',
    whatsapp: 'fa-brands fa-whatsapp',
    mail: 'fa-solid fa-envelope',
    email: 'fa-solid fa-envelope',
    dribbble: 'fa-brands fa-dribbble',
    behance: 'fa-brands fa-behance',
    medium: 'fa-brands fa-medium',
    dev: 'fa-brands fa-dev',
    hashnode: 'fa-brands fa-hashnode',
    leetcode: 'fa-solid fa-code',
    codechef: 'fa-solid fa-code',
    hackerrank: 'fa-solid fa-code',
};

function socialIcon(platform, storedIcon) {
    if (storedIcon && /fa-/.test(storedIcon)) return storedIcon;
    const key = String(platform || '').toLowerCase().trim();
    return SOCIAL_ICONS[key] || 'fa-solid fa-link';
}

/* ------------------------------------------------------------------
   DATA FETCH
------------------------------------------------------------------ */
async function fetchPortfolioData() {
    try {
        const response = await fetch('/api/portfolio/');
        if (!response.ok) throw new Error('Network response was not ok');
        const fresh = await response.json();
        // Merge over the empty skeleton so every section exists.
        portfolioData = { ...EMPTY_DATA(), ...fresh };
        portfolioData.personal = { ...EMPTY_DATA().personal, ...(fresh.personal || {}) };
        portfolioData.stats = { ...EMPTY_DATA().stats, ...(fresh.stats || {}) };
        portfolioData.skills = { ...EMPTY_DATA().skills, ...(fresh.skills || {}) };
        portfolioData.socials = { ...EMPTY_DATA().socials, ...(fresh.socials || {}) };
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        portfolioData = EMPTY_DATA();
    }
}

/* ------------------------------------------------------------------
   BOOTSTRAP
------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', async () => {
    initCosmicBackground();
    await fetchPortfolioData();
    initLoader();
    initTheme();
    initCursor();
    injectContent();
    initNavigation();
    initAnimations();
    initInteractions();
});

/* ------------------------------------------------------------------
   1. CORE SYSTEMS
------------------------------------------------------------------ */
function initLoader() {
    const loader = $('loader');

    const forceHide = setTimeout(hideLoader, 2500);
    window.addEventListener('load', () => {
        clearTimeout(forceHide);
        hideLoader();
    });
}

function hideLoader() {
    const loader = $('loader');
    if (loader) {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
    }
}

function initTheme() {
    const themeToggle = $('theme-toggle');
    const sweep = $('theme-sweep');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        if (sweep) {
            sweep.style.setProperty('--sweep-x', `${x}px`);
            sweep.style.setProperty('--sweep-y', `${y}px`);
            sweep.classList.add('active');
        }

        setTimeout(() => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            try { localStorage.setItem('theme', newTheme); } catch (err) { /* private mode */ }
            if (sweep) sweep.classList.remove('active');
        }, 620);
    });
}

function initCosmicBackground() {
    const canvas = $('bg-cosmos');
    const context = canvas?.getContext('2d', { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    const tau = Math.PI * 2;
    const darkColors = ['#b79aff', '#73eaff', '#fb91e8', '#f8f4ff', '#ffdca1'];
    const lightColors = ['#d49b00', '#ed8a00', '#e6538a', '#a96e00', '#e9c900'];
    const spriteCache = new Map();
    const galaxy = [];
    const stars = [];
    const shards = [];
    const streaks = [];
    const ripples = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let colors = darkColors;
    let nebula = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let angle = 0;
    let elapsed = 0;
    let previousTime = 0;
    let nextFracture = 0;
    let nextStreak = 0;
    let targetX = 0;
    let targetY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let depth = 0;
    let targetDepth = 0;
    let frameWindow = 0;
    let frameCount = 0;
    let maxGalaxyParticles = 1900;

    const random = (min, max) => min + Math.random() * (max - min);
    const choose = (items) => items[Math.floor(Math.random() * items.length)];

    function makeGlow(color, size = 64) {
        const sprite = document.createElement('canvas');
        sprite.width = sprite.height = size;
        const glow = sprite.getContext('2d');
        const gradient = glow.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(.14, `${color}bb`);
        gradient.addColorStop(.42, `${color}30`);
        gradient.addColorStop(1, `${color}00`);
        glow.fillStyle = gradient;
        glow.fillRect(0, 0, size, size);
        return sprite;
    }

    function recolor() {
        colors = document.documentElement.getAttribute('data-theme') === 'light' ? lightColors : darkColors;
        for (const color of colors) {
            if (!spriteCache.has(color)) spriteCache.set(color, makeGlow(color));
        }
        const nebulaColors = colors === lightColors
            ? ['#f0d500', '#f28a00', '#e6538a', '#edbd54']
            : ['#5540ff', '#1488d9', '#d239bb', '#ffb753'];
        nebula = nebulaColors.map((color) => makeGlow(color, 256));
        galaxy.forEach((particle) => { particle.color = choose(colors); });
        stars.forEach((star) => { star.color = choose(colors); });
    }

    function seedScene() {
        galaxy.length = 0;
        stars.length = 0;
        const mobile = width < 700;
        const density = Math.max(.62, Math.min(1, width * height / (1280 * 800)));
        maxGalaxyParticles = Math.round((mobile ? 760 : 1900) * density);
        const starCount = Math.round((mobile ? 230 : 500) * Math.max(.72, density));

        for (let i = 0; i < maxGalaxyParticles; i++) {
            const arm = i % 4;
            const radius = Math.pow(Math.random(), .72);
            galaxy.push({
                radius,
                theta: arm * tau / 4 + radius * 4.8 + random(-.35, .35),
                depth: random(-1, 1),
                size: random(.35, 1.45) * (1.05 - radius * .45),
                color: choose(colors),
                alpha: random(.2, .78)
            });
        }

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() < .04 ? random(1.2, 1.9) : random(.35, .95),
                phase: random(0, tau),
                speed: random(.35, 1.5),
                alpha: random(.2, .82),
                hyper: Math.random() < .018,
                color: choose(colors)
            });
        }
    }

    function resize() {
        const bounds = canvas.getBoundingClientRect();
        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);
        dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.35 : 1.65);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        seedScene();
        recolor();
    }

    function acquire(pool) {
        let item = pool.find((entry) => entry.life <= 0);
        if (!item) {
            item = {};
            pool.push(item);
        }
        return item;
    }

    function fracture(x, y, intensity = 1) {
        const count = Math.floor(random(5, 10));
        for (let i = 0; i < count; i++) {
            const direction = i / count * tau + random(-.24, .24);
            const speed = random(.4, 1.5) * intensity;
            const shard = acquire(shards);
            Object.assign(shard, {
                x, y, homeX: x, homeY: y,
                px: x, py: y,
                vx: Math.cos(direction) * speed,
                vy: Math.sin(direction) * speed,
                spin: random(-.13, .13),
                rotation: random(0, tau),
                size: random(2, 6) * Math.min(1.5, intensity),
                life: random(45, 85), maxLife: 85,
                reassemble: Math.random() < .28,
                color: choose(colors),
                trail: random(5, 15)
            });
        }
        const ripple = acquire(ripples);
        Object.assign(ripple, { x, y, radius: 3, life: 1, maxRadius: random(46, 115) * intensity, color: choose(colors) });
    }

    function shoot() {
        const streak = acquire(streaks);
        const direction = random(.45, 1.12) + (Math.random() < .5 ? Math.PI : 0);
        const speed = random(7, 13);
        Object.assign(streak, {
            x: random(0, width), y: random(0, height * .75),
            vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed,
            life: random(42, 72), maxLife: 72,
            length: random(55, 135), alpha: random(.3, .75)
        });
    }

    function drawNebula(cx, cy, light) {
        context.save();
        context.globalCompositeOperation = 'lighter';
        const size = Math.min(width, height);
        const drift = Math.sin(elapsed * .00012) * size * .025;
        const blobs = [
            [cx - width * .13 + drift, cy - height * .07, size * .56, nebula[0], light ? .065 : .09],
            [cx + width * .16 - drift, cy + height * .02, size * .44, nebula[1], light ? .055 : .075],
            [cx + drift * .5, cy - height * .2, size * .36, nebula[2], light ? .05 : .065],
            [cx - width * .06, cy + height * .13, size * .28, nebula[3], light ? .035 : .045]
        ];
        for (const [x, y, diameter, sprite, alpha] of blobs) {
            context.globalAlpha = alpha;
            context.drawImage(sprite, x - diameter / 2, y - diameter * .32, diameter, diameter * .64);
        }
        context.restore();
    }

    function drawGalaxy(cx, cy, light) {
        const radius = Math.min(width, height) * (width < 700 ? .39 : .43);
        const gx = cx + parallaxX * 13;
        const gy = cy + parallaxY * 11 - depth * .12;
        const coreRadius = radius * .43;
        const core = context.createRadialGradient(gx, gy, 0, gx, gy, coreRadius);
        core.addColorStop(0, light ? 'rgba(255,250,236,.16)' : 'rgba(255,249,244,.3)');
        core.addColorStop(.1, light ? 'rgba(255,197,121,.12)' : 'rgba(255,215,244,.22)');
        core.addColorStop(.36, light ? 'rgba(231,119,158,.055)' : 'rgba(157,118,255,.09)');
        core.addColorStop(1, 'rgba(79,90,255,0)');
        context.save();
        context.globalCompositeOperation = 'lighter';
        context.fillStyle = core;
        context.beginPath();
        context.ellipse(gx, gy, coreRadius, coreRadius * .3, angle * .12, 0, tau);
        context.fill();

        const radiusScale = radius;
        for (const particle of galaxy) {
            const theta = particle.theta + angle * (1 - particle.radius * .38);
            const r = particle.radius * radiusScale;
            const depthOffset = Math.sin(theta * 1.5 + particle.depth * 2) * particle.depth;
            const x = gx + Math.cos(theta) * r * (1 + depthOffset * .1);
            const y = gy + Math.sin(theta) * r * .3 + depthOffset * radius * .03;
            const dotSize = particle.size * (1 + depthOffset * .2);
            const pulse = .2 + (Math.sin(elapsed * .0018 + particle.theta) + 1) * .1;
            context.globalAlpha = particle.alpha * pulse * (light ? .9 : 1);
            const sprite = spriteCache.get(particle.color);
            if (sprite) context.drawImage(sprite, x - dotSize * 7, y - dotSize * 7, dotSize * 14, dotSize * 14);
        }
        context.restore();
    }

    function drawStars(time, light) {
        context.save();
        context.globalCompositeOperation = 'lighter';
        for (const star of stars) {
            const pulse = .55 + Math.sin(time * .001 * star.speed + star.phase) * .3;
            const x = star.x + parallaxX * 2.6 - depth * .015;
            const y = star.y + parallaxY * 2.6 - depth * .02;
            context.globalAlpha = star.alpha * pulse * (light ? .5 : 1);
            if (star.hyper) {
                const flare = star.size * (5 + pulse * 3);
                context.strokeStyle = star.color;
                context.lineWidth = .55;
                context.beginPath();
                context.moveTo(x - flare, y); context.lineTo(x + flare, y);
                context.moveTo(x, y - flare); context.lineTo(x, y + flare);
                context.stroke();
            } else {
                context.fillStyle = star.color;
                context.beginPath();
                context.arc(x, y, star.size, 0, tau);
                context.fill();
            }
        }
        context.restore();
    }

    function drawEffects() {
        context.save();
        context.globalCompositeOperation = 'lighter';
        for (const shard of shards) {
            if (shard.life <= 0) continue;
            shard.px = shard.x; shard.py = shard.y;
            if (shard.reassemble && shard.life < shard.maxLife * .45) {
                shard.vx += (shard.homeX - shard.x) * .018;
                shard.vy += (shard.homeY - shard.y) * .018;
            }
            shard.x += shard.vx; shard.y += shard.vy;
            shard.vx *= .988; shard.vy *= .988;
            shard.rotation += shard.spin; shard.life--;
            context.globalAlpha = Math.max(0, shard.life / shard.maxLife) * .55;
            context.strokeStyle = shard.color;
            context.lineWidth = .8;
            context.beginPath(); context.moveTo(shard.px, shard.py); context.lineTo(shard.x, shard.y); context.stroke();
            context.save();
            context.translate(shard.x, shard.y); context.rotate(shard.rotation);
            context.globalAlpha = Math.max(0, shard.life / shard.maxLife);
            context.fillStyle = shard.color;
            context.beginPath(); context.moveTo(0, -shard.size); context.lineTo(shard.size * .48, shard.size * .7); context.lineTo(-shard.size * .48, shard.size * .7); context.closePath(); context.fill();
            context.restore();
        }

        for (const streak of streaks) {
            if (streak.life <= 0) continue;
            streak.x += streak.vx; streak.y += streak.vy; streak.life--;
            const fade = Math.min(1, streak.life / (streak.maxLife * .24)) * Math.min(1, (streak.maxLife - streak.life) / 8);
            const magnitude = Math.hypot(streak.vx, streak.vy) || 1;
            const tailX = streak.x - streak.vx / magnitude * streak.length;
            const tailY = streak.y - streak.vy / magnitude * streak.length;
            const trail = context.createLinearGradient(streak.x, streak.y, tailX, tailY);
            trail.addColorStop(0, `rgba(255,255,255,${fade * streak.alpha})`);
            trail.addColorStop(.2, `rgba(138,245,255,${fade * streak.alpha * .7})`);
            trail.addColorStop(1, 'rgba(104,133,255,0)');
            context.strokeStyle = trail; context.lineWidth = 1.2;
            context.beginPath(); context.moveTo(streak.x, streak.y); context.lineTo(tailX, tailY); context.stroke();
        }

        for (const ripple of ripples) {
            if (ripple.life <= 0) continue;
            ripple.life -= .014; ripple.radius += (ripple.maxRadius - ripple.radius) * .035;
            context.globalAlpha = Math.max(0, ripple.life) * .24;
            context.strokeStyle = ripple.color; context.lineWidth = .7;
            context.beginPath(); context.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * .42, -.16, 0, tau); context.stroke();
        }
        context.restore();
    }

    function frame(time) {
        requestAnimationFrame(frame);
        if (!previousTime) previousTime = time;
        const delta = Math.min(40, time - previousTime);
        previousTime = time;
        elapsed += delta;
        parallaxX += (targetX - parallaxX) * .025;
        parallaxY += (targetY - parallaxY) * .025;
        depth += (targetDepth - depth) * .04;
        if (!reducedMotion.matches) angle += delta * .00012;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);
        const light = document.documentElement.getAttribute('data-theme') === 'light';
        const cx = width * .67;
        const cy = height * .43;
        drawNebula(cx, cy, light);
        drawStars(time, light);
        drawGalaxy(cx, cy, light);

        if (!reducedMotion.matches) {
            if (time > nextFracture) {
                fracture(random(width * .12, width * .88), random(height * .08, height * .86), random(.65, 1.05));
                nextFracture = time + random(1400, 3200);
            }
            if (time > nextStreak) {
                shoot();
                nextStreak = time + random(1800, 4800);
            }
        }
        drawEffects();

        frameCount++;
        if (time - frameWindow > 2000) {
            const fps = frameCount * 1000 / Math.max(1, time - frameWindow);
            if (fps < 43 && galaxy.length > 480) galaxy.length = Math.floor(galaxy.length * .82);
            frameCount = 0;
            frameWindow = time;
        }
    }

    function pointerMove(event) {
        targetX = (event.clientX / width - .5) * 2;
        targetY = (event.clientY / height - .5) * 2;
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', pointerMove, { passive: true });
    window.addEventListener('scroll', () => { targetDepth = Math.min(180, window.scrollY * .08); }, { passive: true });
    document.addEventListener('pointerdown', (event) => {
        if (event.target.closest('a, button, input, textarea, select, label')) return;
        fracture(event.clientX, event.clientY, event.pointerType === 'touch' ? 1.2 : 1);
    }, { passive: true });
    const themeObserver = new MutationObserver(recolor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    resize();
    frameWindow = performance.now();
    nextFracture = frameWindow + 1200;
    nextStreak = frameWindow + 1700;
    requestAnimationFrame(frame);
}

function initCursor() {
    const dot = $('cursor-dot');
    const ring = $('cursor-ring');
    if (!dot || !ring || window.innerWidth < 900) return;

    document.addEventListener('mousemove', (e) => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;

        ring.animate(
            { left: `${e.clientX}px`, top: `${e.clientY}px` },
            { duration: 500, fill: 'forwards' }
        );
    });

    document.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('expanded'));
        el.addEventListener('mouseleave', () => ring.classList.remove('expanded'));
    });
}

/* ------------------------------------------------------------------
   2. CONTENT INJECTION
------------------------------------------------------------------ */
function injectContent() {
    const p = portfolioData.personal;

    // Personal info
    setText('about-text', p.bio, 'Full-stack developer crafting modern, reliable web experiences.');
    setText('about-philosophy', p.philosophy, 'Build with discipline, design with empathy, ship with confidence.');
    setText('detail-location', p.location, 'India');
    setText('contact-email', p.email, 'tayadeyash999@gmail.com');
    const yearEl = $('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    setSrc('profile-img', p.profileImage);
    if (p.profileImage) {
        const img = $('profile-img');
        if (img) img.onerror = null; // DB image is authoritative; drop static fallback
    }

    // Resume links
    if (p.resumeUrl) {
        setHref('resume-download-hero', p.resumeUrl);
        setHref('resume-download', p.resumeUrl);
        setHref('resume-view', p.resumeUrl);
    }

    // Hero roles (DB-driven rotation)
    heroRoles = (portfolioData.heroRoles || []).filter(Boolean);
    if (!heroRoles.length) heroRoles = ['Full-Stack Developer'];

    // Socials
    renderSocials();

    // Stats
    renderStats();

    // Education
    renderTimeline('education-container', (portfolioData.education || []).map((edu) => `
        <div class="timeline-item education-card-item">
            <div class="timeline-card education-card cert-card--flip">
                <div class="cert-flip-inner">
                    <div class="cert-face cert-face--front education-face-front">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${esc(edu.institution)}</h3>
                            <span class="timeline-date">${esc(edu.duration)}</span>
                        </div>
                        <div class="timeline-meta">
                            <strong>${esc(edu.course)}</strong>${edu.percentage ? ` | ${esc(edu.percentage)}` : ''}
                        </div>
                        ${edu.location ? `<span class="cert-issuer">${esc(edu.location)}</span>` : ''}
                        ${edu.description ? `<p class="education-description">${esc(edu.description)}</p>` : ''}
                        ${edu.achievements ? `<p class="education-description">${esc(edu.achievements)}</p>` : ''}
                        <div class="education-front-actions">
                            <button type="button" class="cert-flip-toggle" data-cert-flip aria-pressed="false">
                                Photos <i class="fa-solid fa-arrow-rotate-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cert-face cert-face--back education-face-back">
                        ${Array.isArray(edu.images) && edu.images.length ? `
                            <div class="workshop-slideshow education-slideshow" data-workshop-slideshow aria-label="${esc(edu.institution)} photos">
                                ${edu.images.map((image, index) => `
                                    <img src="${esc(image)}" class="workshop-slide${index === 0 ? ' is-active' : ''}"
                                        alt="${esc(edu.institution)} photo ${index + 1}" loading="lazy"
                                        onerror="this.style.display='none'">
                                `).join('')}
                            </div>` : `<div class="education-gallery-empty">Upload academic photos to build this gallery.</div>`}
                        <div class="education-back-actions">
                            <button type="button" class="cert-flip-toggle" data-cert-flip aria-pressed="true">
                                <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `), 'No education records yet — check back soon.');

    // Experience
    renderTimeline('experience-container', (portfolioData.experience || []).map((exp) => `
        <div class="timeline-item">
            <div class="timeline-card">
                <div class="timeline-header">
                    <h3 class="timeline-title">${esc(exp.company)}</h3>
                    <span class="timeline-date">${esc(exp.duration)}</span>
                </div>
                <div class="timeline-meta">
                    <strong>${esc(exp.role)}</strong>${exp.location ? ` | ${esc(exp.location)}` : ''}
                </div>
                ${exp.outcomes ? `<p>${esc(exp.outcomes)}</p>` : ''}
                ${Array.isArray(exp.responsibilities) && exp.responsibilities.length ? `
                    <ul class="timeline-list">
                        ${exp.responsibilities.map((r) => `<li>${esc(r)}</li>`).join('')}
                    </ul>` : ''}
            </div>
        </div>
    `), 'Professional experience is on the way — projects below show applied skills.');

    // Skills
    renderSkillsTabs();
    renderSkills(currentCategory);

    // Tech marquee
    renderMarquee();

    // Certificates
    renderCards('certificates-container', (portfolioData.certificates || []).map((cert) => `
        <div class="cert-card cert-card--flip">
            <div class="cert-flip-inner">
                <div class="cert-face cert-face--front">
                    ${cert.image ? `<img src="${esc(cert.image)}" class="cert-img" alt="${esc(cert.title)}" loading="lazy"
                        onerror="this.style.display='none'">` : ''}
                    <div class="cert-content">
                        <h3 class="cert-title">${esc(cert.title)}</h3>
                        <span class="cert-issuer">${esc(cert.issuer)}${cert.date ? ` • ${esc(cert.date)}` : ''}</span>
                        <button type="button" class="cert-flip-toggle" data-cert-flip aria-pressed="false">
                            Details <i class="fa-solid fa-arrow-rotate-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="cert-face cert-face--back">
                    <div class="cert-back-heading">
                        <span class="cert-back-label">Certificate details</span>
                        <h3 class="cert-title">${esc(cert.title)}</h3>
                        <span class="cert-issuer">${esc(cert.issuer)}${cert.date ? ` • ${esc(cert.date)}` : ''}</span>
                    </div>
                    ${cert.description ? `<p class="cert-desc">${esc(cert.description)}</p>` : ''}
                    <div class="cert-back-actions">
                        ${cert.pdf ? `<a href="${esc(cert.pdf)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
                            <i class="fa-solid fa-file-pdf" aria-hidden="true"></i> Open credential PDF
                        </a>` : ''}
                        <button type="button" class="cert-flip-toggle" data-cert-flip aria-pressed="true">
                            <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `), 'certificates', 'No certifications published yet.');

    // Workshops
    renderCards('workshops-container', (portfolioData.workshops || []).map((work) => `
        <div class="cert-card cert-card--flip workshop-card">
            <div class="cert-flip-inner">
                <div class="cert-face cert-face--front">
                    ${Array.isArray(work.images) && work.images.length ? `
                        <div class="cert-img workshop-slideshow" data-workshop-slideshow aria-label="${esc(work.title)} photos">
                            ${work.images.map((image, index) => `
                                <img src="${esc(image)}" class="workshop-slide${index === 0 ? ' is-active' : ''}"
                                    alt="${esc(work.title)} photo ${index + 1}" loading="lazy"
                                    onerror="this.style.display='none'">
                            `).join('')}
                        </div>` : ''}
                    <div class="cert-content">
                        <h3 class="cert-title">${esc(work.title)}</h3>
                        <span class="cert-issuer">${esc(work.organizer)}${work.date ? ` • ${esc(work.date)}` : ''}</span>
                        ${work.topic ? `<span class="tag">${esc(work.topic)}</span>` : ''}
                        <button type="button" class="cert-flip-toggle" data-cert-flip aria-pressed="false">
                            Details <i class="fa-solid fa-arrow-rotate-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="cert-face cert-face--back">
                    <div class="cert-back-heading">
                        <span class="cert-back-label">Workshop details</span>
                        <h3 class="cert-title">${esc(work.title)}</h3>
                        <span class="cert-issuer">${esc(work.organizer)}${work.date ? ` • ${esc(work.date)}` : ''}</span>
                        ${work.topic ? `<span class="tag">${esc(work.topic)}</span>` : ''}
                    </div>
                    ${work.description ? `<p class="cert-desc">${esc(work.description)}</p>` : ''}
                    <div class="cert-back-actions">
                        ${work.url ? `<a href="${esc(work.url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
                            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Workshop link
                        </a>` : ''}
                        <button type="button" class="cert-flip-toggle" data-cert-flip aria-pressed="true">
                            <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `), 'workshops', 'No workshops published yet.');
    initWorkshopSlides();

    // Projects
    renderProjectFilters();
    renderProjects(currentFilter);

    // Achievements
    renderCards('achievements-container', (portfolioData.achievements || []).map((ach) => `
        <div class="achievement-card">
            <div class="achievement-icon"><i class="fa-solid fa-trophy"></i></div>
            <h3 class="achievement-title">${esc(ach.title)}</h3>
            <p class="card-desc">${esc(ach.description)}</p>
            ${ach.date ? `<span class="timeline-date">${esc(ach.date)}</span>` : ''}
        </div>
    `), 'achievements', 'Achievements coming soon.');

    // Hobbies
    renderCards('hobbies-container', (portfolioData.hobbies || []).map((hobby) => `
        <article class="hobby-item">
            <i class="fa-solid ${esc(hobby.icon || 'fa-heart')}" aria-hidden="true"></i>
            <div class="hobby-copy">
                <h3>${esc(hobby.name)}</h3>
                ${hobby.description ? `<p>${esc(hobby.description)}</p>` : ''}
            </div>
        </article>
    `), 'hobbies', 'More interests to come.');

    // Services
    renderCards('services-container', (portfolioData.services || []).map((serv) => `
        <div class="service-card">
            <div class="service-icon"><i class="${esc(serv.icon && /fa-/.test(serv.icon) ? serv.icon : 'fa-solid fa-gears')}"></i></div>
            <h3 class="service-title">${esc(serv.title)}</h3>
            <p class="card-desc">${esc(serv.description)}</p>
        </div>
    `), 'services', 'Services will be listed here soon.');
}

function renderTimeline(containerId, html, emptyMessage) {
    const el = $(containerId);
    if (!el) return;
    const content = Array.isArray(html) ? html.join('') : (html || '');
    el.innerHTML = content.trim()
        ? content
        : `<div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>${esc(emptyMessage)}</p></div>`;
}

function renderCards(containerId, html, gridKind, emptyMessage) {
    const el = $(containerId);
    if (!el) return;
    const content = Array.isArray(html) ? html.join('') : (html || '');
    el.innerHTML = content.trim()
        ? content
        : `<div class="empty-state empty-state--grid"><i class="fa-solid fa-box-open"></i><p>${esc(emptyMessage)}</p></div>`;
}

function renderSocials() {
    const links = portfolioData.socials.links || [];

    // Hero icons
    const heroWrap = $('hero-socials');
    if (heroWrap) {
        heroWrap.innerHTML = links.length
            ? links.map((s) => `
                <a href="${esc(s.url)}" target="_blank" rel="noopener" class="social-link" title="${esc(s.platform)}">
                    <i class="${socialIcon(s.platform, s.icon)}"></i>
                </a>`).join('')
            : `<a href="https://github.com/yashtayade09" target="_blank" rel="noopener" class="social-link" title="GitHub">
                    <i class="fa-brands fa-github"></i>
               </a>`;
    }

    // Footer text links (append under the heading)
    const footerWrap = $('footer-socials');
    if (footerWrap) {
        const heading = footerWrap.querySelector('.footer-heading');
        const extra = links.map((s) =>
            `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.platform)}</a>`).join('');
        if (extra && heading) heading.insertAdjacentHTML('afterend', extra);
    }
}

function renderStats() {
    const container = $('stats-container');
    if (!container) return;

    const custom = portfolioData.stats.custom || [];
    let cards;

    if (custom.length) {
        cards = custom.map((stat) => {
            const numeric = parseFloat(stat.value);
            const isCounter = !isNaN(numeric) && String(stat.value).match(/^\d+$/);
            const iconCls = stat.icon && /fa-/.test(stat.icon) ? stat.icon : 'fa-solid fa-chart-simple';
            return `
                <div class="stat-card">
                    <div class="stat-icon"><i class="${esc(iconCls)}"></i></div>
                    <span class="stat-value">${isCounter
                        ? `<span data-target="${esc(stat.value)}">0</span>${esc(stat.suffix || '')}`
                        : esc(stat.value)}</span>
                    <span class="stat-label">${esc(stat.label)}</span>
                </div>`;
        });
    } else {
        const s = portfolioData.stats;
        const fallback = [
            { label: 'Projects', value: s.projects, suffix: '+' },
            { label: 'Technologies', value: s.technologies, suffix: '+' },
            { label: 'Certificates', value: s.certificates, suffix: '+' },
        ].filter((stat) => stat.value > 0);

        cards = (fallback.length ? fallback : [
            { label: 'Projects', value: 0, suffix: '' },
            { label: 'Technologies', value: 0, suffix: '' },
        ]).map((stat) => `
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid fa-chart-simple"></i></div>
                <span class="stat-value"><span data-target="${stat.value}">0</span>${stat.suffix}</span>
                <span class="stat-label">${esc(stat.label)}</span>
            </div>`);
    }

    container.innerHTML = cards.join('');
    const certificateContainer = $('certificate-stat-container');
    if (certificateContainer) {
        const certificateCards = [...container.querySelectorAll('.stat-card')].filter((card) =>
            /^certificates?$/i.test(card.querySelector('.stat-label')?.textContent.trim() || '')
        );
        certificateContainer.replaceChildren(...certificateCards);
    }
}

/* ------------------------------------------------------------------
   SKILLS
------------------------------------------------------------------ */
let currentCategory = null;

function renderSkillsTabs() {
    const tabsWrap = document.querySelector('.skills-tabs');
    if (!tabsWrap) return;

    const categories = (portfolioData.skills.categories || []).filter(Boolean);
    if (!categories.length) {
        tabsWrap.style.display = 'none';
        currentCategory = null;
        return;
    }

    currentCategory = categories[0];
    tabsWrap.innerHTML = categories.map((cat) => `
        <button class="tab-btn${cat === currentCategory ? ' active' : ''}" data-tab="${esc(cat)}">${esc(cat)}</button>
    `).join('');

    tabsWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        currentCategory = btn.getAttribute('data-tab');
        tabsWrap.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
        renderSkills(currentCategory);
    });
}

function renderSkills(category) {
    const container = $('skills-container');
    if (!container) return;

    const all = portfolioData.skills.data || [];
    const skills = category ? all.filter((s) => s.category === category) : all;

    if (!skills.length) {
        container.innerHTML = `<div class="empty-state empty-state--grid"><i class="fa-solid fa-code"></i><p>No skills published yet — add them from the dashboard.</p></div>`;
        return;
    }

    container.innerHTML = skills.map((skill) => {
        const level = Math.max(0, Math.min(100, parseInt(skill.level, 10) || 0));
        return `
        <div class="skill-card">
            <div class="skill-info">
                <span class="skill-name">${esc(skill.name)}</span>
                <span class="skill-percent">${level}%</span>
            </div>
            <div class="skill-bar-bg">
                <div class="skill-bar-fill" data-level="${level}"></div>
            </div>
        </div>`;
    }).join('');

    // Animate bars in on next frame
    requestAnimationFrame(() => {
        container.querySelectorAll('.skill-bar-fill').forEach((bar) => {
            bar.style.width = `${bar.getAttribute('data-level')}%`;
        });
    });
}

function renderMarquee() {
    const marquee = $('marquee-content');
    if (!marquee) return;

    const skillNames = (portfolioData.skills.data || []).map((s) => s.name);
    const techNames = portfolioData.technologies || [];
    const items = [...new Set([...skillNames, ...techNames].filter(Boolean))];

    if (!items.length) {
        marquee.closest('.tech-marquee').style.display = 'none';
        return;
    }

    const html = items.map((t) => `<div class="marquee-item"><span>◈</span> ${esc(t)}</div>`).join('');
    marquee.innerHTML = html + html; // Duplicate for seamless loop
}

/* ------------------------------------------------------------------
   PROJECTS
------------------------------------------------------------------ */
let currentFilter = 'ALL';

function renderProjectFilters() {
    const wrap = document.querySelector('.project-filters');
    if (!wrap) return;

    const categories = [...new Set((portfolioData.projects || []).map((p) => p.category).filter(Boolean))];

    if (!categories.length) {
        wrap.style.display = 'none';
        currentFilter = 'ALL';
        return;
    }

    currentFilter = 'ALL';
    wrap.innerHTML = ['ALL', ...categories].map((cat) => `
        <button class="filter-btn${cat === 'ALL' ? ' active' : ''}" data-filter="${esc(cat)}">${esc(cat)}</button>
    `).join('');

    wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        currentFilter = btn.getAttribute('data-filter');
        wrap.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b === btn));
        renderProjects(currentFilter);
    });
}

function renderProjects(filter) {
    const container = $('projects-container');
    if (!container) return;

    const projects = portfolioData.projects || [];
    const filtered = filter === 'ALL' ? projects : projects.filter((p) => p.category === filter);

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state empty-state--grid"><i class="fa-solid fa-folder-open"></i><p>No projects published yet — add your first project from the dashboard.</p></div>`;
        return;
    }

    container.innerHTML = filtered.map((proj) => `
        <div class="project-card" data-id="${esc(proj.id)}">
            <div class="project-img-wrapper">
                <span class="project-status">${esc(proj.status)}</span>
                ${proj.images && proj.images.length
                    ? `<img src="${esc(proj.images[0])}" class="project-img" alt="${esc(proj.title)}" loading="lazy"
                         onerror="window.handleProjectImageError(this)">`
                    : `<div class="project-img project-img--placeholder"><i class="fa-solid fa-code"></i></div>`}
            </div>
            <div class="project-content">
                ${proj.category ? `<span class="project-category">${esc(proj.category)}</span>` : ''}
                <h3 class="project-title">${esc(proj.title)}</h3>
                <p class="project-tagline">${esc(proj.tagline)}</p>
                <div class="project-footer">
                    <div class="project-links">
                        ${proj.github ? `<a href="${esc(proj.github)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fa-brands fa-github"></i> Code</a>` : ''}
                        ${proj.live ? `<a href="${esc(proj.live)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live</a>` : ''}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="openProjectModal('${esc(proj.id)}')">
                        Details <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* ------------------------------------------------------------------
   3. NAVIGATION & ANIMATIONS
------------------------------------------------------------------ */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const progressBar = $('scroll-progress');

    window.addEventListener('scroll', () => {
        // Progress bar
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.height = `${scrolled}%`;
        }

        // Active section detection
        let current = '';
        document.querySelectorAll('.section').forEach((section) => {
            if (pageYOffset >= section.offsetTop - 140) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach((item) => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }, { passive: true });
}

function initAnimations() {
    initRoleRotation();
    initStatCounters();
    initScrollReveal();
}

function initRoleRotation() {
    const roleEl = $('dynamic-role');
    if (!roleEl) return;

    if (heroRoles.length === 1) {
        roleEl.textContent = heroRoles[0];
        return;
    }

    let roleIdx = 0;
    roleEl.textContent = heroRoles[0];
    setInterval(() => {
        roleEl.style.opacity = '0';
        setTimeout(() => {
            roleIdx = (roleIdx + 1) % heroRoles.length;
            roleEl.textContent = heroRoles[roleIdx];
            roleEl.style.opacity = '1';
        }, 400);
    }, 3000);
}

function initStatCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const value = parseInt(el.getAttribute('data-target'), 10) || 0;
            const duration = 1600;
            let start = null;

            function step(ts) {
                if (!start) start = ts;
                const p = Math.min((ts - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(eased * value).toLocaleString();
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = value.toLocaleString();
            }
            requestAnimationFrame(step);
            observer.unobserve(el);
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-target]').forEach((el) => observer.observe(el));
}

function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.timeline-item, .cert-card, .project-card, .skill-card, .achievement-card, .service-card, .stat-card'
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

/* ------------------------------------------------------------------
   4. INTERACTIONS
------------------------------------------------------------------ */
function initInteractions() {
    initContactForm();
    initCopyEmail();
    initCertificateFlips();
}

function initCertificateFlips() {
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-cert-flip]');
        if (!toggle) return;

        const card = toggle.closest('.cert-card--flip');
        if (!card) return;

        const isFlipped = card.classList.toggle('is-flipped');
        card.querySelectorAll('[data-cert-flip]').forEach((button) => {
            button.setAttribute('aria-pressed', String(isFlipped));
        });
    });
}

function initWorkshopSlides() {
    document.querySelectorAll('[data-workshop-slideshow]').forEach((slideshow) => {
        if (slideshow.dataset.rollReady === 'true') return;
        const slides = Array.from(slideshow.querySelectorAll('.workshop-slide'));
        if (slides.length < 2) return;

        slideshow.dataset.rollReady = 'true';
        slideshow.classList.add('picture-roll');
        const track = document.createElement('div');
        track.className = 'picture-roll-track';
        slides.forEach((slide) => track.appendChild(slide));
        slides.forEach((slide) => {
            const clone = slide.cloneNode(true);
            clone.alt = '';
            clone.setAttribute('aria-hidden', 'true');
            clone.removeAttribute('onerror');
            track.appendChild(clone);
        });
        slideshow.appendChild(track);

        const sizeTrack = () => {
            const slideWidth = slideshow.clientWidth;
            if (!slideWidth) return;
            track.querySelectorAll('.workshop-slide').forEach((slide) => {
                slide.style.width = `${slideWidth}px`;
            });
            track.style.width = `${slideWidth * slides.length * 2}px`;
            slideshow.style.setProperty('--roll-duration', `${slides.length * 4}s`);
        };

        sizeTrack();
        new ResizeObserver(sizeTrack).observe(slideshow);
    });
}

function initCopyEmail() {
    const btn = $('copy-email');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const email = ($('contact-email') || {}).textContent || '';
        if (!email) return;
        try {
            await navigator.clipboard.writeText(email);
            btn.textContent = 'Copied!';
            showToast('Email copied to clipboard', 'success');
        } catch (err) {
            showToast('Could not copy — select it manually', 'warning');
        }
        setTimeout(() => { btn.textContent = 'Copy Email'; }, 2000);
    });
}

async function initContactForm() {
    const form = $('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        const originalText = btnText ? btnText.textContent : 'Send Message';

        const getVal = (id) => { const el = $(id); return el ? el.value.trim() : ''; };
        const payload = {
            name: getVal('name'),
            email: getVal('email'),
            subject: getVal('subject'),
            message: getVal('message'),
        };

        if (!payload.name && !payload.email && !payload.subject && !payload.message) {
            showToast('Add at least some contact information before sending', 'warning');
            return;
        }

        try {
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Sending...';
            if (submitBtn) submitBtn.classList.add('loading');

            const response = await fetch('/api/contact/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                showToast(result.message || 'Message sent successfully!', 'success');
                form.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.textContent = originalText;
            if (submitBtn) submitBtn.classList.remove('loading');
        }
    });
}

/* ------------------------------------------------------------------
   5. MODAL SYSTEM
------------------------------------------------------------------ */
window.handleProjectImageError = function (image) {
    if (image.classList.contains('modal-hero-img')) {
        image.remove();
        return;
    }

    const placeholder = document.createElement('div');
    placeholder.className = 'project-img project-img--placeholder';
    placeholder.innerHTML = '<i class="fa-solid fa-code"></i>';
    image.replaceWith(placeholder);
};

window.openProjectModal = function (id) {
    const proj = (portfolioData.projects || []).find((p) => String(p.id) === String(id));
    const overlay = $('modal-overlay');
    const container = $('modal-container');
    if (!proj || !overlay || !container) return;

    const features = Array.isArray(proj.features) ? proj.features.filter(Boolean) : [];

    container.innerHTML = `
        <button class="modal-close" onclick="closeProjectModal()" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="modal-body">
            ${proj.images && proj.images.length
                ? `<img src="${esc(proj.images[0])}" class="modal-hero-img" alt="${esc(proj.title)}" loading="lazy"
                     onerror="window.handleProjectImageError(this)">` : ''}
            <div class="modal-header-row">
                <h2 class="modal-title">${esc(proj.title)}</h2>
                <span class="tag">${esc(proj.status)}</span>
            </div>
            ${proj.tagline ? `<p class="modal-tagline">${esc(proj.tagline)}</p>` : ''}
            <p>${esc(proj.description)}</p>
            ${proj.problem ? `
                <div class="modal-section">
                    <h4><i class="fa-solid fa-circle-question"></i> The Problem</h4>
                    <p>${esc(proj.problem)}</p>
                </div>` : ''}
            ${proj.solution ? `
                <div class="modal-section">
                    <h4><i class="fa-solid fa-lightbulb"></i> The Solution</h4>
                    <p>${esc(proj.solution)}</p>
                </div>` : ''}
            ${features.length ? `
                <div class="modal-section">
                    <h4><i class="fa-solid fa-list-check"></i> Key Features</h4>
                    <ul class="modal-list">${features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
                </div>` : ''}
            ${proj.github || proj.live ? `
                <div class="modal-links">
                    ${proj.github ? `<a href="${esc(proj.github)}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fa-brands fa-github"></i> GitHub Repo</a>` : ''}
                    ${proj.live ? `<a href="${esc(proj.live)}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : ''}
                </div>` : ''}
        </div>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function () {
    const overlay = $('modal-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
};

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'modal-overlay') closeProjectModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
});

/* ------------------------------------------------------------------
   6. TOASTS (dashboard-style)
------------------------------------------------------------------ */
function showToast(message, type = 'info') {
    const container = $('toast-container');
    if (!container) return;

    const icons = {
        success: 'fa-solid fa-circle-check',
        error: 'fa-solid fa-circle-exclamation',
        warning: 'fa-solid fa-triangle-exclamation',
        info: 'fa-solid fa-circle-info',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${esc(message)}</span>
        <button class="toast-close" aria-label="Dismiss"><i class="fa-solid fa-xmark"></i></button>
    `;

    const dismiss = () => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 320);
    };

    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    container.appendChild(toast);
    setTimeout(dismiss, 4200);
}
