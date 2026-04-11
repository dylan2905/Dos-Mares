const UI = (() => {
  let revealObserver = null;
  let activeMenu = null;

  function init() {
    setupMegaMenus();
    setupMobileNav();
    setupGlobalClose();
    initReveal();
    updateCartCounter();
  }

  function setupMegaMenus() {
    const buttons = document.querySelectorAll("[data-menu]");

    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const id = button.dataset.menu;
        toggleMegaMenu(id);
      });
    });

    window.addEventListener("resize", () => {
      if (activeMenu) {
        positionMegaMenu(activeMenu);
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest(".nav-item") &&
        !event.target.closest(".mega-menu") &&
        activeMenu
      ) {
        closeMegaMenus();
      }
    });
  }

  function getMenuMap() {
    return {
      women: {
        nav: document.getElementById("navWomen"),
        menu: document.getElementById("menuWomen")
      },
      men: {
        nav: document.getElementById("navMen"),
        menu: document.getElementById("menuMen")
      },
      mujer: {
        nav: document.getElementById("navWomen"),
        menu: document.getElementById("menuWomen")
      },
      hombre: {
        nav: document.getElementById("navMen"),
        menu: document.getElementById("menuMen")
      }
    };
  }

  function toggleMegaMenu(id) {
    const map = getMenuMap();

    if (activeMenu === id) {
      closeMegaMenus();
      return;
    }

    closeMegaMenus();

    const target = map[id];
    if (!target) return;

    target.nav?.classList.add("open");
    target.menu?.classList.add("show");
    target.nav?.querySelector("button")?.setAttribute("aria-expanded", "true");

    activeMenu = id;
    requestAnimationFrame(() => positionMegaMenu(id));
  }

  function positionMegaMenu(id) {
    const map = getMenuMap();
    const target = map[id];
    if (!target?.nav || !target?.menu) return;

    const container = target.nav.closest(".container");
    const layer = container?.querySelector(".mega-menu-layer");
    const button = target.nav.querySelector("button");
    const menu = target.menu;

    if (!container || !layer || !button || !menu) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    const menuWidth = menu.offsetWidth || 640;
    const layerWidth = layer.clientWidth || containerRect.width;

    const idealLeft = (buttonRect.left - containerRect.left) - 24;
    const maxLeft = Math.max(0, layerWidth - menuWidth);

    const safeLeft = Math.min(Math.max(0, idealLeft), maxLeft);

    menu.style.left = `${safeLeft}px`;
  }

  function closeMegaMenus() {
    ["Women", "Men"].forEach((name) => {
      const nav = document.getElementById(`nav${name}`);
      const menu = document.getElementById(`menu${name}`);

      nav?.classList.remove("open");
      nav?.querySelector("button")?.setAttribute("aria-expanded", "false");

      if (menu) {
        menu.classList.remove("show");
        menu.style.left = "0px";
      }
    });

    activeMenu = null;
  }

  function setupMobileNav() {
    const toggle = document.getElementById("mobileToggle") || document.querySelector("[data-mobile-toggle]");
    const nav = document.getElementById("mobileNav") || document.querySelector(".mobile-nav");
    const overlay = document.getElementById("mobileOverlay") || document.querySelector(".mobile-overlay,[data-overlay]");
    const closeBtn = document.getElementById("mobileClose") || document.querySelector("[data-mobile-close]");

    if (toggle && nav) {
      toggle.addEventListener("click", () => openMobileNav());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeMobileNav());
    }

    if (overlay) {
      overlay.addEventListener("click", () => {
        closeMobileNav();
        closeDrawer();
        closeQuickView();
        closeMegaMenus();
      });
    }
  }

  function openMobileNav() {
    const nav = document.getElementById("mobileNav") || document.querySelector(".mobile-nav");
    const overlay = document.getElementById("mobileOverlay") || document.querySelector(".mobile-overlay,[data-overlay]");
    if (!nav) return;

    nav.classList.add("show", "open");
    overlay?.classList.add("show", "active");
    document.body.style.overflow = "hidden";
    nav.setAttribute("aria-hidden", "false");
  }

  function closeMobileNav() {
    const nav = document.getElementById("mobileNav") || document.querySelector(".mobile-nav");
    const overlay = document.getElementById("mobileOverlay") || document.querySelector(".mobile-overlay,[data-overlay]");
    if (!nav) return;

    nav.classList.remove("show", "open");
    nav.setAttribute("aria-hidden", "true");

    if (!isAnyPanelOpen()) {
      overlay?.classList.remove("show", "active");
      document.body.style.overflow = "";
    }
  }

  function openDrawer() {
    const drawer = document.getElementById("cartDrawer") || document.querySelector(".cart-drawer");
    const overlay = document.getElementById("drawerOverlay") || document.querySelector(".drawer-overlay,[data-overlay]");
    if (!drawer) return;

    drawer.classList.add("show", "open");
    overlay?.classList.add("show", "active");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    const drawer = document.getElementById("cartDrawer") || document.querySelector(".cart-drawer");
    const overlay = document.getElementById("drawerOverlay") || document.querySelector(".drawer-overlay,[data-overlay]");
    if (!drawer) return;

    drawer.classList.remove("show", "open");
    drawer.setAttribute("aria-hidden", "true");

    if (!isAnyPanelOpen()) {
      overlay?.classList.remove("show", "active");
      document.body.style.overflow = "";
    }
  }

  function openQuickView() {
    const panel = document.getElementById("quickView") || document.querySelector(".quick-view");
    const overlay = document.getElementById("quickOverlay") || document.querySelector(".quick-overlay,[data-overlay]");
    if (!panel) return;

    panel.classList.add("show", "open");
    overlay?.classList.add("show", "active");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeQuickView() {
    const panel = document.getElementById("quickView") || document.querySelector(".quick-view");
    const overlay = document.getElementById("quickOverlay") || document.querySelector(".quick-overlay,[data-overlay]");
    if (!panel) return;

    panel.classList.remove("show", "open");
    panel.setAttribute("aria-hidden", "true");

    if (!isAnyPanelOpen()) {
      overlay?.classList.remove("show", "active");
      document.body.style.overflow = "";
    }
  }

  function isAnyPanelOpen() {
    const cart = document.getElementById("cartDrawer") || document.querySelector(".cart-drawer");
    const quick = document.getElementById("quickView") || document.querySelector(".quick-view");
    const mobile = document.getElementById("mobileNav") || document.querySelector(".mobile-nav");

    return (
      cart?.classList.contains("show") ||
      quick?.classList.contains("show") ||
      mobile?.classList.contains("show") ||
      mobile?.classList.contains("open")
    );
  }

  function setupGlobalClose() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMegaMenus();
        closeQuickView();
        closeDrawer();
        closeMobileNav();
      }
    });
  }

  function showToast(message) {
    let wrap = document.getElementById("toastWrap") || document.querySelector(".toast-wrap");

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      wrap.id = "toastWrap";
      wrap.setAttribute("aria-live", "polite");
      wrap.setAttribute("aria-atomic", "true");
      document.body.appendChild(wrap);
    }

    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    wrap.appendChild(el);

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(() => el.remove(), 240);
    }, 2200);
  }

  function initReveal() {
    if (revealObserver) revealObserver.disconnect();

    const reveals = document.querySelectorAll(".reveal");
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach((el) => revealObserver.observe(el));
  }

  function updateCartCounter() {
    const counters = document.querySelectorAll("[data-cart-count], #bagCount");
    const total = typeof Cart !== "undefined" ? Cart.getTotalItems() : 0;

    counters.forEach((counter) => {
      counter.textContent = total;
      if (counter.hasAttribute("data-cart-count")) {
        counter.style.display = total > 0 ? "inline-flex" : "none";
      }
    });
  }

  return {
    init,
    initReveal,
    showToast,
    updateCartCounter,
    openDrawer,
    closeDrawer,
    openQuickView,
    closeQuickView,
    openMobileNav,
    closeMobileNav,
    closeMegaMenus
  };
})();
