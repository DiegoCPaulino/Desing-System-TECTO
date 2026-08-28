import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, getPessoaNome, obraSlug, obraPorSlug } from '../state/store';
import Avatar from '../components/Avatar';
import DataComDiaSemana from '../components/DataComDiaSemana';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  positivo: '#2E9E5B',
  atencao: '#E8833A',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
} as const;

const PERIODO_PT: Record<string, string> = {
  dia_todo: 'Dia todo',
  manha: 'Manhã',
  tarde: 'Tarde',
};

const MES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function formatarDataCompleta(data: string): string {
  const [, m, d] = data.split('-');
  return `${parseInt(d)} de ${MES_PT[parseInt(m) - 1]}`;
}

function formatarDataNumero(data: string): string {
  const [, m, d] = data.split('-');
  return `${d}/${m}`;
}

function isSectionHeader(line: string): boolean {
  const t = line.trim();
  return t.length >= 3 && t.length <= 40 && t === t.toUpperCase() && /[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]/.test(t);
}

function IconLock() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5.5" width="9" height="6.5" rx="1.5" />
      <path d="M4 5.5V3.5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4h1.5L4 2h6l1.5 2H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <circle cx="7" cy="7.5" r="2.2" />
    </svg>
  );
}
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="4.5" /><path d="M13.5 13.5l-3-3" /></svg>;
}

export default function ObraDiarios() {
  const state = useStore();
  const { obraId } = useParams<{ obraId: string }>();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'todos' | 'com_fotos' | 'sem_execucao'>('todos');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;
  if (!obra) return null;

  if (obra.tipo === 'pequeno_servico') {
    return (
      <div style={{ padding: '48px 40px', fontFamily: 'Inter, sans-serif', color: C.neutro, fontSize: '14px', textAlign: 'center' }}>
        {obra.codigo} é um pequeno serviço e não tem Diário de Obra.
      </div>
    );
  }

  const diarios = state.diarios
    .filter(d => d.obra_id === obra.id)
    .sort((a, b) => b.data.localeCompare(a.data));

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isPeriodoClosed = (data: string) =>
    state.fechamentos.some(
      f => f.estado === 'fechado' && f.periodo_inicio <= data && f.periodo_fim >= data
    );

  const filtered = diarios.filter(d => {
    if (filterTab === 'com_fotos' && d.fotos.length === 0) return false;
    if (filterTab === 'sem_execucao' && d.houve_execucao !== false) return false;
    if (search) {
      const q = search.toLowerCase();
      const textoMatch = d.texto.some(l => l.toLowerCase().includes(q));
      const dataMatch = formatarDataCompleta(d.data).includes(q) || formatarDataNumero(d.data).includes(q);
      const presencasMatch = state.presencas
        .filter(p => p.diario_id === d.id)
        .some(p => getPessoaNome(state, p.pessoa_id).toLowerCase().includes(q));
      if (!textoMatch && !dataMatch && !presencasMatch) return false;
    }
    return true;
  });

  const estadoBadge = (estado: string) => {
    if (estado === 'finalizado') return { label: 'Finalizado', bg: '#EDFAF3', color: '#2E9E5B' };
    return { label: 'Rascunho', bg: '#F2F2F2', color: '#666666' };
  };

  return (
    <div style={{ padding: '28px 40px 80px', fontFamily: 'Inter, sans-serif', backgroundColor: C.fundo, minHeight: '100%' }}>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700,
          color: C.tinta, margin: 0, letterSpacing: '-0.02em',
        }}>
          Diários da obra
        </h1>
        <Link
          to={`/obras/${obraSlug(obra)}/diario`}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
            color: C.tinta, backgroundColor: C.acento, border: 'none',
            borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}
        >
          Abrir diário de hoje
        </Link>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: C.neutro, pointerEvents: 'none' }}>
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar por texto ou data…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite,
              backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px',
              padding: '9px 14px 9px 34px', outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', border: `1px solid ${C.borda}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: C.superficie }}>
          {([
            { key: 'todos', label: 'Todos' },
            { key: 'com_fotos', label: 'Com fotos' },
            { key: 'sem_execucao', label: 'Sem execução' },
          ] as const).map(({ key, label }) => {
            const active = filterTab === key;
            return (
              <button key={key} onClick={() => setFilterTab(key)} style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 400,
                color: active ? C.tinta : C.tintaFraca, backgroundColor: active ? C.acento : 'transparent',
                border: 'none', padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diary cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.neutro, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            Nenhum diário encontrado.
          </div>
        )}

        {filtered.map(diario => {
          const isExpanded = expandedIds.has(diario.id);
          const fechado = isPeriodoClosed(diario.data);
          const badge = estadoBadge(diario.estado);
          const semExecucao = diario.houve_execucao === false;
          const presencas = state.presencas.filter(p => p.diario_id === diario.id);
          const textLines = diario.texto.filter(l => l.trim() !== '');
          const bodyLines = textLines.filter(l => !isSectionHeader(l));
          const preview = bodyLines.slice(0, 2);

          return (
            <div
              key={diario.id}
              style={{
                backgroundColor: C.superficie, borderRadius: '12px', border: `1px solid ${C.borda}`,
                overflow: 'hidden', cursor: 'pointer',
              }}
              onClick={() => toggleExpanded(diario.id)}
            >
              {/* Card header */}
              <div style={{ padding: '18px 20px 16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {/* Date block */}
                <div style={{
                  flexShrink: 0, backgroundColor: C.fundo, borderRadius: '10px',
                  padding: '8px 14px', textAlign: 'center', minWidth: '60px',
                }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '22px', fontWeight: 700, color: C.tinta, margin: 0, lineHeight: '1' }}>
                    {diario.data.slice(8, 10)}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {MES_PT[parseInt(diario.data.slice(5, 7)) - 1].slice(0, 3)}
                  </p>
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <DataComDiaSemana data={diario.data} />
                    {fechado && (
                      <span style={{ color: C.neutro, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <IconLock />
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
                      backgroundColor: badge.bg, color: badge.color, padding: '2px 9px', borderRadius: '999px',
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  {semExecucao ? (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro, fontStyle: 'italic', margin: '0 0 12px' }}>
                      {diario.motivo_sem_execucao ?? 'Não houve execução'}
                    </p>
                  ) : (
                    <>
                      {!isExpanded && preview.length > 0 && (
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca,
                          margin: '0 0 12px', lineHeight: '1.5',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {preview.join(' · ')}
                        </p>
                      )}

                      {!isExpanded && diario.fotos.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                          {diario.fotos.slice(0, 4).map((url, i) => (
                            <img key={i} src={url} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                          ))}
                          {diario.fotos.length > 4 && (
                            <div style={{ width: '56px', height: '56px', borderRadius: '6px', backgroundColor: C.borda, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: C.tintaFraca }}>
                                +{diario.fotos.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Presença avatars (collapsed) */}
                  {!isExpanded && presencas.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex' }}>
                        {presencas.slice(0, 3).map((p, i) => (
                          <Avatar
                            key={p.id}
                            pessoaId={p.pessoa_id}
                            nome={getPessoaNome(state, p.pessoa_id)}
                            tamanho={26}
                            style={{ border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0' }}
                          />
                        ))}
                        {presencas.length > 3 && (
                          <div style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            backgroundColor: '#D8D8D8', border: '2px solid white', marginLeft: '-8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700, color: C.tintaFraca }}>
                              +{presencas.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro }}>
                        {presencas.length} pessoa{presencas.length !== 1 ? 's' : ''}
                      </span>
                      {diario.fotos.length > 0 && (
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconCamera />
                          {diario.fotos.length} foto{diario.fotos.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.borda}`, padding: '20px 20px 20px' }} onClick={e => e.stopPropagation()}>

                  {fechado && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      backgroundColor: '#F5F5F3', borderRadius: '8px', padding: '10px 14px',
                      fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.neutro,
                      marginBottom: '16px',
                    }}>
                      <IconLock />
                      Período fechado. Alterações somente por estorno.
                    </div>
                  )}

                  {semExecucao ? (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro, fontStyle: 'italic', marginBottom: '16px' }}>
                      {diario.motivo_sem_execucao ?? 'Não houve execução'}
                    </p>
                  ) : (
                    <>
                      {/* Full text */}
                      {textLines.length > 0 && (
                        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {textLines.map((line, i) => {
                            const isHeader = isSectionHeader(line);
                            return isHeader ? (
                              <p key={i} style={{
                                fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700,
                                color: C.neutro, letterSpacing: '0.08em', textTransform: 'uppercase',
                                margin: i > 0 ? '12px 0 4px' : '0 0 4px',
                              }}>
                                {line}
                              </p>
                            ) : (
                              <p key={i} style={{
                                fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite,
                                lineHeight: '1.6', margin: 0,
                              }}>
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* All photos */}
                      {diario.fotos.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                          {diario.fotos.map((url, i) => (
                            <img key={i} src={url.replace('w=280&h=280', 'w=200&h=200')} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Presences list */}
                  {presencas.length > 0 && (
                    <div>
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: C.neutro,
                        marginBottom: '10px', marginTop: semExecucao ? 0 : '0',
                      }}>
                        Equipe presente
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {presencas.map((p) => {
                          const pessoa = state.pessoas.find(pe => pe.id === p.pessoa_id);
                          return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Avatar pessoaId={p.pessoa_id} nome={pessoa?.nome ?? p.pessoa_id} tamanho={30} />
                              <div>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite }}>
                                  {pessoa?.nome ?? p.pessoa_id}
                                </span>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro }}>
                                  {' '}— {pessoa?.funcao ?? ''} · {PERIODO_PT[p.periodo] ?? p.periodo}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleExpanded(diario.id)}
                    style={{
                      marginTop: '16px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
                      color: C.tintaFraca, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    Recolher ↑
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
