# 🚛 Panel Admin — Tractopartes La Curva

Panel de administración web para gestionar inventario y publicar en Mercado Libre.
No requiere conocimientos técnicos para usarlo.

---

## 🚀 Deploy en Vercel (5 minutos)

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "Panel admin tractopartes"
git remote add origin https://github.com/TU_USUARIO/tractopartes-admin.git
git push -u origin main
```

### 2. Conecta con Vercel

1. Ve a vercel.com → New Project
2. Importa el repo de GitHub
3. Vercel detecta Next.js automáticamente → Deploy

### 3. Agrega las variables de entorno en Vercel

Vercel → Tu proyecto → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://reaiwdetcojuaajpuyyx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon key (empieza con eyJ...) |
| `SUPABASE_SERVICE_KEY` | tu service_role key |
| `NEXT_PUBLIC_ML_APP_ID` | 4666949587335001 |
| `ML_APP_ID` | 4666949587335001 |
| `ML_SECRET_KEY` | tu secret key de ML |
| `NEXT_PUBLIC_ML_REDIRECT_URI` | https://TU-APP.vercel.app/api/ml-callback |
| `ML_REDIRECT_URI` | https://TU-APP.vercel.app/api/ml-callback |
| `ML_DEFAULT_CATEGORY` | MLM1747 |
| `ML_LISTING_TYPE` | free |

### 4. Actualiza el Redirect URI en Mercado Libre

1. Ve a developers.mercadolibre.com.mx → tu app
2. Agrega este Redirect URI:
   ```
   https://TU-APP.vercel.app/api/ml-callback
   ```
3. Guarda

### 5. Redeploy en Vercel

Vercel → tu proyecto → Deployments → Redeploy

---

## 🖥️ Cómo usar el panel

### Conectar Mercado Libre
1. Clic en el botón amarillo **"Conectar Mercado Libre"**
2. Inicia sesión con tu cuenta de vendedor
3. Acepta los permisos
4. Vuelves al panel con ML conectado ✅

### Agregar un producto
1. Clic en **"➕ Nuevo Producto"**
2. Llena el formulario
3. Clic en **"Crear Producto"**

### Editar un producto
- Clic en el botón ✏️ en la fila del producto

### Publicar en Mercado Libre
- Clic en el botón 🛒 en la fila del producto
- Solo aparece si el producto NO está publicado todavía
- Requiere tener ML conectado

### Eliminar un producto
- Clic en el botón 🗑️ → confirmar

---

## 📊 Qué muestra el panel

- **Total productos** — todos en el inventario
- **Sin stock** — productos con stock = 0
- **En Mercado Libre** — productos ya publicados

La tabla muestra imagen, número de parte, descripción, categoría, precio, stock y estado en ML.
