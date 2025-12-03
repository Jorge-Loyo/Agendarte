# Actualizar Servicios

Ejecuta estos comandos en PowerShell desde `c:\git\Agendarte`:

```powershell
$services = @(
    "appointment.service.ts",
    "calendar.service.ts",
    "google-calendar.service.ts",
    "google-meet.service.ts",
    "notes.service.ts",
    "notification-preferences.service.ts",
    "patient-history.service.ts",
    "patient.service.ts",
    "payment.service.ts",
    "professional.service.ts",
    "review.service.ts",
    "schedule.service.ts",
    "specialty.service.ts",
    "stats.service.ts"
)

foreach ($service in $services) {
    $path = "frontend\src\app\services\$service"
    $content = Get-Content $path -Raw
    
    # Agregar import si no existe
    if ($content -notmatch "import.*environment") {
        $content = $content -replace "(import.*from 'rxjs';)", "`$1`nimport { environment } from '../../environments/environment';"
    }
    
    # Reemplazar URLs
    $content = $content -replace "http://localhost:3000/api", '${environment.apiUrl}'
    $content = $content -replace "'http://localhost:3000/api", "'`${environment.apiUrl}"
    
    Set-Content $path $content
}

Write-Host "Servicios actualizados!"
```
