/**
 * ULTRA-MODERN DASHBOARD ENGINE
 * Theme, sidebar, counters, toasts, table search, confirms.
 * All lookups are null-guarded so the script is safe on every page.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        initSidebar();
        initToasts();
        initCounters();
        initTableSearch();
        initConfirms();
        initPasswordToggles();
        initCurrentYear();
        initQuickJump();
    });

    /* ------------------------------------------------------------------
       THEME — persisted in localStorage under 'theme' (shared with the
       public site so both stay in sync).
    ------------------------------------------------------------------ */
    function initTheme() {
        var btn = document.querySelector('.db-theme-toggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var root = document.documentElement;
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
        });
    }

    /* ------------------------------------------------------------------
       SIDEBAR — mobile drawer + desktop collapse (persisted).
    ------------------------------------------------------------------ */
    function initSidebar() {
        var burger = document.querySelector('.db-burger');
        var overlay = document.querySelector('.db-sidebar-overlay');
        var collapseBtn = document.querySelector('.db-collapse-btn');
        var sidebar = document.querySelector('.db-sidebar');

        if (burger) {
            burger.addEventListener('click', function () {
                document.body.classList.toggle('db-open');
            });
        }
        if (overlay) {
            overlay.addEventListener('click', function () {
                document.body.classList.remove('db-open');
            });
        }
        // Close drawer when a nav link is tapped (small screens)
        if (sidebar) {
            sidebar.querySelectorAll('.db-nav-link').forEach(function (link) {
                link.addEventListener('click', function () {
                    if (window.innerWidth <= 900) document.body.classList.remove('db-open');
                });
            });
        }
        if (collapseBtn) {
            // Restore persisted state
            try {
                if (localStorage.getItem('db-sidebar') === 'collapsed') {
                    document.body.classList.add('db-collapsed');
                }
            } catch (e) { /* private mode */ }

            collapseBtn.addEventListener('click', function () {
                var collapsed = document.body.classList.toggle('db-collapsed');
                try { localStorage.setItem('db-sidebar', collapsed ? 'collapsed' : 'open'); } catch (e) { /* private mode */ }
            });
        }
        // Escape closes the drawer
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') document.body.classList.remove('db-open');
        });
    }

    /* ------------------------------------------------------------------
       TOASTS — Django messages auto-dismiss with exit animation.
    ------------------------------------------------------------------ */
    function initToasts() {
        document.querySelectorAll('.db-toast').forEach(function (toast) {
            var ttl = parseInt(toast.getAttribute('data-ttl') || '4200', 10);
            var timer = setTimeout(function () { dismissToast(toast); }, ttl);

            var close = toast.querySelector('.db-toast-close');
            if (close) {
                close.addEventListener('click', function () {
                    clearTimeout(timer);
                    dismissToast(toast);
                });
            }
        });
    }

    function dismissToast(toast) {
        if (!toast || toast.classList.contains('db-toast-hide')) return;
        toast.classList.add('db-toast-hide');
        setTimeout(function () { toast.remove(); }, 320);
    }

    /* ------------------------------------------------------------------
       COUNTERS — animate [data-counter] values from 0 up.
    ------------------------------------------------------------------ */
    function initCounters() {
        var els = document.querySelectorAll('[data-counter]');
        if (!els.length) return;

        els.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
            if (target <= 0) { el.textContent = '0'; return; }

            var duration = 1100;
            var start = null;

            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                el.textContent = Math.round(eased * target).toLocaleString();
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = target.toLocaleString();
            }
            requestAnimationFrame(step);
        });
    }

    /* ------------------------------------------------------------------
       TABLE SEARCH — live filter rows of #db-data-table.
    ------------------------------------------------------------------ */
    function initTableSearch() {
        var input = document.getElementById('db-table-search');
        var table = document.getElementById('db-data-table');
        if (!input || !table) return;

        var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
        var counter = document.querySelector('.db-table-count b');

        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            var visible = 0;

            rows.forEach(function (row) {
                var match = row.textContent.toLowerCase().indexOf(q) !== -1;
                row.style.display = match ? '' : 'none';
                if (match) visible++;
            });
            if (counter) counter.textContent = visible;
        });
    }

    /* ------------------------------------------------------------------
       CONFIRM DIALOGS — any link/form with .js-confirm asks first.
    ------------------------------------------------------------------ */
    function initConfirms() {
        document.querySelectorAll('a.js-confirm').forEach(function (link) {
            link.addEventListener('click', function (e) {
                if (!window.confirm(link.getAttribute('data-confirm') || 'Are you sure? This action cannot be undone.')) {
                    e.preventDefault();
                }
            });
        });
        document.querySelectorAll('form.js-confirm').forEach(function (form) {
            form.addEventListener('submit', function (e) {
                if (!window.confirm(form.getAttribute('data-confirm') || 'Are you sure? This action cannot be undone.')) {
                    e.preventDefault();
                }
            });
        });
    }

    /* ------------------------------------------------------------------
       PASSWORD VISIBILITY TOGGLES (login page).
    ------------------------------------------------------------------ */
    function initPasswordToggles() {
        document.querySelectorAll('.db-pw-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var input = btn.parentElement.querySelector('input');
                if (!input) return;
                var show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                var icon = btn.querySelector('i');
                if (icon) icon.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            });
        });
    }

    /* ------------------------------------------------------------------
       QUICK JUMP — command-palette style module switcher in the topbar.
       Arrow keys navigate, Enter opens, Escape closes, '/' focuses.
    ------------------------------------------------------------------ */
    function initQuickJump() {
        var input = document.getElementById('db-quickjump-input');
        var results = document.getElementById('db-quickjump-results');
        if (!input || !results) return;

        var items = [];
        document.querySelectorAll('.db-sidebar-nav .db-nav-link').forEach(function (link) {
            var label = (link.querySelector('span') || {}).textContent || '';
            var icon = link.querySelector('i');
            if (label) {
                items.push({
                    label: label.trim(),
                    href: link.getAttribute('href'),
                    icon: icon ? icon.className : 'fa-solid fa-arrow-right'
                });
            }
        });

        var selected = -1;

        function render(query) {
            var q = query.trim().toLowerCase();
            var matches = !q ? items : items.filter(function (it) {
                return it.label.toLowerCase().indexOf(q) !== -1;
            });

            selected = matches.length ? 0 : -1;

            if (!matches.length) {
                results.innerHTML = '<div class="db-quickjump-empty">No modules match “' + escapeHtml(query) + '”</div>';
            } else {
                results.innerHTML = matches.map(function (it, idx) {
                    return '<a class="db-quickjump-item' + (idx === 0 ? ' selected' : '') + '" href="' + it.href + '">' +
                           '<i class="' + it.icon + '"></i>' + escapeHtml(it.label) + '</a>';
                }).join('');
            }
            results.hidden = false;
        }

        function move(dir) {
            var nodes = results.querySelectorAll('.db-quickjump-item');
            if (!nodes.length) return;
            selected = (selected + dir + nodes.length) % nodes.length;
            nodes.forEach(function (n, i) { n.classList.toggle('selected', i === selected); });
            nodes[selected].scrollIntoView({ block: 'nearest' });
        }

        function openSelected() {
            var nodes = results.querySelectorAll('.db-quickjump-item');
            if (nodes[selected]) window.location.href = nodes[selected].getAttribute('href');
        }

        input.addEventListener('focus', function () { render(input.value); });
        input.addEventListener('input', function () { render(input.value); });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); openSelected(); }
            else if (e.key === 'Escape') { results.hidden = true; input.blur(); }
        });

        document.addEventListener('click', function (e) {
            if (!results.hidden && !results.contains(e.target) && e.target !== input) results.hidden = true;
        });

        // '/' anywhere focuses the quick jump
        document.addEventListener('keydown', function (e) {
            if (e.key === '/' && document.activeElement !== input &&
                !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
                e.preventDefault();
                input.focus();
            }
        });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ------------------------------------------------------------------
       FOOTER YEAR
    ------------------------------------------------------------------ */
    function initCurrentYear() {
        document.querySelectorAll('[data-year]').forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
    }
})();
