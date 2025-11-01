# 🌐 Despliegue en AWS - Configuración Económica

## 💰 Servicios AWS Gratuitos/Económicos

### **Tier Gratuito AWS (12 meses)**
- ✅ **EC2 t2.micro** - 750 horas/mes (servidor backend)
- ✅ **RDS db.t3.micro** - 750 horas/mes (PostgreSQL)
- ✅ **S3** - 5GB almacenamiento (frontend + archivos)
- ✅ **CloudFront** - 50GB transferencia (CDN)

### **Servicios de Pago Mínimo**
- **Route 53** - $0.50/mes (dominio .com)
- **Elastic Beanstalk** - Gratis (solo pagas EC2)

---

## 🏗️ Arquitectura Recomendada (Económica)

```
Internet
    ↓
CloudFront (CDN) ← S3 (Frontend Angular)
    ↓
Elastic Beanstalk (Backend Node.js)
    ↓
RDS PostgreSQL (db.t3.micro)
```

---

## 📋 Plan de Despliegue

### **Fase 1: Base de Datos**
```bash
# 1. Crear RDS PostgreSQL (Free Tier)
- Instancia: db.t3.micro
- Storage: 20GB (gratis)
- Multi-AZ: No (para ahorrar)
- Backup: 7 días
```

### **Fase 2: Backend**
```bash
# 2. Elastic Beanstalk
- Platform: Node.js 18
- Instance: t2.micro
- Load Balancer: No (para ahorrar)
- Auto Scaling: Min 1, Max 1
```

### **Fase 3: Frontend**
```bash
# 3. S3 + CloudFront
- S3 Bucket: Static Website
- CloudFront: CDN global
- Route 53: Dominio personalizado
```

---

## 🔧 Variables de Entorno para AWS

```bash
# Producción AWS
NODE_ENV=production
PORT=8080

# RDS PostgreSQL
DATABASE_URL=postgres://username:password@agendarte-db.xyz.rds.amazonaws.com:5432/agendarte

# JWT
JWT_SECRET=tu_jwt_super_seguro_produccion

# S3 para archivos
AWS_REGION=us-east-1
AWS_S3_BUCKET=agendarte-files
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
```

---

## 💡 Alternativas Gratuitas para Desarrollo

### **Opción 1: Railway (Recomendado)**
- ✅ PostgreSQL gratuito
- ✅ Deploy automático desde GitHub
- ✅ $5/mes después del trial

### **Opción 2: Heroku**
- ✅ PostgreSQL gratuito (limitado)
- ✅ Deploy fácil
- ✅ $7/mes por dyno

### **Opción 3: Supabase + Vercel**
- ✅ PostgreSQL gratuito (Supabase)
- ✅ Frontend gratuito (Vercel)
- ✅ Backend en Railway/Heroku

---

## 📊 Costos Estimados

### **AWS (después del Free Tier)**
- EC2 t2.micro: ~$8/mes
- RDS db.t3.micro: ~$12/mes
- S3 + CloudFront: ~$2/mes
- **Total: ~$22/mes**

### **Alternativa Económica**
- Railway: $5/mes
- Vercel: Gratis
- **Total: $5/mes**

---

## 🚀 Comandos de Deploy

### **Para AWS Elastic Beanstalk**
```bash
# Instalar EB CLI
npm install -g @aws-amplify/cli

# Inicializar
eb init agendarte-backend

# Deploy
eb create production
eb deploy
```

### **Para Railway**
```bash
# Conectar GitHub
railway login
railway link
railway up
```

---

**Recomendación: Empezar con Railway para desarrollo, migrar a AWS para producción**