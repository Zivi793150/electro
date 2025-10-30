# Инструкция по загрузке исправленных файлов на VPS

## Шаг 1: Создан архив с исправленными файлами
- Файл: `fixed-files.tar.gz`
- Расположение: `D:\electro\fixed-files.tar.gz`

## Шаг 2: Загрузка через Termius

### Вариант A: Через SFTP в Termius
1. Откройте Termius
2. Подключитесь к VPS серверу (root@32470)
3. Откройте SFTP (File Transfer)
4. Загрузите файл `D:\electro\fixed-files.tar.gz` в `/var/www/electro/`

### Вариант B: Через терминал Termius
Выполните на локальной машине (в PowerShell):
```powershell
scp D:\electro\fixed-files.tar.gz root@32470:/var/www/electro/
```

## Шаг 3: Распаковка на VPS
После загрузки файла, подключитесь к VPS через Termius и выполните:

```bash
cd /var/www/electro
tar -xzf fixed-files.tar.gz
```

## Шаг 4: Пересборка проекта
```bash
npm run build
```

## Шаг 5: Перезапуск приложения (если используете PM2)
```bash
pm2 restart electro
# или
pm2 restart all
```

## Альтернативный способ: Прямое редактирование через Termius
Если предпочитаете редактировать файлы прямо на сервере:
1. Подключитесь к VPS через Termius
2. Используйте встроенный редактор в Termius
3. Откройте нужные файлы в `/var/www/electro/src/`

