const Cart = (() => {
  const STORAGE_KEY = StoreData.STORAGE_KEYS.cart;

  function getCart() {
    return Utils.loadJSON(STORAGE_KEY, []).map(normalizeCartItem);
  }

  function saveCart(cart) {
    const normalizedCart = cart.map(normalizeCartItem);
    Utils.saveJSON(STORAGE_KEY, normalizedCart);
    window.dispatchEvent(new CustomEvent("cart:updated", {
      detail: {
        cart: [...normalizedCart],
        count: getTotalItems(normalizedCart),
        subtotal: getSubtotal(normalizedCart),
      },
    }));
  }

  function buildVariantKey(productId, size = "") {
    const cleanId = String(productId);
    const cleanSize = String(size || "").trim();
    return cleanSize ? `${cleanId}__${cleanSize}` : cleanId;
  }

  function getProductActiveSizes(product) {
    if (!product) return [];

    if (Array.isArray(product.sizesActive) && product.sizesActive.length) {
      return product.sizesActive.map((size) => String(size));
    }

    if (Array.isArray(product.sizes) && product.sizes.length) {
      return product.sizes
        .map((size) => {
          if (typeof size === "string") return size;
          if (size && size.active) return size.label;
          return null;
        })
        .filter(Boolean)
        .map((size) => String(size));
    }

    return [];
  }

  function normalizeCartItem(item) {
    const id = String(item.id);
    const size = item.size ? String(item.size).trim() : "";
    return {
      id,
      size,
      variantKey: buildVariantKey(id, size),
      qty: Math.max(1, Number(item.qty) || 1),
    };
  }

  function findEntry(cart, identifier, size = null) {
    if (size !== null) {
      const variantKey = buildVariantKey(identifier, size);
      return cart.find((item) => item.variantKey === variantKey) || null;
    }

    return (
      cart.find((item) => item.variantKey === identifier) ||
      cart.find((item) => item.id === identifier) ||
      null
    );
  }

  function add(productId, qty = 1, options = {}) {
    const product = StoreData.getProductById(productId);
    if (!product) {
      console.warn(`Producto no encontrado: ${productId}`);
      return false;
    }

    const quantityToAdd = Math.max(1, Number(qty) || 1);
    const activeSizes = getProductActiveSizes(product);
    const requestedSize = options.size ? String(options.size).trim() : "";

    if (activeSizes.length > 0 && !requestedSize) {
      console.warn(`Se requiere talla para agregar el producto ${productId}`);
      return false;
    }

    if (requestedSize && activeSizes.length > 0 && !activeSizes.includes(requestedSize)) {
      console.warn(`Talla no válida para ${productId}: ${requestedSize}`);
      return false;
    }

    const cart = getCart();
    const variantKey = buildVariantKey(productId, requestedSize);
    const existing = cart.find((item) => item.variantKey === variantKey);

    if (existing) {
      existing.qty += quantityToAdd;
    } else {
      cart.push(
        normalizeCartItem({
          id: productId,
          size: requestedSize,
          qty: quantityToAdd,
        })
      );
    }

    saveCart(cart);
    return true;
  }

  function remove(identifier, size = null) {
    const cart = getCart();
    const entry = findEntry(cart, identifier, size);

    if (!entry) return false;

    saveCart(cart.filter((item) => item.variantKey !== entry.variantKey));
    return true;
  }

  function setQuantity(identifier, qty, size = null) {
    const cart = getCart();
    const item = findEntry(cart, identifier, size);

    if (!item) return false;

    const nextQty = Number(qty) || 0;

    if (nextQty <= 0) {
      return remove(item.variantKey);
    }

    item.qty = nextQty;
    saveCart(cart);
    return true;
  }

  function increase(identifier, step = 1, size = null) {
    const cart = getCart();
    const item = findEntry(cart, identifier, size);

    if (!item) {
      if (size !== null) {
        return add(identifier, step, { size });
      }
      return false;
    }

    item.qty += Math.max(1, Number(step) || 1);
    saveCart(cart);
    return true;
  }

  function decrease(identifier, step = 1, size = null) {
    const cart = getCart();
    const item = findEntry(cart, identifier, size);

    if (!item) return false;

    item.qty -= Math.max(1, Number(step) || 1);

    if (item.qty <= 0) {
      return remove(item.variantKey);
    }

    saveCart(cart);
    return true;
  }

  function clear() {
    saveCart([]);
    return true;
  }

  function has(productId, size = null) {
    return !!findEntry(getCart(), productId, size);
  }

  function getQuantity(productId, size = null) {
    const item = findEntry(getCart(), productId, size);
    return item ? item.qty : 0;
  }

  function getTotalItems(cart = getCart()) {
    return cart.reduce((total, item) => total + (Number(item.qty) || 0), 0);
  }

  function getSubtotal(cart = getCart()) {
    return cart.reduce((total, item) => {
      const product = StoreData.getProductById(item.id);
      if (!product) return total;
      return total + product.price * item.qty;
    }, 0);
  }

  function getDetailedItems(cart = getCart()) {
    return cart
      .map((item) => {
        const product = StoreData.getProductById(item.id);
        if (!product) return null;

        return {
          ...item,
          product,
          lineTotal: product.price * item.qty,
        };
      })
      .filter(Boolean);
  }

  function getSummary() {
    const cart = getCart();
    return {
      items: getDetailedItems(cart),
      count: getTotalItems(cart),
      subtotal: getSubtotal(cart),
    };
  }

  function buildWhatsAppMessage() {
    const summary = getSummary();

    if (!summary.items.length) return "";

    const lines = summary.items.map(({ product, qty, size, lineTotal }) => {
      const sizeText = size ? ` — Talla ${size}` : "";
      return `• ${product.name}${sizeText} x${qty} — ${Utils.formatCOP(lineTotal)}`;
    });

    return [
      "Hola, quiero finalizar este pedido de DOS MARES:",
      "",
      ...lines,
      "",
      `Total: ${Utils.formatCOP(summary.subtotal)}`,
      "",
      "Quedo atento(a) a los datos de pago y envío.",
    ].join("\n");
  }

  function getWhatsAppURL(phone = "573226486408") {
    const message = buildWhatsAppMessage();
    if (!message) return `https://wa.me/${phone}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  return {
    getCart,
    saveCart,
    add,
    remove,
    setQuantity,
    increase,
    decrease,
    clear,
    has,
    getQuantity,
    getTotalItems,
    getSubtotal,
    getDetailedItems,
    getSummary,
    buildWhatsAppMessage,
    getWhatsAppURL,
  };
})();