// F4 : Mode Voyage — raccourcis pays
document.querySelectorAll('.voyage-country').forEach(btn => {
    btn.addEventListener('click', () => {
        const country = btn.dataset.country;
        // Mettre à jour le select pays et déclencher le filtre
        const sel = document.getElementById('country-select');
        if (sel) {
            const opt = Array.from(sel.options).find(o => o.value === country);
            if (opt) { sel.value = country; sel.dispatchEvent(new Event('change')); }
        }
        // Scroller vers le catalogue
        document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
        // Mettre en surbrillance le bouton actif
        document.querySelectorAll('.voyage-country').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
