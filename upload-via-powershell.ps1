# Скрипт для загрузки папок через scp
# Выполнить в PowerShell на компьютере

$VPS = "ubuntu@78.40.109.33"
$VPS_PATH = "/var/www/electro/build"

Write-Host "📤 Загружаю папку uploads..."
scp -r uploads $VPS`:$VPS_PATH/

Write-Host "📤 Загружаю папку images..."
scp -r images $VPS`:$VPS_PATH/

Write-Host "📤 Загружаю папку fonts..."
scp -r fonts $VPS`:$VPS_PATH/

Write-Host "📤 Загружаю папку icons..."
scp -r icons $VPS`:$VPS_PATH/

Write-Host "✅ Готово!"

