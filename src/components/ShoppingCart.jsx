import React from 'react';
import { Trash2, Plus, Minus, TrendingDown, ShoppingCart as CartIcon } from 'lucide-react';
import ComparisonChart from './ComparisonChart';

export default function ShoppingCart({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart, onClose }) {
  
  // Agrupamos y calculamos totales
  const totalMercadona = cartItems
    .filter(item => item.supermercado === 'Mercadona')
    .reduce((sum, item) => sum + item.precio * item.quantity, 0);

  const totalHiperber = cartItems
    .filter(item => item.supermercado === 'Hiperber')
    .reduce((sum, item) => sum + item.precio * item.quantity, 0);

  const hasItems = cartItems.length > 0;

  // Cálculo del ahorro
  const getSavingsDetails = () => {
    if (totalMercadona === 0 || totalHiperber === 0) return null;
    
    if (totalMercadona === totalHiperber) {
      return { tie: true };
    }
    
    const cheapest = totalMercadona < totalHiperber ? 'Mercadona' : 'Hiperber';
    const expensiveTotal = Math.max(totalMercadona, totalHiperber);
    const cheapestTotal = Math.min(totalMercadona, totalHiperber);
    const diff = expensiveTotal - cheapestTotal;
    const pct = (diff / expensiveTotal) * 100;
    
    return {
      cheapest,
      difference: diff,
      percentage: pct
    };
  };

  const savings = getSavingsDetails();

  return (
    <section className="shopping-cart-widget">
      <div className="widget-title-area">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CartIcon size={24} className="text-accent" />
          <span>Lista de la Compra Comparativa</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {hasItems && (
            <button className="clear-cart-btn" onClick={onClearCart}>
              Vaciar lista
            </button>
          )}
          {onClose && (
            <button 
              className="close-drawer-btn" 
              onClick={onClose}
              title="Cerrar carrito"
              aria-label="Cerrar"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {!hasItems ? (
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <CartIcon size={32} />
          <p>Tu lista de la compra está vacía</p>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
            Busca y añade productos para ver la diferencia de precio real en tu cesta.
          </span>
        </div>
      ) : (
        <div className="widget-columns-wrapper">
          {/* Lista de productos añadidos */}
          <div className="cart-items-panel">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-info">
                  <span className="cart-item-name" title={item.nombre}>{item.nombre}</span>
                  <span className={`cart-item-store ${item.supermercado}`}>
                    {item.supermercado}
                  </span>
                </div>
                
                <div className="cart-item-price-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      style={{ background: 'none', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', color: '#fff', cursor: 'pointer', padding: '2px 4px' }}
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button 
                      style={{ background: 'none', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', color: '#fff', cursor: 'pointer', padding: '2px 4px' }}
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  
                  <span className="cart-item-price">
                    {(item.precio * item.quantity).toFixed(2)}€
                  </span>
                  
                  <button 
                    className="cart-item-delete"
                    onClick={() => onRemoveItem(item.id)}
                    title="Eliminar de la lista"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totales y Gráfica */}
          <div className="comparison-totals-panel">
            <div className="totals-container">
              <div className="total-store-row Mercadona">
                <span>Mercadona:</span>
                <span>{totalMercadona.toFixed(2)} €</span>
              </div>
              <div className="total-store-row Hiperber">
                <span>Hiperber:</span>
                <span>{totalHiperber.toFixed(2)} €</span>
              </div>
            </div>

            {savings && !savings.tie && (
              <div className="savings-alert">
                <TrendingDown size={18} />
                <span>
                  ¡Ahorras <strong>{savings.difference.toFixed(2)} €</strong> ({savings.percentage.toFixed(0)}%) comprando en <strong>{savings.cheapest}</strong>!
                </span>
              </div>
            )}

            {savings && savings.tie && (
              <div className="savings-alert" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'hsl(var(--border-color))', color: 'hsl(var(--text-primary))' }}>
                <span>¡Los precios totales de ambos supermercados coinciden exactamente!</span>
              </div>
            )}

            <ComparisonChart 
              totalMercadona={totalMercadona} 
              totalHiperber={totalHiperber} 
            />
          </div>
        </div>
      )}
    </section>
  );
}
