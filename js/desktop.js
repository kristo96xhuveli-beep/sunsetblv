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

  const mainImage = document.getElementById("galleryMainImage");
  const thumbnails = document.getElementById("galleryThumbnails");
  const counter = document.getElementById("galleryCounter");
  const tabs = document.getElementById("galleryTabs");
  const prev = gallery.querySelector(".gallery-prev");
  const next = gallery.querySelector(".gallery-next");

  const roomCards = [...document.querySelectorAll("#rooms .room-card[data-gallery]")];
  const foodCards = [...document.querySelectorAll("#food .simple-grid article[data-gallery]")];

  let groups = [];
  let currentGroup = 0;
  let currentPhoto = 0;
  let lastFocused = null;
  let touchStartX = 0;

  const doubleBedIcon = `<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M5 25V8M35 25V8M5 20H35M8 20V13Q8 10 11 10H29Q32 10 32 13V20M5 25V28M35 25V28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="10" y="12" width="9" height="5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="21" y="12" width="9" height="5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

  const singleBedIcon = `<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M5 25V8M35 25V8M5 20H35M8 20V13Q8 10 11 10H29Q32 10 32 13V20M5 25V28M35 25V28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="12" width="12" height="5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

  function getGroupIcon(title) {
    if (title.includes("Deluxe")) return doubleBedIcon;

    if (title.includes("Triple")) {
      return `<span class="gallery-bed-icons">${doubleBedIcon}${singleBedIcon}</span>`;
    }

    if (title.includes("Cocktail")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18l-8 9v6h5v2H6v-2h5v-6L3 4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
    }

    if (title.includes("Coffee")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h14v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm14 2h2a2 2 0 0 1 0 4h-2M8 4c-1 1 1 2 0 3m5-3c-1 1 1 2 0 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    }

    if (title.includes("Grills")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v7m3-7v7m-6-4h6M4 11v9m13-16v16m0-16c4 2 4 8 0 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    }

    return doubleBedIcon;
  }

  function renderTabs() {
    tabs.innerHTML = "";

    groups.forEach((group, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-tab";
      button.classList.toggle("active", index === currentGroup);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === currentGroup));

      const label = document.createElement("span");
      label.className = "gallery-tab-label";
      label.textContent = group.shortTitle;

      const icon = document.createElement("span");
      icon.className = "gallery-tab-icon";
      icon.innerHTML = getGroupIcon(group.title);

      button.append(label, icon);
      button.addEventListener("click", () => selectGroup(index));
      tabs.appendChild(button);
    });
  }

  function renderThumbnails() {
    thumbnails.innerHTML = "";

    groups[currentGroup].photos.forEach((src, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-thumb";
      button.classList.toggle("active", index === currentPhoto);
      button.setAttribute("aria-label", "Show photo " + (index + 1));

      const image = document.createElement("img");
      image.src = src;
      image.alt = "";

      button.appendChild(image);
      button.addEventListener("click", () => showPhoto(index));
      thumbnails.appendChild(button);
    });
  }

  function showPhoto(index) {
    const photos = groups[currentGroup].photos;
    if (!photos.length) return;

    currentPhoto = Math.max(0, Math.min(index, photos.length - 1));

    mainImage.src = photos[currentPhoto];
    mainImage.alt = groups[currentGroup].title + " photo " + (currentPhoto + 1);

    counter.textContent = (currentPhoto + 1) + " / " + photos.length;

    thumbnails.querySelectorAll(".gallery-thumb").forEach((button, i) => {
      button.classList.toggle("active", i === currentPhoto);
    });

    prev.style.display = "flex";
    next.style.display = "flex";

    renderTabs();
  }

  function selectGroup(index) {
    if (index < 0 || index >= groups.length) return;

    currentGroup = index;
    currentPhoto = 0;

    renderThumbnails();
    showPhoto(0);
  }

  function movePhoto(direction) {
    const photos = groups[currentGroup].photos;

    if (direction > 0 && currentPhoto < photos.length - 1) {
      showPhoto(currentPhoto + 1);
      return;
    }

    if (direction < 0 && currentPhoto > 0) {
      showPhoto(currentPhoto - 1);
      return;
    }

    const nextGroup = currentGroup + direction;

    if (nextGroup >= 0 && nextGroup < groups.length) {
      selectGroup(nextGroup);
    }
  }

  function openGallery(card) {
    const isFood = Boolean(card.closest("#food"));
    const cards = isFood ? foodCards : roomCards;

    groups = cards.map(item => {
      const groupTitle = item.dataset.galleryTitle || "Photo Gallery";
      const photos = (item.dataset.gallery || "")
        .split("|")
        .map(photo => photo.trim())
        .filter(Boolean);

      return {
        title: groupTitle,
        shortTitle: groupTitle
          .replace(" Room", "")
          .replace("Signature & Classic Cocktails", "COCKTAILS")
          .replace("Grills & Mains", "GRILLS & MAINS")
          .replace("Coffees & Drinks", "COFFEES & DRINKS")
          .toUpperCase(),
        photos
      };
    }).filter(group => group.photos.length);

    if (!groups.length) return;

    lastFocused = document.activeElement;

    const clickedTitle = card.dataset.galleryTitle;
    const selectedIndex = groups.findIndex(group => group.title === clickedTitle);

    currentGroup = selectedIndex >= 0 ? selectedIndex : 0;
    currentPhoto = 0;

    gallery.classList.add("is-open");
    gallery.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");

    renderThumbnails();
    showPhoto(0);

    gallery.querySelector(".gallery-close").focus();
  }

  function closeGallery() {
    gallery.classList.remove("is-open");
    gallery.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");

    mainImage.src = "";
    thumbnails.innerHTML = "";
    tabs.innerHTML = "";
    counter.textContent = "";
    groups = [];

    if (lastFocused) lastFocused.focus();
  }

  [...roomCards, ...foodCards].forEach(card => {
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

  prev.addEventListener("click", () => movePhoto(-1));
  next.addEventListener("click", () => movePhoto(1));

  gallery.querySelectorAll("[data-gallery-close]").forEach(button => {
    button.addEventListener("click", closeGallery);
  });

  document.addEventListener("keydown", event => {
    if (!gallery.classList.contains("is-open")) return;

    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") movePhoto(-1);
    if (event.key === "ArrowRight") movePhoto(1);
  });

  mainImage.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  mainImage.addEventListener("touchend", event => {
    const difference = event.changedTouches[0].screenX - touchStartX;

    if (Math.abs(difference) > 50) {
      movePhoto(difference < 0 ? 1 : -1);
    }
  }, { passive: true });

})();


  })();
