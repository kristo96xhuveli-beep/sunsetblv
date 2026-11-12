
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

    mainImage.src = photos[currentIndex];
    mainImage.alt = title.textContent + " photo " + (currentIndex + 1);

    counter.textContent =
      (currentIndex + 1) + " / " + photos.length;

    thumbnails.querySelectorAll(".gallery-thumb").forEach((button, i) => {
      button.classList.toggle("active", i === currentIndex);
    });

    prev.style.display = photos.length > 1 ? "" : "none";
    next.style.display = photos.length > 1 ? "" : "none";
  }

  function openGallery(card) {
    photos = card.dataset.gallery
      .split("|")
      .map(photo => photo.trim())
      .filter(Boolean);

    if (!photos.length) return;

    lastFocused = document.activeElement;

    title.textContent = card.dataset.galleryTitle || "Photo Gallery";

    thumbnails.innerHTML = "";

    photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.className = "gallery-thumb";
      button.type = "button";
      button.setAttribute("aria-label", "Show photo " + (index + 1));

      const image = document.createElement("img");
      image.src = photo;
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

    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-gallery]").forEach(card => {
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
