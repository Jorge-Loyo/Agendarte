# 👨‍⚕️ Formulario de Perfil Profesional - Setup

## 🎯 Funcionalidad Implementada

Se ha creado un formulario completo para que los profesionales puedan editar y actualizar su perfil desde `http://localhost:4200/app/professional-profile`.

## ✅ Características

### **Información Personal**
- ✅ Nombre y Apellido (requeridos)
- ✅ Email (solo lectura)
- ✅ Teléfono
- ✅ Fecha de Nacimiento
- ✅ Dirección completa

### **Información Profesional**
- ✅ Especialidad (requerida)
- ✅ Sub-especialidad
- ✅ Número de Matrícula
- ✅ Años de Experiencia
- ✅ Precio de Consulta
- ✅ Formación Académica
- ✅ Descripción Profesional (máx. 500 caracteres)

### **Imagen de Perfil**
- ✅ Subida de imagen
- ✅ Vista previa
- ✅ Conversión a Base64

### **Redes Sociales**
- ✅ Facebook
- ✅ Instagram
- ✅ LinkedIn
- ✅ TikTok
- ✅ Sitio Web

## 🚀 Cómo Usar

### 1. **Ejecutar Migración (si es necesario)**
```bash
cd backend
node migrate.js
```

### 2. **Iniciar Servicios**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
ng serve
```

### 3. **Acceder al Formulario**
1. Ir a `http://localhost:4200`
2. Iniciar sesión como profesional:
   - Email: `dr.garcia@agendarte.com`
   - Password: `Password123!`
3. Navegar a `http://localhost:4200/app/professional-profile`

### 4. **Probar Funcionalidad**
```bash
# Ejecutar test automatizado
node test-professional-profile.js
```

## 🔧 Archivos Modificados/Creados

### **Frontend**
- `src/app/components/professional-profile/professional-profile.component.html` - Formulario completo
- `src/app/components/professional-profile/professional-profile.component.ts` - Lógica del componente
- `src/app/components/professional-profile/professional-profile.component.css` - Estilos
- `src/app/services/auth.service.ts` - Método updateProfile corregido

### **Backend**
- `src/controllers/auth.controller.js` - Ya tenía updateProfile implementado
- `src/models/Professional.js` - Modelo con campos adicionales
- `migrate.js` - Migración para campos adicionales

## 📊 Base de Datos

Los datos se guardan en las siguientes tablas:

### **profiles** (información personal)
- first_name, last_name
- phone, address
- birth_date

### **professionals** (información profesional)
- specialty, subspecialty
- license_number
- experience
- education, bio
- consultation_price
- social_networks (JSON)
- profile_image (Base64)
- average_rating, total_reviews

## 🎨 Características de UI

- ✅ **Diseño Responsivo** - Se adapta a móviles
- ✅ **Validaciones en Tiempo Real** - Campos requeridos
- ✅ **Mensajes de Estado** - Success/Error
- ✅ **Loading States** - Indicadores de carga
- ✅ **Contador de Caracteres** - Para descripción
- ✅ **Vista Previa de Imagen** - Para foto de perfil
- ✅ **Estilos Modernos** - Gradientes y efectos

## 🔐 Seguridad

- ✅ **Autenticación JWT** - Token requerido
- ✅ **Validación de Roles** - Solo profesionales
- ✅ **Sanitización de Datos** - Trim y validaciones
- ✅ **Email Read-Only** - No se puede cambiar

## 🧪 Testing

### **Test Manual**
1. Llenar todos los campos
2. Subir una imagen
3. Hacer clic en "Guardar Cambios"
4. Verificar mensaje de éxito
5. Recargar página y verificar datos guardados

### **Test Automatizado**
```bash
node test-professional-profile.js
```

## 🐛 Troubleshooting

### **Error: "Token requerido"**
- Verificar que estés logueado como profesional
- Revisar que el token esté en localStorage

### **Error: "Profesional no encontrado"**
- Verificar que el usuario tenga rol 'professional'
- Ejecutar migración si es necesario

### **Error: "Campos requeridos"**
- Nombre y Apellido son obligatorios
- Especialidad es obligatoria

### **Imagen no se guarda**
- Verificar que sea un archivo de imagen válido
- Tamaño máximo recomendado: 2MB

## 📈 Próximas Mejoras

- [ ] Validación de URLs en redes sociales
- [ ] Compresión de imágenes
- [ ] Crop de imagen
- [ ] Integración con Google Calendar
- [ ] Exportar perfil a PDF

---

**✅ El formulario está completamente funcional y listo para usar**
