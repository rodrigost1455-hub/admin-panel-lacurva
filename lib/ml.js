// lib/ml.js
const ML_API = 'https://api.mercadolibre.com'
const APP_ID = process.env.ML_APP_ID
const SECRET_KEY = process.env.ML_SECRET_KEY
const REDIRECT_URI = process.env.ML_REDIRECT_URI // Tu URL de Vercel + /api/ml-callback

export function getAuthUrl() {
  return (
    `https://auth.mercadolibre.com.mx/authorization` +
    `?response_type=code` +
    `&client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
  )
}

export async function exchangeCode(code) {
  const resp = await fetch(`${ML_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: APP_ID,
      client_secret: SECRET_KEY,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })
  return resp.json()
}

export async function refreshToken(refresh_token) {
  const resp = await fetch(`${ML_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: APP_ID,
      client_secret: SECRET_KEY,
      refresh_token,
    }),
  })
  return resp.json()
}

export async function publishItem(token, product) {
  const title = `${product.descripcion} ${product.numero_parte}`.slice(0, 60).trim()

  const pictures = product.imagen_url
    ? [{ source: product.imagen_url }]
    : [{ source: 'https://http2.mlstatic.com/D_NQ_NP_placeholder.jpg' }]

  const payload = {
    title,
    category_id: process.env.ML_DEFAULT_CATEGORY || 'MLM1747',
    price: parseFloat(product.precio_lista || 0),
    currency_id: 'MXN',
    available_quantity: Math.max(0, parseInt(product.stock_actual || 0)),
    buying_mode: 'buy_it_now',
    condition: 'new',
    listing_type_id: process.env.ML_LISTING_TYPE || 'free',
    pictures,
    attributes: [
      { id: 'BRAND', value_name: product.categoria || 'Genérico' },
      { id: 'PART_NUMBER', value_name: product.numero_parte || '' },
    ],
    description: {
      plain_text:
        `Número de parte: ${product.numero_parte}\n` +
        `Categoría: ${product.categoria || 'N/A'}\n\n` +
        `Refacción para tractocamión. Verificamos compatibilidad antes del envío.`,
    },
    warranty: '3 meses de garantía del vendedor',
    sale_terms: [
      { id: 'WARRANTY_TYPE', value_name: 'Garantía del vendedor' },
      { id: 'WARRANTY_TIME', value_name: '3 meses' },
    ],
    shipping: { mode: 'me2', local_pick_up: true, free_shipping: false },
  }

  const resp = await fetch(`${ML_API}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await resp.json()
  if (resp.status !== 201) throw new Error(data.message || JSON.stringify(data))
  return data
}

export async function updateItemStock(token, mlItemId, stock) {
  const updates = { available_quantity: stock }
  if (stock === 0) updates.status = 'paused'

  const resp = await fetch(`${ML_API}/items/${mlItemId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return resp.json()
}
