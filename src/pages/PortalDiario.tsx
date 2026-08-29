import React, { useState } from 'react';
import { useStore } from '../state/store';
import Avatar from '../components/Avatar';
import DataComDiaSemana from '../components/DataComDiaSemana';
import EstadoVazio from '../components/EstadoVazio';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#F5F5F3',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  positivo: '#2E9E5B',
} as const;

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 40) return false;
  return trimmed === trimmed.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(trimmed);
}

interface LightboxProps {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Prev */}
        {photos.length > 1 && (
          <button
            onClick={prev}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l-6 6 6 6"/>
            </svg>
          </button>
        )}

        <div style={{ borderRadius: '12px', overflow: 'hidden', maxWidth: '780px', maxHeight: '80vh' }}>
          <img
            src={photos[current].replace('w=280&h=280', 'w=780&h=580')}
            alt={`Foto ${current + 1}`}
            style={{ display: 'block', maxWidth: '780px', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </div>

        {/* Next */}
        {photos.length > 1 && (
          <button
            onClick={next}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 4l6 6-6 6"/>
            </svg>
          </button>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div style={{ position: 'absolute', bottom: '-32px', left: '50%', transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            {current + 1} / {photos.length}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '-44px', right: '0', width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4l12 12M16 4L4 16"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PortalDiario() {
  const state = useStore();
  const [filter, setFilter] = useState<'todos' | 'com_fotos'>('todos');
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  // 5 most recent finalized diarios for obra o01, sorted newest first
  const allDiarios = state.diarios
    .filter(d => d.obra_id === 'o01' && d.estado === 'finalizado')
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  const diariosFiltrados = filter === 'com_fotos'
    ? allDiarios.filter(d => d.fotos.length > 0)
    : allDiarios;

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 32px 80px', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', gap: '24px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', margin: 0, lineHeight: '1.1' }}>
            Diário da obra
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.tintaFraca, marginTop: '8px' }}>
            Acompanhe o que foi feito, dia por dia
          </p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0', border: `1px solid ${C.borda}`, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
          {(['todos', 'com_fotos'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: filter === f ? 600 : 400,
                color: filter === f ? C.tinta : C.tintaFraca,
                backgroundColor: filter === f ? '#F0F0EE' : C.superficie,
                border: 'none', cursor: 'pointer',
                padding: '8px 16px',
                transition: 'all 0.15s ease',
              }}
            >
              {f === 'todos' ? 'Todos os dias' : 'Só com fotos'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      {diariosFiltrados.length === 0 ? (
        <EstadoVazio
          mensagem={
            filter === 'com_fotos'
              ? 'Sua obra ainda não tem diários com fotos. As imagens aparecem aqui depois do registro do gerente.'
              : 'Sua obra ainda não tem diários publicados. O primeiro dia aparece aqui depois do registro do gerente.'
          }
        />
      ) : (
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '10px', top: '20px', bottom: '20px', width: '1px', backgroundColor: C.borda }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {diariosFiltrados.map((diario, idx) => {
            const presencasEntry = state.presencas.filter(p => p.diario_id === diario.id);
            const pessoas = [...new Set(presencasEntry.map(p => p.pessoa_id))].map((pid) => {
              const pessoa = state.pessoas.find(p => p.id === pid);
              return { id: pid, name: pessoa?.nome ?? '?', role: pessoa?.funcao ?? '?' };
            });

            const semExecucao = diario.houve_execucao === false;
            const hasPhotos = diario.fotos.length > 0;

            return (
              <div key={diario.id} style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
                {/* Timeline dot */}
                <div style={{ flexShrink: 0, marginTop: '18px', zIndex: 1 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: semExecucao ? '#F5F5F3' : C.superficie, border: `2px solid ${semExecucao ? C.neutro : C.acento}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!semExecucao && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.acento }} />}
                  </div>
                </div>

                {/* Card */}
                <div style={{ flex: 1, backgroundColor: C.superficie, borderRadius: '16px', border: `1px solid ${C.borda}`, overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{ padding: '20px 24px 16px', borderBottom: semExecucao ? 'none' : `1px solid ${C.borda}` }}>
                    <DataComDiaSemana data={diario.data} modo="destaque" />
                  </div>

                  {semExecucao ? (
                    <div style={{ padding: '20px 24px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.neutro, fontStyle: 'italic' }}>
                        {diario.motivo_sem_execucao ?? 'Não houve execução'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Diary content */}
                      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {diario.texto.map((line, i) => {
                          if (isSectionHeader(line)) {
                            return (
                              <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.neutro, marginTop: i === 0 ? 0 : '14px', marginBottom: '6px' }}>
                                {line}
                              </p>
                            );
                          }
                          return (
                            <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '24px', color: C.grafite }}>
                              {line}
                            </p>
                          );
                        })}
                      </div>

                      {/* Photos */}
                      {hasPhotos && (
                        <div style={{ padding: '0 24px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(diario.fotos.length, 6)}, 1fr)`, gap: '8px' }}>
                            {diario.fotos.slice(0, 6).map((url, i) => (
                              <button
                                key={i}
                                onClick={() => setLightbox({ photos: diario.fotos, index: i })}
                                style={{ aspectRatio: '1 / 1', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#CCC', border: 'none', cursor: 'zoom-in', padding: 0 }}
                              >
                                <img
                                  src={url}
                                  alt={`Foto ${i + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s ease' }}
                                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* People chips */}
                      {pessoas.length > 0 && (
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.borda}`, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {pessoas.map(({ id, name, role }) => (
                            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5F5F3', borderRadius: '999px', padding: '6px 14px 6px 8px' }}>
                              <Avatar pessoaId={id} nome={name} tamanho={28} />
                              <div>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite }}>{name}</span>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginLeft: '6px' }}>{role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
