import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { AlertCircle, Plus } from 'lucide-react';

export default function ProductGrid({ mercadonaProducts, hiperberProducts, isLoading, onAddToCart, cartItems = [] }) {
  // Estados para controlar el límite de productos visibles en cada lista
  const [visibleMercadona, setVisibleMercadona] = useState(5);
  const [visibleHiperber, setVisibleHiperber] = useState(5);

  const handleLoadMoreMercadona = () => {
    const currentCount = visibleMercadona;
    setVisibleMercadona(prev => prev + 5);
    setTimeout(() => {
      const firstNewCard = document.getElementById(`mercadona-card-${currentCount}`);
      if (firstNewCard && firstNewCard.parentElement) {
        const container = firstNewCard.parentElement;
        const cardTop = firstNewCard.offsetTop;
        container.scrollTo({
          top: cardTop - 10,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  const handleLoadMoreHiperber = () => {
    const currentCount = visibleHiperber;
    setVisibleHiperber(prev => prev + 5);
    setTimeout(() => {
      const firstNewCard = document.getElementById(`hiperber-card-${currentCount}`);
      if (firstNewCard && firstNewCard.parentElement) {
        const container = firstNewCard.parentElement;
        const cardTop = firstNewCard.offsetTop;
        container.scrollTo({
          top: cardTop - 10,
          behavior: 'smooth'
        });
      }
    }, 50);
  };
  
  // Encontramos el producto absoluto más barato de toda la cuadrícula para resaltarlo
  let cheapestId = null;
  const allProducts = [...mercadonaProducts, ...hiperberProducts];
  if (allProducts.length > 0) {
    const cheapestProduct = allProducts.reduce((min, p) => p.precio < min.precio ? p : min, allProducts[0]);
    cheapestId = cheapestProduct ? cheapestProduct.id : null;
  }
  const checkIsInCart = (product) => {
    return cartItems.some(item => item.id === product.id);
  };
  const renderSkeletons = () => (
    <>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
    </>
  );

  return (
    <div className="comparator-grid-container">
      
      {/* Columna de Mercadona */}
      <div className="supermarket-section mercadona-sec">
        <div className="section-header mercadona">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="store-dot mercadona"></span>
            <h2>Mercadona</h2>
          </div>
          {!isLoading && (
            <span className="results-count">
              Mostrando {Math.min(visibleMercadona, mercadonaProducts.length)} de {mercadonaProducts.length} prod.
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="products-list">
            {renderSkeletons()}
          </div>
        ) : mercadonaProducts.length > 0 ? (
          <div className="products-list">
            {mercadonaProducts.slice(0, visibleMercadona).map((product, index) => (
              <ProductCard
                key={product.id}
                id={`mercadona-card-${index}`}
                product={product}
                isCheapest={product.id === cheapestId}
                onAddToCart={onAddToCart}
                isInCart={checkIsInCart(product)}
              />
            ))}
            
            {/* Tarjeta Cargar más */}
            {visibleMercadona < mercadonaProducts.length && (
              <div 
                className="load-more-card mercadona"
                onClick={handleLoadMoreMercadona}
                title="Mostrar 5 productos más"
              >
                <div className="load-more-icon-circle">
                  <Plus size={24} />
                </div>
                <span className="load-more-title">Cargar más</span>
                <span className="load-more-subtitle">
                  Quedan {mercadonaProducts.length - visibleMercadona}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <AlertCircle size={32} />
            <p>Sin resultados en Mercadona</p>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
              Prueba con otro término de búsqueda.
            </span>
          </div>
        )}
      </div>

      {/* Columna de Hiperber */}
      <div className="supermarket-section hiperber-sec">
        <div className="section-header hiperber">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="store-dot hiperber"></span>
            <h2>Hiperber</h2>
          </div>
          {!isLoading && (
            <span className="results-count">
              Mostrando {Math.min(visibleHiperber, hiperberProducts.length)} de {hiperberProducts.length} prod.
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="products-list">
            {renderSkeletons()}
          </div>
        ) : hiperberProducts.length > 0 ? (
          <div className="products-list">
            {hiperberProducts.slice(0, visibleHiperber).map((product, index) => (
              <ProductCard
                key={product.id}
                id={`hiperber-card-${index}`}
                product={product}
                isCheapest={product.id === cheapestId}
                onAddToCart={onAddToCart}
                isInCart={checkIsInCart(product)}
              />
            ))}
            
            {/* Tarjeta Cargar más */}
            {visibleHiperber < hiperberProducts.length && (
              <div 
                className="load-more-card hiperber"
                onClick={handleLoadMoreHiperber}
                title="Mostrar 5 productos más"
              >
                <div className="load-more-icon-circle">
                  <Plus size={24} />
                </div>
                <span className="load-more-title">Cargar más</span>
                <span className="load-more-subtitle">
                  Quedan {hiperberProducts.length - visibleHiperber}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <AlertCircle size={32} />
            <p>Sin resultados en Hiperber</p>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
              Prueba con otros términos de búsqueda.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

