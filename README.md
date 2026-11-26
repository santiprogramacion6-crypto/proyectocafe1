# Laurentino | Sistema de Gestión para Cafetería

Sistema web full-stack para la gestión operativa de una cafetería. El frontend está desarrollado con **React 19**, **Vite** y **Tailwind CSS**, y utiliza **Supabase** como servicio de autenticación y acceso a PostgreSQL.

## Módulos implementados

### Autenticación

- Inicio de sesión con correo y contraseña mediante Supabase Auth.
- Persistencia y renovación automática de la sesión.
- Acceso al panel de gestión para usuarios autenticados y cierre de sesión.

### Productos

- Catálogo asociado a categorías y sus colores.
- Creación, edición y eliminación de productos.
- Filtro por categoría y control de disponibilidad.

### Mesas y zonas

- Alta de mesas y organización por sector: Salón, Deck y Mostrador.
- Filtros por zona e indicadores de estado: Libre, Ocupada y Cobrando.
- Cambio de estado y actualización de mesas ante cambios recibidos desde Supabase Realtime.

### Comandas

- Apertura de una comanda al seleccionar una mesa.
- Carga de productos disponibles, con nota opcional por ítem.
- Eliminación de ítems y recálculo del total a partir de los precios guardados.
- Cierre de la comanda y liberación de la mesa.

## Decisiones de Arquitectura y Seguridad

- **Seguridad a nivel de fila (RLS):** Implementación estricta de *Row Level Security* en Supabase para garantizar que solo los usuarios autenticados operen sobre el catálogo y las comandas.
- **Integridad Transaccional (Índice Único Parcial):** Para prevenir anomalías de concurrencia (como múltiples comandas abiertas simultáneamente para una misma mesa), se implementó un índice único parcial en PostgreSQL (`comandas_una_abierta_por_mesa_idx`), permitiendo un historial ilimitado de comandas cerradas pero estrictamente **una sola comanda activa por mesa**.

## Tecnologías

- **Frontend:** React 19, Vite, Tailwind CSS.
- **Backend y base de datos:** Supabase, PostgreSQL y Supabase Auth.
- **Calidad:** ESLint.
- **Control de versiones:** Git y GitHub.

## Requisitos

- Node.js y npm.
- Un proyecto de Supabase con autenticación por correo y contraseña habilitada.
- Las tablas `categorias`, `productos`, `mesas`, `comandas` y `detalle_comanda`, con columnas y permisos compatibles con los servicios de la aplicación.

## Instalación y configuración local

1. Cloná el repositorio e instalá las dependencias:

   ```bash
   npm install
   ```

2. Creá `.env.local` en la raíz del proyecto:

   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
   ```

   No incluyas una clave `service_role` en variables `VITE_*`. No compartas `.env.local` ni publiques sus valores.

3. Iniciá la aplicación:

   ```bash
   npm run dev
   ```

## Comandos disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera la compilación de producción
npm run preview   # Previsualiza la compilación
npm run lint      # Ejecuta ESLint
```

## Estructura principal

src/
├── services/           # Capa de servicios y consultas a Supabase
│   ├── productosService.js
│   └── comandasService.js
├── pages/              # Vistas principales de la aplicación
│   ├── ProductosPage.jsx
│   └── MesasPage.jsx
├── App.jsx             # Enrutamiento de vistas y control de sesión
├── supabaseClient.js   # Instancia y configuración del cliente Supabase
├── index.css           # Estilos base y configuración de Tailwind CSS
└── main.jsx            # Punto de entrada principal
