@echo off
echo 🐳 Iniciando PostgreSQL con Docker...
docker-compose up -d postgres
echo ✅ PostgreSQL corriendo en puerto 5432
echo 🌐 Adminer disponible en http://localhost:8080
echo.
echo Credenciales:
echo - Host: postgres
echo - Usuario: postgres  
echo - Password: password123
echo - Base de datos: agendarte
pause