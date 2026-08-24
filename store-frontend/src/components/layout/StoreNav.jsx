import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Badge, Dropdown, Avatar, Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';

const navStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(11,11,26,0.97)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(139,92,246,0.15)',
  padding: '0 32px',
  display: 'flex',
  alignItems: 'center',
  height: 56,
  gap: 32,
};

const LINKS = [
  { label: 'TIENDA', to: '/' },
  { label: 'BIBLIOTECA', to: '/library' },
  { label: 'COMUNIDAD', to: '/community' },
  { label: 'SOPORTE', to: '/support' },
];

export default function StoreNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector((s) => s.cart.items.length);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', label: 'Mi Perfil', icon: <UserOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Cerrar sesión', icon: <LogoutOutlined />, danger: true },
  ];

  const onUserMenuClick = ({ key }) => {
    if (key === 'logout') handleLogout();
  };

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{
            height: 36,
            width: 'auto',
            display: 'block',
            filter: 'brightness(0) invert(1) drop-shadow(0 0 6px rgba(139,92,246,0.7))',
          }}
        />
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ color: '#7a8fa6', fontSize: 12, letterSpacing: 2, fontWeight: 600, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c6d4df'}
            onMouseLeave={e => e.currentTarget.style.color = '#7a8fa6'}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Search bar */}
      <div style={{
        flex: '0 1 240px',
        background: 'rgba(27,40,56,0.8)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        height: 32,
      }}>
        <span style={{ color: '#7a8fa6', fontSize: 13, marginRight: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          placeholder="Buscar juegos..."
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#c6d4df', fontSize: 13, width: '100%' }}
        />
      </div>

      {/* Cart */}
      <Badge count={cartCount} color="#6d28d9" size="small">
        <Button
          type="text"
          icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
          onClick={() => navigate('/cart')}
          style={{ color: '#c6d4df', height: 36, display: 'flex', alignItems: 'center' }}
        />
      </Badge>

      {/* Auth */}
      {user ? (
        <Dropdown menu={{ items: userMenuItems, onClick: onUserMenuClick }} trigger={['click']}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(139,92,246,0.2)' }}>
            <Avatar size={26} style={{ background: 'linear-gradient(135deg, #6d28d9, #3b0764)', fontSize: 11 }}>
              {(user.username || 'U').slice(0, 2).toUpperCase()}
            </Avatar>
            <span style={{ color: '#c6d4df', fontSize: 13 }}>{user.username || 'Usuario'}</span>
            <DownOutlined style={{ color: '#7a8fa6', fontSize: 10 }} />
          </div>
        </Dropdown>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" onClick={() => navigate('/login')} style={{ background: 'transparent', borderColor: 'rgba(139,92,246,0.4)', color: '#c6d4df' }}>
            Iniciar sesión
          </Button>
          <Button size="small" type="primary" onClick={() => navigate('/register')} style={{ background: '#6d28d9', borderColor: '#6d28d9' }}>
            Registrarse
          </Button>
        </div>
      )}
    </nav>
  );
}
