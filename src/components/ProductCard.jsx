import React, { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, isCheapest, onAddToCart, id }) {
  const [imageError, setImageError] = useState(false);
  const {
    nombre,
    brand,
    precio,
    precio_kg,
    formato_kg,
    imagen,
    supermercado,
    nutriscore,
    kcal,
    formato
  } = product;

  return (
    <div id={id} className={`product-card ${isCheapest ? 'cheapest' : ''}`}>
      {isCheapest && (
        <div className="cheapest-badge" title="Este es el producto con el precio unitario más económico">
          Más Barato
        </div>
      )}
      
      <div className="card-img-wrapper">
        {imageError ? (
          <div className="img-placeholder">
            <ShoppingBag size={24} className="placeholder-icon" />
            <span className="placeholder-text">{supermercado}</span>
          </div>
        ) : (
          <img 
            src={imagen} 
            alt={nombre} 
            className="card-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      <div className="card-content">
        <div className="card-top">
          <span className="card-brand">{brand || (supermercado === 'Mercadona' ? 'Hacendado' : 'Genérica')}</span>
          <h4 className="card-title" title={nombre}>{nombre}</h4>
          {formato && (
            <span className="card-format">{formato}</span>
          )}
          
          <div className="card-attributes">
            {kcal !== undefined && kcal !== null && (
              <span className="attr-badge kcal">
                {kcal} <span className="kcal-text-desktop">kcal / 100g</span><span className="kcal-text-mobile">kcal</span>
              </span>
            )}
            
            {nutriscore && (
              <span className="attr-badge nutriscore" title={`Nutri-Score: ${nutriscore}`}>
                <span className={`nutriscore-dot ${nutriscore}`}></span>
                <span className="nutriscore-text-desktop">Nutri-Score </span>
                <span>{nutriscore}</span>
              </span>
            )}
          </div>
        </div>

        <div className="card-bottom">
          <div className="price-box">
            <span className="price-main">{precio.toFixed(2)} €</span>
            {precio_kg > 0 && (
              <span className="price-kg">
                {precio_kg.toFixed(2)} € / {formato_kg}
              </span>
            )}
          </div>
          
          <button 
            className="add-cart-btn"
            onClick={() => onAddToCart(product)}
            title="Añadir a la lista de la compra"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
