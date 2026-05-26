/**
 * Normaliza un producto devuelto por la API de Hiperber al formato estándar de la app.
 */
function normalizeProduct(item) {
  const priceData = item.priceData || {};
  const prices = priceData.prices || [];
  const priceObj = prices.find(p => p.id === 'PRICE') || prices[0] || {};
  const priceValue = priceObj.value || {};
  
  const precio = parseFloat(priceValue.centAmount) || 0;
  const precioKg = parseFloat(priceValue.centUnitAmount) || precio;
  
  // Mapeamos el tipo de formato de unidad (e.g. "KG", "LT", "UD")
  let formatoKg = 'kg';
  const unitType = (priceData.unitPriceUnitType || '').toLowerCase();
  if (unitType === 'lt' || unitType === 'l') {
    formatoKg = 'l';
  } else if (unitType === 'ud' || unitType === 'un') {
    formatoKg = 'ud';
  }

  // Nombre y marca
  const nombre = item.productData?.name || 'Producto Hiperber';
  const brand = item.productData?.brand?.name || 'Genérica';

  // Obtenemos la URL de la imagen (priorizando media[0] que tiene la extensión de archivo y case-sensitivity correctos)
  const image = (item.media && item.media[0] && item.media[0].url) || 
                item.productData?.imageURL || 
                `https://via.placeholder.com/150?text=Hiperber`;

  return {
    id: `hiperber-${item.id || Math.random().toString(36).substr(2, 9)}`,
    nombre: nombre,
    brand: brand,
    precio: precio,
    precio_kg: precioKg,
    formato_kg: formatoKg,
    imagen: image,
    supermercado: 'Hiperber'
  };
}

/**
 * Busca productos por nombre en la API de Hiperber.
 */
export async function searchProducts(query) {
  if (!query || query.trim() === '') return [];
  
  const cacheKey = `hiperber_search_v3_${query.trim().toLowerCase()}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      sessionStorage.removeItem(cacheKey);
    }
  }

  try {
    // La API de Hiperber tiene habilitado CORS (Access-Control-Allow-Origin: *),
    // por lo que podemos llamarla directamente sin usar proxies.
    const url = `https://tienda.hiperber.com/api/rest/V1.0/catalog/searcher/products?q=${encodeURIComponent(query.trim())}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error buscando productos en Hiperber: ${response.statusText}`);
    }
    
    const data = await response.json();
    const rawProducts = data.catalog?.products || [];
    
    // Filtramos productos que no tengan nombre
    const normalized = rawProducts
      .filter(item => item.productData?.name)
      .slice(0, 30) // Limitamos a 30 resultados para soportar carga progresiva
      .map(normalizeProduct);
      
    // Guardamos en caché de sesión
    sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
    
    return normalized;
  } catch (error) {
    console.error('Error in searchProducts Hiperber:', error);
    return [];
  }
}
