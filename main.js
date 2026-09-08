const BUSINESS = {
  email: "info@khgautoworkshops.com.au",
  phone: "0460505070",
  phoneDisplay: "0460 505 070",
  address: "68–70 Fairbank Road, Clayton South VIC 3169"
};

function formatPrice(price) {
  return "$" + Number(price).toLocaleString() + " Drive Away";
}

function getVehicleImages(v) {
  if (Array.isArray(v.images) && v.images.length) {
    return v.images.filter(Boolean);
  }

  if (v.image) {
    return [v.image];
  }

  return [];
}

function vehicleImage(v) {
  const images = getVehicleImages(v);

  if (images.length) {
    return `
      <div class="vehicle-image">
        <img src="${images[0]}" alt="${v.title}">
      </div>
    `;
  }

  return `<div class="vehicle-image">${v.imageLabel || v.title}</div>`;
}

function vehicleGallery(v) {
  const images = getVehicleImages(v);

  if (!images.length) return vehicleImage(v);

  const sliderControls = images.length > 1
    ? `
      <button
        class="gallery-nav gallery-prev"
        type="button"
        aria-label="Previous vehicle image"
      >
        ‹
      </button>

      <button
        class="gallery-nav gallery-next"
        type="button"
        aria-label="Next vehicle image"
      >
        ›
      </button>
    `
    : "";

  const thumbnails = images
    .map(
      (src, index) => `
        <button
          class="gallery-thumb ${index === 0 ? "active" : ""}"
          type="button"
          data-gallery-index="${index}"
          data-gallery-image="${src}"
          aria-label="View image ${index + 1} of ${v.title}"
        >
          <img src="${src}" alt="${v.title} image ${index + 1}">
        </button>
      `
    )
    .join("");

  return `
    <div class="vehicle-gallery" data-gallery-count="${images.length}">
      <div class="gallery-main vehicle-image">
        <img
          src="${images[0]}"
          alt="${v.title}"
          id="mainVehicleImage"
          data-gallery-index="0"
        >
        ${sliderControls}
      </div>

      <aside class="gallery-sidebar" aria-label="Vehicle image gallery">
        ${thumbnails}
      </aside>
    </div>
  `;
}

function getCarsalesUrl(v) {
  return v.carsalesUrl || v.externalListing?.url || "";
}

function vehicleCard(v, options = {}) {
  const showCompare = options.compare === true;
  const carsalesUrl = getCarsalesUrl(v);

  const carsalesButton = carsalesUrl
    ? `<a class="btn carsales-card-btn" href="${carsalesUrl}" target="_blank" rel="noopener">Carsales</a>`
    : "";

  const compareControl = showCompare
    ? `
      <label class="compare-check">
        <input type="checkbox" value="${v.id}" data-compare-check>
        <span>Compare</span>
      </label>
    `
    : "";

  return `
    <article class="vehicle-card" data-vehicle-id="${v.id}">
      <a
        href="vehicle-detail.html?id=${encodeURIComponent(v.id)}"
        aria-label="View details for ${v.title}"
      >
        ${vehicleImage(v)}
      </a>

      <div class="vehicle-info">
        ${compareControl}

        <h3>
          <a href="vehicle-detail.html?id=${encodeURIComponent(v.id)}">
            ${v.title}
          </a>
        </h3>

        <div class="price">${formatPrice(v.price)}</div>

        <div class="meta">
          <span>${v.kms}</span>
          <span>${v.transmission}</span>
          <span>${v.fuel}</span>
          <span>${v.warranty}</span>
        </div>

        <div class="card-actions">
          <a
            class="btn primary"
            href="vehicle-detail.html?id=${encodeURIComponent(v.id)}"
          >
            View Details
          </a>

          ${carsalesButton}

          <a class="btn enquire-card-btn" href="tel:${BUSINESS.phone}">
            Enquire
          </a>
        </div>
      </div>
    </article>
  `;
}

function setupAjaxForms() {
  document.querySelectorAll("form.lead-form").forEach(form => {
    const button = form.querySelector('button[type="submit"]');
    let status = form.querySelector(".form-status");

    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const originalText = button ? button.textContent : "";

      if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
      }

      status.textContent = "Sending your enquiry...";
      status.className = "form-status";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        form.reset();

        status.textContent =
          "Thank you. Your enquiry has been sent to KHG Auto Carsales.";
        status.className = "form-status success";
      } catch (error) {
        status.textContent =
          "Sorry, the enquiry could not be sent. Please call 0440 139 012 or email info@khgautoworkshops.com.au.";
        status.className = "form-status error";
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    });
  });
}

function setupMobileMenu() {
  const button = document.querySelector(".menu-btn");
  const nav = document.querySelector("header nav");

  if (!button || !nav) return;

  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function setupActiveNav() {
  let currentPath = location.pathname
    .replace(/^\/+|\/+$/g, "")
    .replace(".html", "");

  if (!currentPath) {
    currentPath = "index";
  }

  document.querySelectorAll(".topbar nav a").forEach(link => {
    let linkPath = link
      .getAttribute("href")
      .replace(/^\/+|\/+$/g, "")
      .replace(".html", "");

    if (!linkPath) {
      linkPath = "index";
    }

    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
}

function setupMobileVehicleFilters() {
  const toggleButton = document.getElementById("mobileFilterToggle");
  const filtersPanel = document.getElementById("vehicleFiltersPanel");

  if (!toggleButton || !filtersPanel) return;

  toggleButton.addEventListener("click", () => {
    const isOpen = filtersPanel.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });
}

/* =========================================================
   COMPARE VEHICLES FEATURE
   ========================================================= */

let selectedCompareIds = [];

function getCompareVehicles() {
  if (typeof vehicles === "undefined") return [];

  return selectedCompareIds
    .map(id => vehicles.find(vehicle => vehicle.id === id))
    .filter(Boolean);
}

function updateCompareBar() {
  const compareBar = document.getElementById("compareBar");
  const compareCount = document.getElementById("compareCount");
  const openButton = document.getElementById("openCompare");

  if (!compareBar || !compareCount) return;

  const count = selectedCompareIds.length;

  compareBar.hidden = count === 0;

  compareCount.textContent =
    count === 1 ? "1 vehicle selected" : `${count} vehicles selected`;

  if (openButton) {
    openButton.disabled = count < 2;
    openButton.textContent =
      count < 2 ? "Select 2 vehicles" : "Compare Vehicles";
  }

  document.querySelectorAll("[data-compare-check]").forEach(input => {
    input.checked = selectedCompareIds.includes(input.value);
  });
}

function setupCompareCheckboxes() {
  document.querySelectorAll("[data-compare-check]").forEach(input => {
    input.checked = selectedCompareIds.includes(input.value);

    input.addEventListener("change", () => {
      const id = input.value;

      if (input.checked) {
        if (selectedCompareIds.length >= 3) {
          input.checked = false;
          alert("You can compare up to 3 vehicles at a time.");
          return;
        }

        if (!selectedCompareIds.includes(id)) {
          selectedCompareIds.push(id);
        }
      } else {
        selectedCompareIds = selectedCompareIds.filter(item => item !== id);
      }

      updateCompareBar();
    });
  });
}

function openCompareModal() {
  const modal = document.getElementById("compareModal");
  const tableWrap = document.getElementById("compareTableWrap");
  const selectedVehicles = getCompareVehicles();

  if (!modal || !tableWrap) return;

  if (selectedVehicles.length < 2) {
    alert("Please select at least 2 vehicles to compare.");
    return;
  }

  const rows = [
    ["Price", vehicle => formatPrice(vehicle.price)],
    ["Kilometres", vehicle => vehicle.kms],
    ["Fuel", vehicle => vehicle.fuel],
    ["Transmission", vehicle => vehicle.transmission],
    ["Body type", vehicle => vehicle.body],
    ["Warranty", vehicle => vehicle.warranty]
  ];

  tableWrap.innerHTML = `
    <div class="compare-table-scroll">
      <table class="compare-table">
        <thead>
          <tr>
            <th>Details</th>
            ${selectedVehicles
              .map(vehicle => `<th>${vehicle.title}</th>`)
              .join("")}
          </tr>
        </thead>

        <tbody>
          ${rows
            .map(
              ([label, getValue]) => `
                <tr>
                  <td>${label}</td>
                  ${selectedVehicles
                    .map(vehicle => `<td>${getValue(vehicle)}</td>`)
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="compare-modal-actions">
      ${selectedVehicles
        .map(
          vehicle => `
            <a
              class="btn primary"
              href="vehicle-detail.html?id=${encodeURIComponent(vehicle.id)}"
            >
              View ${vehicle.title}
            </a>
          `
        )
        .join("")}
    </div>
  `;

  modal.hidden = false;
  document.body.classList.add("compare-open");
}

function closeCompareModal() {
  const modal = document.getElementById("compareModal");

  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove("compare-open");
}

function setupCompareFeature() {
  const openButton = document.getElementById("openCompare");
  const clearButton = document.getElementById("clearCompare");

  openButton?.addEventListener("click", openCompareModal);

  clearButton?.addEventListener("click", () => {
    selectedCompareIds = [];
    updateCompareBar();
  });

  document.querySelectorAll("[data-close-compare]").forEach(button => {
    button.addEventListener("click", closeCompareModal);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCompareModal();
    }
  });

  updateCompareBar();
}

/* =========================================================
   VEHICLE LISTING PAGE
   ========================================================= */

function setupVehicleLists() {
  if (typeof vehicles === "undefined") return;

  const featured = document.getElementById("featuredVehicles");

  if (featured) {
    featured.innerHTML = vehicles
      .slice(0, 3)
      .map(vehicle => vehicleCard(vehicle, { compare: false }))
      .join("");
  }

  const list = document.getElementById("vehicleList");
  const pagination = document.getElementById("vehiclePagination");
  const count = document.getElementById("vehicleCount");
  const searchInput = document.getElementById("searchInput");
  const priceFilter = document.getElementById("priceFilter");
  const bodyFilter = document.getElementById("bodyFilter");
  const transmissionFilter = document.getElementById("transmissionFilter");
  const fuelFilter = document.getElementById("fuelFilter");
  const sortFilter = document.getElementById("sortFilter");
  const resetFilters = document.getElementById("resetFilters");

  if (!list) return;

  const perPage = 6;

  let currentPage =
    Math.max(1, Number(new URLSearchParams(location.search).get("page"))) || 1;

  const addOptions = (select, values) => {
    if (!select) return;

    [...new Set(values.filter(Boolean))]
      .sort()
      .forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
  };

  addOptions(bodyFilter, vehicles.map(v => v.body));
  addOptions(transmissionFilter, vehicles.map(v => v.transmission));
  addOptions(fuelFilter, vehicles.map(v => v.fuel));

  const getKmNumber = v =>
    Number(String(v.kms).replace(/[^0-9]/g, "")) || 0;

  const getYearNumber = v =>
    Number(String(v.title).match(/\b(19|20)\d{2}\b/)?.[0]) || 0;

  function getFilteredVehicles() {
    const search = (searchInput?.value || "").toLowerCase();
    const maxPrice = priceFilter?.value || "all";
    const body = bodyFilter?.value || "all";
    const transmission = transmissionFilter?.value || "all";
    const fuel = fuelFilter?.value || "all";
    const sort = sortFilter?.value || "featured";

    const filtered = vehicles.filter(v => {
      const text =
        `${v.title} ${v.kms} ${v.transmission} ${v.fuel} ${v.body} ${v.colour} ${v.engine} ${v.stockNo}`.toLowerCase();

      return (
        text.includes(search) &&
        (maxPrice === "all" || v.price <= Number(maxPrice)) &&
        (body === "all" || v.body === body) &&
        (transmission === "all" || v.transmission === transmission) &&
        (fuel === "all" || v.fuel === fuel)
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "year-new") return getYearNumber(b) - getYearNumber(a);
      if (sort === "year-old") return getYearNumber(a) - getYearNumber(b);
      if (sort === "km-low") return getKmNumber(a) - getKmNumber(b);
      return vehicles.indexOf(a) - vehicles.indexOf(b);
    });
  }

  function setPage(page, updateUrl = true) {
    currentPage = page;

    if (updateUrl) {
      const url = new URL(location.href);

      if (currentPage > 1) {
        url.searchParams.set("page", currentPage);
      } else {
        url.searchParams.delete("page");
      }

      history.pushState({}, "", url);
    }

    renderVehicles(false);
    list.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPagination(totalPages) {
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    const buttons = [];

    buttons.push(`
      <button
        type="button"
        ${currentPage === 1 ? "disabled" : ""}
        data-page="${currentPage - 1}"
      >
        Previous
      </button>
    `);

    for (let page = 1; page <= totalPages; page++) {
      buttons.push(`
        <button
          type="button"
          class="${page === currentPage ? "active" : ""}"
          aria-current="${page === currentPage ? "page" : "false"}"
          data-page="${page}"
        >
          ${page}
        </button>
      `);
    }

    buttons.push(`
      <button
        type="button"
        ${currentPage === totalPages ? "disabled" : ""}
        data-page="${currentPage + 1}"
      >
        Next
      </button>
    `);

    pagination.innerHTML = buttons.join("");

    pagination.querySelectorAll("button[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        setPage(Number(button.dataset.page));
      });
    });
  }

  function renderVehicles(resetPage = false) {
    const filtered = getFilteredVehicles();
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

    if (resetPage) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * perPage;
    const shown = filtered.slice(start, start + perPage);

    list.innerHTML =
      shown.map(vehicle => vehicleCard(vehicle, { compare: true })).join("") ||
      "<p>No vehicles found. Please call us for current stock.</p>";

    setupCompareCheckboxes();
    updateCompareBar();

    if (count) {
      if (filtered.length === 0) {
        count.textContent = "No vehicles found";
      } else {
        count.textContent = `Showing ${start + 1}-${start + shown.length} of ${filtered.length} vehicles`;
      }
    }

    renderPagination(totalPages);
  }

  renderVehicles();

  [
    searchInput,
    priceFilter,
    bodyFilter,
    transmissionFilter,
    fuelFilter,
    sortFilter
  ].forEach(control => {
    control?.addEventListener("input", () => renderVehicles(true));
    control?.addEventListener("change", () => renderVehicles(true));
  });

  resetFilters?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";

    [priceFilter, bodyFilter, transmissionFilter, fuelFilter].forEach(control => {
      if (control) control.value = "all";
    });

    if (sortFilter) sortFilter.value = "featured";

    renderVehicles(true);
  });

  window.addEventListener("popstate", () => {
    currentPage =
      Math.max(1, Number(new URLSearchParams(location.search).get("page"))) || 1;

    renderVehicles(false);
  });
}

/* =========================================================
   CAROUSELS
   ========================================================= */

function renderCarousel(trackId, items, template) {
  const track = document.getElementById(trackId);

  if (!track || !items) return;

  track.innerHTML = items.map(template).join("");
}

function setupCarousels() {
  if (typeof services !== "undefined") {
    renderCarousel(
      "servicesTrack",
      services,
      item => `
        <article class="service-card carousel-card">
          <div class="icon">✓</div>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    );
  }

  if (typeof reviews !== "undefined") {
    renderCarousel(
      "reviewsTrack",
      reviews,
      item => `
        <article class="review-card carousel-card">
          <div class="stars">★★★★★</div>
          <h3>${item.title}</h3>
          <p>“${item.text}”</p>
          <strong>${item.name}</strong>
        </article>
      `
    );
  }

  document.querySelectorAll("[data-slider]").forEach(slider => {
    const track = slider.querySelector(".carousel-track");

    if (!track) return;

    const move = dir =>
      track.scrollBy({
        left: dir * Math.min(track.clientWidth, 420),
        behavior: "smooth"
      });

    slider.querySelectorAll("[data-prev]").forEach(btn => {
      btn.addEventListener("click", () => move(-1));
    });

    slider.querySelectorAll("[data-next]").forEach(btn => {
      btn.addEventListener("click", () => move(1));
    });

    const head = slider.previousElementSibling;

    head?.querySelectorAll("[data-prev]").forEach(btn => {
      btn.addEventListener("click", () => move(-1));
    });

    head?.querySelectorAll("[data-next]").forEach(btn => {
      btn.addEventListener("click", () => move(1));
    });
  });
}

/* =========================================================
   VEHICLE DETAIL PAGE
   ========================================================= */

function setupVehicleDetail() {
  const root = document.getElementById("vehicleDetail");

  if (!root || typeof vehicles === "undefined") return;

  const id = new URLSearchParams(location.search).get("id") || vehicles[0].id;
  const v = vehicles.find(item => item.id === id) || vehicles[0];

  document.title = `${v.title} For Sale | KHG Auto Carsales`;

  const subject = encodeURIComponent(`Vehicle enquiry: ${v.title}`);

  const body = encodeURIComponent(
    `Hi KHG Auto Workshops,\n\nI am interested in ${v.title}.\nStock No: ${v.stockNo}\nPrice: ${formatPrice(v.price)}\nKilometres: ${v.kms}\n\nPlease contact me.\n\nName:\nPhone:`
  );

  const carsalesUrl = getCarsalesUrl(v);
  const pageUrl = window.location.href;

  const externalListing = carsalesUrl
    ? `
      <div class="detail-card">
        <span class="eyebrow">
          ${v.externalListing?.label || "Official Carsales Listing"}
        </span>

        <h3>Also listed on Carsales</h3>

        <p>
          ${v.externalListing?.text || "Open the Carsales listing for the live advertisement details."}
        </p>

        <a
          class="btn primary"
          href="${carsalesUrl}"
          target="_blank"
          rel="noopener"
        >
          View Carsales Listing
        </a>
      </div>
    `
    : "";

  const vehicleEnquiryForm = `
    <div class="detail-card vehicle-enquiry-card">
      <span class="eyebrow">Vehicle Enquiry</span>

      <h3>Enquire about this vehicle</h3>

      <p>
        Send your details and our team will contact you about this vehicle.
        Vehicle information is included automatically.
      </p>

      <form
        class="lead-form vehicle-auto-form"
        action="https://formsubmit.co/ajax/${BUSINESS.email}"
        method="POST"
      >
        <input
          type="hidden"
          name="_subject"
          value="Vehicle enquiry from KHG Auto Carsales website"
        />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />

        <input type="hidden" name="Vehicle Title" value="${v.title}" />
        <input type="hidden" name="Stock Number" value="${v.stockNo}" />
        <input type="hidden" name="Vehicle Price" value="${formatPrice(v.price)}" />
        <input type="hidden" name="Page URL" value="${pageUrl}" />

        <div class="form-grid">
          <label>
            Name
            <input
              name="Name"
              type="text"
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Phone
            <input
              name="Phone"
              type="tel"
              placeholder="Your phone number"
              required
            />
          </label>
        </div>

        <label>
          Email
          <input
            name="Email"
            type="email"
            placeholder="Your email address"
          />
        </label>

        <label>
          Message
          <textarea
            name="Message"
            placeholder="Hi, I am interested in this vehicle. Please contact me with more information."
          ></textarea>
        </label>

        <div class="auto-vehicle-summary">
          <strong>${v.title}</strong>
          <span>Stock No: ${v.stockNo}</span>
          <span>${formatPrice(v.price)}</span>
        </div>

        <button class="vehicle-enquiry-submit" type="submit">
          Send Vehicle Enquiry
        </button>
      </form>
    </div>
  `;

  root.innerHTML = `
    <div class="detail-layout">
      <section class="detail-main">
        ${vehicleGallery(v)}

        <div class="detail-card">
          <h2>Vehicle Overview</h2>
          <p>${v.description}</p>

          <h3>Features</h3>
          <div class="feature-tags">
            ${v.features.map(f => `<span>${f}</span>`).join("")}
          </div>
        </div>
      </section>

      <aside class="detail-sidebar">
        <div class="detail-card sticky-card">
          <span class="eyebrow">${v.stockNo}</span>

          <h1>${v.title}</h1>

          <div class="price detail-price">
            ${formatPrice(v.price)}
          </div>

          <div class="spec-list">
            <div><strong>Kilometres</strong><span>${v.kms}</span></div>
            <div><strong>Transmission</strong><span>${v.transmission}</span></div>
            <div><strong>Fuel</strong><span>${v.fuel}</span></div>
            <div><strong>Body</strong><span>${v.body}</span></div>
            <div><strong>Colour</strong><span>${v.colour}</span></div>
            <div><strong>Engine</strong><span>${v.engine}</span></div>
            <div><strong>Rego</strong><span>${v.rego}</span></div>
            <div><strong>VIN</strong><span>${v.vin}</span></div>
          </div>

          <div class="card-actions detail-actions">
            <a
              class="btn primary"
              href="mailto:${BUSINESS.email}?subject=${subject}&body=${body}"
            >
              Enquire Now
            </a>

            <a class="btn gold" href="tel:${BUSINESS.phone}">
              Call ${BUSINESS.phoneDisplay}
            </a>

            <a class="btn finance-detail-btn" href="finance.html">
              Finance Enquiry
            </a>
          </div>
        </div>

        ${externalListing}
      </aside>
    </div>

    <section class="vehicle-enquiry-wide-section">
      ${vehicleEnquiryForm}
    </section>
  `;

  const mainImage = root.querySelector("#mainVehicleImage");
  const galleryButtons = Array.from(root.querySelectorAll(".gallery-thumb"));

  let activeGalleryIndex = 0;

  function showGalleryImage(index) {
    if (!mainImage || !galleryButtons.length) return;

    const totalImages = galleryButtons.length;
    activeGalleryIndex = (index + totalImages) % totalImages;

    const activeButton = galleryButtons[activeGalleryIndex];
    const nextImage = activeButton?.dataset.galleryImage;

    if (!nextImage) return;

    mainImage.src = nextImage;
    mainImage.alt = `${v.title} image ${activeGalleryIndex + 1}`;
    mainImage.dataset.galleryIndex = String(activeGalleryIndex);

    galleryButtons.forEach(item => item.classList.remove("active"));
    activeButton.classList.add("active");

    activeButton.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }

  galleryButtons.forEach((button, index) => {
    button.addEventListener("click", () => showGalleryImage(index));
  });

  root
    .querySelector(".gallery-prev")
    ?.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));

  root
    .querySelector(".gallery-next")
    ?.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));

  setupAjaxForms();
}

function setupPromoPopup() {
  const popup = document.getElementById("promoPopup");

  if (!popup) return;

  const closeButtons = popup.querySelectorAll("[data-promo-close]");
  const isHomePage =
    location.pathname === "/" ||
    location.pathname.endsWith("index.html") ||
    location.pathname === "";

  if (!isHomePage) return;

  setTimeout(() => {
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("promo-popup-open");
  }, 700);

  function closePromoPopup() {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("promo-popup-open");
  }

  closeButtons.forEach(button => {
    button.addEventListener("click", closePromoPopup);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closePromoPopup();
    }
  });
}


setupMobileMenu();
setupActiveNav();
setupVehicleLists();
setupMobileVehicleFilters();
setupCompareFeature();
setupCarousels();
setupVehicleDetail();
setupAjaxForms();
setupPromoPopup();