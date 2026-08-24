import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import store from './store';
import App from './App';
import './index.css';

const steamTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6d28d9',
    colorBgBase: '#0b0b1a',
    colorBgContainer: '#16213e',
    colorBgElevated: '#1b2838',
    colorBorder: 'rgba(139, 92, 246, 0.25)',
    colorText: '#c6d4df',
    colorTextSecondary: '#7a8fa6',
    borderRadius: 4,
    fontFamily: "'Motiva Sans', Arial, sans-serif",
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={steamTheme}>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
