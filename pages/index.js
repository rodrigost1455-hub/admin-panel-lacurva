import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const ML_APP_ID    = process.env.NEXT_PUBLIC_ML_APP_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_ML_REDIRECT_URI

function sbFetch(path, opts = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
      ...opts.headers,
    },
  })
}

const EMPTY_PRODUCT = {
  numero_parte: '', descripcion: '', categoria: '',
  precio_lista: '', stock_actual: '', imagen_url: '',
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const colors = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600' }
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${colors[type] || colors.info} text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium`}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

// ── Product Form Modal ────────────────────────────────────────────────────────

function ProductModal({ product, categorias, onSave, onClose }) {
  const [form, setForm] = useState(product || EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)
  const isNew = !product?.id

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      numero_parte: form.numero_parte,
      descripcion:  form.descripcion,
      categoria:    form.categoria,
      precio_lista: parseFloat(form.precio_lista) || 0,
      stock_actual: parseInt(form.stock_actual) || 0,
      imagen_url:   form.imagen_url || null,
    }
    const url = isNew ? '/api/producto' : `/api/producto?id=${product.id}`
    const method = isNew ? 'POST' : 'PATCH'
    const resp = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (resp.ok) onSave()
    else {
      const err = await resp.json()
      alert('Error: ' + (err.message || JSON.stringify(err)))
    }
  }

  const fields = [
    { name: 'numero_parte', label: 'Número de Parte', required: true, placeholder: 'Ej: F4HZ-9E527-AA' },
    { name: 'descripcion',  label: 'Descripción',     required: true, placeholder: 'Ej: Bomba de agua Motor 3406' },
    { name: 'precio_lista', label: 'Precio (MXN)',     required: true, type: 'number', placeholder: '0.00' },
    { name: 'stock_actual', label: 'Stock disponible', required: true, type: 'number', placeholder: '0' },
    { name: 'imagen_url',   label: 'URL de imagen',   placeholder: 'https://...' },
  ]

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">{isNew ? '➕ Nuevo Producto' : '✏️ Editar Producto'}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-xs text-zinc-400 mb-1 font-medium uppercase tracking-wider">{f.label}{f.required && ' *'}</label>
              <input
                name={f.name}
                type={f.type || 'text'}
                value={form[f.name] || ''}
                onChange={handleChange}
                required={f.required}
                placeholder={f.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>
          ))}

          {/* Categoría */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium uppercase tracking-wider">Categoría</label>
            <input
              name="categoria"
              list="categorias-list"
              value={form.categoria || ''}
              onChange={handleChange}
              placeholder="Ej: Motor, Suspensión..."
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <datalist id="categorias-list">
              {categorias.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Preview imagen */}
          {form.imagen_url && (
            <div className="rounded-xl overflow-hidden border border-zinc-700 h-32 bg-zinc-800">
              <img src={form.imagen_url} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : isNew ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [products, setProducts]     = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [modal, setModal]           = useState(null) // null | 'new' | product object
  const [toast, setToast]           = useState(null)
  const [stats, setStats]           = useState({ total: 0, sinStock: 0, enML: 0 })
  const [publishing, setPublishing] = useState({}) // { [id]: true }
  const [mlConnected, setMlConnected] = useState(false)
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const LIMIT = 50

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
  }

  // ── Cargar productos ────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const offset = (page - 1) * LIMIT
    let url = `productos?select=*&order=descripcion.asc&limit=${LIMIT}&offset=${offset}`
    if (search) url += `&or=(numero_parte.ilike.*${encodeURIComponent(search)}*,descripcion.ilike.*${encodeURIComponent(search)}*)`
    if (catFilter) url += `&categoria=eq.${encodeURIComponent(catFilter)}`

    const resp = await sbFetch(url)
    const data = await resp.json()
    const count = parseInt(resp.headers.get('Content-Range')?.split('/')[1] || '0')
    setProducts(Array.isArray(data) ? data : [])
    setTotal(count)
    setLoading(false)
  }, [search, catFilter, page])

  useEffect(() => { loadProducts() }, [loadProducts])

  // ── Cargar categorías y stats ───────────────────────────────────────────────

  useEffect(() => {
    sbFetch('productos?select=categoria&not.categoria=is.null&order=categoria.asc', { headers: { Prefer: '' } })
      .then(r => r.json())
      .then(rows => setCategorias([...new Set(rows.map(r => r.categoria).filter(Boolean))]))

    // Stats
    Promise.all([
      sbFetch('productos?select=id'),
      sbFetch('productos?select=id&stock_actual=eq.0'),
      sbFetch('productos?select=id&not.ml_item_id=is.null'),
    ]).then(([a, b, c]) => {
      setStats({
        total:    parseInt(a.headers.get('Content-Range')?.split('/')[1] || '0'),
        sinStock: parseInt(b.headers.get('Content-Range')?.split('/')[1] || '0'),
        enML:     parseInt(c.headers.get('Content-Range')?.split('/')[1] || '0'),
      })
    })
  }, [products])

  // ── Detectar conexión ML desde URL ─────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('ml_connected')) {
      setMlConnected(true)
      showToast('¡Mercado Libre conectado correctamente!', 'success')
      window.history.replaceState({}, '', '/')
    }
    if (params.get('ml_error')) {
      showToast('Error al conectar ML: ' + params.get('ml_error'), 'error')
      window.history.replaceState({}, '', '/')
    }
    // Verificar si ya hay sesión
    fetch('/api/ml-status').then(r => r.json()).then(d => setMlConnected(d.connected))
  }, [])

  // ── Publicar en ML ──────────────────────────────────────────────────────────

  async function handlePublish(product) {
    if (!mlConnected) {
      showToast('Primero conecta tu cuenta de Mercado Libre', 'error')
      return
    }
    setPublishing(p => ({ ...p, [product.id]: true }))
    try {
      const resp = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await resp.json()
      if (data.success) {
        showToast(`✅ Publicado en ML: ${data.mlItemId}`, 'success')
        loadProducts()
      } else {
        showToast('Error: ' + data.error, 'error')
      }
    } catch (e) {
      showToast('Error de red: ' + e.message, 'error')
    }
    setPublishing(p => ({ ...p, [product.id]: false }))
  }

  // ── Eliminar ────────────────────────────────────────────────────────────────

  async function handleDelete(product) {
    if (!confirm(`¿Eliminar "${product.descripcion}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/producto?id=${product.id}`, { method: 'DELETE' })
    showToast('Producto eliminado', 'success')
    loadProducts()
  }

  // ── Conectar ML ─────────────────────────────────────────────────────────────

  function connectML() {
    const url =
      `https://auth.mercadolibre.com.mx/authorization` +
      `?response_type=code` +
      `&client_id=${ML_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    window.location.href = url
  }

  const totalPages = Math.ceil(total / LIMIT)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Panel Admin — Tractopartes La Curva</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── HEADER ── */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
                🚛 Tractopartes La Curva
                <span className="text-amber-400 ml-2">Admin</span>
              </h1>
              <p className="text-zinc-500 text-xs">Panel de gestión de inventario</p>
            </div>

            {/* ML Connect Button */}
            {mlConnected ? (
              <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-semibold">Mercado Libre conectado</span>
              </div>
            ) : (
              <button onClick={connectML} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                🔗 Conectar Mercado Libre
              </button>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* ── STATS ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total productos', value: stats.total, color: 'text-white' },
              { label: 'Sin stock',       value: stats.sinStock, color: 'text-red-400' },
              { label: 'En Mercado Libre', value: stats.enML, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{s.value.toLocaleString()}</p>
                <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── TOOLBAR ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
              <input
                type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por número de parte o descripción..."
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            {/* Category filter */}
            <select
              value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* New product button */}
            <button
              onClick={() => setModal('new')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              ➕ Nuevo Producto
            </button>
          </div>

          {/* ── TABLE ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Imagen</th>
                    <th className="text-left px-4 py-3">N° Parte</th>
                    <th className="text-left px-4 py-3">Descripción</th>
                    <th className="text-left px-4 py-3">Categoría</th>
                    <th className="text-right px-4 py-3">Precio</th>
                    <th className="text-center px-4 py-3">Stock</th>
                    <th className="text-center px-4 py-3">ML</th>
                    <th className="text-center px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 animate-pulse">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-zinc-800 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-16 text-zinc-600">No se encontraron productos</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      {/* Image */}
                      <td className="px-4 py-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          {p.imagen_url
                            ? <img src={p.imagen_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                            : <div className="w-full h-full flex items-center justify-center text-zinc-700 text-lg">📦</div>
                          }
                        </div>
                      </td>

                      {/* Numero parte */}
                      <td className="px-4 py-2">
                        <span className="font-mono text-amber-400 font-semibold text-xs">{p.numero_parte}</span>
                      </td>

                      {/* Descripcion */}
                      <td className="px-4 py-2 max-w-[220px]">
                        <span className="text-zinc-200 line-clamp-2 text-xs">{p.descripcion}</span>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-2">
                        <span className="text-zinc-500 text-xs">{p.categoria || '—'}</span>
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-2 text-right">
                        <span className="text-white font-bold text-xs">
                          ${Number(p.precio_lista || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          p.stock_actual === 0 ? 'text-red-400 bg-red-900/30' :
                          p.stock_actual <= 5  ? 'text-amber-400 bg-amber-900/30' :
                          'text-emerald-400 bg-emerald-900/30'
                        }`}>
                          {p.stock_actual || 0}
                        </span>
                      </td>

                      {/* ML Status */}
                      <td className="px-4 py-2 text-center">
                        {p.ml_item_id ? (
                          <a href={p.ml_permalink} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-mono"
                          >
                            {p.ml_item_id}
                          </a>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setModal(p)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title="Editar"
                          >✏️</button>

                          {!p.ml_item_id && (
                            <button
                              onClick={() => handlePublish(p)}
                              disabled={publishing[p.id] || !mlConnected}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 transition-colors disabled:opacity-30"
                              title="Publicar en Mercado Libre"
                            >
                              {publishing[p.id] ? '⏳' : '🛒'}
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(p)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 transition-colors"
                            title="Eliminar"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs">
                  Mostrando {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} de {total.toLocaleString()} productos
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-700 transition-colors">
                    ← Anterior
                  </button>
                  <span className="px-3 py-1.5 text-xs text-zinc-400">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-700 transition-colors">
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL ── */}
        {modal && (
          <ProductModal
            product={modal === 'new' ? null : modal}
            categorias={categorias}
            onSave={() => { setModal(null); loadProducts(); showToast(modal === 'new' ? 'Producto creado' : 'Producto actualizado') }}
            onClose={() => setModal(null)}
          />
        )}

        {/* ── TOAST ── */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  )
}
