const TiendaPage = (() => {
  const state = {
    activeFilter: "all",
    search: "",
    sort: "featured",
    quickProductId: null,
    sliderIntervals: new Map(),
    selectedSizes: {}
  };

  const refs = {};

  function init() {
    if (!document.getElementById("productGrid")) return;

    cacheRefs();
    setupInitialFilterFromURL();
    UI.init();
    wireEvents();
    renderProducts();
    renderCart();
    UI.updateCartCounter();
    syncBagCount();
  }

  function cacheRefs() {
    refs.filterChips = document.getElementById("filterChips");
    refs.productGrid = document.getElementById("productGrid");
    refs.bagCount = document.getElementById("bagCount");
    refs.cartToggle = document.getElementById("cartToggle");
    refs.cartDrawer = document.getElementById("cartDrawer");
    refs.drawerOverlay = document.getElementById("drawerOverlay");
    refs.cartClose = document.getElementById("cartClose");
    refs.cartBody = document.getElementById("cartBody");
    refs.subtotalValue = document.getElementById("subtotalValue");
    refs.totalValue = document.getElementById("totalValue");
    refs.clearCartBtn = document.getElementById("clearCartBtn");
    refs.checkoutBtn = document.getElementById("checkoutBtn");
    refs.quickView = document.getElementById("quickView");
    refs.quickOverlay = document.getElementById("quickOverlay");
    refs.quickClose = document.getElementById("quickClose");
    refs.quickBody = document.getElementById("quickBody");
    refs.searchInput = document.getElementById("searchInput");
    refs.sortSelect = document.getElementById("sortSelect");
    refs.newsletterForm = document.getElementById("newsletterForm");
    refs.newsletterEmail = document.getElementById("newsletterEmail");
    refs.newsletterFeedback = document.getElementById("newsletterFeedback");
    refs.mobileToggle = document.getElementById("mobileToggle");
    refs.mobileNav = document.getElementById("mobileNav");
    refs.mobileOverlay = document.getElementById("mobileOverlay");
    refs.mobileClose = document.getElementById("mobileClose");
    refs.mobileCartBtn = document.getElementById("mobileCartBtn");
    refs.mobileWishlistBtn = document.getElementById("mobileWishlistBtn");
    refs.wishlistToggle = document.getElementById("wishlistToggle");
  }

  function setupInitialFilterFromURL() {
    const filter = Utils.getQueryParam("filter");
    if (filter && StoreData.FILTERS.some((f) => f.id === filter)) {
      state.activeFilter = filter;
    }
  }

  function wireEvents() {
    document.addEventListener("click", handleDelegatedClicks);

    refs.searchInput?.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderProducts();
    });

    refs.sortSelect?.addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderProducts();
    });

    refs.cartToggle?.addEventListener("click", (e) => {
      e.preventDefault();
      toggleCart();
    });

    refs.cartClose?.addEventListener("click", closeCart);
    refs.drawerOverlay?.addEventListener("click", closeCart);

    refs.quickClose?.addEventListener("click", closeQuickView);
    refs.quickOverlay?.addEventListener("click", closeQuickView);

    refs.clearCartBtn?.addEventListener("click", () => {
      Cart.clear();
      renderCart();
      syncBagCount();
      UI.updateCartCounter();
      UI.showToast("Carrito vaciado.");
    });

    refs.checkoutBtn?.addEventListener("click", handleCheckout);
    refs.newsletterForm?.addEventListener("submit", handleNewsletterSubmit);

    refs.mobileCartBtn?.addEventListener("click", () => {
      UI.closeMobileNav();
      openCart();
    });

    refs.mobileWishlistBtn?.addEventListener("click", () => {
      UI.closeMobileNav();
      applyWishlistView();
      scrollToCatalog();
    });

    refs.wishlistToggle?.addEventListener("click", () => {
      applyWishlistView();
      scrollToCatalog();
    });

    window.addEventListener("cart:updated", () => {
      renderCart();
      syncBagCount();
      UI.updateCartCounter();
    });

    window.addEventListener("wishlist:updated", () => {
      renderProducts();
      if (isQuickViewOpen()) {
        renderQuickView();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeCart();
        closeQuickView();
      }
    });
  }

  function handleDelegatedClicks(event) {
    const actionTrigger = event.target.closest("[data-action]");
    if (actionTrigger) {
      const { action, id, key, size } = actionTrigger.dataset;

      if (action === "add-to-cart") addToCart(id, 1, size || null);
      if (action === "toggle-wishlist") toggleWishlist(id);
      if (action === "quick-view") openQuickView(id);
      if (action === "qty-minus") changeQty(key, -1);
      if (action === "qty-plus") changeQty(key, 1);
      if (action === "remove-cart") removeFromCart(key);
      if (action === "select-size") selectSize(id, size);
    }

    const filterBtn = event.target.closest("[data-filter]");
    if (filterBtn) {
      setFilter(filterBtn.dataset.filter);
    }

    const filterLink = event.target.closest("[data-filter-link]");
    if (filterLink) {
      event.preventDefault();
      setFilter(filterLink.dataset.filterLink);
      UI.closeMegaMenus();
      UI.closeMobileNav();
      scrollToCatalog();
    }

    const mobileFilter = event.target.closest("[data-mobile-filter]");
    if (mobileFilter) {
      event.preventDefault();
      setFilter(mobileFilter.dataset.mobileFilter);
      UI.closeMobileNav();
      scrollToCatalog();
    }

    const sliderDot = event.target.closest("[data-slider-dot]");
    if (sliderDot) {
      const sliderId = sliderDot.dataset.sliderId;
      const index = Number(sliderDot.dataset.sliderDot);
      goToSlide(sliderId, index, true);
    }

    const quickSliderDot = event.target.closest("[data-quick-slider-dot]");
    if (quickSliderDot) {
      const sliderId = quickSliderDot.dataset.quickSliderId;
      const index = Number(quickSliderDot.dataset.quickSliderDot);
      goToSlide(sliderId, index, true);
    }
  }

  function scrollToCatalog() {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function labelGender(value) {
    return value === "women" ? "Mujer" : "Hombre";
  }

  function labelCategory(value) {
    const map = {
      vestidos: "Vestidos",
      sets: "Sets",
      enterizos: "Enterizos",
      camisas: "Camisas",
      pantalones: "Pantalones",
      shorts: "Shorts",
      women: "Mujer",
      men: "Hombre",
      nuevo: "Nuevo",
      destacado: "Destacado"
    };
    return map[value] || value;
  }

  function getProduct(id) {
    return StoreData.getProductById(id);
  }

  function getBagCount() {
    return Cart.getTotalItems();
  }

  function getSubtotal() {
    return Cart.getSubtotal();
  }

  function getProductActiveSizes(product) {
    if (!product) return [];

    if (Array.isArray(product.sizesActive) && product.sizesActive.length) {
      return product.sizesActive;
    }

    if (Array.isArray(product.sizes) && product.sizes.length) {
      return product.sizes
        .map((size) => {
          if (typeof size === "string") return size;
          if (size && size.active) return size.label;
          return null;
        })
        .filter(Boolean);
    }

    return [];
  }

  function getSelectedSize(productId) {
    return state.selectedSizes[productId] || "";
  }

  function setSelectedSize(productId, size) {
    state.selectedSizes[productId] = size;
  }

  function clearSelectedSize(productId) {
    delete state.selectedSizes[productId];
  }

  function selectSize(productId, size) {
    setSelectedSize(productId, size);

    if (isQuickViewOpen() && state.quickProductId === productId) {
      renderQuickView();
    }
  }

  function buildFilterChips() {
    refs.filterChips.innerHTML = StoreData.FILTERS.map((filter) => `
      <button class="chip ${state.activeFilter === filter.id ? "active" : ""}" type="button" data-filter="${filter.id}">
        ${filter.label}
      </button>
    `).join("");
  }

  function matchesFilter(product) {
    if (state.activeFilter === "all") return true;
    if (product.gender === state.activeFilter) return true;
    if (product.category === state.activeFilter) return true;
    if (product.collection === state.activeFilter) return true;
    return false;
  }

  function matchesSearch(product) {
    if (!state.search) return true;
    const q = state.search.toLowerCase().trim();
    return [
      product.name,
      product.description,
      product.category,
      product.gender,
      product.collection
    ].join(" ").toLowerCase().includes(q);
  }

  function sortProducts(list) {
    const arr = [...list];

    switch (state.sort) {
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "name-asc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return arr.sort((a, b) => {
          if (a.collection === "nuevo" && b.collection !== "nuevo") return -1;
          if (a.collection !== "nuevo" && b.collection === "nuevo") return 1;
          return 0;
        });
    }
  }

  function getVisibleProducts() {
    return sortProducts(StoreData.getAllProducts().filter((p) => matchesFilter(p) && matchesSearch(p)));
  }

  function clearAllSliderIntervals() {
    state.sliderIntervals.forEach((intervalId) => clearInterval(intervalId));
    state.sliderIntervals.clear();
  }

  function createSliderMarkup(images, alt, sliderId, dotAttr, sliderAttr) {
    const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];

    if (!safeImages.length) {
      return "";
    }

    return `
      ${safeImages.map((image, index) => `
        <img
          src="${image}"
          alt="${Utils.escapeHTML(index === 0 ? alt : `${alt} ${index + 1}`)}"
          class="slider-img ${index === 0 ? "active" : ""}"
          data-slide-index="${index}"
          loading="lazy"
          onerror="this.remove()"
        >
      `).join("")}

      ${safeImages.length > 1 ? `
        <div class="slider-dots">
          ${safeImages.map((_, index) => `
            <button
              class="dot ${index === 0 ? "active" : ""}"
              type="button"
              ${dotAttr}="${index}"
              ${sliderAttr}="${sliderId}"
              aria-label="Ver imagen ${index + 1}"
            ></button>
          `).join("")}
        </div>
      ` : ""}
    `;
  }

  function renderProducts() {
    clearAllSliderIntervals();
    buildFilterChips();

    const items = getVisibleProducts();

    if (!items.length) {
      refs.productGrid.innerHTML = `
        <article class="product-card" style="grid-column:1/-1;padding:28px;border-radius:24px;">
          <div class="product-info" style="padding:10px 6px;">
            <p class="product-meta">Sin resultados</p>
            <h3 class="product-name" style="font-size:34px;">No encontramos productos para esa búsqueda.</h3>
            <p class="product-desc" style="min-height:auto;max-width:420px;">Prueba con otro nombre, cambia el filtro o limpia la búsqueda para volver a ver todo el catálogo.</p>
            <div class="product-footer" style="margin-top:12px;">
              <button class="btn btn-soft" type="button" id="resetFiltersBtn">Restablecer</button>
            </div>
          </div>
        </article>
      `;

      document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
        state.activeFilter = "all";
        state.search = "";
        refs.searchInput.value = "";
        renderProducts();
      });

      return;
    }

    refs.productGrid.innerHTML = items.map((product, index) => {
      const wished = Wishlist.has(product.id);
      const isSoldOut = product.soldOut === true;
      const visual = StoreData.resolveProductVisual(product);
      const sliderId = `card-${product.id}`;
      const activeSizes = getProductActiveSizes(product);
      const hasMultipleSizes = activeSizes.length > 1;
      const addLabel = hasMultipleSizes ? "Elegir talla" : "Agregar al carrito";

      return `
        <article class="product-card reveal ${index % 3 === 1 ? "d1" : index % 3 === 2 ? "d2" : ""}">
          <div class="product-media" data-slider-root="${sliderId}">
            <div class="product-media-bg" style="background:${visual.gradient};"></div>
            ${createSliderMarkup(visual.images, visual.alt, sliderId, "data-slider-dot", "data-slider-id")}
            ${product.badge ? `<span class="product-tag">${product.badge}</span>` : ""}

            <div class="product-actions-top">
              <button class="icon-circle ${wished ? "active" : ""}" type="button" aria-label="Guardar en favoritos" data-action="toggle-wishlist" data-id="${product.id}">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 13.2S2 9.7 2 5.6a3 3 0 016 0 3 3 0 016 0C14 9.7 8 13.2 8 13.2z" stroke="currentColor" stroke-width="1.2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="product-info">
            <p class="product-meta">${labelGender(product.gender)} — ${labelCategory(product.category)}</p>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.description}</p>

            <div class="price-row">
              <div>
                <span class="product-price">${Utils.formatCOP(product.price)}</span>
                ${product.oldPrice ? `<span class="product-old-price">${Utils.formatCOP(product.oldPrice)}</span>` : ""}
              </div>
            </div>

            <div class="product-footer">
              <button class="btn btn-add" type="button" data-action="${hasMultipleSizes ? "quick-view" : "add-to-cart"}" data-id="${product.id}">
                ${addLabel}
              </button>
              <button class="btn btn-view" type="button" data-action="quick-view" data-id="${product.id}" aria-label="Ver detalle rápido">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5c-5.2 0-9.27 4.11-10 7 .73 2.89 4.8 7 10 7s9.27-4.11 10-7c-.73-2.89-4.8-7-10-7Z" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.4"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    initSliders();
    UI.initReveal();
  }

  function initSliders() {
    document.querySelectorAll("[data-slider-root]").forEach((sliderRoot) => {
      const sliderId = sliderRoot.dataset.sliderRoot;
      const slides = Array.from(sliderRoot.querySelectorAll(".slider-img"));

      if (slides.length <= 1) return;

      sliderRoot.dataset.currentIndex = "0";

      const intervalId = setInterval(() => {
        const current = Number(sliderRoot.dataset.currentIndex || 0);
        const next = (current + 1) % slides.length;
        updateSlider(sliderRoot, next);
      }, 5000);

      state.sliderIntervals.set(sliderId, intervalId);

      sliderRoot.addEventListener("mouseenter", () => {
        const currentInterval = state.sliderIntervals.get(sliderId);
        if (currentInterval) {
          clearInterval(currentInterval);
          state.sliderIntervals.delete(sliderId);
        }
      });

      sliderRoot.addEventListener("mouseleave", () => {
        const oldInterval = state.sliderIntervals.get(sliderId);
        if (oldInterval) clearInterval(oldInterval);

        const newIntervalId = setInterval(() => {
          const current = Number(sliderRoot.dataset.currentIndex || 0);
          const next = (current + 1) % slides.length;
          updateSlider(sliderRoot, next);
        }, 5000);

        state.sliderIntervals.set(sliderId, newIntervalId);
      });
    });
  }

  function updateSlider(sliderRoot, nextIndex) {
    const slides = Array.from(sliderRoot.querySelectorAll(".slider-img"));
    const dots = Array.from(sliderRoot.querySelectorAll(".dot"));

    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === nextIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === nextIndex);
    });

    sliderRoot.dataset.currentIndex = String(nextIndex);
  }

  function goToSlide(sliderId, index, restartInterval = false) {
    const sliderRoot = document.querySelector(`[data-slider-root="${sliderId}"], [data-quick-slider-root="${sliderId}"]`);
    if (!sliderRoot) return;

    updateSlider(sliderRoot, index);

    if (!restartInterval) return;

    const slides = Array.from(sliderRoot.querySelectorAll(".slider-img"));
    if (slides.length <= 1) return;

    const currentInterval = state.sliderIntervals.get(sliderId);
    if (currentInterval) clearInterval(currentInterval);

    const intervalId = setInterval(() => {
      const current = Number(sliderRoot.dataset.currentIndex || 0);
      const next = (current + 1) % slides.length;
      updateSlider(sliderRoot, next);
    }, 5000);

    state.sliderIntervals.set(sliderId, intervalId);
  }

  function addToCart(id, qty = 1, sizeOverride = null) {
    const product = getProduct(id);
    if (!product) return false;

    const activeSizes = getProductActiveSizes(product);
    let selectedSize = sizeOverride || getSelectedSize(id) || "";

    if (activeSizes.length === 1 && !selectedSize) {
      selectedSize = activeSizes[0];
    }

    if (activeSizes.length > 1 && !selectedSize) {
      openQuickView(id);
      UI.showToast("Selecciona una talla para continuar.");
      return false;
    }

    const ok = Cart.add(id, qty, { size: selectedSize });

    if (ok) {
      renderCart();
      syncBagCount();
      UI.updateCartCounter();
      UI.showToast(
        selectedSize
          ? `Producto agregado al carrito — Talla ${selectedSize}.`
          : "Producto agregado al carrito."
      );
    }

    return ok;
  }

  function changeQty(key, delta) {
    if (delta > 0) {
      Cart.increase(key, delta);
    } else {
      Cart.decrease(key, Math.abs(delta));
    }

    renderCart();
    syncBagCount();
    UI.updateCartCounter();
  }

  function removeFromCart(key) {
    Cart.remove(key);
    renderCart();
    syncBagCount();
    UI.updateCartCounter();
    UI.showToast("Producto eliminado del carrito.");
  }

  function syncBagCount() {
    if (refs.bagCount) {
      refs.bagCount.textContent = getBagCount();
    }
  }

  function renderCart() {
    const summary = Cart.getSummary();

    if (!summary.items.length) {
      refs.cartBody.innerHTML = `
        <div class="cart-empty">
          <p class="eyebrow">Aún vacío</p>
          <h3 class="product-name" style="font-size:34px;">Tu selección todavía no empieza.</h3>
          <p class="product-desc" style="min-height:auto;max-width:320px;">Explora el catálogo, agrega productos y finaliza la compra por WhatsApp con un resumen listo.</p>
          <a class="btn btn-soft" href="#catalogo" id="emptyGoCatalogBtn">Ir al catálogo</a>
        </div>
      `;

      document.getElementById("emptyGoCatalogBtn")?.addEventListener("click", () => {
        closeCart();
      });
    } else {
      refs.cartBody.innerHTML = summary.items.map((item) => {
        const product = item.product;
        const visual = StoreData.resolveProductVisual(product);
        const sizeText = item.size ? `Talla ${item.size}` : null;

        return `
          <article class="cart-item">
            <div class="cart-item-media">
              <div class="cart-item-bg" style="background:${visual.gradient};"></div>
            </div>
            <div>
              <h3 class="cart-item-name">${product.name}</h3>
              <p class="cart-item-meta">
                ${labelGender(product.gender)} — ${labelCategory(product.category)}
                ${sizeText ? ` — ${sizeText}` : ""}
              </p>
              <p class="cart-item-desc">${product.description}</p>

              <div class="cart-item-bottom">
                <div class="qty-control">
                  <button class="qty-btn" type="button" aria-label="Restar cantidad" data-action="qty-minus" data-key="${item.variantKey}">−</button>
                  <span class="qty-value">${item.qty}</span>
                  <button class="qty-btn" type="button" aria-label="Sumar cantidad" data-action="qty-plus" data-key="${item.variantKey}">+</button>
                </div>

                <div style="text-align:right;min-width:120px;">
                  <div style="font-size:14px;font-weight:500;margin-bottom:6px;">${Utils.formatCOP(item.lineTotal)}</div>
                  <button class="cart-remove" type="button" data-action="remove-cart" data-key="${item.variantKey}">Eliminar</button>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }

    const subtotal = getSubtotal();
    refs.subtotalValue.textContent = Utils.formatCOP(subtotal);
    refs.totalValue.textContent = Utils.formatCOP(subtotal);
  }

  function isCartOpen() {
    return refs.cartDrawer?.classList.contains("show");
  }

  function isQuickViewOpen() {
    return refs.quickView?.classList.contains("show");
  }

  function toggleCart() {
    if (isCartOpen()) {
      closeCart();
    } else {
      openCart();
    }
  }

  function openCart() {
    closeQuickView();
    UI.closeMobileNav();

    refs.cartDrawer.classList.add("show");
    refs.drawerOverlay.classList.add("show");
    refs.cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeCart() {
    refs.cartDrawer.classList.remove("show");
    refs.drawerOverlay.classList.remove("show");
    refs.cartDrawer.setAttribute("aria-hidden", "true");

    if (!isQuickViewOpen() && !refs.mobileNav?.classList.contains("show")) {
      document.body.classList.remove("no-scroll");
    }
  }

  function openQuickView(id) {
    closeCart();
    UI.closeMobileNav();

    const product = getProduct(id);
    const activeSizes = getProductActiveSizes(product);

    if (activeSizes.length === 1 && !getSelectedSize(id)) {
      setSelectedSize(id, activeSizes[0]);
    }

    state.quickProductId = id;
    renderQuickView();

    refs.quickView.classList.add("show");
    refs.quickOverlay.classList.add("show");
    refs.quickView.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeQuickView() {
    const quickSliderId = state.quickProductId ? `quick-${state.quickProductId}` : null;
    if (quickSliderId && state.sliderIntervals.has(quickSliderId)) {
      clearInterval(state.sliderIntervals.get(quickSliderId));
      state.sliderIntervals.delete(quickSliderId);
    }

    refs.quickView.classList.remove("show");
    refs.quickOverlay.classList.remove("show");
    refs.quickView.setAttribute("aria-hidden", "true");
    state.quickProductId = null;

    if (!isCartOpen() && !refs.mobileNav?.classList.contains("show")) {
      document.body.classList.remove("no-scroll");
    }
  }

  function renderQuickView() {
    const product = getProduct(state.quickProductId);
    if (!product) {
      refs.quickBody.innerHTML = "";
      return;
    }

    const wished = Wishlist.has(product.id);
    const visual = StoreData.resolveProductVisual(product);
    const activeSizes = getProductActiveSizes(product);
    const quickSliderId = `quick-${product.id}`;
    const selectedSize = getSelectedSize(product.id) || "";
    const requiresSelection = activeSizes.length > 1;
    const canAdd = activeSizes.length === 0 || activeSizes.length === 1 || !!selectedSize;

    if (state.sliderIntervals.has(quickSliderId)) {
      clearInterval(state.sliderIntervals.get(quickSliderId));
      state.sliderIntervals.delete(quickSliderId);
    }

    refs.quickBody.innerHTML = `
      <div class="quick-gallery" data-quick-slider-root="${quickSliderId}">
        <div class="quick-gallery-bg" style="background:${visual.gradient};"></div>
        ${createSliderMarkup(visual.images, visual.alt, quickSliderId, "data-quick-slider-dot", "data-quick-slider-id")}
      </div>

      <p class="quick-meta">${labelGender(product.gender)} — ${labelCategory(product.category)}</p>
      <h3 class="quick-name">${product.name}</h3>
      <p class="quick-desc">${product.description}</p>

      <div class="quick-price">
        ${Utils.formatCOP(product.price)}
        ${product.oldPrice ? `<span class="product-old-price" style="font-size:13px;">${Utils.formatCOP(product.oldPrice)}</span>` : ""}
      </div>

      ${activeSizes.length ? `
        <div>
          <p class="eyebrow" style="margin-bottom:10px;color:var(--mid)">
            ${requiresSelection ? "Selecciona tu talla" : "Talla disponible"}
          </p>
          <div class="size-row">
            ${activeSizes.map((size) => `
              <button
                class="size-pill is-selectable ${selectedSize === size ? "selected" : ""}"
                type="button"
                data-action="select-size"
                data-id="${product.id}"
                data-size="${size}"
                aria-pressed="${selectedSize === size ? "true" : "false"}"
              >
                ${size}
              </button>
            `).join("")}
          </div>
          ${requiresSelection && !selectedSize ? `<p class="size-hint">Debes elegir una talla antes de agregar al carrito.</p>` : ""}
        </div>
      ` : ""}

      <div class="quick-actions">
        <button
          class="btn btn-add"
          type="button"
          data-action="add-to-cart"
          data-id="${product.id}"
          ${selectedSize ? `data-size="${selectedSize}"` : ""}
          ${!canAdd ? "disabled" : ""}
        >
          Agregar al carrito
        </button>

        <button class="btn btn-soft" type="button" data-action="toggle-wishlist" data-id="${product.id}">
          ${wished ? "Guardado" : "Favorito"}
        </button>
      </div>
    `;

    initQuickSlider(quickSliderId);
  }

  function initQuickSlider(sliderId) {
    const sliderRoot = document.querySelector(`[data-quick-slider-root="${sliderId}"]`);
    if (!sliderRoot) return;

    const slides = Array.from(sliderRoot.querySelectorAll(".slider-img"));
    if (slides.length <= 1) return;

    sliderRoot.dataset.currentIndex = "0";

    const intervalId = setInterval(() => {
      const current = Number(sliderRoot.dataset.currentIndex || 0);
      const next = (current + 1) % slides.length;
      updateSlider(sliderRoot, next);
    }, 5000);

    state.sliderIntervals.set(sliderId, intervalId);
  }

  function toggleWishlist(id) {
    const added = Wishlist.toggle(id);
    renderProducts();

    if (isQuickViewOpen()) {
      renderQuickView();
    }

    UI.showToast(
      added
        ? "Producto guardado en favoritos."
        : "Producto eliminado de favoritos."
    );
  }

  function setFilter(filterId) {
    state.activeFilter = StoreData.FILTERS.some((f) => f.id === filterId) ? filterId : "all";
    renderProducts();
  }

  function applyWishlistView() {
    const wishlistProducts = Wishlist.getProducts();

    if (!wishlistProducts.length) {
      UI.showToast("Aún no tienes favoritos guardados.");
      return;
    }

    clearAllSliderIntervals();

    state.activeFilter = "all";
    state.search = "";
    refs.searchInput.value = "";

    refs.productGrid.innerHTML = wishlistProducts.map((product) => {
      const visual = StoreData.resolveProductVisual(product);
      const sliderId = `wish-${product.id}`;
      const activeSizes = getProductActiveSizes(product);
      const hasMultipleSizes = activeSizes.length > 1;
      const addLabel = hasMultipleSizes ? "Elegir talla" : "Agregar al carrito";

      return `
        <article class="product-card">
          <div class="product-media" data-slider-root="${sliderId}">
            <div class="product-media-bg" style="background:${visual.gradient};"></div>
            ${createSliderMarkup(visual.images, visual.alt, sliderId, "data-slider-dot", "data-slider-id")}
            <span class="product-tag">Favorito</span>
          </div>

          <div class="product-info">
            <p class="product-meta">${labelGender(product.gender)} — ${labelCategory(product.category)}</p>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.description}</p>

            <div class="product-footer">
              <button class="btn btn-add" type="button" data-action="${hasMultipleSizes ? "quick-view" : "add-to-cart"}" data-id="${product.id}">
                ${addLabel}
              </button>
              <button class="btn btn-view" type="button" data-action="quick-view" data-id="${product.id}" aria-label="Ver detalle rápido">+</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    initSliders();
    UI.showToast("Mostrando tus favoritos.");
  }

  function handleCheckout() {
    const url = Cart.getWhatsAppURL("573226486408");

    if (!Cart.getTotalItems()) {
      UI.showToast("Tu carrito está vacío.");
      return;
    }

    window.open(url, "_blank", "noopener");
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();

    const email = refs.newsletterEmail.value.trim().toLowerCase();

    if (!Utils.validEmail(email)) {
      refs.newsletterFeedback.textContent = "Escribe un correo válido.";
      refs.newsletterFeedback.className = "form-feedback error";
      return;
    }

    const stored = Utils.loadJSON(StoreData.STORAGE_KEYS.newsletter, []);

    if (stored.includes(email)) {
      refs.newsletterFeedback.textContent = "Ese correo ya está registrado en la comunidad.";
      refs.newsletterFeedback.className = "form-feedback error";
      return;
    }

    stored.push(email);
    Utils.saveJSON(StoreData.STORAGE_KEYS.newsletter, stored);

    refs.newsletterFeedback.textContent = "Gracias. Ya haces parte de la comunidad DOS MARES.";
    refs.newsletterFeedback.className = "form-feedback success";
    refs.newsletterForm.reset();
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  TiendaPage.init();
});
