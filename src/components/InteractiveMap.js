import React, { useEffect, useRef, useState } from 'react';

const InteractiveMap = ({ 
  latitude = 43.233801, 
  longitude = 76.816602, 
  address = "г. Алматы, Аймусин улица, 1в",
  companyName = "Танкер Тулс",
  zoom = 17 
}) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const loadMap = () => {
      if (!mapRef.current) return;

      // Попытка загрузить 2GIS виджет
      const load2GISWidget = () => {
        const mapContainer = mapRef.current;
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div style="
              width: 100%; 
              height: 100%; 
              position: relative;
              border-radius: 8px;
              overflow: hidden;
            ">
              <!-- Основная карта 2GIS -->
              <div id="main-map-${Date.now()}" style="width: 100%; height: 100%; position: relative;">
                <iframe
                  src="https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A${latitude}%2C%22lon%22%3A${longitude}%7D%2C%22zoom%22%3A${zoom}%2C%22city%22%3A%22almaty%22%7D"
                  width="100%"
                  height="100%"
                  style="border: 0; border-radius: 8px;"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Карта ${companyName} - ${address}"
                ></iframe>
              </div>
              
              <!-- Панель управления картой -->
              <div style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.95);
                border-radius: 8px;
                padding: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                gap: 5px;
                z-index: 1000;
              ">
                <button 
                  onclick="switchTo2GIS_${Date.now()}()" 
                  style="
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: #2E7D32;
                    color: white;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                  "
                  onmouseover="this.style.background='#1B5E20'"
                  onmouseout="this.style.background='#2E7D32'"
                >
                  2GIS
                </button>
                <button 
                  onclick="switchToGoogle_${Date.now()}()" 
                  style="
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: #1976D2;
                    color: white;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                  "
                  onmouseover="this.style.background='#1565C0'"
                  onmouseout="this.style.background='#1976D2'"
                >
                  Google
                </button>
                <button 
                  onclick="openInNewWindow_${Date.now()}()" 
                  style="
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: #FF9800;
                    color: white;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                  "
                  onmouseover="this.style.background='#F57C00'"
                  onmouseout="this.style.background='#FF9800'"
                >
                  🔗
                </button>
              </div>
              
              <!-- Информационная панель -->
              <div style="
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(255,255,255,0.95);
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 300px;
                z-index: 1000;
              ">
                <div style="font-weight: bold; margin-bottom: 5px; color: #333;">
                  📍 ${companyName}
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                  ${address}
                </div>
                <div style="font-size: 12px; color: #888;">
                  Координаты: ${latitude}, ${longitude}
                </div>
              </div>
            </div>
          `;
          
          // Добавляем функции переключения карт с уникальными именами
          const timestamp = Date.now();
          window[`switchTo2GIS_${timestamp}`] = () => {
            const mainMap = document.getElementById(`main-map-${timestamp}`);
            if (mainMap) {
              mainMap.innerHTML = `
                <iframe
                  src="https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A${latitude}%2C%22lon%22%3A${longitude}%7D%2C%22zoom%22%3A${zoom}%2C%22city%22%3A%22almaty%22%7D"
                  width="100%"
                  height="100%"
                  style="border: 0; border-radius: 8px;"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Карта ${companyName} - 2GIS"
                ></iframe>
              `;
            }
          };
          
          window[`switchToGoogle_${timestamp}`] = () => {
            const mainMap = document.getElementById(`main-map-${timestamp}`);
            if (mainMap) {
              mainMap.innerHTML = `
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.123456789!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE0JzAxLjciTiA3NsKwNDknMDAuMCJF!5e0!3m2!1sru!2skz!4v1234567890123!5m2!1sru!2skz"
                  width="100%"
                  height="100%"
                  style="border: 0; border-radius: 8px;"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Карта ${companyName} - Google Maps"
                ></iframe>
              `;
            }
          };
          
                     window[`openInNewWindow_${timestamp}`] = () => {
             const choice = window.confirm('Выберите карту:\nOK - 2GIS\nОтмена - Google Maps');
             if (choice) {
               window.open(`https://2gis.kz/almaty/search/${latitude}%2C${longitude}`, '_blank');
             } else {
               window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
             }
           };
          
          setMapLoaded(true);
        }
      };

      // Загружаем карту
      load2GISWidget();
      
      // Fallback через 5 секунд
      const fallbackTimer = setTimeout(() => {
        if (!mapLoaded) {
          setMapError(true);
          createFallbackMap();
        }
      }, 5000);

      const createFallbackMap = () => {
        const mapContainer = mapRef.current;
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div style="
              width: 100%; 
              height: 100%; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              position: relative;
              overflow: hidden;
            ">
              <div style="
                background: rgba(255,255,255,0.95);
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 450px;
                margin: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
              ">
                <div style="
                  width: 60px;
                  height: 60px;
                  background: linear-gradient(135deg, #2E7D32, #4CAF50);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 20px;
                  font-size: 24px;
                  box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
                ">
                  📍
                </div>
                
                <h3 style="margin-bottom: 15px; color: #333; font-size: 20px; font-weight: 600;">
                  ${companyName}
                </h3>
                <p style="margin-bottom: 25px; color: #666; line-height: 1.6; font-size: 16px;">
                  ${address}
                </p>
                
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                  <a 
                    href="https://2gis.kz/almaty/search/${latitude}%2C${longitude}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style="
                      display: inline-flex;
                      align-items: center;
                      gap: 8px;
                      padding: 14px 28px;
                      background: linear-gradient(135deg, #2E7D32, #4CAF50);
                      color: white;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                      font-size: 14px;
                      transition: all 0.3s ease;
                      box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46, 125, 50, 0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(46, 125, 50, 0.3)'"
                  >
                    🗺️ 2GIS
                  </a>
                  <a 
                    href="https://www.google.com/maps?q=${latitude},${longitude}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style="
                      display: inline-flex;
                      align-items: center;
                      gap: 8px;
                      padding: 14px 28px;
                      background: linear-gradient(135deg, #1976D2, #42A5F5);
                      color: white;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                      font-size: 14px;
                      transition: all 0.3s ease;
                      box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(25, 118, 210, 0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(25, 118, 210, 0.3)'"
                  >
                    🗺️ Google Maps
                  </a>
                </div>
                
                <div style="
                  background: rgba(0,0,0,0.05);
                  padding: 12px;
                  border-radius: 8px;
                  font-size: 13px;
                  color: #666;
                  border-left: 3px solid #2E7D32;
                ">
                  <strong>Координаты:</strong> ${latitude}, ${longitude}<br>
                  <strong>Статус:</strong> Карта временно недоступна
                </div>
              </div>
            </div>
          `;
        }
      };

      return () => {
        clearTimeout(fallbackTimer);
      };
    };

    loadMap();
  }, [latitude, longitude, address, companyName, zoom, mapLoaded]);

  return (
    <div 
      ref={mapRef}
      style={{ 
        width: '100%', 
        height: '450px',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}
    />
  );
};

export default InteractiveMap;
