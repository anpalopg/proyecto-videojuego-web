import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Divider, Alert, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import { login, register, clearError } from '../store/slices/authSlice';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.35) 0%, transparent 60%), #0b0b1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: 'linear-gradient(135deg, rgba(22,33,62,0.95) 0%, rgba(27,40,56,0.95) 100%)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 8,
    padding: '36px 32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(109,40,217,0.15)',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6d28d9, #3b0764)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    border: '2px solid rgba(139,92,246,0.5)',
  },
  logoTitle: {
    color: '#c6d4df',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
  },
  logoSub: {
    color: '#7a8fa6',
    fontSize: 12,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    height: 42,
    background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)',
    border: 'none',
    borderRadius: 4,
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 4,
  },
  socialRow: {
    display: 'flex',
    gap: 10,
    marginTop: 4,
  },
  socialBtn: {
    flex: 1,
    height: 40,
    background: 'rgba(11,11,26,0.6)',
    border: '1px solid rgba(139,92,246,0.25)',
    color: '#c6d4df',
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 13,
    transition: 'border-color 0.2s, background 0.2s',
  },
  linkRow: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    color: '#7a8fa6',
  },
  link: {
    color: '#8b5cf6',
    marginLeft: 4,
  },
};

export default function AuthPage({ defaultTab = 'login' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [tab, setTab] = useState(defaultTab);
  const [form] = Form.useForm();

  const handleTabChange = (key) => {
    setTab(key);
    form.resetFields();
    dispatch(clearError());
  };

  const onFinish = async (values) => {
    dispatch(clearError());
    if (tab === 'login') {
      // Pass identifier (username or email) under the key the thunk expects
      const result = await dispatch(login({ email: values.identifier, password: values.password }));
      if (result.meta.requestStatus === 'fulfilled') navigate('/');
    } else {
      const result = await dispatch(register({ username: values.username, email: values.email, password: values.password }));
      if (result.meta.requestStatus === 'fulfilled') navigate('/');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{
              height: 56,
              width: 'auto',
              marginBottom: 4,
              filter: 'brightness(0) invert(1) drop-shadow(0 0 12px rgba(139,92,246,0.9))',
            }}
          />
          <span style={styles.logoSub}>Te damos la bienvenida<br />Ingresa tus credenciales para acceder a tu cuenta</span>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16, background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)', color: '#ff7875' }} />
        )}

        <Tabs
          activeKey={tab}
          onChange={handleTabChange}
          centered
          items={[
            { key: 'login', label: 'Iniciar sesión' },
            { key: 'register', label: 'Registrarse' },
          ]}
          style={{ marginBottom: 20 }}
        />

        <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
          {tab === 'register' && (
            <Form.Item name="username" rules={[{ required: true, message: 'Ingresa tu nombre de usuario' }]}>
              <Input prefix={<UserOutlined />} placeholder="Nombre de usuario" size="large" />
            </Form.Item>
          )}

          {/* Login: username or email, no format restriction */}
          {tab === 'login' && (
            <Form.Item name="identifier" rules={[{ required: true, message: 'Ingresa tu usuario o correo' }]}>
              <Input prefix={<UserOutlined />} placeholder="Usuario o correo electrónico" size="large" />
            </Form.Item>
          )}

          {/* Register: dedicated email field with format check */}
          {tab === 'register' && (
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Ingresa un email válido' }]}>
              <Input prefix={<UserOutlined />} placeholder="Correo electrónico" size="large" />
            </Form.Item>
          )}

          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>

          {tab === 'register' && (
            <Form.Item name="confirmPassword" dependencies={['password']} rules={[
              { required: true, message: 'Confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject('Las contraseñas no coinciden');
                },
              }),
            ]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Confirmar contraseña" size="large" />
            </Form.Item>
          )}

          {tab === 'login' && (
            <Form.Item style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox style={{ color: '#7a8fa6', fontSize: 12 }}>Recordarme</Checkbox>
                <a href="#" style={{ color: '#8b5cf6', fontSize: 12 }}>¿Olvidaste tu contraseña?</a>
              </div>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} style={styles.submitBtn}>
              {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(139,92,246,0.2)', color: '#7a8fa6', fontSize: 11 }}>O continúa con</Divider>

        <div style={styles.socialRow}>
          <button style={styles.socialBtn} onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.25)'}>
            <GoogleOutlined /> Google
          </button>
          <button style={styles.socialBtn} onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.25)'}>
            <AppleOutlined /> Apple
          </button>
        </div>

        <div style={styles.linkRow}>
          {tab === 'login' ? (
            <>¿No tienes una cuenta?<Link to="/register" style={styles.link} onClick={() => handleTabChange('register')}>Regístrate</Link></>
          ) : (
            <>¿Ya tienes cuenta?<Link to="/login" style={styles.link} onClick={() => handleTabChange('login')}>Inicia sesión</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
