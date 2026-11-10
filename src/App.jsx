import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('El correo o la contraseña no son correctos.')
    }

    setIsSubmitting(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Laurentino
          </p>
          <h1 className="text-3xl font-bold text-amber-950">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-500">
            Accede al sistema de gestión de tu cafetería.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Correo electrónico
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Contraseña
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-amber-800 px-4 py-3 font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </section>
    </main>
  )
}

function Dashboard({ user }) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Laurentino
            </p>
            <h1 className="text-xl font-bold text-slate-900">Panel de gestión</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">{user.email}</span>
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Primera etapa lista
          </p>
          <h2 className="mt-2 text-3xl font-bold text-amber-950">
            Tu sesión permanecerá activa
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Supabase guarda la sesión y la renueva automáticamente. El siguiente módulo será
            la gestión de productos, mesas y comandas persistidas en la base de datos.
          </p>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (isMounted) {
        setSession(currentSession)
        setIsLoading(false)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setIsLoading(false)
      },
    )

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-amber-50 text-amber-900">
        Cargando sesión...
      </main>
    )
  }

  return session ? <Dashboard user={session.user} /> : <LoginForm />
}

export default App