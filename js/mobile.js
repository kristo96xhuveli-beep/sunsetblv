
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

  /* WEATHER FORCAST */
function setupLocalWeather() {
  const timeEl=document.getElementById('qeparoTime'), dateEl=document.getElementById('qeparoDate'), tempEl=document.getElementById('weatherTemp'), descEl=document.getElementById('weatherDescription'), iconEl=document.getElementById('weatherIcon');
  if (!timeEl || !dateEl || !tempEl || !descEl || !iconEl) return;
  const timezone='Europe/Tirane';

  function updateClock() {
    const now=new Date();
    timeEl.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
    dateEl.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(now);
  }

  function getWeather(code) {
    if (code===0) return ['Clear sky','sun'];
    if (code===1) return ['Mainly clear','sun'];
    if (code===2) return ['Partly cloudy','partly'];
    if (code===3) return ['Overcast','cloud'];
    if (code<=48) return ['Foggy','cloud'];
    if (code<=67) return ['Rain','rain'];
    if (code<=77) return ['Snow','rain'];
    if (code<=82) return ['Rain showers','rain'];
    if (code<=86) return ['Snow showers','rain'];
    return ['Thunderstorm','rain'];
  }

  function iconSvg(type) {
    const sun=`<circle cx="17" cy="15" r="6"/><path d="M17 3v3 M17 24v3 M5 15H2 M29 15h-3 M8.5 6.5l2 2 M23.5 21.5l2 2 M25.5 6.5l-2 2 M10.5 21.5l-2 2"/>`;
    const cloud=`<path d="M9 25h15a7 7 0 0 0 0-14 10 10 0 0 0-19 3 6 6 0 0 0 4 11Z"/>`;
    if (type==='sun') return `<svg viewBox="0 0 34 34">${sun}</svg>`;
    if (type==='partly') return `<svg viewBox="0 0 34 34"><g stroke="#c3ad83">${sun}</g>${cloud}</svg>`;
    if (type==='rain') return `<svg viewBox="0 0 34 34">${cloud}<path d="m12 27-2 4 M20 27l-2 4 M27 27l-2 4"/></svg>`;
    return `<svg viewBox="0 0 34 34">${cloud}</svg>`;
  }

  async function loadWeather() {
    try {
      const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.05&longitude=19.82&current=temperature_2m,weather_code&timezone=Europe%2FTirane');
      if (!response.ok) throw new Error('Weather unavailable');
      const data=await response.json(), current=data.current, info=getWeather(current.weather_code);
      tempEl.textContent=`${Math.round(current.temperature_2m)}°C`;
      descEl.textContent=info[0].toUpperCase();
      iconEl.innerHTML=iconSvg(info[1]);
    } catch (error) {
      tempEl.textContent='--°C'; descEl.textContent='WEATHER UNAVAILABLE'; iconEl.innerHTML='';
    }
  }

  updateClock(); loadWeather();
  setInterval(updateClock,30000);
  setInterval(loadWeather,15*60*1000);
}

setupLocalWeather();

  /* RADIO PLAYER */

  function setupRadio() {
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
    !volumeButton || !volumePanel || !volumeSlider || !status
  ) {
    return;
  }

  let playlist = [];
  let previousTrack = -1;

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
    document.body.classList.toggle('radio-player-open', show);
  }

  function closeVolumePanel() {
    volumePanel.hidden = true;
    volumeButton.setAttribute('aria-expanded', 'false');
  }

  function openVolumePanel() {
    volumePanel.hidden = false;
    volumeButton.setAttribute('aria-expanded', 'true');
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
    const track = chooseNextTrack();

    if (!track) {
      status.textContent = 'No music tracks available';
      return;
    }

    audio.src = track;

    try {
      await audio.play();
    } catch (error) {
      status.textContent = 'Tap play to start music';
      updatePlayButton();
    }
  }

  // Load the playlist according to the local time.
  status.textContent = 'Loading music...';

  fetch('audio.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('audio.json not found');
      }
      return response.json();
    })
    .then(data => {
      const hour = new Date().getHours();

      playlist =
        hour >= 6 && hour < 12
          ? data.morning || []
          : hour >= 12 && hour < 20
            ? data.day || []
            : data.night || [];

      if (playlist.length) {
        status.textContent = 'Ready to play';
      } else {
        status.textContent = 'No tracks in this playlist';
      }
    })
    .catch(() => {
      status.textContent = 'Radio playlist unavailable';
    });

  // Header button only shows or hides the player.
  headerButton.addEventListener('click', () => {
    updatePlayerVisibility(playerBar.hidden);
  });

  // Play or pause.
  playButton.addEventListener('click', async () => {
    if (audio.paused) {
      if (!audio.src) {
        await playNextTrack();
      } else {
        try {
          await audio.play();
        } catch (error) {
          status.textContent = 'Unable to play this track';
        }
      }
    } else {
      audio.pause();
    }

    updatePlayButton();
  });

  // Skip to another random track.
  nextButton.addEventListener('click', playNextTrack);

  // Automatically play another track when one ends.
  audio.addEventListener('ended', playNextTrack);

  audio.addEventListener('play', () => {
    status.textContent = 'Now playing';
    updatePlayButton();
  });

  audio.addEventListener('pause', updatePlayButton);

  audio.addEventListener('error', () => {
    status.textContent = 'Track unavailable';
    updatePlayButton();
  });

  // Volume control.
  volumeButton.addEventListener('click', () => {
    if (volumePanel.hidden) {
      openVolumePanel();
    } else {
      closeVolumePanel();
    }
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = Number(volumeSlider.value);
  });

  // Close the volume slider when clicking elsewhere.
  document.addEventListener('click', event => {
    if (
      !volumePanel.hidden &&
      !volumePanel.contains(event.target) &&
      !volumeButton.contains(event.target)
    ) {
      closeVolumePanel();
    }
  });

  updatePlayButton();
}
  setupRadio();
  
 
/* PHOTO GALLERY */
(() => {
  const gallery = document.getElementById("photoGallery");
  if (!gallery) return;

  const title = document.getElementById("galleryTitle");
  const mainImage = document.getElementById("galleryMainImage");
  const thumbnails = document.getElementById("galleryThumbnails");
  const counter = document.getElementById("galleryCounter");
  const prev = gallery.querySelector(".gallery-prev");
  const next = gallery.querySelector(".gallery-next");

  let photos = [];
  let currentIndex = 0;
  let lastFocused = null;
  let touchStartX = 0;

  function showPhoto(index) {
    if (!photos.length) return;

    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];

    title.textContent = photo.title;
    mainImage.src = photo.src;
    mainImage.alt = photo.title + " photo " + (photo.photoIndex + 1);

    counter.textContent = (photo.photoIndex + 1) + " / " + photo.groupLength;

    thumbnails.querySelectorAll(".gallery-thumb").forEach((button, i) => {
      button.classList.toggle("active", i === currentIndex);
    });

    prev.style.display = photos.length > 1 ? "" : "none";
    next.style.display = photos.length > 1 ? "" : "none";
  }

  function openGallery(card) {
    const groups = [card, ...card.querySelectorAll("[data-gallery-group]")];

    photos = [];

    groups.forEach(group => {
      const files = (group.dataset.gallery || "")
        .split("|")
        .map(photo => photo.trim())
        .filter(Boolean);

      const groupTitle = group.dataset.galleryTitle || "Photo Gallery";

      files.forEach((src, index) => {
        photos.push({
          src,
          title: groupTitle,
          photoIndex: index,
          groupLength: files.length
        });
      });
    });

    if (!photos.length) return;

    lastFocused = document.activeElement;
    thumbnails.innerHTML = "";

    photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.className = "gallery-thumb";
      button.type = "button";
      button.setAttribute(
        "aria-label",
        photo.title + " photo " + (photo.photoIndex + 1)
      );

      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = "";

      button.appendChild(image);
      button.addEventListener("click", () => showPhoto(index));
      thumbnails.appendChild(button);
    });

    showPhoto(0);

    gallery.classList.add("is-open");
    gallery.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");

    gallery.querySelector(".gallery-close").focus();
  }

  function closeGallery() {
    gallery.classList.remove("is-open");
    gallery.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");

    mainImage.src = "";
    thumbnails.innerHTML = "";
    photos = [];

    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(
    ".room-card[data-gallery-group], .simple-grid article[data-gallery-group]"
  ).forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("a, button")) return;
      openGallery(card);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGallery(card);
      }
    });
  });

  prev.addEventListener("click", () => showPhoto(currentIndex - 1));
  next.addEventListener("click", () => showPhoto(currentIndex + 1));

  gallery.querySelectorAll("[data-gallery-close]").forEach(button => {
    button.addEventListener("click", closeGallery);
  });

  document.addEventListener("keydown", event => {
    if (!gallery.classList.contains("is-open")) return;

    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (event.key === "ArrowRight") showPhoto(currentIndex + 1);
  });

  mainImage.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  mainImage.addEventListener("touchend", event => {
    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchEndX - touchStartX;

    if (Math.abs(difference) > 50) {
      showPhoto(currentIndex + (difference < 0 ? 1 : -1));
    }
  }, { passive: true });
})();

  })();
