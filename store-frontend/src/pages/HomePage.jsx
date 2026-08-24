import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Tag } from 'antd';
import { ShoppingCartOutlined, RightOutlined } from '@ant-design/icons';
import StoreNav from '../components/layout/StoreNav';
import AssignmentsCarousel from '../components/AssignmentsCarousel';
import { addLocal } from '../store/slices/cartSlice';
import { TRENDING, GAMES_DB } from '../data/games';

const FEATURED = GAMES_DB[1];

const CATEGORIES = [
  { id: 1, name: 'Acción',     icon: null, count: 142 },
  { id: 2, name: 'Horror',     icon: null, count: 58  },
  { id: 3, name: 'RPG',        icon: null, count: 213 },
  { id: 4, name: 'Aventura',   icon: null, count: 97  },
  { id: 5, name: 'Estrategia', icon: null, count: 175 },
];

// ── accent gradients per game ──────────────────────────────────────────────────
const GAME_COVER_STYLES = {
  1: { background: 'radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.6), rgba(11,11,26,0.95))', label: 'RECESSED MINDS' },
  2: { background: 'radial-gradient(ellipse at 50% 0%, rgba(180,20,20,0.6), rgba(11,11,26,0.95))',  label: 'OUTLAST' },
  3: { background: 'radial-gradient(ellipse at 50% 0%, rgba(160,10,10,0.6),  rgba(11,11,26,0.95))', label: 'OUTLAST 2' },
  4: { background: 'radial-gradient(ellipse at 50% 0%, rgba(220,40,40,0.55), rgba(11,11,26,0.95))', label: 'ROBLOX' },
  5: { background: 'radial-gradient(ellipse at 50% 0%, rgba(0,140,240,0.45), rgba(11,11,26,0.95))', label: 'GTA V' },
};

const s = {
  page: { minHeight: '100vh', background: '#0b0b1a' },
  hero: {
    position: 'relative',
    height: 420,
    background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(109,40,217,0.45) 0%, transparent 65%), linear-gradient(180deg, #1b2838 0%, #0b0b1a 100%)',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '0 64px',
  },
  heroContent: { maxWidth: 560, position: 'relative', zIndex: 2 },
  heroTag: { color: '#7a8fa6', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 },
  heroTitle: { color: '#c6d4df', fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 },
  heroSub: { color: '#8b5cf6', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  heroDesc: { color: '#7a8fa6', fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 460 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  heroPriceRow: { display: 'flex', alignItems: 'center', gap: 12 },
  heroDiscount: { background: '#4c6b22', color: '#a4d007', padding: '4px 10px', borderRadius: 3, fontSize: 20, fontWeight: 700 },
  heroOriginal: { color: '#7a8fa6', textDecoration: 'line-through', fontSize: 13 },
  heroPrice: { color: '#a4d007', fontSize: 22, fontWeight: 700 },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 80% at 75% 50%, rgba(109,40,217,0.2) 0%, transparent 70%)', pointerEvents: 'none' },
  heroPlaceholder: {
    position: 'absolute', right: 80, top: '50%', transform: 'translateY(-50%)',
    width: 460, height: 280,
    background: GAME_COVER_STYLES[1].background,
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#c6d4df', fontSize: 18, fontWeight: 800, letterSpacing: 3,
  },
  section: { padding: '40px 64px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: '#c6d4df', fontSize: 18, fontWeight: 700, letterSpacing: 1 },
  seeAll: { color: '#8b5cf6', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  grid5: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  gameCard: {
    background: '#1b2838', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 4,
    overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
  },
  gameCardImg: {
    width: '100%', height: 120,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#c6d4df', fontSize: 13, fontWeight: 700, letterSpacing: 1,
  },
  gameCardBody: { padding: '10px 12px' },
  gameCardTitle: { color: '#c6d4df', fontSize: 13, fontWeight: 600, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  gameCardPrice: { display: 'flex', alignItems: 'center', gap: 8 },
  discountBadge: { background: '#4c6b22', color: '#a4d007', padding: '2px 6px', borderRadius: 2, fontSize: 11, fontWeight: 700 },
  priceText: { color: '#a4d007', fontSize: 13, fontWeight: 700 },
  priceTextFree: { color: '#67c23a', fontSize: 13, fontWeight: 700 },
  catCard: {
    background: '#16213e', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 6,
    padding: '20px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
  },
  catIcon: { fontSize: 28, marginBottom: 8 },
  catName: { color: '#c6d4df', fontSize: 13, fontWeight: 600, marginBottom: 4 },
  catCount: { color: '#7a8fa6', fontSize: 11 },
  joinSection: {
    margin: '0 64px 48px', borderRadius: 8,
    background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(27,40,56,0.4) 100%)',
    border: '1px solid rgba(139,92,246,0.2)', padding: '48px 64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    overflow: 'hidden', position: 'relative',
  },
  joinContent: { maxWidth: 480 },
  joinTitle: { color: '#c6d4df', fontSize: 32, fontWeight: 800, marginBottom: 12 },
  joinDesc: { color: '#7a8fa6', fontSize: 14, lineHeight: 1.7, marginBottom: 24 },
  joinBg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, background: 'radial-gradient(ellipse 80% 80% at 80% 50%, rgba(109,40,217,0.3), transparent)' },
  footer: {
    background: '#0d0d1a', borderTop: '1px solid rgba(139,92,246,0.1)',
    padding: '32px 64px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32,
  },
  footerLogo: { color: '#c6d4df', fontWeight: 700, fontSize: 15, marginBottom: 12 },
  footerLink: { color: '#7a8fa6', fontSize: 12, display: 'block', marginBottom: 6, cursor: 'pointer' },
  footerBottom: { borderTop: '1px solid rgba(139,92,246,0.1)', padding: '16px 64px', background: '#0d0d1a', color: '#7a8fa6', fontSize: 11 },
};

function GameCard({ game, onNavigate }) {
  const cover = GAME_COVER_STYLES[game.id] || GAME_COVER_STYLES[1];
  const isFree = !game.discount && game.price === 'Gratis';
  return (
    <div
      style={s.gameCard}
      onClick={() => onNavigate(game)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.transform = 'none'; }}
    >
      {game.cover
        ? <img src={game.cover} alt={game.title} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
        : <div style={{ ...s.gameCardImg, background: cover.background }}>{cover.label}</div>
      }
      <div style={s.gameCardBody}>
        <div style={s.gameCardTitle}>{game.title}</div>
        <div style={s.gameCardPrice}>
          {game.discount && <span style={s.discountBadge}>{game.discount}%</span>}
          <span style={isFree ? s.priceTextFree : s.priceText}>{game.price}</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGameClick = (game) => {
    if (game.externalUrl) {
      window.open(game.externalUrl, '_blank');
    } else {
      navigate(`/game/${game.id}`);
    }
  };

  return (
    <div style={s.page}>
      <StoreNav />

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroPlaceholder}>{GAME_COVER_STYLES[1].label}</div>
        <div style={s.heroContent}>
          <p style={s.heroTag}>Destacado · Thriller Psicológico</p>
          <h1 style={s.heroTitle}>{FEATURED.title}</h1>
          <p style={s.heroSub}>Vive experiencias inolvidables</p>
          <p style={s.heroDesc}>{FEATURED.description.split('\n\n')[0]}</p>
          <div style={s.heroBtns}>
            {FEATURED.tags.map(t => (
              <Tag key={t} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', borderRadius: 2 }}>{t}</Tag>
            ))}
          </div>
          <div style={s.heroPriceRow}>
            <span style={s.heroDiscount}>{FEATURED.discount}%</span>
            <div>
              <div style={s.heroOriginal}>{FEATURED.originalPrice}</div>
              <div style={s.heroPrice}>{FEATURED.price}</div>
            </div>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => window.open(FEATURED.externalUrl, '_blank')}
              style={{ background: '#6d28d9', borderColor: '#6d28d9', height: 40, paddingInline: 20 }}
            >
              Ver Juego
            </Button>
          </div>
        </div>
      </div>

      {/* ── TENDENCIAS ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>Tendencias</span>
          <span style={s.seeAll}>Ver todos <RightOutlined /></span>
        </div>
        <div style={s.grid5}>
          {TRENDING.map(game => (
            <GameCard key={game.id} game={game} onNavigate={handleGameClick} />
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>Explorar por categoría</span>
          <span style={s.seeAll}>Ver todos <RightOutlined /></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              style={s.catCard}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.background = 'rgba(109,40,217,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'; e.currentTarget.style.background = '#16213e'; }}
            >
              <div style={s.catName}>{cat.name}</div>
              <div style={s.catCount}>{cat.count} juegos</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARRUSEL DE TAREAS ── */}
      <AssignmentsCarousel />

      {/* ── ÚNETE ── */}
      <div style={s.joinSection}>
        <div style={s.joinBg} />
        <div style={s.joinContent}>
          <div style={{ color: '#8b5cf6', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Comunidad</div>
          <h2 style={s.joinTitle}>Únete</h2>
          <p style={s.joinDesc}>Conecta con millones de jugadores, descubre nuevos juegos y vive experiencias únicas. Tu aventura comienza aquí.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="primary" size="large" style={{ background: '#6d28d9', borderColor: '#6d28d9', height: 44, paddingInline: 32 }} onClick={() => navigate('/register')}>
              Crear cuenta gratis
            </Button>
            <Button size="large" style={{ background: 'transparent', borderColor: 'rgba(139,92,246,0.4)', color: '#c6d4df', height: 44 }} onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          </div>
        </div>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(109,40,217,0.15)', border: '2px solid rgba(139,92,246,0.2)', position: 'relative', zIndex: 1 }} />
      </div>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        {[
          { title: 'STEAM',              links: ['Inicio', 'Acerca de', 'Soporte Steam', 'Para los medios'] },
          { title: 'VALVE',              links: ['Empleos', 'Sobre Valve', 'Steam Deck'] },
          { title: 'JUEGOS',             links: ['Todos los juegos', 'Nuevos lanzamientos', 'Próximamente', 'Recomendados'] },
          { title: 'SOPORTE',            links: ['Soporte Steam', 'Privacidad', 'Legal'] },
          { title: 'INFORMACIÓN LEGAL',  links: ['Privacidad', 'Términos', 'Devoluciones'] },
        ].map(col => (
          <div key={col.title}>
            <div style={s.footerLogo}>{col.title}</div>
            {col.links.map(l => <span key={l} style={s.footerLink}>{l}</span>)}
          </div>
        ))}
      </footer>
      <div style={s.footerBottom}>© 2026 AFKSCS, inc. Todos los derechos reservados.</div>
    </div>
  );
}
