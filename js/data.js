const StoreData = (() => {
  const STORAGE_KEYS = {
    cart: "dosmares_cart_v1",
    wishlist: "dosmares_wishlist_v1",
    newsletter: "dosmares_newsletter_v1",
  };

  const FILTERS = [
    { id: "all", label: "Todo" },
    { id: "women", label: "Mujer" },
    { id: "men", label: "Hombre" },
    { id: "nuevo", label: "Nuevo" },
    { id: "vestidos", label: "Vestidos" },
    { id: "sets", label: "Sets" },
    { id: "enterizos", label: "Enterizos" },
    { id: "camisas", label: "Camisas" },
    { id: "pantalones", label: "Pantalones" },
    { id: "shorts", label: "Shorts" },
  ];

  const CATEGORIES = {
    women: "Mujer",
    men: "Hombre",
    nuevo: "Nuevo",
    destacado: "Destacado",
    vestidos: "Vestidos",
    sets: "Sets",
    enterizos: "Enterizos",
    camisas: "Camisas",
    pantalones: "Pantalones",
    shorts: "Shorts",
  };

  const PRODUCTS = [
    {
      id: "dm-001",
      slug: "vestido-mar",
      name: "Vestido Mar",
      gender: "women",
      category: "vestidos",
      collection: "nuevo",
      price: 135000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Vestido en lino de presencia limpia y caída elegante, pensado para una estética costera sobria y refinada.",
      sizes: [
        { label: "S/M", active: true },
      ],
      images: [
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Mar/IMG_1620.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Mar/IMG_1628.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Mar/IMG_1638.jpg",
      ],
      imageAlt: "Vestido Mar de DOS MARES",
      gradient: "linear-gradient(145deg,#e7d8c7 0%,#cbb299 52%,#9e7c66 100%)",
    },

    {
      id: "dm-003",
      slug: "conjunto-ancla",
      name: "Conjunto Ancla",
      gender: "women",
      category: "sets",
      collection: "nuevo",
      price: 130000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Set en lino con silueta pulida y una presencia sofisticada.",
      sizes: [
        { label: "S", active: true },
        { label: "M", active: true },
        { label: "L", active: false },
      ],
      images: [
        "assets/img/CATALOGO/Mujer/SETS/Set Ancla/IMG_1714.jpg",
        "assets/img/CATALOGO/Mujer/SETS/Set Ancla/IMG_1716.jpg",
      ],
      imageAlt: "Conjunto Ancla de DOS MARES",
      gradient: "linear-gradient(145deg,#f1e3d4 0%,#d7bea6 48%,#b28f73 100%)",
    },

    {
      id: "dm-004",
      slug: "conjunto-brisa",
      name: "Conjunto Brisa",
      gender: "women",
      category: "sets",
      collection: "nuevo",
      price: 130000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Conjunto en lino con acabados suaves, construido para verse elegante sin esfuerzo.",
      sizes: [
        { label: "S", active: true },
        { label: "M", active: false },
        { label: "L", active: false },
      ],
      images: [
        "assets/img/CATALOGO/Mujer/SETS/Set Brisa/IMG_1680.jpg",
        "assets/img/CATALOGO/Mujer/SETS/Set Brisa/IMG_1702.jpg",
        "assets/img/CATALOGO/Mujer/SETS/Set Brisa/IMG_1688.jpg",
      ],
      imageAlt: "Conjunto Brisa de DOS MARES",
      gradient: "linear-gradient(145deg,#eadbcb 0%,#ccb39b 50%,#a68069 100%)",
    },

    {
      id: "dm-005",
      slug: "camisa-olas",
      name: "Camisa Olas",
      gender: "men",
      category: "camisas",
      collection: "nuevo",
      price: 85000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Camisa en lino de estructura relajada y estética costera, pensada para un armario chévere.",
      sizes: [
        { label: "S", active: false },
        { label: "M", active: true },
        { label: "L", active: false },
        { label: "XL", active: false },
      ],
      images: [
        "assets/img/CATALOGO/Hombres/CAMISA/IMG_1598.jpg",
        "assets/img/CATALOGO/Hombres/CAMISA/IMG_1602.jpg",
      ],
      imageAlt: "Camisa Olas de DOS MARES",
      gradient: "linear-gradient(145deg,#4d1a22 0%,#6f2c37 50%,#9a6d67 100%)",
    },

    {
      id: "dm-006",
      slug: "vestido-olas",
      name: "Vestido Olas",
      gender: "women",
      category: "vestidos",
      collection: "nuevo",
      price: 105000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Vestido en lino con presencia fresca, ideal para una propuesta versátil entre ciudad y costa.",
      sizes: [
        { label: "S", active: true },
        { label: "M", active: true },
        { label: "L", active: false },
      ],
      images: [
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Olas/IMG_1564.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Olas/IMG_1568.jpg",
      ],
      imageAlt: "Vestido Olas de DOS MARES",
      gradient: "linear-gradient(145deg,#e8d7cb 0%,#cfb19d 52%,#a78471 100%)",
    },

    {
  id: "dm-007",
  slug: "enterizo-marea",
  name: "Enterizo Marea",
  gender: "women",
  category: "enterizos",
  collection: "nuevo",
  price: 80000,
  oldPrice: null,
  badge: "Nuevo",
  featured: true,
  soldOut: true, 
  description:
    "Enterizo en lino pensado para moverte con estilo. Un básico que no puede faltar en tu clóset.",
  sizes: [
    { label: "Talla U", active: false }, 
  ],
  images: [
    "assets/img/CATALOGO/Mujer/ENTERIZO/Enterizo Marea/IMG_1593.jpg",
    "assets/img/CATALOGO/Mujer/ENTERIZO/Enterizo Marea/IMG_1596.jpg",
  ],
  imageAlt: "Enterizo Marea de DOS MARES",
  gradient: "linear-gradient(145deg,#dcc8b6 0%,#bf9f87 50%,#8e6d58 100%)",
},

    {
      id: "dm-008",
      slug: "vestido-coral",
      name: "Vestido Coral",
      gender: "women",
      category: "vestidos",
      collection: "nuevo",
      price: 115000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Vestido en lino con una presencia elegante, pensado para una imagen limpia y memorable.",
      sizes: [
        { label: "Talla U", active: true },
      ],
      images: [
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Coral/IMG_1657.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Coral/IMG_1660.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Coral/IMG_1670.jpg",
      ],
      imageAlt: "Vestido Coral de DOS MARES",
      gradient: "linear-gradient(145deg,#f0ddd0 0%,#d7b7a3 50%,#b48d79 100%)",
    },

    {
      id: "dm-009",
      slug: "vestido-calma",
      name: "Vestido Calma",
      gender: "women",
      category: "vestidos",
      collection: "nuevo",
      price: 90000,
      oldPrice: null,
      badge: "Nuevo",
      featured: true,
      description:
        "Vestido en lino de expresión serena, con una silueta ligera y una estética atemporal.",
      sizes: [
        { label: "S", active: true },
        { label: "M", active: true },
        { label: "L", active: false },
      ],
      images: [
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Calma/IMG_1575.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Calma/IMG_1588.jpg",
        "assets/img/CATALOGO/Mujer/VESTIDOS/Vestido Calma/IMG_1578.jpg",
      ],
      imageAlt: "Vestido Calma de DOS MARES",
      gradient: "linear-gradient(145deg,#ead8c9 0%,#cda98f 50%,#9e775f 100%)",
    },
  ];

  function normalizeProduct(product) {
    const images = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : product.image
        ? [product.image]
        : [];

    const activeSizes = Array.isArray(product.sizes)
      ? product.sizes
          .filter((size) => {
            if (typeof size === "string") return true;
            return !!size.active;
          })
          .map((size) => (typeof size === "string" ? size : size.label))
      : [];

    return {
      ...product,
      images,
      image: images[0] || "",
      hasGallery: images.length > 1,
      sizesActive: activeSizes,
    };
  }

  function getAllProducts() {
    return PRODUCTS.map(normalizeProduct);
  }

  function getProductById(id) {
    const product = PRODUCTS.find((item) => item.id === id);
    return product ? normalizeProduct(product) : null;
  }

  function getProductBySlug(slug) {
    const product = PRODUCTS.find((item) => item.slug === slug);
    return product ? normalizeProduct(product) : null;
  }

  function getFeaturedProducts(limit = 4) {
    return PRODUCTS
      .filter((product) => product.featured)
      .slice(0, limit)
      .map(normalizeProduct);
  }

  function getProductsByGender(gender) {
    return PRODUCTS
      .filter((product) => product.gender === gender)
      .map(normalizeProduct);
  }

  function getProductsByCategory(category) {
    return PRODUCTS
      .filter((product) => product.category === category)
      .map(normalizeProduct);
  }

  function getProductsByCollection(collection) {
    return PRODUCTS
      .filter((product) => product.collection === collection)
      .map(normalizeProduct);
  }

  function getFilterLabel(id) {
    const match = FILTERS.find((filter) => filter.id === id);
    return match ? match.label : id;
  }

  function getCategoryLabel(id) {
    return CATEGORIES[id] || id;
  }

  function resolveProductImage(product) {
    if (Array.isArray(product.images) && product.images.length) {
      return product.images[0];
    }
    return product.image || "";
  }

  function resolveProductVisual(product) {
    const resolvedImages = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : product.image
        ? [product.image]
        : [];

    const primaryImage = resolvedImages[0] || "";

    return {
      hasImage: !!primaryImage,
      image: primaryImage,
      images: resolvedImages,
      alt: product.imageAlt || product.name,
      gradient:
        product.gradient ||
        "linear-gradient(145deg,#d8c8b7 0%,#bca387 45%,#876858 100%)",
    };
  }

  return {
    STORAGE_KEYS,
    FILTERS,
    CATEGORIES,
    PRODUCTS,
    getAllProducts,
    getProductById,
    getProductBySlug,
    getFeaturedProducts,
    getProductsByGender,
    getProductsByCategory,
    getProductsByCollection,
    getFilterLabel,
    getCategoryLabel,
    resolveProductImage,
    resolveProductVisual,
  };
})();
