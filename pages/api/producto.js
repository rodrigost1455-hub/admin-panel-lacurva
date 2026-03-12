// pages/api/producto.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

export default async function handler(req, res) {
  const { id } = req.query

  // CREAR
  if (req.method === 'POST') {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/productos`, {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    return res.status(resp.ok ? 201 : 400).json(data)
  }

  // ACTUALIZAR
  if (req.method === 'PATCH') {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
      method: 'PATCH',
      headers: sbHeaders(),
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    return res.status(resp.ok ? 200 : 400).json(data)
  }

  // ELIMINAR
  if (req.method === 'DELETE') {
    await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
      method: 'DELETE',
      headers: sbHeaders(),
    })
    return res.status(204).end()
  }

  res.status(405).end()
}
