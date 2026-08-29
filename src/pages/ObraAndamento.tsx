import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, calcularPctObra, calcularPctAmbiente, obraPorSlug } from '../state/store';
import TituloSecao from '../components/TituloSecao';
import EstadoVazio from '../components/EstadoVazio';

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
  informativo: '#215FD7',
  neutro: '#9A9A9A',
} as const;

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <path d="M3 5.5l4 4 4-4" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="#EDFAF3" stroke="#2E9E5B" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="#2E9E5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCircleEmpty() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="none" stroke="#D0D0D0" strokeWidth="1.2" />
    </svg>
  );
}
function ProgressBar({ pct, done }: { pct: number; done?: boolean }) {
  return (
    <div style={{ flex: 1, height: '5px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: done ? C.positivo : C.acento, borderRadius: '999px', transition: 'width 0.3s ease' }} />
    </div>
  );
}

export default function ObraAndamento() {
  const state = useStore();
  const { obraId } = useParams<{ obraId: string }>();
  const [expandedTecto, setExpandedTecto] = useState<Set<string>>(new Set());

  const perfilAtivo = state.perfil_ativo;
  const pessoaId = perfilAtivo === 'gerente_obras' ? 'p04' : perfilAtivo === 'financeiro' ? 'p03' : 'p01';

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;
  if (!obra) return null;

  const pctTecto = calcularPctObra(state, obra.id);
  const totalItens = state.itens_orcamento.filter(i => i.obra_id === obra.id).length;
  const executadosItens = state.itens_orcamento.filter(i => i.obra_id === obra.id && i.executado).length;

  const ambientes = state.ambientes.filter(a => a.obra_id === obra.id);

  const toggleTecto = (id: string) => {
    setExpandedTecto(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleMarcarAmbiente = (ambienteId: string) => {
    state.marcarTodosItensAmbiente({ ambiente_id: ambienteId, executado: true, pessoa_id: pessoaId });
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: C.superficie, borderRadius: '14px', border: `1px solid ${C.borda}`,
    padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px',
  };

  return (
    <div style={{ padding: '28px 40px 80px', fontFamily: 'Inter, sans-serif', backgroundColor: C.fundo, minHeight: '100%' }}>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── ANDAMENTO TECTO ── */}
        <div style={cardStyle}>
          <div>
            <TituloSecao margemInferior={12}>Andamento TECTO</TituloSecao>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '52px', fontWeight: 700,
                color: C.tinta, lineHeight: '1', letterSpacing: '-0.04em',
              }}>
                {pctTecto}%
              </span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, margin: '4px 0 0' }}>
              {executadosItens} de {totalItens} serviços concluídos
            </p>
          </div>

          {/* Overall progress bar */}
          <div style={{ height: '6px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${pctTecto}%`, height: '100%', backgroundColor: C.acento, borderRadius: '999px', transition: 'width 0.3s ease' }} />
          </div>

          {/* Per-ambiente */}
          {ambientes.length === 0 ? (
            <EstadoVazio compacto mensagem="Esta obra ainda não tem ambientes. O andamento aparece aqui quando a estrutura da obra for cadastrada." />
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ambientes.map(amb => {
              const pct = calcularPctAmbiente(state, amb.id);
              const itens = state.itens_orcamento.filter(i => i.ambiente_id === amb.id);
              const isOpen = expandedTecto.has(amb.id);
              const isDone = pct === 100;

              return (
                <div key={amb.id} style={{ borderTop: `1px solid ${C.borda}` }}>
                  <button
                    onClick={() => toggleTecto(amb.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 0', backgroundColor: 'transparent', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, flex: 1, minWidth: 0 }}>
                      {amb.nome}
                    </span>
                    <ProgressBar pct={pct} done={isDone} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, width: '34px', textAlign: 'right', flexShrink: 0 }}>
                      {pct}%
                    </span>
                    <span style={{ color: C.neutro }}><IconChevron open={isOpen} /></span>
                  </button>

                  {isOpen && (
                    <div style={{ paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {itens.length === 0 ? (
                        <EstadoVazio compacto mensagem="Este ambiente ainda não tem serviços. Eles aparecem aqui quando o orçamento for detalhado." />
                      ) : itens.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px' }}>
                          {item.executado ? <IconCheck /> : <IconCircleEmpty />}
                          <span style={{
                            fontFamily: 'Inter, sans-serif', fontSize: '13px',
                            color: item.executado ? C.tintaFraca : C.grafite,
                            textDecoration: item.executado ? 'line-through' : 'none',
                          }}>
                            {item.servico}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* ── ANDAMENTO GERAL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={cardStyle}>
            <div>
              <TituloSecao margemInferior={12}>Andamento Geral</TituloSecao>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '52px', fontWeight: 700,
                  color: C.tinta, lineHeight: '1', letterSpacing: '-0.04em',
                }}>
                  {obra.andamento_geral_pct}%
                </span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, margin: '4px 0 0' }}>
                obra completa, incluindo serviços de terceiros
              </p>
            </div>

            <div style={{ height: '6px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${obra.andamento_geral_pct}%`, height: '100%', backgroundColor: C.acento, borderRadius: '999px' }} />
            </div>

            {/* Per-ambiente — no detail, with "marcar" button */}
            {ambientes.length === 0 ? (
              <EstadoVazio compacto mensagem="Esta obra ainda não tem ambientes. O andamento geral aparece aqui quando a estrutura da obra for cadastrada." />
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {ambientes.map(amb => {
                const pct = calcularPctAmbiente(state, amb.id);
                const isDone = pct === 100;
                return (
                  <div key={amb.id} style={{ borderTop: `1px solid ${C.borda}`, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, flex: '0 0 140px' }}>
                      {amb.nome}
                    </span>
                    <ProgressBar pct={pct} done={isDone} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, width: '34px', textAlign: 'right', flexShrink: 0 }}>
                      {pct}%
                    </span>
                    {!isDone && (
                      <button
                        onClick={() => handleMarcarAmbiente(amb.id)}
                        style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
                          color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
                          borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                        }}
                      >
                        Concluir
                      </button>
                    )}
                    {isDone && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
                        color: C.positivo, backgroundColor: '#EDFAF3', padding: '3px 9px',
                        borderRadius: '999px', flexShrink: 0,
                      }}>Concluído</span>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
