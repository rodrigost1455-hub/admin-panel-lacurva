// pages/api/ml-status.js
function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, decodeURIComponent(v.join('='))]
    })
  )
}

export default function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie)
  res.json({ connected: !!cookies.ml_access_token })
}
