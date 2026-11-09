(() => {
  const body = document.body;
  const drawer = document.getElementById('menuDrawer');
  const shade = document.getElementById('menuShade');
  const closeMenu = () => body.classList.remove('menu-open');
  document.getElementById('menuOpen').addEventListener('click', () => body.classList.add('menu-open'));
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  shade.addEventListener('click', closeMenu);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  const dark = document.getElementById('darkMode');
  dark.addEventListener('change', () => body.classList.toggle('dark', dark.checked));

  document.querySelectorAll('[data-lang]').forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('active', b === button));
      document.querySelectorAll('[data-en][data-al]').forEach(el => {
        el.textContent = el.dataset[lang];
      });
    });
  });

  setupRadio();
  function setupRadio() {
    const audio = document.getElementById('radioPlayer');
    const button = document.getElementById('musicToggle');
    let playlist = [], started = false, muted = false;
    fetch('audio.json').then(r => { if (!r.ok) throw new Error('audio.json not found'); return r.json(); })
      .then(data => {
        const h = new Date().getHours();
        playlist = h >= 6 && h < 12 ? data.morning || [] : h >= 12 && h < 20 ? data.day || [] : data.night || [];
      }).catch(() => { button.title = 'Add audio.json to enable the hotel radio'; });
    let previous = -1;
    function nextTrack() {
      if (!playlist.length) return;
      let index = Math.floor(Math.random() * playlist.length);
      if (playlist.length > 1 && index === previous) index = (index + 1) % playlist.length;
      previous = index; audio.src = playlist[index]; audio.play().catch(() => {});
    }
    audio.addEventListener('ended', nextTrack);
    button.addEventListener('click', async () => {
      if (!started) {
        if (!audio.src) nextTrack();
        try { await audio.play(); started = true; muted = false; button.textContent = '🔇 Mute'; }
        catch { button.textContent = 'Tap to play'; }
      } else {
        muted = !muted; audio.muted = muted; button.textContent = muted ? '🔊 Unmute' : '🔇 Mute';
      }
    });
  }
})();