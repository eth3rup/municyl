
# Municyl — Vercel Only

Proyecto adaptado para ejecutarse íntegramente en Vercel:

- Frontend Vite en la raíz (build a `dist/`).
- Funciones Serverless en `/api/*` que reemplazan el Express original.
- Datos locales en `/data/*`.
- Código compartido reutilizado en `api/_lib/*` y `shared/*`.

## Despliegue

1. Sube este repo a GitHub.
2. En Vercel: New Project → importa el repo.
3. Ajustes:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: (raíz del repo)
4. Deploy.

