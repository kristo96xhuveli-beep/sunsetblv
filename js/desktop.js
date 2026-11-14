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

  const dialog = gallery.querySelector(".photo-gallery-dialog");
  const tabsContainer = document.getElementById("galleryTabs");
  const mainImage = document.getElementById("galleryMainImage");
  const thumbnails = document.getElementById("galleryThumbnails");
  const counter = document.getElementById("galleryCounter");

  const closeButton = gallery.querySelector(".gallery-close");
  const previousButton = gallery.querySelector(".gallery-prev");
  const nextButton = gallery.querySelector(".gallery-next");

  if (!dialog || !tabsContainer || !mainImage || !thumbnails) return;

  let currentGroups = [];
  let activeGroupIndex = 0;
  let activePhotoIndex = 0;
  let touchStartX = 0;

  const getCardTitle = (card) => {
    return (
      card.dataset.galleryTitle ||
      card.querySelector("h3")?.textContent.trim() ||
      "Photo Gallery"
    );
  };

  const getShortTitle = (title) => {
    const shortTitles = {
      "Deluxe Double Room": "DELUXE DOUBLE",
      "Standard Triple Room": "STANDARD TRIPLE",
      "Simple Triple Room": "SIMPLE TRIPLE",
      "Grills & Mains": "GRILLS & MAINS",
      "Signature & Classic Cocktails": "COCKTAILS",
      "Coffees & Drinks": "COFFEES & DRINKS",
      "Beach & Swimming": "BEACH",
      "Boat Trips & Canoeing": "BOAT TRIPS",
      "Village Hiking": "HIKING"
    };

    return shortTitles[title] || title.toUpperCase();
  };

  const getPhotos = (card) => {
    const rawPhotos = card.dataset.gallery || "";

    return rawPhotos
      .split(",")
      .map(photo => photo.trim())
      .filter(Boolean);
  };

  const getSectionCards = (card) => {
    const section = card.closest("section") || card.closest("#rooms, #food, #food-drinks, #activities");

    if (!section) return [card];

    return Array.from(section.querySelectorAll("[data-gallery]"))
      .filter(item => getPhotos(item).length > 0);
  };

  const buildGroups = (cards) => {
    return cards.map(card => ({
      element: card,
      title: getCardTitle(card),
      shortTitle: getShortTitle(getCardTitle(card)),
      photos: getPhotos(card)
    })).filter(group => group.photos.length > 0);
  };

  const renderTabs = () => {
    tabsContainer.innerHTML = "";

    currentGroups.forEach((group, index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "gallery-tab";
      tab.textContent = group.shortTitle;
      tab.setAttribute("aria-label", `View ${group.title} photos`);
      tab.setAttribute("aria-selected", index === activeGroupIndex ? "true" : "false");

      if (index === activeGroupIndex) {
        tab.classList.add("active");
      }

      tab.addEventListener("click", () => {
        selectGroup(index);
      });

      tabsContainer.appendChild(tab);
    });
  };

  const renderThumbnails = () => {
    thumbnails.innerHTML = "";

    const photos = currentGroups[activeGroupIndex].photos;

    photos.forEach((photo, index) => {
      const thumbnail = document.createElement("button");
      thumbnail.type = "button";
      thumbnail.className = "gallery-thumbnail";
      thumbnail.setAttribute("aria-label", `View photo ${index + 1}`);

      if (index === activePhotoIndex) {
        thumbnail.classList.add("active");
      }

      const image = document.createElement("img");
      image.src = photo;
      image.alt = "";
      image.loading = "lazy";

      thumbnail.appendChild(image);

      thumbnail.addEventListener("click", () => {
        showPhoto(index);
      });

      thumbnails.appendChild(thumbnail);
    });
  };

  const showPhoto = (index) => {
    const group = currentGroups[activeGroupIndex];
    if (!group || !group.photos.length) return;

    activePhotoIndex = (index + group.photos.length) % group.photos.length;

    mainImage.src = group.photos[activePhotoIndex];
    mainImage.alt = `${group.title} - Photo ${activePhotoIndex + 1}`;

    if (counter) {
      counter.textContent = `${activePhotoIndex + 1} / ${group.photos.length}`;
    }

    thumbnails.querySelectorAll(".gallery-thumbnail").forEach((thumbnail, i) => {
      thumbnail.classList.toggle("active", i === activePhotoIndex);
    });

    const activeThumbnail = thumbnails.querySelector(".gallery-thumbnail.active");
    activeThumbnail?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
  };

  const selectGroup = (index) => {
    if (!currentGroups[index]) return;

    activeGroupIndex = index;
    activePhotoIndex = 0;

    renderTabs();
    renderThumbnails();
    showPhoto(0);
  };

  const movePhoto = (direction) => {
    showPhoto(activePhotoIndex + direction);
  };

  const openGallery = (card) => {
    const cards = getSectionCards(card);
    currentGroups = buildGroups(cards);

    if (!currentGroups.length) return;

    const clickedIndex = currentGroups.findIndex(
      group => group.element === card
    );

    activeGroupIndex = clickedIndex >= 0 ? clickedIndex : 0;
    activePhotoIndex = 0;

    renderTabs();
    renderThumbnails();
    showPhoto(0);

    gallery.classList.add("is-open");
    gallery.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");

    closeButton?.focus();
  };

  const closeGallery = () => {
    gallery.classList.remove("is-open");
    gallery.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");
  };

  const galleryCards = document.querySelectorAll(
    "#rooms [data-gallery], #food [data-gallery], #food-drinks [data-gallery], #activities [data-gallery], section [data-gallery]"
  );

  galleryCards.forEach(card => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      openGallery(card);
    });

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${getCardTitle(card)} photo gallery`);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGallery(card);
      }
    });
  });

  closeButton?.addEventListener("click", closeGallery);

  previousButton?.addEventListener("click", () => {
    movePhoto(-1);
  });

  nextButton?.addEventListener("click", () => {
    movePhoto(1);
  });

  gallery.addEventListener("click", (event) => {
    if (event.target === gallery) {
      closeGallery();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!gallery.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeGallery();
    } else if (event.key === "ArrowLeft") {
      movePhoto(-1);
    } else if (event.key === "ArrowRight") {
      movePhoto(1);
    }
  });

  const stage = gallery.querySelector(".gallery-stage");

  stage?.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  stage?.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) < 45) return;

    movePhoto(difference > 0 ? 1 : -1);
  }, { passive: true });

})();



  })();
