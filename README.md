# Municyl (Vercel)

Proyecto adaptado para funcionar íntegramente en **Vercel**:
- Frontend Vite (en `client/`).
- Endpoints `/api/*` como **Funciones Serverless** (sin Express).

## Despliegue en Vercel

1. Sube este repo a GitHub.
2. En Vercel → *New Project* → importa el repo.
3. Framework: **Vite**.
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Deploy.

Las rutas de SPA están cubiertas por `vercel.json`. El front llama a `/api/*` igual que antes.

## Desarrollo local

- Front: `npm run dev` (Vite en http://localhost:5173)
- API local: usa `vercel dev` si quieres simular funciones.

