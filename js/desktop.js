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
