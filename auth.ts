import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import {
  segundosDeBloqueo,
  registrarFalloDeLogin,
  limpiarFallosDeLogin,
} from '@/lib/admin/loginAttempts'

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

        // Límite de intentos por CUENTA, además del rate limit por IP del route handler.
        // El de arriba se diluye con un ataque distribuido; este no, porque no depende de
        // ningún valor derivado de la red. Ver lib/admin/loginAttempts.ts.
        //
        // Fail-closed a propósito: si el contador no está disponible no se autentica a
        // nadie, igual que el route handler cuando faltan las variables de Upstash (A03).
        // Tampoco se distingue el motivo hacia afuera — bloqueado y contraseña incorrecta
        // devuelven lo mismo, para no confirmarle a un atacante que dio con la cuenta.
        try {
          if ((await segundosDeBloqueo(email)) > 0) return null

          const isValid = await compare(password, adminPasswordHash)
          if (!isValid) {
            await registrarFalloDeLogin(email)
            return null
          }

          await limpiarFallosDeLogin(email)
        } catch {
          return null
        }

        return { id: 'admin', email: adminEmail }
      },
    }),
  ],
})
