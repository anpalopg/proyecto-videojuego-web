import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Tooltip, message } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileZipOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { assignmentsService } from '../services/api';
import { useSelector } from 'react-redux';

// ── File metadata seeded from the real /trabajos/ folder ─────────────────────
const SEED_FILES = [
  { filename: 'Alcance - Steam.pdf',                                   title: 'Alcance — Steam',                          filetype: 'pdf'  },
  { filename: 'Clusters_Steam DEF.html',                               title: 'Clusters Steam DEF',                       filetype: 'doc'  },
  { filename: 'Pestel (1).pdf',                                        title: 'PESTEL (versión 2)',                        filetype: 'pdf'  },
  { filename: 'Pestel.pdf',                                            title: 'PESTEL',                                   filetype: 'pdf'  },
  { filename: 'TALLER DE ENTRADAS Y SALIDAS- (VALVE-STEAM)-GRUPO3.pdf',title: 'Taller Entradas y Salidas — Valve/Steam',  filetype: 'pdf'  },
  { filename: 'WhatsApp Image 2026-08-23 at 12.33.59 PM.jpeg',        title: 'Imagen de sustentación',                   filetype: 'img'  },
  { filename: 'alcance.pdf',                                           title: 'Alcance del proyecto',                     filetype: 'pdf'  },
  { filename: 'matriz (1).pdf',                                        title: 'Matriz (versión 2)',                        filetype: 'pdf'  },
  { filename: 'matriz.pdf',                                            title: 'Matriz',                                   filetype: 'pdf'  },
  { filename: 'valve (1).pdf',                                         title: 'Valve (versión 2)',                        filetype: 'pdf'  },
  { filename: 'valve-raci-SEND (1).xlsx',                              title: 'Valve RACI',                               filetype: 'xlsx' },
];

const FILE_ICONS = {
  pdf:  <FilePdfOutlined  style={{ color: '#ff7875', fontSize: 26 }} />,
  img:  <FileImageOutlined style={{ color: '#69b1ff', fontSize: 26 }} />,
  doc:  <FileTextOutlined  style={{ color: '#95de64', fontSize: 26 }} />,
  zip:  <FileZipOutlined   style={{ color: '#ffd666', fontSize: 26 }} />,
  xlsx: <FileTextOutlined  style={{ color: '#95de64', fontSize: 26 }} />,
  html: <FileTextOutlined  style={{ color: '#69b1ff', fontSize: 26 }} />,
};

const TYPE_LABEL = { pdf: 'PDF', doc: 'DOC', img: 'IMG', zip: 'ZIP', xlsx: 'XLSX', html: 'HTML' };

const CARD_WIDTH = 260;
const GAP        = 16;
const VISIBLE    = 4;

const s = {
  section:      { padding: '40px 64px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleRow:     { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  title:        { color: '#c6d4df', fontSize: 18, fontWeight: 700, letterSpacing: 1 },
  countBadge:   { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', borderRadius: 12, padding: '1px 10px', fontSize: 11, fontWeight: 700 },
  subjectRow:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
  subjectPill:  { padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #8b5cf6', background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'inline-block' },
  editInput:    { background: 'rgba(11,11,26,0.8)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: 20, padding: '4px 12px', color: '#c6d4df', fontSize: 12, fontWeight: 600, outline: 'none', width: 220 },
  iconBtn:      { background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', lineHeight: 1 },
  carouselWrap: { position: 'relative' },
  track:        { display: 'flex', gap: GAP, transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)' },
  card:         { flexShrink: 0, width: CARD_WIDTH, background: '#16213e', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 6, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.2s, transform 0.2s' },
  cardTitle:    { color: '#c6d4df', fontSize: 13, fontWeight: 600, lineHeight: 1.4, flex: 1, paddingRight: 6 },
  cardDate:     { color: '#7a8fa6', fontSize: 11, marginTop: 2 },
  cardMeta:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBtn:       { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 36, height: 36, borderRadius: '50%', background: 'rgba(11,11,26,0.9)', border: '1px solid rgba(139,92,246,0.3)', color: '#c6d4df', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, transition: 'background 0.2s, border-color 0.2s' },
  typeTag:      (ft) => ({ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', borderRadius: 3, fontSize: 10, padding: '0 6px', fontWeight: 700 }),
  viewBtn:      { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', borderRadius: 3, padding: '5px 0', width: '100%', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
};

export default function AssignmentsCarousel() {
  const user = useSelector(st => st.auth.user);

  const [items,       setItems]       = useState([]);
  const [subject,     setSubject]     = useState('Gerencia Estratégica');
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [offset,      setOffset]      = useState(0);

  // ── load subject + assignments from backend ──────────────────────────────
  useEffect(() => {
    assignmentsService.getSubject()
      .then(r => setSubject(r.data.name))
      .catch(() => {});

    assignmentsService.getAll()
      .then(r => setItems(r.data.assignments))
      .catch(() => {});
  }, []);

  const maxOffset  = Math.max(0, items.length - VISIBLE);
  const translateX = offset * (CARD_WIDTH + GAP);
  const prev = () => setOffset(o => Math.max(0, o - 1));
  const next = () => setOffset(o => Math.min(maxOffset, o + 1));

  // ── subject name edit ─────────────────────────────────────────────────────
  const startEdit = () => { setNameInput(subject); setEditingName(true); };
  const cancelEdit = () => setEditingName(false);
  const saveEdit = () => {
    const name = nameInput.trim();
    if (!name) { message.error('El nombre no puede estar vacío'); return; }
    assignmentsService.setSubject(name)
      .then(r => { setSubject(r.data.name); setEditingName(false); message.success('Nombre guardado'); })
      .catch(() => message.error('Error al guardar. ¿Iniciaste sesión?'));
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const removeItem = (id) => {
    assignmentsService.remove(id)
      .then(() => {
        setItems(prev => prev.filter(i => i.id !== id));
        setOffset(0);
        message.success('Trabajo eliminado');
      })
      .catch(() => message.error('Error al eliminar. ¿Iniciaste sesión?'));
  };

  const openFile = (filename) => {
    window.open(`/trabajos/${encodeURIComponent(filename)}`, '_blank');
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={s.section}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.title}>Trabajos</span>
          <span style={s.countBadge}>{items.length}</span>
        </div>
      </div>

      {/* ── Subject pill + inline edit ─────────────────────────────────── */}
      <div style={s.subjectRow}>
        {editingName ? (
          <>
            <input
              autoFocus
              style={s.editInput}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
            />
            <button style={{ ...s.iconBtn, color: '#10b981' }} onClick={saveEdit}>
              <CheckOutlined />
            </button>
            <button style={{ ...s.iconBtn, color: '#7a8fa6' }} onClick={cancelEdit}>
              <CloseOutlined />
            </button>
          </>
        ) : (
          <>
            <div style={s.subjectPill}>{subject}</div>
            {user && (
              <Tooltip title="Editar nombre de materia">
                <button style={{ ...s.iconBtn, color: '#7a8fa6' }} onClick={startEdit}>
                  <EditOutlined style={{ fontSize: 13 }} />
                </button>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {/* ── Carousel ───────────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div style={{ color: '#7a8fa6', fontSize: 13, padding: '24px 0' }}>
          No hay trabajos aún. Inicia sesión para cargar los archivos.
        </div>
      ) : (
        <div style={s.carouselWrap}>
          {offset > 0 && (
            <button
              style={{ ...s.navBtn, left: -18 }}
              onClick={prev}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.8)'; e.currentTarget.style.borderColor = '#8b5cf6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(11,11,26,0.9)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
            >
              <LeftOutlined />
            </button>
          )}

          <div style={{ overflow: 'hidden' }}>
            <div style={{ ...s.track, transform: `translateX(-${translateX}px)` }}>
              {items.map(item => (
                <div
                  key={item.id}
                  style={s.card}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Top row: icon + title + delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {FILE_ICONS[item.filetype] || FILE_ICONS.doc}
                      <div>
                        <div style={s.cardTitle}>{item.title}</div>
                        <div style={s.cardDate}>{formatDate(item.createdAt)}</div>
                      </div>
                    </div>
                    {user && (
                      <Tooltip title="Eliminar">
                        <button
                          style={{ background: 'none', border: 'none', color: '#7a8fa6', cursor: 'pointer', padding: '2px 4px', lineHeight: 1, flexShrink: 0 }}
                          onClick={() => removeItem(item.id)}
                          onMouseEnter={e => e.currentTarget.style.color = '#ff7875'}
                          onMouseLeave={e => e.currentTarget.style.color = '#7a8fa6'}
                        >
                          <DeleteOutlined style={{ fontSize: 12 }} />
                        </button>
                      </Tooltip>
                    )}
                  </div>

                  {/* Type tag + subject */}
                  <div style={s.cardMeta}>
                    <span style={s.typeTag(item.filetype)}>
                      {TYPE_LABEL[item.filetype] || item.filetype.toUpperCase()}
                    </span>
                    <span style={{ color: '#8b5cf6', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, maxWidth: 130, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {subject}
                    </span>
                  </div>

                  {/* View button */}
                  <button
                    style={s.viewBtn}
                    onClick={() => openFile(item.filename)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                  >
                    <EyeOutlined />Ver trabajo
                  </button>
                </div>
              ))}
            </div>
          </div>

          {offset < maxOffset && (
            <button
              style={{ ...s.navBtn, right: -18 }}
              onClick={next}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.8)'; e.currentTarget.style.borderColor = '#8b5cf6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(11,11,26,0.9)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
            >
              <RightOutlined />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
