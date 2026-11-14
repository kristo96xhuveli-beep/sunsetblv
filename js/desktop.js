(() => {
  const body = document.body;

  /* 1. MOBILE MENU */
  const menuOpen = document.getElementById('menuOpen');
  const menuClose = document.getElementById('menuClose');
  const drawer = document.getElementById('menuDrawer');
  const shade = document.getElementById('menuShade');

  if (menuOpen && menuClose && drawer && shade) {
    const closeMenu = () => body.classList.remove('menu-open');

    menuOpen.addEventListener('click', () => body.classList.add('menu-open'));
    menuClose.addEventListener('click', closeMenu);
    shade.addEventListener('click', closeMenu);

    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });
  }

  /* 2. QEPARO LOCAL TIME & WEATHER */
  (() => {
    const timeElement = document.getElementById('qeparoTime');
    const dateElement = document.getElementById('qeparoDate');
    const iconElement = document.getElementById('weatherIcon');
    const tempElement = document.getElementById('weatherTemp');
    const descriptionElement = document.getElementById('weatherDescription');

    const timezone = 'Europe/Tirane';

    function updateLocalTime() {
      const now = new Date();

      if (timeElement) {
        timeElement.textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23'
        }).format(now);
      }

      if (dateElement) {
        dateElement.textContent = new Intl.DateTimeFormat('en-GB', {
          timeZone: timezone,
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(now);
      }
    }

    function getWeather(code) {
      if (code === 0) return { text: 'Clear sky', icon: 'sun' };
      if (code === 1) return { text: 'Mainly clear', icon: 'sun-cloud' };
      if (code === 2) return { text: 'Partly cloudy', icon: 'sun-cloud' };
      if (code === 3) return { text: 'Overcast', icon: 'cloud' };
      if ([45, 48].includes(code)) return { text: 'Foggy', icon: 'fog' };
      if ([51, 53, 55, 56, 57].includes(code)) return { text: 'Drizzle', icon: 'rain' };
      if ([61, 63, 65, 66, 67].includes(code)) return { text: 'Rain', icon: 'rain' };
      if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: 'Snow', icon: 'snow' };
      if ([80, 81, 82].includes(code)) return { text: 'Rain showers', icon: 'rain' };
      if ([95, 96, 99].includes(code)) return { text: 'Thunderstorm', icon: 'storm' };

      return { text: 'Weather unavailable', icon: 'cloud' };
    }

    function iconSvg(type) {
      const icons = {
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
        'sun-cloud': '<circle cx="8" cy="8" r="3"/><path d="M8 2v1m0 10v1M2 8h1m10 0h1M3.8 3.8l.7.7m7 7 .7.7M15 19h-8a4 4 0 0 1-.5-8 5 5 0 0 1 9.5-1A4.5 4.5 0 0 1 15 19Z"/>',
        cloud: '<path d="M20 17.5A4.5 4.5 0 0 0 17 9a6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 6 17.5Z"/>',
        fog: '<path d="M4 10h16M2 14h20M5 18h14M6 6h12"/>',
        rain: '<path d="M20 15.5A4.5 4.5 0 0 0 17 7a6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 6 15.5Z"/><path d="m8 18-1 3m6-3-1 3m6-3-1 3"/>',
        snow: '<path d="M20 15.5A4.5 4.5 0 0 0 17 7a6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 6 15.5Z"/><path d="M8 18v4m-2-2 2 2 2-2m4-2v4m-2-2 2 2 2-2"/>',
        storm: '<path d="M20 14.5A4.5 4.5 0 0 0 17 6a6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 6 14.5Z"/><path d="m13 15-4 5h4l-1 3 5-6h-4l1-2"/>'
      };

      return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[type] || icons.cloud}</svg>`;
    }

    async function updateWeather() {
      if (!tempElement && !descriptionElement && !iconElement) return;

      const url = 'https://api.open-meteo.com/v1/forecast?latitude=40.05&longitude=19.82&current=temperature_2m,weather_code&timezone=Europe%2FTirane';

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Weather service unavailable');
        }

        const data = await response.json();
        const current = data.current;

        if (!current) {
          throw new Error('Weather data unavailable');
        }

        const temperature = Math.round(current.temperature_2m);
        const weather = getWeather(current.weather_code);

        if (tempElement) {
          tempElement.textContent = `${temperature}°C`;
        }

        if (descriptionElement) {
          descriptionElement.textContent = weather.text;
        }

        if (iconElement) {
          iconElement.innerHTML = iconSvg(weather.icon);
        }

      } catch (error) {
        console.error('Qeparo weather error:', error);

        if (descriptionElement) {
          descriptionElement.textContent = 'Weather unavailable';
        }

        if (iconElement) {
          iconElement.innerHTML = iconSvg('cloud');
        }
      }
    }

    updateLocalTime();
    updateWeather();

    setInterval(updateLocalTime, 1000);
    setInterval(updateWeather, 30 * 60 * 1000);
  })();

  /* 3. DARK MODE */
  const dark = document.getElementById('darkMode');

  if (dark) {
    dark.addEventListener('click', () => {
      body.classList.toggle('dark');
    });
  }

  

/* 4. HOTEL RADIO – DESKTOP PLAYER */
(() => {
  const audio = document.getElementById('radioPlayer');
  const headerButton = document.getElementById('musicToggle');
  const playerBar = document.getElementById('radioPlayerBar');
  const playButton = document.getElementById('musicPlayPause');
  const playIcon = document.getElementById('playPauseIcon');
  const nextButton = document.getElementById('musicNext');
  const volumeButton = document.getElementById('volumeToggle');
  const volumePanel = document.getElementById('radioVolumePanel');
  const volumeSlider = document.getElementById('volumeSlider');
  const status = document.getElementById('radioStatus');

  if (
    !audio || !headerButton || !playerBar ||
    !playButton || !playIcon || !nextButton ||
    !volumeButton || !volumePanel || !volumeSlider
  ) return;

  let playlist = [];
  let previousTrack = -1;
  let playlistReady = false;

  audio.volume = Number(volumeSlider.value);

  function updatePlayButton() {
    if (audio.paused) {
      playIcon.innerHTML = '<path d="M8 5v14l11-7Z"></path>';
      playButton.setAttribute('aria-label', 'Play music');
    } else {
      playIcon.innerHTML =
        '<path d="M8 5v14"></path><path d="M16 5v14"></path>';
      playButton.setAttribute('aria-label', 'Pause music');
    }
  }

  function updatePlayerVisibility(show) {
    playerBar.hidden = !show;
    headerButton.setAttribute('aria-expanded', String(show));
    headerButton.setAttribute(
      'aria-label',
      show ? 'Hide music player' : 'Open music player'
    );
  }

  function choosePlaylist(data) {
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Tirane',
        hour: '2-digit',
        hourCycle: 'h23'
      }).format(new Date())
    );

    if (hour >= 6 && hour < 12) return data.morning || [];
    if (hour >= 12 && hour < 20) return data.day || [];
    return data.night || [];
  }

  function chooseNextTrack() {
    if (!playlist.length) return null;

    let index = Math.floor(Math.random() * playlist.length);

    if (playlist.length > 1 && index === previousTrack) {
      index = (index + 1) % playlist.length;
    }

    previousTrack = index;
    return playlist[index];
  }

  async function playNextTrack() {
    if (!playlistReady) return;

    const track = chooseNextTrack();
    if (!track) return;

    audio.src = track;

    try {
      await audio.play();
    } catch (error) {
      updatePlayButton();
    }
  }

  async function togglePlayback() {
    if (!playlistReady) return;

    if (audio.paused) {
      if (!audio.src) {
        await playNextTrack();
        return;
      }

      try {
        await audio.play();
      } catch (error) {
        updatePlayButton();
      }
    } else {
      audio.pause();
    }

    updatePlayButton();
  }

  // Load playlists using Qeparo local time.
  fetch('audio.json')
    .then(response => {
      if (!response.ok) throw new Error('Playlist not found');
      return response.json();
    })
    .then(data => {
      playlist = choosePlaylist(data);
      playlistReady = true;
    })
    .catch(error => {
      console.error('Radio playlist error:', error);
      playlistReady = true;
    });

  // Top-right Music button opens and closes the player.
  headerButton.addEventListener('click', () => {
    updatePlayerVisibility(playerBar.hidden);
  });

  // Play / pause.
  playButton.addEventListener('click', togglePlayback);

  // Next random track.
  nextButton.addEventListener('click', playNextTrack);

  // Volume panel.
  volumeButton.addEventListener('click', () => {
    volumePanel.hidden = !volumePanel.hidden;
    volumeButton.setAttribute(
      'aria-expanded',
      String(!volumePanel.hidden)
    );
  });

  // Volume slider.
  volumeSlider.addEventListener('input', () => {
    audio.volume = Number(volumeSlider.value);
    audio.muted = false;
  });

  // Automatically play another track when one ends.
  audio.addEventListener('ended', playNextTrack);

  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);

})();


    /* 5. INLINE FEATURE GALLERIES WITH AUTOMATIC PHOTO COLOURS */
  (() => {
    const galleries = document.querySelectorAll('[data-feature-gallery]');
    if (!galleries.length) return;

    const shortTitles = {
      'Deluxe Double': 'DELUXE DOUBLE',
      'Standard Triple': 'STANDARD TRIPLE',
      'Simple Triple': 'SIMPLE TRIPLE',
      'Grills & Mains': 'GRILLS & MAINS',
      'Signature & Classic Cocktails': 'COCKTAILS',
      'Coffees & Drinks': 'COFFEES & DRINKS',
      'Beach & Swimming': 'BEACH',
      'Boat Trips & Canoeing': 'BOAT TRIPS',
      'Village Hiking': 'HIKING'
    };

    const getPhotos = item => (item.dataset.gallery || '')
      .split(/[|,]/)
      .map(photo => photo.trim())
      .filter(Boolean);

    const colourCache = new Map();

    function getPhotoColour(image) {
      if (!image.complete || !image.naturalWidth) return null;

      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        canvas.width = 40;
        canvas.height = 40;

        context.drawImage(image, 0, 0, 40, 40);

        const pixels = context.getImageData(0, 0, 40, 40).data;
        const buckets = new Map();

        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const alpha = pixels[i + 3];

          if (alpha < 180) continue;

          const brightness = (r + g + b) / 3;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);

          // Ignore very dark and nearly white pixels.
          if (brightness < 28 || brightness > 238) continue;

          // Give colourful pixels more influence than grey pixels.
          const saturation = max === 0 ? 0 : (max - min) / max;
          if (saturation < 0.12) continue;

          const qr = Math.round(r / 32);
          const qg = Math.round(g / 32);
          const qb = Math.round(b / 32);
          const key = `${qr},${qg},${qb}`;

          const existing = buckets.get(key) || {
            count: 0,
            r: 0,
            g: 0,
            b: 0
          };

          existing.count++;
          existing.r += r;
          existing.g += g;
          existing.b += b;

          buckets.set(key, existing);
        }

        if (!buckets.size) return null;

        let dominant = null;

        buckets.forEach(bucket => {
          if (!dominant || bucket.count > dominant.count) {
            dominant = bucket;
          }
        });

        const r = Math.round(dominant.r / dominant.count);
        const g = Math.round(dominant.g / dominant.count);
        const b = Math.round(dominant.b / dominant.count);

        // Blend the sampled colour with navy for an elegant, readable stripe.
        const navy = { r: 11, g: 31, b: 58 };
        const blend = 0.62;

        const finalR = Math.round(r * blend + navy.r * (1 - blend));
        const finalG = Math.round(g * blend + navy.g * (1 - blend));
        const finalB = Math.round(b * blend + navy.b * (1 - blend));

        return `rgb(${finalR}, ${finalG}, ${finalB})`;

      } catch (error) {
        // If the browser cannot read image pixels, keep the default navy.
        return null;
      }
    }

    function updateStripeColour(image, tabs) {
      const source = image.currentSrc || image.src;

      if (colourCache.has(source)) {
        const cached = colourCache.get(source);
        if (cached) tabs.style.setProperty('--gallery-stripe-colour', cached);
        return;
      }

      const colour = getPhotoColour(image);

      if (colour) {
        colourCache.set(source, colour);
        tabs.style.setProperty('--gallery-stripe-colour', colour);
      }
    }

    galleries.forEach(gallery => {
      const tabs = gallery.closest('.feature-layout')?.querySelector('.feature-copy .feature-category-tabs');
      const imageWrap = gallery.querySelector('.feature-image-wrap');
      const mainImage = imageWrap?.querySelector('img');
      const previousButton = imageWrap?.querySelector('.feature-prev');
      const nextButton = imageWrap?.querySelector('.feature-next');
      const counter = imageWrap?.querySelector('.feature-counter');

      if (!tabs || !imageWrap || !mainImage) return;

      const groups = Array.from(gallery.querySelectorAll('[data-gallery]'))
        .map(item => ({
          title: item.dataset.galleryTitle || 'Photo Gallery',
          photos: getPhotos(item)
        }))
        .filter(group => group.photos.length);

      if (!groups.length) return;

      let activeGroupIndex = 0;
      let activePhotoIndex = 0;
      let touchStartX = 0;

      const updatePhotoColour = () => {
        const applyColour = () => updateStripeColour(mainImage, tabs);

        if (mainImage.complete && mainImage.naturalWidth) {
          applyColour();
        } else {
          mainImage.addEventListener('load', applyColour, { once: true });
        }
      };

      const updatePhoto = () => {
        const group = groups[activeGroupIndex];
        const photo = group.photos[activePhotoIndex];

        mainImage.src = photo;
        mainImage.alt = `${group.title} - Photo ${activePhotoIndex + 1}`;

        if (counter) {
          counter.textContent = `${activePhotoIndex + 1} / ${group.photos.length}`;
        }

        gallery.dataset.singlePhoto = String(group.photos.length <= 1);

        updatePhotoColour();
      };

      const renderTabs = () => {
        tabs.innerHTML = '';

        groups.forEach((group, index) => {
          const tab = document.createElement('button');

          tab.type = 'button';
          tab.className = 'feature-category-tab';
          tab.textContent = shortTitles[group.title] || group.title.toUpperCase();
          tab.setAttribute('role', 'tab');
          tab.setAttribute('aria-selected', String(index === activeGroupIndex));

          if (index === activeGroupIndex) {
            tab.classList.add('active');
          }

          tab.addEventListener('click', () => {
            activeGroupIndex = index;
            activePhotoIndex = 0;
            renderTabs();
            updatePhoto();
          });

          tabs.appendChild(tab);
        });
      };

      const movePhoto = direction => {
        const photos = groups[activeGroupIndex].photos;

        if (photos.length <= 1) return;

        activePhotoIndex = (activePhotoIndex + direction + photos.length) % photos.length;
        updatePhoto();
      };

      previousButton?.addEventListener('click', () => movePhoto(-1));
      nextButton?.addEventListener('click', () => movePhoto(1));

      imageWrap.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].screenX;
      }, { passive: true });

      imageWrap.addEventListener('touchend', event => {
        const difference = touchStartX - event.changedTouches[0].screenX;

        if (Math.abs(difference) < 45) return;

        movePhoto(difference > 0 ? 1 : -1);
      }, { passive: true });

      renderTabs();
      updatePhoto();
    });
  })();

})();
