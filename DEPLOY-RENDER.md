# Guía de Deployment en Render

## 📋 Pasos para Desplegar

### 1. Backend + Base de Datos

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en "New +" → "PostgreSQL"
   - Name: `agendarte-db`
   - Database: `agendarte`
   - User: `agendarte`
   - Region: Oregon (más cercano a Latinoamérica)
   - Plan: Free
   - Click "Create Database"

3. Click en "New +" → "Web Service"
   - Connect tu repositorio de GitHub
   - Name: `agendarte-backend`
   - Region: Oregon
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. En "Environment Variables" agrega:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (copiar de la base de datos creada en paso 2)
   - `JWT_SECRET` = (generar uno aleatorio, ej: `tu_jwt_secret_super_seguro_123`)
   - `PORT` = `10000`
   - `MASTER_EMAIL` = `jorgenayati@gmail.com`

5. Click "Create Web Service"

### 2. Frontend

1. Click en "New +" → "Static Site"
   - Connect tu repositorio de GitHub
   - Name: `agendarte-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist/frontend/browser`
   - Plan: Free

2. Click "Create Static Site"

### 3. Actualizar URL del Backend

Una vez que el backend esté desplegado:

1. Copia la URL del backend (ej: `https://agendarte-backend.onrender.com`)
2. Edita `frontend/src/environments/environment.prod.ts`:
   ```typescript
   apiUrl: 'https://TU-BACKEND-URL.onrender.com/api'
   ```
3. Haz commit y push para que se redespliegue el frontend

### 4. Configurar CORS en Backend

Edita `backend/src/app.js` y agrega la URL del frontend en CORS:
```javascript
const allowedOrigins = [
  'http://localhost:4200',
  'https://agendarte-frontend.onrender.com'
];
```

## ⚠️ Notas Importantes

- **Base de datos gratuita**: Expira después de 90 días. Puedes crear una nueva.
- **Backend se duerme**: Después de 15 min de inactividad tarda ~30 seg en despertar.
- **Primera carga lenta**: El primer request puede tardar hasta 50 segundos.
- **Variables de entorno**: No subas el `.env` al repositorio.

## 🔧 Comandos Útiles

Ver logs del backend:
```bash
# En el dashboard de Render, click en "Logs"
```

Reiniciar servicio:
```bash
# En el dashboard, click en "Manual Deploy" → "Clear build cache & deploy"
```

## 📝 URLs Finales

- Frontend: `https://agendarte-frontend.onrender.com`
- Backend: `https://agendarte-backend.onrender.com`
- API: `https://agendarte-backend.onrender.com/api`
