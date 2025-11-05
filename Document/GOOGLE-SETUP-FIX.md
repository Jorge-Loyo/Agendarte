# 🔧 Solución Error 403 Google OAuth

## Problema
Error 403: access_denied - La app no completó el proceso de verificación de Google

## Solución Rápida

### 1. Agregar Usuarios de Prueba
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. **APIs & Services** → **OAuth consent screen**
4. Scroll hasta **Test users**
5. Clic en **+ ADD USERS**
6. Agrega tu email: `tu-email@gmail.com`
7. **SAVE**

### 2. Verificar Configuración OAuth
- **Application type**: Web application
- **Authorized redirect URIs**: `http://localhost:3000/callback`
- **Scopes**: `https://www.googleapis.com/auth/calendar`

### 3. Reiniciar Aplicación
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm start
```

## Alternativa: Crear Nuevo Proyecto

Si persiste el error, crea un nuevo proyecto en Google Cloud Console:

1. **Nuevo Proyecto** → Nombre: "Agendarte-Dev"
2. **Habilitar APIs**: Google Calendar API
3. **Crear Credenciales** → OAuth 2.0 Client ID
4. **Configurar pantalla de consentimiento** como "External" + "Testing"
5. **Agregar usuarios de prueba**

## Variables de Entorno
Actualizar en `backend/.env`:
```env
GOOGLE_CLIENT_ID=tu_nuevo_client_id
GOOGLE_CLIENT_SECRET=tu_nuevo_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/callback
```

✅ **Después de estos pasos, Google Calendar debería funcionar correctamente**