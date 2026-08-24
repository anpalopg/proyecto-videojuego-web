import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Tag, Progress } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import StoreNav from '../components/layout/StoreNav';
import { addLocal } from '../store/slices/cartSlice';
import { GAMES_DB } from '../data/games';

// ── per-game cover accent ──────────────────────────────────────────────────────
const COVER_STYLES = {
  1: { background: 'radial-gradient(ellipse at 50% 30%, rgba(109,40,217,0.55), rgba(11,11,26,0.98))', label: 'RECESSED MINDS' },
  2: { background: 'radial-gradient(ellipse at 50% 30%, rgba(180,20,20,0.65),  rgba(11,11,26,0.98))', label: 'OUTLAST' },
  3: { background: 'radial-gradient(ellipse at 50% 30%, rgba(160,10,10,0.65),  rgba(11,11,26,0.98))', label: 'OUTLAST 2' },
  4: { background: 'radial-gradient(ellipse at 50% 30%, rgba(220,40,40,0.55),  rgba(11,11,26,0.98))', label: 'ROBLOX' },
  5: { background: 'radial-gradient(ellipse at 50% 30%, rgba(0,140,240,0.45),  rgba(11,11,26,0.98))', label: 'GTA V' },
};

// Fallback placeholder game when navigating to an unknown id
const FALLBACK = GAMES_DB[1];

const s = {
  page: { minHeight: '100vh', background: '#0b0b1a' },
  inner: { maxWidth: 980, margin: '0 auto', padding: '32px 24px' },
  breadcrumb: { color: '#7a8fa6', fontSize: 12, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' },
  breadLink: { color: '#8b5cf6', cursor: 'pointer' },
  title: { color: '#c6d4df', fontSize: 26, fontWeight: 700, marginBottom: 20 },
  topGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 },
  mainImg: {
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: 4,
    aspectRatio: '16/9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#c6d4df', fontSize: 20, fontWeight: 800, letterSpacing: 3,
  },
  thumbs: { display: 'flex', gap: 6, marginTop: 8 },
  thumb: {
    flex: 1, height: 52,
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: 2, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#7a8fa6', fontSize: 10, fontWeight: 600,
  },
  sidePanel: {
    background: '#16213e',
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: 4,
    padding: 16,
  },
  sideName: { color: '#c6d4df', fontSize: 16, fontWeight: 700, marginBottom: 8 },
  sidePrice: { color: '#a4d007', fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sidePriceOrig: { color: '#7a8fa6', textDecoration: 'line-through', fontSize: 12, marginBottom: 12 },
  sidePriceFree: { color: '#67c23a', fontSize: 22, fontWeight: 700, marginBottom: 12 },
  buyBtn: { width: '100%', height: 44, background: 'linear-gradient(90deg,#4a8c4a,#5aab5a)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 3, cursor: 'pointer', marginBottom: 8 },
  sideInfo: { fontSize: 11, color: '#7a8fa6', marginTop: 12 },
  sideInfoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  sideLabel: { color: '#7a8fa6' },
  sideValue: { color: '#c6d4df' },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  descGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 },
  descTitle: { color: '#c6d4df', fontSize: 15, fontWeight: 700, marginBottom: 10, borderBottom: '1px solid rgba(139,92,246,0.15)', paddingBottom: 8 },
  descText: { color: '#7a8fa6', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' },
  offersSection: { marginBottom: 32 },
  offerRow: {
    background: '#16213e',
    border: '1px solid rgba(139,92,246,0.1)',
    borderRadius: 4, padding: '14px 16px', marginBottom: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  offerLeft: { flex: 1 },
  offerName: { color: '#c6d4df', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  offerNote: { color: '#7a8fa6', fontSize: 11 },
  offerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  offerDiscount: { background: '#4c6b22', color: '#a4d007', padding: '4px 8px', borderRadius: 2, fontSize: 14, fontWeight: 700 },
  offerOriginal: { color: '#7a8fa6', fontSize: 11, textDecoration: 'line-through' },
  offerPrice: { color: '#a4d007', fontSize: 15, fontWeight: 700 },
  offerPriceFree: { color: '#67c23a', fontSize: 15, fontWeight: 700 },
  addCartBtn: { background: '#5a8a5a', border: 'none', color: '#fff', borderRadius: 3, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' },
};

export default function GameDetailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const game = GAMES_DB[Number(id)] || FALLBACK;
  const cover = COVER_STYLES[game.id] || COVER_STYLES[1];
  const shots = game.screenshots && game.screenshots.length > 0 ? game.screenshots : null;
  const [mainImg, setMainImg] = useState(0);
  const isFree = game.price === 'Gratis';

  const addToCart = (offer) => {
    dispatch(addLocal({ id: `${game.id}-${offer.id}`, title: offer.name, price: offer.price, cover: game.cover || null }));
  };

  return (
    <div style={s.page}>
      <StoreNav />
      <div style={s.inner}>

        {/* Breadcrumb */}
        <div style={s.breadcrumb}>
          <span style={s.breadLink} onClick={() => navigate('/')}>Tienda</span>
          <span>/</span>
          <span style={s.breadLink}>{game.tags[0]}</span>
          <span>/</span>
          <span>{game.title}</span>
        </div>

        <h1 style={s.title}>{game.title}</h1>

        {/* Top grid */}
        <div style={s.topGrid}>
          {/* Screenshots */}
          <div>
            {shots
              ? <img src={shots[mainImg]} alt={`${game.title} screenshot ${mainImg + 1}`} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(139,92,246,0.15)', display: 'block' }} />
              : <div style={{ ...s.mainImg, background: cover.background }}>{cover.label}</div>
            }
            <div style={s.thumbs}>
              {(shots || [null, null, null, null, null]).map((src, i) => (
                <div
                  key={i}
                  style={{ ...s.thumb, borderColor: mainImg === i ? '#8b5cf6' : 'rgba(139,92,246,0.15)', overflow: 'hidden', padding: 0 }}
                  onClick={() => setMainImg(i)}
                >
                  {src
                    ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', background: cover.background, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8fa6', fontSize: 9 }}>SCR {i+1}</div>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div style={s.sidePanel}>
            {game.cover && (
              <img src={game.cover} alt={game.title} style={{ width: '100%', borderRadius: 3, objectFit: 'cover', marginBottom: 12, display: 'block' }} />
            )}
            <div style={s.sideName}>{game.title}</div>
            {game.originalPrice && <div style={s.sidePriceOrig}>{game.originalPrice}</div>}
            {isFree
              ? <div style={s.sidePriceFree}>Gratis</div>
              : <div style={s.sidePrice}>{game.price}</div>
            }
            <button
              style={s.buyBtn}
              onClick={() => addToCart(game.offers[0])}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              {isFree ? 'Jugar gratis' : 'Añadir al carrito'}
            </button>
            {game.externalUrl && (
              <button
                style={{ width: '100%', height: 36, background: 'transparent', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa', fontWeight: 600, fontSize: 12, borderRadius: 3, cursor: 'pointer', marginBottom: 4 }}
                onClick={() => window.open(game.externalUrl, '_blank')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)'; e.currentTarget.style.background = 'rgba(109,40,217,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Ver página oficial
              </button>
            )}

            <div style={s.sideInfo}>
              {[
                ['Desarrollador', game.developer],
                ['Editor', game.publisher],
                ['Lanzamiento', game.releaseDate],
              ].map(([l, v]) => (
                <div key={l} style={s.sideInfoRow}>
                  <span style={s.sideLabel}>{l}</span>
                  <span style={s.sideValue}>{v}</span>
                </div>
              ))}
            </div>

            <div style={s.tagsRow}>
              {game.tags.map(t => (
                <Tag key={t} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', borderRadius: 2, fontSize: 10 }}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>

        {/* Description grid */}
        <div style={s.descGrid}>
          <div>
            <div style={s.descTitle}>Sobre el juego</div>
            <p style={s.descText}>{game.description}</p>
          </div>
          <div>
            <div style={s.descTitle}>Características</div>
            <p style={s.descText}>{game.features}</p>
          </div>
          <div>
            <div style={s.descTitle}>Requisitos mínimos</div>
            <p style={s.descText}>{game.requirements.min}</p>
          </div>
          <div>
            <div style={s.descTitle}>Requisitos recomendados</div>
            <p style={s.descText}>{game.requirements.rec}</p>
          </div>
        </div>

        {/* Purchase options */}
        <div style={s.offersSection}>
          <div style={{ color: '#c6d4df', fontSize: 15, fontWeight: 700, marginBottom: 14, borderBottom: '1px solid rgba(139,92,246,0.1)', paddingBottom: 10 }}>
            Opciones de compra
          </div>
          {game.offers.map(offer => (
            <div key={offer.id} style={s.offerRow}>
              <div style={s.offerLeft}>
                <div style={s.offerName}>{offer.name}</div>
                {offer.note && <div style={s.offerNote}>{offer.note}</div>}
              </div>
              <div style={s.offerRight}>
                {offer.discount ? (
                  <div style={{ display: 'flex', background: 'rgba(27,40,56,0.6)', borderRadius: 2, overflow: 'hidden' }}>
                    <span style={s.offerDiscount}>{offer.discount}%</span>
                    <div style={{ padding: '4px 8px' }}>
                      {offer.original && <div style={s.offerOriginal}>{offer.original}</div>}
                      <div style={s.offerPrice}>{offer.price}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginRight: 8 }}>
                    <div style={offer.price === 'Gratis' ? s.offerPriceFree : s.offerPrice}>{offer.price}</div>
                  </div>
                )}
                <button
                  style={s.addCartBtn}
                  onClick={() => addToCart(offer)}
                  onMouseEnter={e => e.currentTarget.style.background = '#6aaa6a'}
                  onMouseLeave={e => e.currentTarget.style.background = '#5a8a5a'}
                >
                  {offer.price === 'Gratis' ? 'Jugar gratis' : 'Añadir al carro'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div>
          <div style={{ background: '#16213e', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 4, padding: 20 }}>
            <div style={{ color: '#c6d4df', fontSize: 13, marginBottom: 8 }}>
              Valoración general:{' '}
              <span style={{ color: '#66c0f4' }}>
                {game.statsPositive >= 90 ? 'Extremadamente positiva' : game.statsPositive >= 80 ? 'Muy positiva' : game.statsPositive >= 70 ? 'Mayormente positiva' : 'Mixta'}
              </span>
            </div>
            <Progress percent={game.statsPositive} strokeColor={{ from: '#4c6b22', to: '#a4d007' }} trailColor="rgba(139,92,246,0.1)" />
            <div style={{ color: '#7a8fa6', fontSize: 11, marginTop: 6 }}>
              {game.statsPositive}% de {game.totalReviews.toLocaleString()} reseñas son positivas
            </div>
            <div style={{ marginTop: 16, height: 80, background: 'rgba(27,40,56,0.4)', borderRadius: 4, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '8px 8px 0', overflow: 'hidden' }}>
              {Array.from({ length: 36 }).map((_, i) => {
                const h = 15 + Math.abs(Math.sin(i * 0.7 + game.id)) * 65;
                return <div key={i} style={{ flex: 1, height: `${h}%`, background: i % 4 === 0 ? '#a4d007' : '#4c6b22', borderRadius: '2px 2px 0 0', opacity: 0.85 }} />;
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
