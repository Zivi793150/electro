import React, { useState, useEffect } from 'react';

const PickupPoints = ({ onLogout }) => {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPoint, setEditingPoint] = useState(null);
  const [newPoint, setNewPoint] = useState({
    address: '',
    description: '',
    workingHours: 'Пн-Пт: 9:00-18:00'
  });

  const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api/pickup-points' 
    : 'https://electro-a8bl.onrender.com/api/pickup-points';

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const fetchPickupPoints = async () => {
    try {
      setLoading(true);
      console.log('Загружаем пункты самовывоза с:', API_URL);
      const response = await fetch(API_URL);
      console.log('Статус загрузки:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Загруженные данные:', data);
        setPickupPoints(data);
      } else {
        console.error('Ошибка загрузки:', response.status, response.statusText);
        setPickupPoints([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки пунктов самовывоза:', error);
      setPickupPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoint = async (e) => {
    e.preventDefault();
    if (!newPoint.address.trim()) {
      alert('Введите адрес пункта самовывоза');
      return;
    }

    try {
      console.log('Отправляем данные:', newPoint);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPoint),
      });

      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Успешный ответ:', result);
        setNewPoint({ address: '', description: '', workingHours: 'Пн-Пт: 9:00-18:00' });
        fetchPickupPoints();
        alert('Пункт самовывоза добавлен');
      } else {
        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('Ошибка сервера:', errorMessage);
        alert(`Ошибка: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert(`Ошибка сети: ${error.message}`);
    }
  };

  const handleUpdatePoint = async (e) => {
    e.preventDefault();
    if (!editingPoint.address.trim()) {
      alert('Введите адрес пункта самовывоза');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editingPoint._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPoint),
      });

      if (response.ok) {
        setEditingPoint(null);
        fetchPickupPoints();
        alert('Пункт самовывоза обновлен');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка обновления пункта самовывоза:', error);
      alert('Ошибка при обновлении пункта самовывоза');
    }
  };

  const handleDeletePoint = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пункт самовывоза?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPickupPoints();
        alert('Пункт самовывоза удален');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка удаления пункта самовывоза:', error);
      alert('Ошибка при удалении пункта самовывоза');
    }
  };

  const startEditing = (point) => {
    setEditingPoint({ ...point });
  };

  const cancelEditing = () => {
    setEditingPoint(null);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div className="admin-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="admin-header" style={{ margin: 0, color: '#333' }}>Управление пунктами самовывоза</h1>
        <div>
          <button
            onClick={() => window.location.href = '/admin/products'}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            📦 Товары
          </button>
          <button
            onClick={() => window.location.href = '/admin/settings'}
            style={{
              background: '#1e88e5',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            ⚙️ Настройки
          </button>
          <button
            onClick={onLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Форма добавления нового пункта */}
      <div className="admin-form" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', position: 'relative' }}>
        <button 
          type="button" 
          onClick={() => setNewPoint({ address: '', description: '', workingHours: 'Пн-Пт: 9:00-18:00' })}
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            background: 'none',
            border: 'none',
            fontSize: 20,
            color: '#666',
            cursor: 'pointer',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f0f0f0';
            e.target.style.color = '#333';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#666';
          }}
        >
          ✕
        </button>
        <h2 className="admin-header" style={{ marginTop: 0, color: '#333', paddingRight: 40 }}>Добавить новый пункт самовывоза</h2>
        <form onSubmit={handleAddPoint} style={{ display: 'grid', gap: '15px', maxWidth: '600px' }}>
          <div>
            <label className="admin-label" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Адрес: *
            </label>
            <input
              className="admin-input"
              type="text"
              value={newPoint.address}
              onChange={(e) => setNewPoint({ ...newPoint, address: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="ул. Толе би 216Б"
              required
            />
          </div>
          <div>
            <label className="admin-label" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Описание:
            </label>
            <textarea
              className="admin-input"
              value={newPoint.description}
              onChange={(e) => setNewPoint({ ...newPoint, description: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Дополнительная информация о пункте самовывоза"
            />
          </div>
          <div>
            <label className="admin-label" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Часы работы:
            </label>
            <input
              className="admin-input"
              type="text"
              value={newPoint.workingHours}
              onChange={(e) => setNewPoint({ ...newPoint, workingHours: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Пн-Пт: 9:00-18:00"
            />
          </div>
          <button
            className="admin-button"
            type="submit"
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Добавить пункт самовывоза
          </button>
        </form>
      </div>

      {/* Список существующих пунктов */}
      <div>
        <h2 className="admin-header" style={{ color: '#333', marginBottom: '20px' }}>Существующие пункты самовывоза</h2>
        {pickupPoints.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Пункты самовывоза не найдены</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {pickupPoints.map((point) => (
              <div
                key={point._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  background: 'white'
                }}
              >
                {editingPoint && editingPoint._id === point._id ? (
                  // Форма редактирования
                  <form onSubmit={handleUpdatePoint} style={{ display: 'grid', gap: '15px', position: 'relative' }}>
                    <button 
                      type="button" 
                      onClick={cancelEditing}
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        background: '#dc3545',
                        border: 'none',
                        fontSize: 18,
                        color: '#fff',
                        cursor: 'pointer',
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        zIndex: 10
                      }}
                    >
                      ✕
                    </button>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Адрес: *
                      </label>
                      <input
                        type="text"
                        value={editingPoint.address}
                        onChange={(e) => setEditingPoint({ ...editingPoint, address: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Описание:
                      </label>
                      <textarea
                        value={editingPoint.description}
                        onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Часы работы:
                      </label>
                      <input
                        type="text"
                        value={editingPoint.workingHours}
                        onChange={(e) => setEditingPoint({ ...editingPoint, workingHours: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  // Отображение информации
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{point.address}</h3>
                        {point.description && (
                          <p style={{ margin: '0 0 10px 0', color: '#666' }}>{point.description}</p>
                        )}
                        <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
                          <strong>Часы работы:</strong> {point.workingHours}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => startEditing(point)}
                          style={{
                            background: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeletePoint(point._id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      Создан: {new Date(point.createdAt).toLocaleDateString('ru-RU')}
                      {point.updatedAt && (
                        <span> | Обновлен: {new Date(point.updatedAt).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupPoints; 