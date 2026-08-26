import React, { useState, useMemo } from 'react';
import { useStore } from '../state/store';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
} as const;

const MESES_FULL = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

function formatarTituloSecao(data: string): string {
  const [, m, d] = data.split('-');
  return `${parseInt(d)} DE ${MESES_FULL[parseInt(m) - 1]}`;
}

function IconX() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 5l12 12M17 5L5 17" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 2v8M4 7l3.5 3.5L11 7" /><path d="M2 12h11" />
    </svg>
  );
}

interface FotoEntry {
  url: string;
  data: string;
  diarioId: string;
  index: number;
}

const AMBIENTE_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'a01', label: 'Suíte Master' },
  { key: 'a02', label: 'Banheiro da Suíte' },
  { key: 'a03', label: 'Cozinha' },
  { key: 'a04', label: 'Sala' },
  { key: 'a05', label: 'Lavabo' },
];

export default function ObraFotos() {
  const state = useStore();
  const [activeAmbiente, setActiveAmbiente] = useState('todos');
  const [ordem, setOrdem] = useState<'recentes' | 'antigas'>('recentes');
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null);

  // Collect all photos from obra o01 diaries
  const todasFotos: FotoEntry[] = useMemo(() => {
    const entries: FotoEntry[] = [];
    let globalIdx = 0;
    const diariosFiltrados = [...state.diarios.filter(d => d.obra_id === 'o01' && d.fotos.length > 0)]
      .sort((a, b) => b.data.localeCompare(a.data));
    for (const d of diariosFiltrados) {
      for (const url of d.fotos) {
        entries.push({ url, data: d.data, diarioId: d.id, index: globalIdx++ });
      }
    }
    return entries;
  }, [state.diarios]);

  // Since photos have no ambiente tag, ambiente filter is decorative
  const fotosVisiveis = useMemo(() => {
    const sorted = ordem === 'antigas' ? [...todasFotos].reverse() : todasFotos;
    return sorted;
  }, [todasFotos, ordem]);

  // Group by date
  const groups = useMemo(() => {
    const map: Record<string, FotoEntry[]> = {};
    for (const f of fotosVisiveis) {
      if (!map[f.data]) map[f.data] = [];
      map[f.data].push(f);
    }
    const dates = Object.keys(map);
    if (ordem === 'antigas') dates.sort((a, b) => a.localeCompare(b));
    else dates.sort((a, b) => b.localeCompare(a));
    return dates.map(data => ({ data, fotos: map[data] }));
  }, [fotosVisiveis, ordem]);

  const totalFotos = todasFotos.length;

  const handleOpen = (absoluteIdx: number) => {
    setLightbox({ index: absoluteIdx });
  };

  const handleNav = (dir: 1 | -1) => {
    if (!lightbox) return;
    const next = lightbox.index + dir;
    if (next < 0 || next >= fotosVisiveis.length) return;
    setLightbox({ index: next });
  };

  const currentFoto = lightbox !== null ? fotosVisiveis[lightbox.index] : null;

  return (
    <div style={{ padding: '28px 40px 80px', fontFamily: 'Inter, sans-serif', backgroundColor: C.fundo, minHeight: '100%' }}>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: C.tinta, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Fotos da obra
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, margin: 0 }}>
            {totalFotos} foto{totalFotos !== 1 ? 's' : ''}
          </p>
        </div>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
          color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
          borderRadius: '8px', padding: '9px 16px', cursor: 'pointer',
        }}>
          <IconDownload />
          Baixar todas
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        {/* Ambiente tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${C.borda}`, overflowX: 'auto' }}>
          {AMBIENTE_TABS.map(({ key, label }) => {
            const active = activeAmbiente === key;
            return (
              <button key={key} onClick={() => setActiveAmbiente(key)} style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 400,
                color: active ? C.tinta : C.tintaFraca, backgroundColor: 'transparent', border: 'none',
                borderBottom: active ? `3px solid ${C.acento}` : '3px solid transparent',
                padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: '-1px',
                flexShrink: 0,
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Ordem */}
        <select
          value={ordem}
          onChange={e => setOrdem(e.target.value as 'recentes' | 'antigas')}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.grafite,
            backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px',
            padding: '8px 12px', cursor: 'pointer', outline: 'none', flexShrink: 0,
          }}
        >
          <option value="recentes">Mais recentes</option>
          <option value="antigas">Mais antigas</option>
        </select>
      </div>

      {/* Groups */}
      {groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.neutro, fontSize: '14px' }}>
          Nenhuma foto encontrada.
        </div>
      )}

      {groups.map(group => (
        <div key={group.data} style={{ marginBottom: '32px' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', color: C.neutro,
            }}>
              {formatarTituloSecao(group.data)}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro }}>
              · {group.fotos.length} foto{group.fotos.length !== 1 ? 's' : ''}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: C.borda }} />
          </div>

          {/* Photo grid: 5 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {group.fotos.map(foto => (
              <div
                key={foto.index}
                onClick={() => handleOpen(foto.index)}
                style={{ position: 'relative', paddingBottom: '100%', cursor: 'zoom-in', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#D8D8D8' }}
                onMouseEnter={e => { (e.currentTarget.querySelector('img') as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget.querySelector('img') as HTMLImageElement).style.transform = 'scale(1)'; }}
              >
                <img
                  src={foto.url}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s ease' }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {lightbox !== null && currentFoto && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
            }}
          >
            <IconX />
          </button>

          {/* Counter */}
          <div style={{
            position: 'absolute', top: '22px', left: '50%', transform: 'translateX(-50%)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.7)',
          }}>
            {lightbox.index + 1} de {fotosVisiveis.length}
          </div>

          {/* Prev */}
          {lightbox.index > 0 && (
            <button
              onClick={e => { e.stopPropagation(); handleNav(-1); }}
              style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                width: '48px', height: '48px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
              }}
            >
              <IconChevronLeft />
            </button>
          )}

          {/* Image */}
          <img
            src={currentFoto.url.replace('w=280&h=280', 'w=900&h=700')}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 'min(900px, 90vw)', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px', display: 'block' }}
          />

          {/* Next */}
          {lightbox.index < fotosVisiveis.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); handleNav(1); }}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                width: '48px', height: '48px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
              }}
            >
              <IconChevronRight />
            </button>
          )}

          {/* Date caption */}
          <div style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)',
          }}>
            {formatarTituloSecao(currentFoto.data)}
          </div>
        </div>
      )}
    </div>
  );
}
