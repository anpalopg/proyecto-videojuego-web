import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import CartPage from './pages/CartPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login"    element={<AuthPage />} />
        <Route path="/register" element={<AuthPage defaultTab="register" />} />
        <Route path="/"         element={<HomePage />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/cart"     element={<CartPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
