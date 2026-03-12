// pages/api/publish.js
import { publishItem, refreshToken } from '../../lib/ml'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

async function updateSupabase(id, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}

async function getProduct(id) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}&select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  const data = await resp.json()
  return data[0]
}

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { productId } = req.body
  if (!productId) return res.status(400).json({ error: 'Falta productId' })

  const cookies = parseCookies(req.headers.cookie)
  let token = cookies.ml_access_token
  const refreshTok = cookies.ml_refresh_token

  if (!token) {
    return res.status(401).json({ error: 'No conectado a Mercado Libre' })
  }

  try {
    const product = await getProduct(productId)
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

    // Intentar publicar, si falla por token vencido, renovar
    let mlItem
    try {
      mlItem = await publishItem(token, product)
    } catch (err) {
      if (err.message?.includes('invalid_token') && refreshTok) {
        const newTokens = await refreshToken(refreshTok)
        token = newTokens.access_token
        mlItem = await publishItem(token, product)
      } else {
        throw err
      }
    }

    // Guardar en Supabase
    await updateSupabase(productId, {
      ml_item_id: mlItem.id,
      ml_permalink: mlItem.permalink,
      ml_status: mlItem.status,
    })

    res.json({ success: true, mlItemId: mlItem.id, permalink: mlItem.permalink })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
