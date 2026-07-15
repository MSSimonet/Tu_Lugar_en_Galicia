/**
 * lib/admin/errors.ts — Error de validación de negocio para los repos de /lib/admin.
 *
 * Los repos (pipelineRepo, camposCustomRepo, etc.) la usan para señalar fallos de
 * validación de input (formato, longitud, duplicados) de forma distinguible de un fallo
 * real de infraestructura (Supabase caído, red, etc.). Los endpoints de /app/api/admin
 * capturan `ValidationError` para responder 400; cualquier otro Error cae a 500.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
