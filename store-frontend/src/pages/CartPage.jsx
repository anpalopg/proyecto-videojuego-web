import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Empty, Tooltip } from 'antd';
import { DeleteOutlined, ShoppingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import StoreNav from '../components/layout/StoreNav';
import { removeLocal } from '../store/slices/cartSlice';

const s = {
  page:         { minHeight: '100vh', background: '#0b0b1a' },
  inner:        { maxWidth: 980, margin: '0 auto', padding: '32px 24px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title:        { color: '#c6d4df', fontSize: 22, fontWeight: 700 },
  editLink:     { color: '#8b5cf6', fontSize: 13, cursor: 'pointer' },
  grid:         { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' },
  summaryCol:   { background: '#16213e', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 4, padding: 20, position: 'sticky', top: 80 },
  summaryTitle: { color: '#c6d4df', fontSize: 16, fontWeight: 700, marginBottom: 16 },
  summaryRow:   { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#7a8fa6', fontSize: 13 },
  summaryValue: { color: '#c6d4df', fontSize: 13 },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(139,92,246,0.15)' },
  totalLabel:   { color: '#c6d4df', fontSize: 14, fontWeight: 600 },
  totalValue:   { color: '#a4d007', fontSize: 20, fontWeight: 700 },
  checkoutBtn:  { width: '100%', height: 46, background: 'linear-gradient(90deg,#6d28d9,#8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 4, cursor: 'pointer', marginTop: 16 },
  disclaimerRow:{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'flex-start' },
  disclaimer:   { color: '#7a8fa6', fontSize: 10, lineHeight: 1.5 },
  itemCard:     { background: '#16213e', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', marginBottom: 8 },
  itemThumb:    { width: 64, height: 64, borderRadius: 3, flexShrink: 0, background: 'linear-gradient(135deg, rgba(109,40,217,0.3), rgba(27,40,56,0.5))', border: '1px solid rgba(139,92,246,0.15)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName:     { color: '#c6d4df', fontSize: 14, fontWeight: 600, flex: 1 },
  itemPrice:    { color: '#a4d007', fontSize: 15, fontWeight: 700, marginRight: 16 },
  removeBtn:    { background: 'transparent', border: 'none', color: '#7a8fa6', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 2 },
  emptyState:   { padding: '60px 0', textAlign: 'center' },
};

// Parse price string like "COP$ 1.000" → number 1000
function parsePrice(priceStr) {
  if (!priceStr || priceStr === 'Gratis') return 0;
  // Remove currency prefix and dots used as thousand separators
  const digits = priceStr.replace(/[^0-9]/g, '');
  return parseInt(digits, 10) || 0;
}

function formatCOP(amount) {
  return `COP$ ${amount.toLocaleString('es-CO')}`;
}

function CartItem({ item }) {
  const dispatch = useDispatch();
  return (
    <div style={s.itemCard}>
      <div style={s.itemThumb}>
        {item.cover
          ? <img src={item.cover} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <span style={{ color: '#7a8fa6', fontSize: 9 }}>IMG</span>
        }
      </div>
      <div style={s.itemName}>{item.title}</div>
      <span style={s.itemPrice}>{item.price}</span>
      <Tooltip title="Eliminar del carrito">
        <button
          style={s.removeBtn}
          onClick={() => dispatch(removeLocal(item.id))}
          onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
          onMouseLeave={e => e.currentTarget.style.color = '#7a8fa6'}
        >
          <DeleteOutlined />
        </button>
      </Tooltip>
    </div>
  );
}

export default function CartPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const items     = useSelector((s) => s.cart.items);

  // Calculate total from actual item prices
  const total = items.reduce((sum, item) => sum + parsePrice(item.price), 0);

  return (
    <div style={s.page}>
      <StoreNav />
      <div style={s.inner}>
        <div style={s.header}>
          <h1 style={s.title}>Mi Carrito</h1>
          <span style={s.editLink} onClick={() => navigate('/')}>+ Seguir comprando</span>
        </div>

        {items.length === 0 ? (
          <div style={s.emptyState}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#7a8fa6' }}>Tu carrito está vacío</span>}
            />
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/')}
              style={{ marginTop: 16, background: '#6d28d9', borderColor: '#6d28d9' }}
            >
              Explorar tienda
            </Button>
          </div>
        ) : (
          <div style={s.grid}>
            {/* Items list */}
            <div>
              {items.map(item => <CartItem key={item.id} item={item} />)}
            </div>

            {/* Order summary */}
            <div style={s.summaryCol}>
              <div style={s.summaryTitle}>Resumen del Pedido</div>

              {items.map(item => (
                <div key={item.id} style={s.summaryRow}>
                  <span style={{ ...s.summaryLabel, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <span style={s.summaryValue}>{item.price}</span>
                </div>
              ))}

              <div style={s.summaryTotal}>
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalValue}>{formatCOP(total)}</span>
              </div>

              <button
                style={s.checkoutBtn}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                FINALIZAR COMPRA
              </button>

              <div style={s.disclaimerRow}>
                <InfoCircleOutlined style={{ color: '#7a8fa6', fontSize: 11, marginTop: 2, flexShrink: 0 }} />
                <span style={s.disclaimer}>
                  Los precios están en COP. Impuestos aplicables según tu región.
                </span>
              </div>

              {/* Remove links per item */}
              <Divider style={{ borderColor: 'rgba(139,92,246,0.1)', margin: '16px 0 12px' }} />
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#7a8fa6', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <button
                    style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 11 }}
                    onClick={() => dispatch(removeLocal(item.id))}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
