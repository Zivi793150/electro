# Настройка целей в Яндекс.Метрике для отслеживания кликов по социальным сетям

## Общая информация
- **ID счетчика**: 104706911
- **Сайт**: https://eltok.kz

## Цели для настройки в Яндекс.Метрике

### 1. Цели для социальных сетей

#### Общая цель для всех соцсетей
- **Название**: Клик по социальным сетям
- **Идентификатор**: `SOCIAL_CLICK`
- **Тип**: JavaScript-событие
- **Описание**: Фиксирует любой клик по ссылке на социальную сеть

#### Специфичные цели для каждой платформы
1. **WhatsApp**
   - Идентификатор: `SOCIAL_WHATSAPP`
   - Описание: Клик по WhatsApp

2. **Instagram**
   - Идентификатор: `SOCIAL_INSTAGRAM`
   - Описание: Клик по Instagram

3. **Facebook**
   - Идентификатор: `SOCIAL_FACEBOOK`
   - Описание: Клик по Facebook

4. **TikTok**
   - Идентификатор: `SOCIAL_TIKTOK`
   - Описание: Клик по TikTok

5. **Telegram**
   - Идентификатор: `SOCIAL_TELEGRAM`
   - Описание: Клик по Telegram

#### Цели с контекстом (место клика)

**WhatsApp:**
- `SOCIAL_WHATSAPP_HEADER_DESKTOP` - Клик в шапке сайта (десктоп)
- `SOCIAL_WHATSAPP_HEADER_MOBILE` - Клик в мобильном меню
- `SOCIAL_WHATSAPP_FLOATING_BUTTON` - Клик по плавающей кнопке
- `SOCIAL_WHATSAPP_CONTACTS_PAGE` - Клик на странице контактов
- `SOCIAL_WHATSAPP_AUTO_DETECT` - Автоматически обнаруженный клик

**Instagram:**
- `SOCIAL_INSTAGRAM_HEADER_DESKTOP`
- `SOCIAL_INSTAGRAM_HEADER_MOBILE`
- `SOCIAL_INSTAGRAM_CONTACTS_PAGE`
- `SOCIAL_INSTAGRAM_AUTO_DETECT`

**Facebook:**
- `SOCIAL_FACEBOOK_HEADER_DESKTOP`
- `SOCIAL_FACEBOOK_HEADER_MOBILE`
- `SOCIAL_FACEBOOK_CONTACTS_PAGE`
- `SOCIAL_FACEBOOK_AUTO_DETECT`

**TikTok:**
- `SOCIAL_TIKTOK_HEADER_DESKTOP`
- `SOCIAL_TIKTOK_HEADER_MOBILE`
- `SOCIAL_TIKTOK_CONTACTS_PAGE`
- `SOCIAL_TIKTOK_AUTO_DETECT`

### 2. Цели для телефонных звонков

#### Общая цель
- **Название**: Клик по телефону
- **Идентификатор**: `PHONE_CLICK`
- **Тип**: JavaScript-событие

#### Цели с контекстом
- `PHONE_CLICK_HEADER_DESKTOP` - Клик по телефону в шапке (десктоп)
- `PHONE_CLICK_HEADER_MOBILE` - Клик по телефону в мобильном меню
- `PHONE_CLICK_FLOATING_BUTTON` - Клик по плавающей кнопке звонка
- `PHONE_CLICK_AUTO_DETECT` - Автоматически обнаруженный клик

## Как настроить цели в Яндекс.Метрике

1. Зайдите в интерфейс Яндекс.Метрики: https://metrika.yandex.ru
2. Выберите счетчик с ID 104706911
3. Перейдите в раздел "Цели" → "Список целей"
4. Нажмите "Добавить цель"
5. Выберите тип "JavaScript-событие"
6. Введите идентификатор цели из списка выше
7. Задайте описательное название
8. Сохраните цель

## Проверка работы целей

После настройки целей их выполнение можно отслеживать в разделе "Отчеты" → "Конверсии" → "Цели".

## Дополнительная аналитика

Кроме Яндекс.Метрики, события также отправляются в:
- Внутреннюю систему аналитики (эндпоинт `/api/analytics/track`)
- Google Analytics/Google Tag Manager (если настроен)

## Структура событий

### Событие social_click
```javascript
{
  platform: 'WhatsApp|Instagram|Facebook|TikTok|Telegram',
  context: 'header_desktop|header_mobile|floating_button|contacts_page|auto_detect',
  url: 'https://...' // URL социальной сети
}
```

### Событие phone_click
```javascript
{
  phoneNumber: '+77075177385',
  context: 'header_desktop|header_mobile|floating_button|auto_detect',
  buttonText: 'Позвонить'
}
```