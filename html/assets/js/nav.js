// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const siteHeaders = document.querySelectorAll('.site-header');
    const themeStorageKey = 'hoff-theme';

    function setMenuState(button, menu, isOpen) {
        menu.classList.toggle('is-open', isOpen);
        button.classList.toggle('is-open', isOpen);
        button.setAttribute('aria-expanded', String(isOpen));
    }

    siteHeaders.forEach((header, index) => {
        const existingToggle = header.querySelector('.nav-toggle');
        const menu = header.querySelector('.header-controls, .primary-nav');
        if (!menu) return;

        const toggle = existingToggle || document.createElement('button');
        if (!existingToggle) {
            toggle.type = 'button';
            toggle.className = 'nav-toggle';
            toggle.innerHTML = '<span></span><span></span><span></span>';
            toggle.setAttribute('aria-label', 'Ouvrir le menu');
            header.querySelector('.site-header__inner')?.insertBefore(toggle, menu);
        }

        const menuId = menu.id || `site-menu-${index + 1}`;
        menu.id = menuId;
        toggle.setAttribute('aria-controls', menuId);
        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') !== 'true';
            setMenuState(toggle, menu, isOpen);
        });
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.matchMedia('(max-width: 800px)').matches) {
                    setMenuState(toggle, menu, false);
                }
            });
        });
    });

    function updateThemeButton(button, theme) {
        const isDark = theme === 'dark';
        button.textContent = isDark ? '☀️' : '◐';
        button.setAttribute('aria-label', isDark ? 'Activer le thème clair' : 'Activer le thème sombre');
        button.setAttribute('aria-pressed', String(isDark));
    }

    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === 'dark' || storedTheme === 'light') {
        document.documentElement.dataset.theme = storedTheme;
    }

    siteHeaders.forEach(header => {
        const container = header.querySelector('.header-cta-row, .primary-nav');
        if (!container || container.querySelector('.theme-toggle')) return;
        const themeButton = document.createElement('button');
        themeButton.type = 'button';
        themeButton.className = 'theme-toggle';
        themeButton.addEventListener('click', () => {
            const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = nextTheme;
            localStorage.setItem(themeStorageKey, nextTheme);
            updateThemeButton(themeButton, nextTheme);
        });
        container.appendChild(themeButton);
        updateThemeButton(themeButton, document.documentElement.dataset.theme || 'light');
    });

    // Close fundraiser banner
    const closeBanner = document.getElementById('close-banner');
    const banner = document.getElementById('fundraiser-banner');
    
    if (closeBanner && banner) {
        closeBanner.addEventListener('click', () => {
            banner.style.display = 'none';
        });
    }

    // Donation links
    const donateLink = document.getElementById('donate-link');
    const footerDonateLink = document.getElementById('footer-donate-link');
    
    const donationUrl = 'donate.html';
    
    if (donateLink) {
        donateLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = donationUrl;
        });
    }
    
    if (footerDonateLink) {
        footerDonateLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = donationUrl;
        });
    }

    // Ombre du header au scroll (feedback visuel de profondeur)
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        const onScroll = () => {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});
