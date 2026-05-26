export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse path and query
  const fullUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = fullUrl.pathname;
  const search = fullUrl.search;
  
  // Extract target path (e.g. /api/mercadona/search/ -> search/)
  const targetPath = pathname.replace(/^\/api\/mercadona\//, '');
  const targetUrl = `https://tienda.mercadona.es/api/${targetPath}${search}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': req.headers['content-type'] || 'application/json',
      }
    };

    // Forward Cookie header if present
    if (req.headers.cookie) {
      fetchOptions.headers['Cookie'] = req.headers.cookie;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Read body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);
      fetchOptions.body = body;
    }

    const targetRes = await fetch(targetUrl, fetchOptions);
    const contentType = targetRes.headers.get('content-type') || '';
    
    let data;
    if (contentType.includes('application/json')) {
      data = await targetRes.json();
      // Si es la acción de cambiar código postal, le añadimos el código del almacén obtenido del header
      if (pathname.includes('/postal-codes/actions/change-pc/')) {
        data.warehouse = targetRes.headers.get('x-customer-wh') || 'vlc1';
      }
    } else {
      data = await targetRes.text();
    }

    // Forward set-cookie headers (if standard response has getSetCookie, else custom headers map)
    let setCookies;
    if (typeof targetRes.headers.getSetCookie === 'function') {
      setCookies = targetRes.headers.getSetCookie();
    } else {
      // Fallback for older environments
      const rawCookieHeader = targetRes.headers.get('set-cookie');
      setCookies = rawCookieHeader ? [rawCookieHeader] : [];
    }

    if (setCookies && setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    }

    res.status(targetRes.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request', details: error.message });
  }
}
