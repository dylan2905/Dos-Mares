const Wishlist = (() => {
  const STORAGE_KEY = StoreData.STORAGE_KEYS.wishlist;

  function getWishlist() {
    return Utils.loadJSON(STORAGE_KEY, []);
  }

  function saveWishlist(items) {
    const normalized = [...new Set(items.map(String))];
    Utils.saveJSON(STORAGE_KEY, normalized);

    window.dispatchEvent(
      new CustomEvent("wishlist:updated", {
        detail: {
          items: [...normalized],
          count: normalized.length,
        },
      })
    );
  }

  function has(productId) {
    return getWishlist().includes(String(productId));
  }

  function add(productId) {
    const product = StoreData.getProductById(productId);
    if (!product) {
      console.warn(`Producto no encontrado en wishlist: ${productId}`);
      return false;
    }

    const items = getWishlist();
    const id = String(productId);

    if (!items.includes(id)) {
      items.push(id);
      saveWishlist(items);
    }

    return true;
  }

  function remove(productId) {
    const id = String(productId);
    const items = getWishlist().filter((item) => item !== id);
    saveWishlist(items);
    return true;
  }

  function toggle(productId) {
    if (has(productId)) {
      remove(productId);
      return false;
    }

    add(productId);
    return true;
  }

  function clear() {
    saveWishlist([]);
    return true;
  }

  function count() {
    return getWishlist().length;
  }

  function getProducts() {
    return getWishlist()
      .map((id) => StoreData.getProductById(id))
      .filter(Boolean);
  }

  return {
    getWishlist,
    saveWishlist,
    has,
    add,
    remove,
    toggle,
    clear,
    count,
    getProducts,
  };
})();