 
(() => {
  const body = document.body;

  /* MOBILE MENU */
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

  /* QEPARO LOCAL TIME & WEATHER */
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
      if ([51, 53, 55].includes(code)) return { text: 'Drizzle', icon: 'rain' };
      if ([56, 57].includes(code)) return { text: 'Freezing drizzle', icon: 'rain' };
      if ([61, 63, 65].includes(code)) return { text: 'Rain', icon: 'rain' };
      if ([66, 67].includes(code)) return { text: 'Freezing rain', icon: 'rain' };
      if ([71, 73, 75, 77].includes(code)) return { text: 'Snow', icon: 'snow' };
      if ([80, 81, 82].includes(code)) return { text: 'Rain showers', icon: 'rain' };
      if ([85, 86].includes(code)) return { text: 'Snow showers', icon: 'snow' };
      if (code === 95) return { text: 'Thunderstorm', icon: 'storm' };
      if ([96, 99].includes(code)) return { text: 'Thunderstorm with hail', icon: 'storm' };

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

  /* DARK MODE */
  const dark = document.getElementById('darkMode');

  if (dark) {
    dark.addEventListener('click', () => {
      body.classList.toggle('dark');
    });
  }

  /* HOTEL RADIO */
  const audio = document.getElementById('radioPlayer');
  const button = document.getElementById('musicToggle');

  if (audio && button) {
    let playlist = [];
    let started = false;
    let muted = false;
    let previous = -1;

    fetch('audio.json')
      .then(r => {
        if (!r.ok) throw new Error('audio.json not found');
        return r.json();
      })
      .then(data => {
        const h = new Date().getHours();

        playlist =
          h >= 6 && h < 12 ? data.morning || [] :
          h >= 12 && h < 20 ? data.day || [] :
          data.night || [];
      })
      .catch(() => {
        button.title = 'Add audio.json to enable the hotel radio';
      });

    function nextTrack() {
      if (!playlist.length) return;

      let i = Math.floor(Math.random() * playlist.length);

      if (playlist.length > 1 && i === previous) {
        i = (i + 1) % playlist.length;
      }

      previous = i;
      audio.src = playlist[i];
      audio.play().catch(() => {});
    }

    audio.addEventListener('ended', nextTrack);

    button.addEventListener('click', async () => {
      if (!started) {
        if (!audio.src) nextTrack();

        try {
          await audio.play();
          started = true;
          muted = false;
          button.textContent = '🔇 Mute';
        } catch {
          button.textContent = 'Tap to play';
        }
      } else {
        muted = !muted;
        audio.muted = muted;
        button.textContent = muted ? '🔊 Unmute' : '🔇 Mute';
      }
    });
  }

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

    const getCardTitle = card => {
      return (
        card.dataset.galleryTitle ||
        card.querySelector("h3")?.textContent.trim() ||
        "Photo Gallery"
      );
    };

    const getShortTitle = title => {
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

    const getPhotos = card => {
      return (card.dataset.gallery || "")
        .split(",")
        .map(photo => photo.trim())
        .filter(Boolean);
    };

    const getSectionCards = card => {
      const section = card.closest("section");

      if (!section) return [card];

      return Array.from(section.querySelectorAll("[data-gallery]"))
        .filter(item => getPhotos(item).length > 0);
    };

    const buildGroups = cards => {
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
        tab.setAttribute(
          "aria-selected",
          index === activeGroupIndex ? "true" : "false"
        );

        if (index === activeGroupIndex) {
          tab.classList.add("active");
        }

        tab.addEventListener("click", () => selectGroup(index));

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

        thumbnail.addEventListener("click", () => showPhoto(index));

        thumbnails.appendChild(thumbnail);
      });
    };

    const showPhoto = index => {
      const group = currentGroups[activeGroupIndex];

      if (!group || !group.photos.length) return;

      activePhotoIndex =
        (index + group.photos.length) % group.photos.length;

      mainImage.src = group.photos[activePhotoIndex];
      mainImage.alt = `${group.title} - Photo ${activePhotoIndex + 1}`;

      if (counter) {
        counter.textContent =
          `${activePhotoIndex + 1} / ${group.photos.length}`;
      }

      thumbnails.querySelectorAll(".gallery-thumbnail").forEach((thumbnail, i) => {
        thumbnail.classList.toggle("active", i === activePhotoIndex);
      });

      const activeThumbnail =
        thumbnails.querySelector(".gallery-thumbnail.active");

      activeThumbnail?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    };

    const selectGroup = index => {
      if (!currentGroups[index]) return;

      activeGroupIndex = index;
      activePhotoIndex = 0;

      renderTabs();
      renderThumbnails();
      showPhoto(0);
    };

    const movePhoto = direction => {
      showPhoto(activePhotoIndex + direction);
    };

    const openGallery = card => {
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
      body.classList.add("gallery-open");

      closeButton?.focus();
    };

    const closeGallery = () => {
      gallery.classList.remove("is-open");
      gallery.setAttribute("aria-hidden", "true");
      body.classList.remove("gallery-open");
    };

    const galleryCards = document.querySelectorAll(
      "#rooms [data-gallery], #food [data-gallery], #food-drinks [data-gallery], #activities [data-gallery], section [data-gallery]"
    );

    galleryCards.forEach(card => {
      card.addEventListener("click", event => {
        if (event.target.closest("a, button")) return;
        openGallery(card);
      });

      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute(
        "aria-label",
        `Open ${getCardTitle(card)} photo gallery`
      );

      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openGallery(card);
        }
      });
    });

    closeButton?.addEventListener("click", closeGallery);

    previousButton?.addEventListener("click", () => movePhoto(-1));
    nextButton?.addEventListener("click", () => movePhoto(1));

    gallery.addEventListener("click", event => {
      if (event.target === gallery) closeGallery();
    });

    document.addEventListener("keydown", event => {
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

    stage?.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    stage?.addEventListener("touchend", event => {
      const touchEndX = event.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;

      if (Math.abs(difference) < 45) return;

      movePhoto(difference > 0 ? 1 : -1);
    }, { passive: true });

  })();

})();
