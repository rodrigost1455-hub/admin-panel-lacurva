// pages/api/ml-callback.js
import { exchangeCode } from '../../lib/ml'

export default async function handler(req, res) {
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect('/?ml_error=acceso_denegado')
  }

  try {
    const tokenData = await exchangeCode(code)

    if (tokenData.error) {
      return res.redirect(`/?ml_error=${tokenData.error}`)
    }

    // Guardar tokens en cookies seguras (HttpOnly)
    const maxAge = 60 * 60 * 24 * 30 // 30 días
    res.setHeader('Set-Cookie', [
      `ml_access_token=${tokenData.access_token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
      `ml_refresh_token=${tokenData.refresh_token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
      `ml_user_id=${tokenData.user_id}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`,
    ])

    res.redirect('/?ml_connected=true')
  } catch (err) {
    res.redirect(`/?ml_error=${encodeURIComponent(err.message)}`)
  }
}
