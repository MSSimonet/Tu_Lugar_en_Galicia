import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

// Sesión de admin: 12 horas. Es un panel interno de un solo usuario (Silvana),
// no hace falta la duración larga de un producto consumer.
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Vercel expone el deploy en varias URLs (producción + previews) — Auth.js
  // ya detecta VERCEL=1 y confía en el host automáticamente, pero lo dejamos
  // explícito para que también funcione en despliegues previos/manuales.
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

        // Fail-closed: si las variables de entorno no están configuradas,
        // no se autentica a nadie — no se loguea el motivo con detalle.
        if (!adminEmail || !adminPasswordHash) return null

        const email = credentials?.email
        const password = credentials?.password
        if (typeof email !== 'string' || typeof password !== 'string') return null
        if (email !== adminEmail) return null

        const isValid = await compare(password, adminPasswordHash)
        if (!isValid) return null

        return { id: 'admin', email: adminEmail }
      },
    }),
  ],
})
