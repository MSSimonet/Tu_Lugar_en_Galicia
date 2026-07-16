'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

// Pantalla utilitaria de login para el panel /admin — un solo usuario
// (Silvana), sin cara al público. No aplica design system ni voz de marca.
export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl')
  const callbackUrl =
    rawCallbackUrl && rawCallbackUrl.startsWith('/admin') ? rawCallbackUrl : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result || result.error) {
      setError('Email o contraseña incorrectos.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-niebla)',
        padding: '24px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-blanco)',
          border: '1px solid var(--color-arena)',
          borderRadius: '8px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <h1
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-laton-text)',
            fontFamily: 'var(--font-ui)',
            marginBottom: '20px',
          }}
        >
          Tu Lugar en Galicia — Admin
        </h1>

        <label
          htmlFor="admin-email"
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--color-pizarra)',
            fontFamily: 'var(--font-ui)',
            marginBottom: '4px',
          }}
        >
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            marginBottom: '16px',
            border: '1px solid var(--color-arena)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'var(--font-ui)',
          }}
        />

        <label
          htmlFor="admin-password"
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--color-pizarra)',
            fontFamily: 'var(--font-ui)',
            marginBottom: '4px',
          }}
        >
          Contraseña
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            marginBottom: '20px',
            border: '1px solid var(--color-arena)',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'var(--font-ui)',
          }}
        />

        {error && (
          <p
            role="alert"
            style={{
              fontSize: '13px',
              color: 'var(--color-estado-error)',
              fontFamily: 'var(--font-ui)',
              marginBottom: '16px',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton-borde)]"
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            background: 'var(--color-granito)',
            color: 'var(--color-blanco)',
            fontSize: '14px',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
