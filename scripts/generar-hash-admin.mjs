// Uso: node scripts/generar-hash-admin.mjs "tu-password-nueva"
// Pegar el hash resultante en ADMIN_PASSWORD_HASH (.env.local y Vercel).

import { hash } from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Uso: node scripts/generar-hash-admin.mjs "tu-password-nueva"')
  process.exit(1)
}

const hashed = await hash(password, 12)
console.log(hashed)
