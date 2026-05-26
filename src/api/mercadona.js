const IS_DEV = import.meta.env.DEV;
const BASE_URL = IS_DEV ? '/mercadona-api' : '/api/mercadona';

/**
 * Genera una descripción legible del formato del producto (ej: "Bote 52 g", "Pack 6 x 250 ml").
 */
function getFormatDescription(item) {
  const packaging = item.packaging || '';
  const priceInfo = item.price_instructions || {};
  const unitSize = priceInfo.unit_size;
  const sizeFormat = priceInfo.size_format;
  const totalUnits = priceInfo.total_units;
  
  let sizeStr = '';
  if (unitSize !== undefined && unitSize !== null) {
    if (sizeFormat === 'kg') {
      if (unitSize < 1) {
        sizeStr = `${Math.round(unitSize * 1000)} g`;
      } else {
        sizeStr = `${unitSize} kg`;
      }
    } else if (sizeFormat === 'l') {
      if (unitSize < 1) {
        sizeStr = `${Math.round(unitSize * 1000)} ml`;
      } else {
        sizeStr = `${unitSize} l`;
      }
    } else {
      sizeStr = `${unitSize} ${sizeFormat || ''}`.trim();
    }
  }
  
  let parts = [];
  if (packaging) parts.push(packaging);
  
  if (totalUnits && totalUnits > 1) {
    parts.push(`${totalUnits} x ${sizeStr}`);
  } else if (sizeStr) {
    parts.push(sizeStr);
  }
  
  return parts.join(' ');
}

/**
 * Normaliza un producto devuelto por la API interna de Mercadona al formato estándar de la app.
 */
function normalizeProduct(item) {
  const priceInfo = item.price_instructions || {};
  
  return {
    id: `mercadona-${item.id || Math.random().toString(36).substr(2, 9)}`,
    nombre: item.display_name || item.name || 'Producto Hacendado',
    brand: item.brand || 'Hacendado',
    precio: parseFloat(priceInfo.unit_price) || 0,
    precio_kg: parseFloat(priceInfo.reference_price) || parseFloat(priceInfo.unit_price) || 0,
    formato_kg: priceInfo.reference_format || 'kg',
    imagen: item.thumbnail || 'https://via.placeholder.com/150?text=Mercadona',
    supermercado: 'Mercadona',
    formato: getFormatDescription(item)
  };
}

/**
 * Actualiza el código postal en la sesión de Mercadona.
 * Esto determina la disponibilidad de productos y los precios regionales.
 */
export async function changePostalCode(postalCode) {
  try {
    const url = `${BASE_URL}/postal-codes/actions/change-pc/`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_postal_code: postalCode })
    });
    
    if (!response.ok) {
      throw new Error(`Error cambiando código postal: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Obtenemos el almacén (warehouse) de la respuesta o del header
    const warehouse = data.warehouse || response.headers.get('x-customer-wh') || 'vlc1';
    sessionStorage.setItem('mercadona_warehouse', warehouse);
    
    // Limpiamos la caché de búsqueda de sessionStorage al cambiar de código postal
    // para forzar la recarga con precios del nuevo almacén.
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('mercadona_search_')) {
        sessionStorage.removeItem(key);
      }
    });

    return true;
  } catch (error) {
    console.error('Error in changePostalCode:', error);
    throw error;
  }
}

/**
 * Busca productos por nombre en Mercadona utilizando su índice público de Algolia.
 */
export async function searchProducts(query) {
  if (!query || query.trim() === '') return [];
  
  const cacheKey = `mercadona_search_${query.trim().toLowerCase()}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      sessionStorage.removeItem(cacheKey);
    }
  }

  try {
    const warehouse = sessionStorage.getItem('mercadona_warehouse') || 'vlc1';
    const url = `https://7UZJKL1DJ0-dsn.algolia.net/1/indexes/products_prod_${warehouse}_es/query`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-algolia-application-id': '7UZJKL1DJ0',
        'x-algolia-api-key': '9d8f2e39e90df472b4f2e559a116fe17',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        params: `query=${encodeURIComponent(query.trim())}&clickAnalytics=true&hitsPerPage=30`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error buscando productos en Mercadona via Algolia: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const rawProducts = data.hits || [];
    const normalized = rawProducts.map(normalizeProduct);
    
    // Guardamos en caché de sesión
    sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
    
    return normalized;
  } catch (error) {
    console.error('Error in searchProducts Mercadona:', error);
    // Retornamos un array vacío en caso de error para que la aplicación no explote
    return [];
  }
}
