import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, obraPorSlug } from '../state/store';
import { ambientesDaObra } from '../state/midia';
import EstadoVazio from '../components/EstadoVazio';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  positivo: '#2E9E5B',
  atencao: '#E8833A',
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
function IconUpload() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 12V4M4 7l3.5-3.5L11 7" /><path d="M2 13h11" />
    </svg>
  );
}

interface FotoEntry {
  url: string;
  data: string;
  diarioId: string;
  index: number;
}

export default function ObraFotos() {
  const state = useStore();
  const { obraId } = useParams<{ obraId: string }>();
  const [activeAmbiente, setActiveAmbiente] = useState('todos');
  const [ordem, setOrdem] = useState<'recentes' | 'antigas'>('recentes');
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null);
  const [envioAberto, setEnvioAberto] = useState(false);
  const [ambienteEnvio, setAmbienteEnvio] = useState('');
  const [arquivoEnvio, setArquivoEnvio] = useState<File | null>(null);
  const [erroEnvio, setErroEnvio] = useState('');
  const [confirmacaoEnvio, setConfirmacaoEnvio] = useState('');

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;

  const ambientesDisponiveis = useMemo(
    () => (obra ? ambientesDaObra(state, obra.id) : []),
    [state.ambientes, obra]
  );
  const AMBIENTE_TABS = useMemo(
    () => [{ key: 'todos', label: 'Todos' }, ...ambientesDisponiveis.map(a => ({ key: a.id, label: a.nome }))],
    [ambientesDisponiveis]
  );

  // Collect all photos from this obra's diaries
  const todasFotos: FotoEntry[] = useMemo(() => {
    if (!obra) return [];
    const entries: FotoEntry[] = [];
    let globalIdx = 0;
    const diariosFiltrados = [...state.diarios.filter(d => d.obra_id === obra.id && d.fotos.length > 0)]
      .sort((a, b) => b.data.localeCompare(a.data));
    for (const d of diariosFiltrados) {
      for (const url of d.fotos) {
        entries.push({ url, data: d.data, diarioId: d.id, index: globalIdx++ });
      }
    }
    return entries;
  }, [state.diarios, obra]);

  if (!obra) return null;

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

  const handleEnviarMidia = () => {
    const erro = state.adicionarMidiaNaObra({
      obra_id: obra.id,
      ambiente_id: ambienteEnvio,
      url: arquivoEnvio ? URL.createObjectURL(arquivoEnvio) : '',
      tipo: arquivoEnvio?.type.startsWith('video/') ? 'video' : 'foto',
    });

    if (erro) {
      setErroEnvio(erro);
      setConfirmacaoEnvio('');
      return;
    }

    setErroEnvio('');
    setConfirmacaoEnvio('Mídia enviada.');
    setActiveAmbiente(ambienteEnvio);
    setArquivoEnvio(null);
    setAmbienteEnvio('');
    setEnvioAberto(false);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => { setEnvioAberto((aberto) => !aberto); setErroEnvio(''); setConfirmacaoEnvio(''); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: C.tinta, backgroundColor: C.acento, border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer' }}
          >
            <IconUpload />
            Enviar mídia
          </button>
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
      </div>

      {confirmacaoEnvio && (
        <p role="status" aria-live="polite" data-confirmacao-acao="true" style={{ margin: '-8px 0 20px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#EDFAF3', color: C.positivo, fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600 }}>
          {confirmacaoEnvio}
        </p>
      )}

      {envioAberto && (
        <section aria-label="Enviar mídia" style={{ marginBottom: '24px', padding: '20px', border: `1px solid ${C.borda}`, borderRadius: '12px', backgroundColor: C.superficie }}>
          <h2 style={{ margin: '0 0 16px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', color: C.tinta }}>Enviar mídia</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(220px, 1fr) auto', gap: '12px', alignItems: 'end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: C.grafite }}>
              Ambiente
              <select
                aria-required="true"
                value={ambienteEnvio}
                onChange={(event) => { setAmbienteEnvio(event.target.value); setErroEnvio(''); }}
                style={{ width: '100%', padding: '10px 11px', border: `1px solid ${erroEnvio && !ambienteEnvio ? C.atencao : C.borda}`, borderRadius: '8px', backgroundColor: C.superficie, color: C.grafite, fontFamily: 'Inter, sans-serif', fontSize: '13px' }}
              >
                <option value="">Escolha o ambiente</option>
                {ambientesDisponiveis.map((ambiente) => <option key={ambiente.id} value={ambiente.id}>{ambiente.nome}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: C.grafite }}>
              Arquivo
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(event) => { setArquivoEnvio(event.target.files?.[0] ?? null); setErroEnvio(''); }}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: `1px solid ${C.borda}`, borderRadius: '8px', backgroundColor: C.superficie, color: C.tintaFraca, fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
              />
            </label>
            <button type="button" onClick={handleEnviarMidia} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: C.acento, color: C.tinta, fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Enviar mídia
            </button>
          </div>
          {erroEnvio && <p role="alert" style={{ margin: '10px 0 0', color: C.atencao, fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '19px' }}>{erroEnvio}</p>}
        </section>
      )}

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
        <EstadoVazio
          mensagem={
            activeAmbiente === 'todos'
              ? 'Esta obra ainda não tem fotos. As primeiras aparecem aqui quando o gerente registrar o dia.'
              : 'Este ambiente ainda não tem fotos. Elas aparecem aqui quando o gerente registrar o serviço.'
          }
        />
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
