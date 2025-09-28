import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Orders = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const navigate = useNavigate();

  // Маппинг статусов на русские названия
  const statusLabels = {
    'new': 'Новый заказ',
    'confirmed': 'Оформлено',
    'pending_payment': 'Ожидает оплаты',
    'partially_paid': 'Частично оплачено',
    'paid': 'Оплачено',
    'ordered': 'Заказано у поставщика',
    'processing': 'В обработке',
    'assembling': 'Собирается',
    'assembled': 'Собрано',
    'ready_to_ship': 'Готов к отгрузке',
    'shipped': 'Отправлено',
    'in_transit': 'Доставляется',
    'delivered': 'Доставлено',
    'completed': 'Выполнено',
    'cancelled': 'Отменено',
    'returned': 'Возврат'
  };

  // Цвета для статусов
  const statusColors = {
    'new': '#2196F3',           // Синий
    'confirmed': '#4CAF50',     // Зеленый
    'pending_payment': '#FF9800', // Оранжевый
    'partially_paid': '#FFC107',  // Желтый
    'paid': '#4CAF50',          // Зеленый
    'ordered': '#9C27B0',       // Фиолетовый
    'processing': '#607D8B',    // Сине-серый
    'assembling': '#795548',    // Коричневый
    'assembled': '#3F51B5',     // Индиго
    'ready_to_ship': '#00BCD4', // Циан
    'shipped': '#009688',       // Теал
    'in_transit': '#8BC34A',    // Светло-зеленый
    'delivered': '#4CAF50',     // Зеленый
    'completed': '#4CAF50',     // Зеленый
    'cancelled': '#F44336',     // Красный
    'returned': '#E91E63'       // Розовый
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('https://electro-1-vjdu.onrender.com/api/orders');
      const j = await r.json();
      if (j && j.success && Array.isArray(j.orders)) {
        setOrders(j.orders);
      } else if (Array.isArray(j)) {
        setOrders(j);
      } else {
        setOrders([]);
      }
    } catch (e) {
      setError('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`https://electro-1-vjdu.onrender.com/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          changedBy: 'admin'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Обновляем локальное состояние
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        setError(result.error || 'Ошибка обновления статуса');
      }
    } catch (e) {
      setError('Ошибка обновления статуса заказа');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="admin-container" style={{minHeight:'100vh',background:'#f5f7fa',padding:'32px 0'}}>
      <div style={{maxWidth:1400,margin:'0 auto',background:'#fff',borderRadius:10,border:'1.5px solid #e0e0e0',padding:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <h2 style={{fontWeight:700,fontSize:24,color:'#1a2236',margin:0}}>Заказы</h2>
          <div className="admin-nav">
            <button onClick={()=>{navigate('/admin/products')}} className="nav-btn" style={{background:'#FF6B00'}}>+ Добавить товар</button>
            <button onClick={()=>navigate('/admin/variations')} className="nav-btn nav-variations">🔄 Вариации</button>
            <button onClick={()=>navigate('/admin/orders')} className="nav-btn" style={{background:'#1e88e5'}}>🧾 Заказы</button>
            <button onClick={()=>navigate('/admin/settings')} className="nav-btn nav-settings">⚙️ Настройки</button>
            <button onClick={()=>navigate('/admin/analytics')} className="nav-btn nav-analytics">📊 Аналитика</button>
            <button onClick={()=>navigate('/admin/pickup-points')} className="nav-btn nav-pickup">🏬 Пункты самовывоза</button>
            <button onClick={onLogout} className="nav-btn nav-logout">Выйти</button>
          </div>
        </div>

        {loading ? (
          <div style={{padding:32,textAlign:'center'}}>Загрузка…</div>
        ) : error ? (
          <div style={{color:'#e53935',padding:32,textAlign:'center'}}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{padding:24,textAlign:'center',color:'#666'}}>Заказов пока нет</div>
        ) : (
          <table className="admin-table" style={{width:'100%',borderCollapse:'collapse',fontSize:15,background:'#fff'}}>
            <thead>
              <tr style={{background:'#f5f7fa'}}>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Дата</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Клиент</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Телефон</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Статус</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Доставка</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Оплата</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Сумма</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Товары</th>
                <th style={{padding:'8px 6px',textAlign:'left'}}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} style={{borderBottom:'1px solid #e0e0e0'}}>
                  <td style={{padding:'8px 6px'}}>{new Date(o.createdAt).toLocaleString('ru-RU')}</td>
                  <td style={{padding:'8px 6px'}}>{o.firstName}</td>
                  <td style={{padding:'8px 6px'}}>{o.phone}</td>
                  <td style={{padding:'8px 6px'}}>
                    <select
                      value={o.status || 'new'}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      disabled={updatingStatus === o._id}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        backgroundColor: statusColors[o.status || 'new'],
                        color: '#fff',
                        fontWeight: '500',
                        cursor: updatingStatus === o._id ? 'not-allowed' : 'pointer',
                        opacity: updatingStatus === o._id ? 0.6 : 1,
                        minWidth: '140px'
                      }}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value} style={{backgroundColor: '#fff', color: '#333'}}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {updatingStatus === o._id && (
                      <span style={{marginLeft: '8px', fontSize: '12px', color: '#666'}}>
                        Обновление...
                      </span>
                    )}
                  </td>
                  <td style={{padding:'8px 6px'}}>{o.deliveryType === 'delivery' ? `Доставка ${o.address ? '('+o.address+')' : ''}` : 'Самовывоз'}</td>
                  <td style={{padding:'8px 6px'}}>
                    {o.payment === 'cash' ? 'Наличными' : 'Безналично'}
                    {o.payment === 'cashless' && o.paymentMethod ? ` (${o.paymentMethod})` : ''}
                  </td>
                  <td style={{padding:'8px 6px',color:'#FFB300',fontWeight:700}}>{(o.total||0).toLocaleString('ru-RU')} ₸</td>
                  <td style={{padding:'8px 6px'}}>
                    {Array.isArray(o.items) && o.items.length > 0 ? (
                      <ul style={{margin:0,paddingLeft:16}}>
                        {o.items.map((it, idx) => (
                          <li key={idx}>{it.productName || it.productId} ×{it.quantity || 1}</li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{color:'#666'}}>—</span>
                    )}
                  </td>
                  <td style={{padding:'8px 6px'}}>
                    <button
                      onClick={() => openOrderDetails(o)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#1e88e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Детали
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальное окно с деталями заказа */}
      {showOrderDetails && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '16px'
            }}>
              <h3 style={{ margin: 0, color: '#1a2236' }}>
                Заказ #{selectedOrder._id.slice(-8)}
              </h3>
              <button
                onClick={closeOrderDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#1a2236' }}>Информация о клиенте</h4>
                <p><strong>Имя:</strong> {selectedOrder.firstName}</p>
                <p><strong>Телефон:</strong> {selectedOrder.phone}</p>
                <p><strong>Адрес:</strong> {selectedOrder.address || 'Не указан'}</p>
                <p><strong>Комментарий:</strong> {selectedOrder.comment || 'Нет'}</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#1a2236' }}>Детали заказа</h4>
                <p><strong>Дата создания:</strong> {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}</p>
                <p><strong>Доставка:</strong> {selectedOrder.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}</p>
                <p><strong>Оплата:</strong> {selectedOrder.payment === 'cash' ? 'Наличными' : 'Безналично'}</p>
                <p><strong>Сумма:</strong> <span style={{ color: '#FFB300', fontWeight: 'bold' }}>
                  {(selectedOrder.total || 0).toLocaleString('ru-RU')} ₸
                </span></p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1a2236' }}>Товары</h4>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {item.productName || item.productId} × {item.quantity || 1}
                      {item.price && ` - ${item.price.toLocaleString('ru-RU')} ₸`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666' }}>Товары не указаны</p>
              )}
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1a2236' }}>История статусов</h4>
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {selectedOrder.statusHistory.map((entry, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      marginBottom: '4px',
                      backgroundColor: '#f5f7fa',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${statusColors[entry.status] || '#ccc'}`
                    }}>
                      <span style={{ fontWeight: '500' }}>
                        {statusLabels[entry.status] || entry.status}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(entry.changedAt).toLocaleString('ru-RU')}
                        {entry.changedBy && ` (${entry.changedBy})`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>История статусов пуста</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;


