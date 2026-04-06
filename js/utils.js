const Utils = (() => {
  function formatCOP(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(number);
  }

  function loadJSON(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`No se pudo leer localStorage para la llave: ${key}`, error);
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`No se pudo guardar localStorage para la llave: ${key}`, error);
      return false;
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`No se pudo eliminar localStorage para la llave: ${key}`, error);
      return false;
    }
  }

  function validEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
  }

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function createElement(tag, className = "", content = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.innerHTML = content;
    return el;
  }

  function slugify(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function getQueryParam(param) {
    const url = new URL(window.location.href);
    return url.searchParams.get(param);
  }

  function updateQueryParam(param, value) {
    const url = new URL(window.location.href);

    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, value);
    }

    window.history.replaceState({}, "", url);
  }

  function debounce(fn, delay = 250) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function scrollToTop(smooth = true) {
    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
  }

  return {
    formatCOP,
    loadJSON,
    saveJSON,
    removeStorage,
    validEmail,
    qs,
    qsa,
    createElement,
    slugify,
    getQueryParam,
    updateQueryParam,
    debounce,
    clamp,
    scrollToTop,
    escapeHTML,
  };
})();
