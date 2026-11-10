# Laurentino

Sistema web de gestión para una cafetería, desarrollado con React y Vite.

## Estado actual

La primera etapa incluye:

- Inicio de sesión con Supabase Auth.
- Persistencia y renovación automática de la sesión.
- Panel inicial para usuarios autenticados.
- Cierre de sesión.

Los siguientes módulos previstos son la gestión de productos, mesas y comandas persistidas en Supabase.

## Tecnologías

- React 19
- Vite
- Tailwind CSS
- Supabase

## Requisitos

- Node.js
- Una instancia de Supabase configurada con autenticación por correo y contraseña.

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env.local` en la raíz del proyecto:

   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
   ```

   No compartas este archivo ni publiques sus valores. `.env.local` debe permanecer fuera del control de versiones.

## Comandos

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera la compilación de producción
npm run preview   # Previsualiza la compilación
npm run lint      # Ejecuta ESLint
```

## Estructura principal

```text
src/
├── App.jsx             # Autenticación y panel inicial
├── supabaseClient.js   # Cliente de Supabase
├── index.css           # Estilos base y Tailwind
└── main.jsx            # Punto de entrada de la aplicación
```

## Identidad visual

El proyecto utiliza una interfaz en español con una paleta inspirada en cafeterías. El nombre visible de la aplicación es **Laurentino**.
