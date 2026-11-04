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
  {
    id: 1,
    filename: 'Alcance - Steam.pdf',
    title: 'Alcance — Steam',
    description: 'Definición del alcance operativo, límites funcionales y objetivos de la plataforma Steam.',
    filetype: 'pdf',
    createdAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 2,
    filename: 'Clusters_Steam DEF.html',
    title: 'Clusters Steam DEF',
    description: 'Análisis interactivo de clusters estratégicos y ecosistema de servicios de Valve.',
    filetype: 'html',
    createdAt: '2026-08-16T12:00:00.000Z',
  },
  {
    id: 3,
    filename: 'Matriz de riesgos.jpeg',
    title: 'Matriz de Riesgos',
    description: 'Identificación, evaluación de impacto y nivel de probabilidad de riesgos operacionales.',
    filetype: 'img',
    createdAt: '2026-08-18T14:30:00.000Z',
  },
  {
    id: 4,
    filename: 'NotebookLM Mind Map.png',
    title: 'Mapa Mental Estratégico',
    description: 'Mapa mental integral generado con los pilares estratégicos y organizacionales de Valve.',
    filetype: 'img',
    createdAt: '2026-08-19T09:15:00.000Z',
  },
  {
    id: 5,
    filename: 'Pestel.pdf',
    title: 'Análisis PESTEL',
    description: 'Diagnóstico del macroentorno político, económico, social, tecnológico, ambiental y legal.',
    filetype: 'pdf',
    createdAt: '2026-08-20T11:00:00.000Z',
  },
  {
    id: 6,
    filename: 'Pestel (1).pdf',
    title: 'Análisis PESTEL (v2)',
    description: 'Segunda entrega y profundización del análisis PESTEL del sector de videojuegos.',
    filetype: 'pdf',
    createdAt: '2026-08-21T15:00:00.000Z',
  },
  {
    id: 7,
    filename: 'TALLER DE ENTRADAS Y SALIDAS- (VALVE-STEAM)-GRUPO3.pdf',
    title: 'Taller Entradas y Salidas — Valve/Steam',
    description: 'Mapeo detallado de flujos de procesos, insumos y entregables del modelo de negocio.',
    filetype: 'pdf',
    createdAt: '2026-08-22T16:20:00.000Z',
  },
  {
    id: 8,
    filename: 'WhatsApp Image 2026-08-23 at 12.33.59 PM.jpeg',
    title: 'Evidencia de Sustentación',
    description: 'Registro visual y evidencia de las sesiones de trabajo y sustentación grupal.',
    filetype: 'img',
    createdAt: '2026-08-23T12:33:59.000Z',
  },
  {
    id: 9,
    filename: 'alcance.pdf',
    title: 'Alcance del Proyecto',
    description: 'Delimitación general de objetivos, requisitos y alcance del proyecto estratégico.',
    filetype: 'pdf',
    createdAt: '2026-08-24T10:00:00.000Z',
  },
  {
    id: 10,
    filename: 'aspectos e impactos ambientales.jpeg',
    title: 'Aspectos e Impactos Ambientales',
    description: 'Matriz de identificación de aspectos e impactos ambientales y sostenibilidad.',
    filetype: 'img',
    createdAt: '2026-08-25T11:30:00.000Z',
  },
  {
    id: 11,
    filename: 'dashboard_auditoria_valve.html',
    title: 'Dashboard de Auditoría Valve',
    description: 'Tablero interactivo para control, métricas de cumplimiento y seguimiento de auditoría.',
    filetype: 'html',
    createdAt: '2026-08-26T14:00:00.000Z',
  },
  {
    id: 12,
    filename: 'historia_y_procesos_valve_v2.docx',
    title: 'Historia y Procesos Valve v2',
    description: 'Documento histórico sobre la evolución empresarial y arquitectura de procesos de Valve.',
    filetype: 'docx',
    createdAt: '2026-08-27T09:40:00.000Z',
  },
  {
    id: 13,
    filename: 'mapa-procesos-valve-v2.png',
    title: 'Mapa de Procesos Valve v2',
    description: 'Cadena de valor completa: procesos estratégicos, misionales y de soporte.',
    filetype: 'img',
    createdAt: '2026-08-28T10:10:00.000Z',
  },
  {
    id: 14,
    filename: 'matriz  riesgos y seguridad información.jpeg',
    title: 'Riesgos y Seguridad de Información',
    description: 'Matriz de riesgos enfocada en ciberseguridad, integridad y confidencialidad de datos.',
    filetype: 'img',
    createdAt: '2026-08-29T15:00:00.000Z',
  },
  {
    id: 15,
    filename: 'matriz.pdf',
    title: 'Matriz Estratégica',
    description: 'Matriz de evaluación de factores internos y externos para la toma de decisiones.',
    filetype: 'pdf',
    createdAt: '2026-08-30T11:20:00.000Z',
  },
  {
    id: 16,
    filename: 'matriz (1).pdf',
    title: 'Matriz Estratégica (v2)',
    description: 'Segunda versión de la matriz con priorización y ponderación de variables críticas.',
    filetype: 'pdf',
    createdAt: '2026-08-31T14:45:00.000Z',
  },
  {
    id: 17,
    filename: 'matriz de riesgos y calidad.jpeg',
    title: 'Matriz de Riesgos y Calidad',
    description: 'Análisis de riesgos operativos alineado con estándares de calidad y servicio.',
    filetype: 'img',
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 18,
    filename: 'risk heatmap.jpeg',
    title: 'Risk Heatmap (Mapa de Calor)',
    description: 'Mapa de calor para visualización de criticidad y priorización de riesgos.',
    filetype: 'img',
    createdAt: '2026-09-02T13:15:00.000Z',
  },
  {
    id: 19,
    filename: 'risk treatment.jpeg',
    title: 'Tratamiento de Riesgos',
    description: 'Planes de mitigación, contingencia y acciones de tratamiento para riesgos clave.',
    filetype: 'img',
    createdAt: '2026-09-03T16:00:00.000Z',
  },
  {
    id: 20,
    filename: 'roles_y_procesos_valve.xlsx',
    title: 'Roles y Procesos Valve',
    description: 'Matriz de roles organizacionales y asignación de responsabilidades por proceso.',
    filetype: 'xlsx',
    createdAt: '2026-09-04T10:00:00.000Z',
  },
  {
    id: 21,
    filename: 'tabla de categorias.jpeg',
    title: 'Tabla de Categorías',
    description: 'Taxonomía y categorización de productos y servicios de la plataforma.',
    filetype: 'img',
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 22,
    filename: 'valve (1).pdf',
    title: 'Informe Estratégico Valve',
    description: 'Diagnóstico organizacional completo y formulación de estrategias competitivas.',
    filetype: 'pdf',
    createdAt: '2026-09-06T15:30:00.000Z',
  },
  {
    id: 23,
    filename: 'valve-raci-SEND (1).xlsx',
    title: 'Matriz RACI Valve',
    description: 'Matriz de responsabilidades: Responsable, Aprobador, Consultado e Informado.',
    filetype: 'xlsx',
    createdAt: '2026-09-07T17:00:00.000Z',
  },
];

const FILE_ICONS = {
  pdf:  <FilePdfOutlined   style={{ color: '#ff7875', fontSize: 24 }} />,
  img:  <FileImageOutlined style={{ color: '#69b1ff', fontSize: 24 }} />,
  doc:  <FileTextOutlined  style={{ color: '#597ef7', fontSize: 24 }} />,
  docx: <FileTextOutlined  style={{ color: '#597ef7', fontSize: 24 }} />,
  zip:  <FileZipOutlined   style={{ color: '#ffd666', fontSize: 24 }} />,
  xlsx: <FileTextOutlined  style={{ color: '#52c41a', fontSize: 24 }} />,
  html: <FileTextOutlined  style={{ color: '#fa8c16', fontSize: 24 }} />,
};

const TYPE_LABEL = { pdf: 'PDF', doc: 'DOC', docx: 'DOCX', img: 'IMG', zip: 'ZIP', xlsx: 'XLSX', html: 'HTML' };

const CARD_WIDTH = 280;
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
  cardDesc:     { color: '#8fa2b7', fontSize: 11.5, lineHeight: 1.5, height: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  cardDate:     { color: '#7a8fa6', fontSize: 11, marginTop: 2 },
  cardMeta:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  navBtn:       { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 36, height: 36, borderRadius: '50%', background: 'rgba(11,11,26,0.9)', border: '1px solid rgba(139,92,246,0.3)', color: '#c6d4df', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, transition: 'background 0.2s, border-color 0.2s' },
  typeTag:      (ft) => ({ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', borderRadius: 3, fontSize: 10, padding: '0 6px', fontWeight: 700 }),
  viewBtn:      { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', borderRadius: 3, padding: '6px 0', width: '100%', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
};

export default function AssignmentsCarousel() {
  const user = useSelector(st => st.auth.user);

  const [items,       setItems]       = useState(SEED_FILES);
  const [subject,     setSubject]     = useState('Gerencia Estratégica');
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [offset,      setOffset]      = useState(0);

  // ── load subject + assignments from backend ──────────────────────────────
  useEffect(() => {
    assignmentsService.getSubject()
      .then(r => { if (r?.data?.name) setSubject(r.data.name); })
      .catch(() => {});

    assignmentsService.getAll()
      .then(r => {
        if (r?.data?.assignments && r.data.assignments.length > 0) {
          setItems(r.data.assignments);
        }
      })
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
    window.open(`${import.meta.env.BASE_URL}trabajos/${encodeURIComponent(filename)}`, '_blank');
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        {FILE_ICONS[item.filetype] || FILE_ICONS.doc}
                      </div>
                      <div style={{ flex: 1 }}>
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

                  {/* Description */}
                  {item.description && (
                    <div style={s.cardDesc} title={item.description}>
                      {item.description}
                    </div>
                  )}

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
