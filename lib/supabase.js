// lib/supabase.js
// Conexión a Supabase via REST puro — sin librería, sin problemas de compatibilidad

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY

function headers(useService = false) {
  const key = useService ? SUPABASE_SERVICE : SUPABASE_ANON
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }
}

export async function getProductos({ search = '', categoria = '', page = 1, limit = 50 } = {}) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let url = `${SUPABASE_URL}/rest/v1/productos?select=*&order=descripcion.asc&limit=${limit}&offset=${from}`

  if (search) {
    url += `&or=(numero_parte.ilike.*${encodeURIComponent(search)}*,descripcion.ilike.*${encodeURIComponent(search)}`
    url += `*)`
  }
  if (categoria) {
    url += `&categoria=eq.${encodeURIComponent(categoria)}`
  }

  const resp = await fetch(url, {
    headers: { ...headers(), 'Prefer': 'count=exact' },
  })
  const total = parseInt(resp.headers.get('Content-Range')?.split('/')[1] || '0')
  const data = await resp.json()
  return { data, total }
}

export async function getCategorias() {
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/productos?select=categoria&not.categoria=is.null&order=categoria.asc`,
    { headers: headers() }
  )
  const rows = await resp.json()
  return [...new Set(rows.map(r => r.categoria).filter(Boolean))]
}

export async function createProducto(data) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/productos`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(data),
  })
  return resp.json()
}

export async function updateProducto(id, data) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify(data),
  })
  return resp.json()
}

export async function deleteProducto(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
    method: 'DELETE',
    headers: headers(true),
  })
}

export async function getStats() {
  const [total, sinStock, enML] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/productos?select=id`, { headers: { ...headers(), 'Prefer': 'count=exact' } }),
    fetch(`${SUPABASE_URL}/rest/v1/productos?select=id&stock_actual=eq.0`, { headers: { ...headers(), 'Prefer': 'count=exact' } }),
    fetch(`${SUPABASE_URL}/rest/v1/productos?select=id&not.ml_item_id=is.null`, { headers: { ...headers(), 'Prefer': 'count=exact' } }),
  ])
  return {
    total: parseInt(total.headers.get('Content-Range')?.split('/')[1] || '0'),
    sinStock: parseInt(sinStock.headers.get('Content-Range')?.split('/')[1] || '0'),
    enML: parseInt(enML.headers.get('Content-Range')?.split('/')[1] || '0'),
  }
}
