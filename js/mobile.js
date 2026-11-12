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
  const button = document.getElementById('musicToggle');
  const icon = document.getElementById('playPauseIcon');
  const nextButton = document.getElementById('musicNext');
  const volumeToggle = document.getElementById('volumeToggle');
  const volumePanel = document.getElementById('volumePanel');
  const volumeSlider = document.getElementById('volumeSlider');

  let playlist = [];
  let previous = -1;
  let playlistReady = false;

  audio.volume = 0.7;

  function updatePlayIcon(playing) {
    if (playing) {
      icon.innerHTML = '<path d="M7 5h4v14H7z M15 5h4v14h-4z"/>';
      button.setAttribute('aria-label', 'Pause radio');
    } else {
      icon.innerHTML = '<path d="M8 5v14l11-7Z"/>';
      button.setAttribute('aria-label', 'Play radio');
    }
  }

  fetch('audio.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('audio.json not found');
      }
      return response.json();
    })
    .then(data => {
      const hour = new Date().getHours();

      playlist = hour >= 6 && hour < 12
        ? data.morning || []
        : hour >= 12 && hour < 20
          ? data.day || []
          : data.night || [];

      playlistReady = playlist.length > 0;

      if (!playlistReady) {
        button.title = 'No songs available in this playlist';
      }
    })
    .catch(() => {
      button.title = 'Unable to load hotel radio';
    });

  async function playNextTrack() {
    if (!playlistReady) return;

    let index = Math.floor(Math.random() * playlist.length);

    if (playlist.length > 1 && index === previous) {
      index = (index + 1) % playlist.length;
    }

    previous = index;
    audio.src = playlist[index];
    audio.load();

    try {
      await audio.play();
    } catch (error) {
      updatePlayIcon(false);
    }
  }

  button.addEventListener('click', async () => {
    if (audio.paused) {
      if (!audio.src) {
        await playNextTrack();
      } else {
        try {
          await audio.play();
        } catch (error) {
          updatePlayIcon(false);
        }
      }
    } else {
      audio.pause();
    }
  });

  nextButton.addEventListener('click', playNextTrack);

  audio.addEventListener('play', () => updatePlayIcon(true));
  audio.addEventListener('pause', () => updatePlayIcon(false));
  audio.addEventListener('ended', playNextTrack);

  volumeToggle.addEventListener('click', () => {
    const isOpen = !volumePanel.hidden;

    volumePanel.hidden = isOpen;
    volumeToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = Number(volumeSlider.value);
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('#musicControls')) {
      volumePanel.hidden = true;
      volumeToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
  
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
