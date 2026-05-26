import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import ShoppingCart from './components/ShoppingCart';
import { changePostalCode, searchProducts as searchMercadona } from './api/mercadona';
import { searchProducts as searchHiperber } from './api/hiperber';
import { RefreshCw, ShoppingBag, Moon, Sun, Menu, X } from 'lucide-react';
import './App.css'; // Mantenemos la importación para evitar fallos de compilación

// Clasificador simple de categorías por palabras clave en el nombre del producto
function getProductCategory(name) {
  const lower = name.toLowerCase();
  if (
    lower.includes('leche') || 
    lower.includes('queso') || 
    lower.includes('yogur') || 
    lower.includes('láct') || 
    lower.includes('mantequilla') || 
    lower.includes('nata')
  ) {
    return 'Lácteos y Derivados';
  }
  if (
    lower.includes('chocolate') || 
    lower.includes('galleta') || 
    lower.includes('dulce') || 
    lower.includes('patatas') || 
    lower.includes('snack') || 
    lower.includes('caramelo') ||
    lower.includes('patata') ||
    lower.includes('frito')
  ) {
    return 'Aperitivos y Dulces';
  }
  if (
    lower.includes('agua') || 
    lower.includes('refresco') || 
    lower.includes('zumo') || 
    lower.includes('bebida') || 
    lower.includes('cerveza') || 
    lower.includes('vino') ||
    lower.includes('cola')
  ) {
    return 'Bebidas';
  }
  if (
    lower.includes('pan') || 
    lower.includes('cereal') || 
    lower.includes('arroz') || 
    lower.includes('pasta') || 
    lower.includes('harina')
  ) {
    return 'Panadería y Cereales';
  }
  return 'Otros';
}

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getRelevanceScore(name, query) {
  if (!query) return 0;
  const normName = removeAccents(name.toLowerCase());
  const normQuery = removeAccents(query.toLowerCase().trim());
  
  const checkScore = (term) => {
    if (normName === term) return 100;
    if (normName.startsWith(term + ' ')) return 90;
    if (normName.startsWith(term)) return 80;
    
    // Contiene la palabra exacta (con límites de palabra)
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(normName)) return 70;
    
    if (normName.includes(term)) return 40;
    return 0;
  };
  
  let score = checkScore(normQuery);
  if (score > 0) return score;
  
  // Mapeo de sinónimos comunes para mejorar la experiencia de búsqueda
  const synonyms = {
    'platano': ['banana', 'bananas', 'platanos'],
    'platanos': ['banana', 'bananas', 'platano'],
    'banana': ['platano', 'platanos', 'bananas'],
    'bananas': ['platano', 'platanos', 'banana']
  };
  
  const querySynonyms = synonyms[normQuery] || [];
  for (const syn of querySynonyms) {
    const synScore = checkScore(syn);
    if (synScore > 0) {
      return synScore - 5; // Puntuación ligeramente menor que el término exacto
    }
  }
  
  return 0;
}

export default function App() {
  // Estado de ubicación y sesión fijo a Elche (03203)
  const [postalCode, setPostalCode] = useState('03203');

  // Selector de tema (Claro por defecto)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Cajón del carrito para móviles
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Estados de búsqueda
  const [query, setQuery] = useState('');
  const [mercadonaProducts, setMercadonaProducts] = useState([]);
  const [hiperberProducts, setHiperberProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Historial de búsquedas removido a petición del usuario

  // Lista de la compra (carrito)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('shopping_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Controles de filtrado y ordenación
  const [filterCategory, setFilterCategory] = useState('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Sincroniza el tema visual con el documento HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Inicializa el código postal en la API de Mercadona al cargar la aplicación
  useEffect(() => {
    const initPostalCode = async () => {
      try {
        await changePostalCode(postalCode);
      } catch (err) {
        console.error('Error inicializando el código postal:', err);
      }
    };
    initPostalCode();
  }, [postalCode]);

  // Persistencia de código postal desactivada

  // Historial de persistencia removido

  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Ejecuta la búsqueda en ambas APIs simultáneamente
  const executeSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setMercadonaProducts([]);
      setHiperberProducts([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Lanzamos ambas peticiones en paralelo
      const [mercadonaResults, hiperberResults] = await Promise.all([
        searchMercadona(searchTerm),
        searchHiperber(searchTerm)
      ]);
      
      setMercadonaProducts(mercadonaResults);
      setHiperberProducts(hiperberResults);
      
      // Historial removido

    } catch (error) {
      console.error('Error ejecutando la búsqueda global:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = (newQuery) => {
    setQuery(newQuery);
    executeSearch(newQuery);
  };

  // Controlador de código postal removido

  // Controladores de historial de búsquedas removidos

  // Carrito de compras
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Procesamiento de datos: Filtro de Categoría y Ordenación por Relevancia en cliente
  const processProducts = (productsList) => {
    let result = [...productsList];

    // 1. Filtrado por categoría
    if (filterCategory !== 'all') {
      result = result.filter(p => getProductCategory(p.nombre) === filterCategory);
    }

    // 2. Ordenación por precio (de menor a mayor)
    result.sort((a, b) => a.precio - b.precio);

    return result;
  };

  const processedMercadona = processProducts(mercadonaProducts);
  const processedHiperber = processProducts(hiperberProducts);

  return (
    <div className="app-container">
      {/* Cabecera Principal */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <ShoppingBag size={24} style={{ color: '#fff' }} />
          </div>
          <div className="brand-title">
            <h1>AhorraSuper</h1>
            <span className="brand-subtitle">Comparador de Precios</span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button 
            className="cart-toggle-btn"
            onClick={() => setIsCartOpen(true)}
            title="Ver lista de la compra"
            aria-label="Ver carrito"
          >
            <ShoppingBag size={18} />
            {cartItems.length > 0 && (
              <span className="cart-badge">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
          
          {(mercadonaProducts.length > 0 || hiperberProducts.length > 0) && (
            <button 
              className="filter-toggle-btn"
              onClick={() => setIsFiltersOpen(true)}
              title="Filtrar por categoría"
              aria-label="Menú de filtros"
            >
              <Menu size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Panel del Buscador */}
      <main className="search-dashboard">
        <SearchBar 
          query={query} 
          onSearchChange={handleSearchChange} 
          isSearching={isLoading} 
        />

        {/* Historial de búsquedas removido */}
      </main>

      {/* Cajón de Filtros (Sidebar/Drawer) */}
      <div className={`filters-drawer-container ${isFiltersOpen ? 'drawer-open' : 'drawer-closed'}`}>
        {isFiltersOpen && <div className="drawer-overlay" onClick={() => setIsFiltersOpen(false)}></div>}
        <div className="filters-drawer">
          <div className="drawer-header">
            <h3>Filtros de Búsqueda</h3>
            <button className="close-drawer-btn" onClick={() => setIsFiltersOpen(false)} aria-label="Cerrar filtros">
              <X size={20} />
            </button>
          </div>
          <div className="drawer-body">
            <div className="filter-group">
              <span className="filter-group-label">Filtrar por Categoría</span>
              <div className="category-list">
                {[
                  { value: 'all', label: 'Todas las Categorías' },
                  { value: 'Lácteos y Derivados', label: 'Lácteos y Derivados' },
                  { value: 'Aperitivos y Dulces', label: 'Aperitivos y Dulces' },
                  { value: 'Bebidas', label: 'Bebidas' },
                  { value: 'Panadería y Cereales', label: 'Panadería y Cereales' },
                  { value: 'Otros', label: 'Otros' }
                ].map((cat) => (
                  <button
                    key={cat.value}
                    className={`category-item-btn ${filterCategory === cat.value ? 'active' : ''}`}
                    onClick={() => {
                      setFilterCategory(cat.value);
                      setIsFiltersOpen(false);
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de la Compra (Carrito) */}
      <div className={`shopping-cart-container ${isCartOpen ? 'drawer-open' : 'drawer-closed'}`}>
        {isCartOpen && <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}></div>}
        <ShoppingCart 
          cartItems={cartItems} 
          onUpdateQuantity={handleUpdateQuantity} 
          onRemoveItem={handleRemoveItem} 
          onClearCart={handleClearCart} 
          onClose={() => setIsCartOpen(false)}
        />
      </div>

      {/* Resultados de Comparación en Cuadrícula */}
      {query ? (
        <ProductGrid 
          mercadonaProducts={processedMercadona} 
          hiperberProducts={processedHiperber} 
          isLoading={isLoading} 
          onAddToCart={handleAddToCart} 
          cartItems={cartItems}
        />
      ) : (
        <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--glass-bg)' }}>
          <ShoppingBag size={48} className="text-accent" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Comienza a Comparar</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
            Escribe en el buscador superior para encontrar y comparar precios de alimentos en tiempo real entre Mercadona e Hiperber.
          </p>
        </div>
      )}

    </div>
  );
}
