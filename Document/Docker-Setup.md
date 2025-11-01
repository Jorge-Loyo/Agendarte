# 🐳 Configuración Docker para Agendarte

## 📋 Instalación Docker Desktop

### **1. Descargar Docker Desktop**
- Ir a: https://www.docker.com/products/docker-desktop/
- Descargar para Windows
- Instalar y reiniciar

### **2. Verificar instalación**
```bash
docker --version
docker-compose --version
```

---

## 🚀 Comandos para PostgreSQL

### **Iniciar base de datos**
```bash
# Opción 1: Docker Compose
docker-compose up -d postgres

# Opción 2: Script Windows
scripts\start-db.bat

# Opción 3: NPM script (desde /backend)
npm run db:start
```

### **Detener base de datos**
```bash
docker-compose down
# o
scripts\stop-db.bat
# o
npm run db:stop
```

### **Resetear base de datos**
```bash
npm run db:reset
```

---

## 🌐 Acceso a la Base de Datos

### **Credenciales**
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Password**: password123
- **Base de datos**: agendarte

### **Adminer (Interfaz Web)**
- URL: http://localhost:8080
- Sistema: PostgreSQL
- Servidor: postgres
- Usuario: postgres
- Contraseña: password123

---

## 🔧 Comandos Útiles

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Conectar directamente a PostgreSQL
docker exec -it agendarte-db psql -U postgres -d agendarte

# Ver contenedores corriendo
docker ps

# Limpiar todo (cuidado: borra datos)
docker-compose down -v
```

---

## ⚡ Inicio Rápido

1. **Instalar Docker Desktop**
2. **Ejecutar**: `docker-compose up -d postgres`
3. **Verificar**: http://localhost:8080 (Adminer)
4. **Iniciar backend**: `npm run dev`

---

**¡La base de datos estará lista para desarrollo!** 🎉