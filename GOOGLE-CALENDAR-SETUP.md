# 📅 Google Calendar - Setup Completo

## ✅ Problemas Corregidos

1. **Tabla user_preferences creada** - Para almacenar tokens de Google
2. **Callback mejorado** - Mejor manejo de errores y logs
3. **Frontend actualizado** - Navegación en misma ventana y notificaciones
4. **Variables de entorno configuradas** - Credenciales de Google Calendar

## 🚀 Cómo Usar

### 1. **Iniciar Servicios**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
ng serve
```

### 2. **Conectar Google Calendar**
1. Ir a `http://localhost:4200`
2. Login como profesional:
   - Email: `jorgenayati@gmail.com`
   - Password: `Matris94`
3. Ir al Dashboard Profesional
4. Hacer clic en "Conectar Google Calendar"
5. Autorizar la aplicación en Google
6. Será redirigido de vuelta con confirmación

### 3. **Verificar Conexión**
- Aparecerá notificación de éxito
- Los tokens se guardan en la tabla `user_preferences`
- Los eventos se crearán automáticamente al agendar turnos

## 🔧 Configuración Técnica

### **Variables de Entorno (.env)**
```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/callback
```

### **Flujo de Autorización**
1. `GET /api/google-calendar/auth-url` - Obtiene URL de autorización
2. Usuario autoriza en Google
3. `GET /callback` - Procesa tokens y redirige
4. Tokens se guardan en BD

### **Creación de Eventos**
```javascript
// Al crear una cita, automáticamente se crea evento en Google Calendar
const eventData = {
  appointmentId: appointment.id,
  title: `Consulta - Paciente ID: ${patientId}`,
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  description: notes || 'Consulta médica'
};
```

## 🧪 Testing

### **Test Manual**
```bash
cd backend
node test-google-calendar.js
```

### **Test Completo**
1. Ejecutar test para obtener URL
2. Abrir URL en navegador
3. Autorizar aplicación
4. Verificar redirección exitosa
5. Crear una cita y verificar que aparece en Google Calendar

## 📊 Base de Datos

### **Tabla user_preferences**
```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  email_reminders BOOLEAN DEFAULT true,
  whatsapp_reminders BOOLEAN DEFAULT false,
  reminder_hours INTEGER DEFAULT 24,
  google_tokens TEXT,  -- Tokens de Google Calendar
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## 🔐 Seguridad

- Tokens se almacenan encriptados en BD
- Scope limitado solo a Calendar
- Refresh tokens para renovación automática
- Validación de estado en callback

## 🎉 Funcionalidades

### **Implementadas**
- ✅ Autorización OAuth2
- ✅ Almacenamiento de tokens
- ✅ Creación automática de eventos
- ✅ Manejo de errores
- ✅ Notificaciones de estado

### **Próximas**
- 📅 Sincronización bidireccional
- 🔄 Actualización de eventos existentes
- 📱 Recordatorios personalizados
- 📊 Múltiples calendarios

---

**✅ Google Calendar está completamente integrado y funcionando**

**🚀 Los profesionales pueden conectar sus calendarios y los turnos se sincronizan automáticamente**
