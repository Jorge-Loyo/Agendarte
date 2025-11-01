# 🏥 Agendarte - Sistema de Gestión de Turnos

**Agendarte** es una plataforma web completa para la gestión de turnos médicos que conecta pacientes con profesionales de la salud de manera eficiente y segura.

## 🚀 Características Principales

- **👥 Multi-usuario**: Pacientes, Profesionales, Administrativos y Master
- **📅 Gestión de Turnos**: Agendado, cancelación y reprogramación
- **💳 Pagos Integrados**: Mercado Pago para confirmación de turnos
- **⭐ Sistema de Reseñas**: Calificaciones y comentarios post-consulta
- **📱 Responsive**: Optimizado para dispositivos móviles y desktop
- **🔔 Recordatorios**: Notificaciones automáticas por email/SMS
- **📊 Reportes**: Analytics y métricas para administrativos

## 🏗️ Arquitectura del Sistema

```
Agendarte/
├── frontend/         # Angular 20 - Interfaz de usuario
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── assets/
│   ├── angular.json
│   └── package.json
├── backend/          # Node.js + Express - API REST
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│   └── package.json
├── database/         # MySQL - Esquemas y datos
│   └── schema.sql
├── HU/              # Historias de Usuario (21 archivos)
│   ├── HU-01-Registro-Paciente.md
│   ├── HU-02-Ver-Profesionales.md
│   └── ...
└── README.md
```

## 👥 Roles del Sistema

### 🩺 **Pacientes**
- Registro y gestión de perfil
- Búsqueda y selección de profesionales
- Agendado de turnos con pago
- Historial de consultas
- Sistema de reseñas

### 👨‍⚕️ **Profesionales**
- Configuración de horarios de atención
- Gestión de agenda personal
- Historial de pacientes
- Notas de consulta
- Visualización de reseñas

### 🏢 **Administrativos**
- Gestión completa de turnos
- Registro de nuevos pacientes
- Reportes y métricas
- Soporte general

### ⚙️ **Master/Desarrollador**
- Creación de usuarios del sistema
- Gestión de roles y permisos
- Configuración del sistema

## 🛠️ Stack Tecnológico

### Frontend
- **Angular 20** - Framework principal
- **TypeScript** - Lenguaje de programación
- **CSS3** - Estilos y responsive design
- **RxJS** - Programación reactiva

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **JWT** - Autenticación y autorización
- **Mercado Pago SDK** - Procesamiento de pagos

### Base de Datos
- **MySQL** - Base de datos relacional
- **8 tablas principales** con relaciones optimizadas

## 📋 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MySQL (v8 o superior)
- Angular CLI
- Cuenta de Mercado Pago (para pagos)

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Agendarte
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de BD y Mercado Pago
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE agendarte;

# Importar esquema
mysql -u root -p agendarte < database/schema.sql
```

### 4. Configurar Frontend
```bash
cd frontend
npm install
```

## 🚀 Ejecución

### Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
ng serve
```

### Producción
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
ng build --prod
```

## 📱 URLs de Acceso

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Documentación API**: http://localhost:3000/api-docs

## 🧪 Testing

```bash
# Frontend
cd frontend
ng test

# Backend
cd backend
npm test
```

## 📊 Historias de Usuario

El proyecto incluye **21 Historias de Usuario** organizadas por roles:

- **HU-01 a HU-07**: Funcionalidades de Pacientes
- **HU-08 a HU-13**: Funcionalidades de Profesionales  
- **HU-14 a HU-16**: Funcionalidades Administrativas
- **HU-17 a HU-18**: Funcionalidades Master
- **HU-19 a HU-21**: Sistema de Reseñas

Ver carpeta `/HU/` para detalles completos.

## 🔐 Seguridad

- Autenticación JWT
- Encriptación de contraseñas (bcrypt)
- Validación de datos de entrada
- Protección CORS configurada
- Roles y permisos granulares

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

Para soporte o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para mejorar la gestión de turnos médicos**