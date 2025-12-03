@echo off
cd frontend\src\app\services

powershell -Command "(Get-Content admin.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content admin.service.ts"
powershell -Command "(Get-Content appointment.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content appointment.service.ts"
powershell -Command "(Get-Content calendar.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content calendar.service.ts"
powershell -Command "(Get-Content google-calendar.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content google-calendar.service.ts"
powershell -Command "(Get-Content google-meet.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content google-meet.service.ts"
powershell -Command "(Get-Content notes.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content notes.service.ts"
powershell -Command "(Get-Content notification-preferences.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content notification-preferences.service.ts"
powershell -Command "(Get-Content patient-history.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content patient-history.service.ts"
powershell -Command "(Get-Content patient.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content patient.service.ts"
powershell -Command "(Get-Content payment.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content payment.service.ts"
powershell -Command "(Get-Content professional.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content professional.service.ts"
powershell -Command "(Get-Content review.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content review.service.ts"
powershell -Command "(Get-Content schedule.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content schedule.service.ts"
powershell -Command "(Get-Content specialty.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content specialty.service.ts"
powershell -Command "(Get-Content stats.service.ts) -replace 'http://localhost:3000/api', '${environment.apiUrl}' | Set-Content stats.service.ts"

echo Servicios actualizados!
