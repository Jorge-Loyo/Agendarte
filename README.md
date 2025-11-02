# 🏥 Agendarte - Sistema de Gestión de Turnos

**Agendarte** es una plataforma web completa para la gestión de turnos médicos que conecta pacientes con profesionales de la salud de manera eficiente y segura.

## 🎯 Estado del Proyecto

**📊 Progreso Actual: 61.9% Completado**
- ✅ **10 HU Completadas** (144/234 puntos)
- 🔄 **1 HU Parcial** (HU-17)
- ❌ **10 HU Pendientes**

### 🚀 **MVP FUNCIONAL DISPONIBLE**
El sistema cuenta con todas las funcionalidades core para pacientes y profesionales:
- ✅ Registro y autenticación
- ✅ Gestión completa de turnos
- ✅ Pagos con Mercado Pago
- ✅ Recordatorios automáticos
- ✅ Calendarios avanzados

## 🏗️ Arquitectura del Sistema

```
Agendarte/
├── frontend/         # Angular 18 - Interfaz de usuario
│   ├── src/app/
│   │   ├── components/    # 15+ componentes implementados
│   │   ├── services/      # 8 servicios de API
│   │   └── guards/        # Autenticación y roles
├── backend/          # Node.js + Express - API REST
│   ├── src/
│   │   ├── controllers/   # 6 controladores
│   │   ├── models/        # 8 modelos Sequelize
│   │   ├── routes/        # 9 rutas de API
│   │   ├── services/      # Notificaciones y pagos
│   │   └── seeders/       # Datos de prueba
├── database/         # PostgreSQL - Esquemas
└── Document/         # Documentación y HU
```

## ✅ Funcionalidades Implementadas

### 🩺 **Para Pacientes (95% Completo)**
- ✅ **Registro y Login** (HU-01)
- ✅ **Búsqueda de Profesionales** con filtros (HU-02)
- ✅ **Calendario de Disponibilidad** (HU-03)
- ✅ **Gestión de Turnos** - Ver, cancelar, reprogramar (HU-05, HU-06)
- ✅ **Pagos con Mercado Pago** (HU-04)
- ✅ **Recordatorios** por email/WhatsApp (HU-07)

### 👨⚕️ **Para Profesionales (90% Completo)**
- ✅ **Configuración de Horarios** (HU-08)
- ✅ **Agenda Profesional** - Vistas día/semana/mes (HU-09)
- ✅ **Agendar para Pacientes** - Sin pago requerido (HU-10)

### 🔧 **Sistema (100% Completo)**
- ✅ **Autenticación JWT** con roles
- ✅ **Base de datos PostgreSQL** con seeders
- ✅ **API RESTful** completa
- ✅ **Notificaciones automáticas**
- ✅ **Interfaz responsive**

## 🛠️ Stack Tecnológico

### Frontend
- **Angular 18** - Framework principal
- **TypeScript** - Lenguaje de programación
- **CSS3** - Estilos responsive
- **RxJS** - Programación reactiva

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación
- **Mercado Pago SDK** - Pagos

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **8 modelos principales** con relaciones

## 📋 Instalación Rápida

### Prerrequisitos
- Node.js (v18+)
- PostgreSQL (v12+)
- Angular CLI

### 1. Clonar e Instalar
```bash
git clone https://github.com/Jorge-Loyo/Agendarte.git
cd Agendarte

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configurar Base de Datos
```bash
# Crear BD PostgreSQL
createdb agendarte

# Configurar .env en backend/
cp .env.example .env
# Editar con tus credenciales
```

### 3. Ejecutar
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && ng serve
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Usuarios de Prueba**:
  - Paciente: `paciente@agendarte.com` / `Password123!`
  - Profesional: `dr.garcia@agendarte.com` / `Password123!`

## 📊 Historias de Usuario

### ✅ **Completadas (10/21)**
- **HU-01**: Registro de Paciente
- **HU-02**: Ver Profesionales Disponibles  
- **HU-03**: Ver Calendario de Profesional
- **HU-04**: Pago con Mercado Pago
- **HU-05**: Ver Mis Turnos
- **HU-06**: Cancelar/Reprogramar Turnos
- **HU-07**: Recordatorios de Turnos
- **HU-08**: Configurar Horarios de Atención
- **HU-09**: Ver Agenda del Profesional
- **HU-10**: Agendar Turnos para Pacientes

### 🔄 **En Progreso (1/21)**
- **HU-17**: Crear Usuarios Master (60%)

### 🎯 **Próximas Prioridades**
- **HU-13**: Notas de Consulta
- **HU-11**: Historial de Paciente  
- **HU-12**: Cancelar/Reprogramar Profesional

## 🧪 Testing del Sistema

### Flujo Completo de Prueba
1. **Registro**: Crear cuenta de paciente
2. **Búsqueda**: Encontrar profesionales
3. **Agendado**: Reservar turno
4. **Pago**: Simular pago exitoso
5. **Gestión**: Ver, cancelar, reprogramar turnos
6. **Recordatorios**: Verificar notificaciones automáticas

## 🔐 Seguridad Implementada

- ✅ Autenticación JWT
- ✅ Encriptación bcrypt
- ✅ Validación de entrada
- ✅ Roles y permisos
- ✅ CORS configurado
- ✅ Sanitización de datos

## 🏆 Logros Destacados

1. **MVP Completamente Funcional**
2. **Sistema de Pagos Integrado**
3. **Recordatorios Automáticos**
4. **Calendarios Avanzados**
5. **Arquitectura Escalable**
6. **UX Optimizada**

## 📈 Roadmap

### **Corto Plazo**
- Completar notas de consulta
- Historial de pacientes
- Funcionalidades administrativas

### **Mediano Plazo**  
- Sistema de reseñas
- Reportes y analytics
- Notificaciones push

### **Largo Plazo**
- App móvil nativa
- Integración con sistemas hospitalarios
- IA para recomendaciones

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Documentación

- **Avance del Proyecto**: `/Document/Avance.md`
- **Historias de Usuario**: `/Document/HU/`
- **Planificación**: `/Document/Planificacion-Desarrollo.md`

---

**🚀 Sistema listo para producción con funcionalidades core implementadas**

**Desarrollado con ❤️ para revolucionar la gestión de turnos médicos**