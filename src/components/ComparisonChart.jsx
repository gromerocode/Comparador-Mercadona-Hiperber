import React from 'react';

export default function ComparisonChart({ totalMercadona, totalHiperber }) {
  const maxTotal = Math.max(totalMercadona, totalHiperber, 1); // Evitamos división por cero
  
  // Calculamos las alturas porcentuales para las barras (máximo 100% de la altura útil)
  const pctMercadona = (totalMercadona / maxTotal) * 100;
  const pctHiperber = (totalHiperber / maxTotal) * 100;

  // Calculamos el ahorro
  const difference = Math.abs(totalMercadona - totalHiperber);
  
  const hasItems = totalMercadona > 0 || totalHiperber > 0;

  if (!hasItems) {
    return (
      <div className="empty-state" style={{ padding: '20px' }}>
        <p style={{ fontSize: '0.9rem' }}>Añade productos para ver la comparativa gráfica</p>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ width: '100%' }}>
      <svg viewBox="0 0 400 220" className="svg-chart">
        {/* Líneas de cuadrícula de fondo */}
        <line x1="50" y1="30" x2="350" y2="30" className="chart-grid-line" />
        <line x1="50" y1="80" x2="350" y2="80" className="chart-grid-line" />
        <line x1="50" y1="130" x2="350" y2="130" className="chart-grid-line" />
        <line x1="50" y1="180" x2="350" y2="180" stroke="hsl(var(--border-color))" strokeWidth="1.5" />

        {/* Eje Y Labels (Precios) */}
        <text x="40" y="35" fill="hsl(var(--text-muted))" fontSize="10" textAnchor="end">
          {(maxTotal).toFixed(1)}€
        </text>
        <text x="40" y="105" fill="hsl(var(--text-muted))" fontSize="10" textAnchor="end">
          {(maxTotal / 2).toFixed(1)}€
        </text>
        <text x="40" y="184" fill="hsl(var(--text-muted))" fontSize="10" textAnchor="end">
          0€
        </text>

        {/* Barra Mercadona (Verde) */}
        <g>
          {/* Fondo o sombra de barra */}
          <rect 
            x="95" 
            y="30" 
            width="60" 
            height="150" 
            fill="hsla(var(--mercadona-brand), 0.03)" 
            rx="4"
          />
          {/* Barra activa */}
          <rect 
            x="95" 
            y={180 - (pctMercadona * 1.5)} 
            width="60" 
            height={pctMercadona * 1.5} 
            className="chart-bar-mercadona"
            rx="4"
          />
          <text 
            x="125" 
            y={Math.min(170, 175 - (pctMercadona * 1.5))} 
            fill="#fff" 
            fontSize="11" 
            fontWeight="bold" 
            textAnchor="middle"
          >
            {totalMercadona > 0 ? `${totalMercadona.toFixed(2)}€` : ''}
          </text>
          <text x="125" y="198" fill="hsl(var(--text-secondary))" fontSize="11" fontWeight="600" textAnchor="middle">
            Mercadona
          </text>
        </g>

        {/* Barra Hiperber (Rojo) */}
        <g>
          {/* Fondo o sombra de barra */}
          <rect 
            x="245" 
            y="30" 
            width="60" 
            height="150" 
            fill="hsla(var(--hiperber-brand), 0.03)" 
            rx="4"
          />
          {/* Barra activa */}
          <rect 
            x="245" 
            y={180 - (pctHiperber * 1.5)} 
            width="60" 
            height={pctHiperber * 1.5} 
            className="chart-bar-hiperber"
            rx="4"
          />
          <text 
            x="275" 
            y={Math.min(170, 175 - (pctHiperber * 1.5))} 
            fill="#fff" 
            fontSize="11" 
            fontWeight="bold" 
            textAnchor="middle"
          >
            {totalHiperber > 0 ? `${totalHiperber.toFixed(2)}€` : ''}
          </text>
          <text x="275" y="198" fill="hsl(var(--text-secondary))" fontSize="11" fontWeight="600" textAnchor="middle">
            Hiperber
          </text>
        </g>
      </svg>
    </div>
  );
}
