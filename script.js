/* Framework-free portfolio interactions. */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initProjectFilters();
    initSkillSearch();
    initScrollProgress();
});
function initTheme() {
    const button = document.getElementById('theme-toggle');
    function apply(theme) {
        const light = theme === 'light';
        document.body.classList.toggle('light-theme', light);
        document.body.classList.toggle('dark-theme', !light);
        button.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
        button.setAttribute('aria-pressed', String(light));
        button.title = `Switch to ${light ? 'dark' : 'light'} theme`;
    }
    let saved = 'light';
    try { saved = localStorage.getItem('palak-portfolio-appearance') || 'light'; } catch { /* Storage is optional. */ }
    apply(saved);
    button.addEventListener('click', () => {
        const theme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        apply(theme);
        try { localStorage.setItem('palak-portfolio-appearance', theme); } catch { /* The toggle still works. */ }
    });
}
function initNavigation() {
    const header = document.getElementById('navbar');
    const button = document.getElementById('mobile-toggle');
    const menu = document.getElementById('nav-menu');
    const mobile = window.matchMedia('(max-width: 768px)');
    const links = [...menu.querySelectorAll('.nav-link')];
    function setOpen(open) {
        menu.classList.toggle('active', open);
        menu.inert = mobile.matches && !open;
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
    }
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    links.forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', event => {
        if (mobile.matches && !header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            button.focus();
        }
    });
    mobile.addEventListener('change', () => setOpen(false));
    setOpen(false);
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => {
                    const active = link.hash === `#${entry.target.id}`;
                    link.classList.toggle('active', active);
                    if (active) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-15% 0px -65% 0px' });
        document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
    }
}
function initProjectFilters() {
    const buttons = [...document.querySelectorAll('.filter-btn')];
    const cards = [...document.querySelectorAll('.project-card')];
    const status = document.getElementById('project-count');
    buttons.forEach(button => button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        buttons.forEach(item => {
            const active = item === button;
            item.classList.toggle('active', active);
            item.setAttribute('aria-pressed', String(active));
        });
        let count = 0;
        cards.forEach(card => {
            const show = filter === 'all' || card.dataset.category.split(/\s+/).includes(filter);
            card.hidden = !show;
            if (show) count++;
        });
        status.textContent = filter === 'all' ? `Showing all ${count} projects` : `${count} projects · ${button.textContent.trim()}`;
    }));
}
function initSkillSearch() {
    const input = document.getElementById('skill-search-input');
    const clear = document.getElementById('clear-search-btn');
    const groups = [...document.querySelectorAll('.skill-group-card')];
    const status = document.getElementById('skill-search-status');
    const empty = document.getElementById('skill-empty');
    function search() {
        const query = input.value.trim().toLowerCase();
        let matches = 0;
        groups.forEach(group => {
            const headingMatches = group.querySelector('h3').textContent.toLowerCase().includes(query);
            let groupMatches = 0;
            group.querySelectorAll('.skill-pill').forEach(pill => {
                const show = !query || headingMatches || pill.textContent.toLowerCase().includes(query);
                pill.hidden = !show;
                pill.classList.toggle('highlight', !!query && show);
                if (show) groupMatches++;
            });
            group.hidden = groupMatches === 0;
            matches += groupMatches;
        });
        clear.hidden = !query;
        empty.hidden = matches > 0;
        status.textContent = query ? `${matches} matching ${matches === 1 ? 'skill' : 'skills'}` : `Explore ${groups.length} skill areas`;
    }
    input.addEventListener('input', search);
    clear.addEventListener('click', () => { input.value = ''; search(); input.focus(); });
}
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    const update = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = `${total > 0 ? window.scrollY / total * 100 : 0}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}
