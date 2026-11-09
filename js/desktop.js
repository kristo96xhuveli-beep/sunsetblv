(() => {
  const body = document.body;
  const dark = document.getElementById('darkMode');
  dark.addEventListener('click', () => body.classList.toggle('dark'));
  const audio = document.getElementById('radioPlayer');
  const button = document.getElementById('musicToggle');
  let playlist = [], started = false, muted = false, previous = -1;
  fetch('audio.json').then(r => { if (!r.ok) throw new Error('audio.json not found'); return r.json(); })
    .then(data => {
      const h = new Date().getHours();
      playlist = h >= 6 && h < 12 ? data.morning || [] : h >= 12 && h < 20 ? data.day || [] : data.night || [];
    }).catch(() => { button.title = 'Add audio.json to enable the hotel radio'; });
  function nextTrack() {
    if (!playlist.length) return;
    let i = Math.floor(Math.random() * playlist.length);
    if (playlist.length > 1 && i === previous) i = (i + 1) % playlist.length;
    previous = i; audio.src = playlist[i]; audio.play().catch(() => {});
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
})();