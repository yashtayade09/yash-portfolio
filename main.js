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
        <div class="timeline-item">
            <div class="timeline-card">
                <div class="timeline-header">
                    <h3 class="timeline-title">${esc(edu.institution)}</h3>
                    <span class="timeline-date">${esc(edu.duration)}</span>
                </div>
                <div class="timeline-meta">
                    <strong>${esc(edu.course)}</strong>${edu.percentage ? ` | ${esc(edu.percentage)}` : ''}
                </div>
                ${edu.description ? `<p>${esc(edu.description)}</p>` : ''}
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
        <div class="cert-card">
            ${cert.image ? `<img src="${esc(cert.image)}" class="cert-img" alt="${esc(cert.title)}" loading="lazy"
                onerror="this.style.display='none'">` : ''}
            <div class="cert-content">
                <h3 class="cert-title">${esc(cert.title)}</h3>
                <span class="cert-issuer">${esc(cert.issuer)}${cert.date ? ` • ${esc(cert.date)}` : ''}</span>
                ${cert.description ? `<p class="cert-desc">${esc(cert.description)}</p>` : ''}
                ${cert.url ? `<a href="${esc(cert.url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">View Credential</a>` : ''}
            </div>
        </div>
    `), 'certificates', 'No certifications published yet.');

    // Workshops
    renderCards('workshops-container', (portfolioData.workshops || []).map((work) => `
        <div class="cert-card">
            <div class="cert-content">
                <h3 class="cert-title">${esc(work.title)}</h3>
                <span class="cert-issuer">${esc(work.organizer)}${work.date ? ` • ${esc(work.date)}` : ''}</span>
                ${work.description ? `<p class="cert-desc">${esc(work.description)}</p>` : ''}
                ${work.topic ? `<span class="tag">${esc(work.topic)}</span>` : ''}
            </div>
        </div>
    `), 'workshops', 'No workshops published yet.');

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
                         onerror="this.src='https://via.placeholder.com/400x250?text=Project'">`
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
                     onerror="this.style.display='none'">` : ''}
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
