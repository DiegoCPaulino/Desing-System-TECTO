import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, calcularPctObra, calcularPctAmbiente } from '../state/store';
import { HOJE } from '../state/dados-iniciais';
import TituloSecao from '../components/TituloSecao';
import Avatar from '../components/Avatar';
import DataComDiaSemana from '../components/DataComDiaSemana';

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
  positivoFundo: '#EDFAF3',
} as const;

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.superficie, borderRadius: '16px', border: `1px solid ${C.borda}`, padding: '28px', ...style }}>
      {children}
    </div>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" fill="#EDFAF3" stroke="#2E9E5B" strokeWidth="1"/>
      <path d="M5 8l2 2 4-4" stroke="#2E9E5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="#D0D0D0" strokeWidth="1"/>
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4"/>
    </svg>
  );
}

export default function PortalMinhaObra() {
  const state = useStore();
  const [expandedAmbientes, setExpandedAmbientes] = useState<Set<string>>(new Set());

  const obra = state.obras.find(o => o.id === 'o01')!;
  const ambientes = state.ambientes.filter(a => a.obra_id === 'o01');
  const tectoPct = calcularPctObra(state, 'o01');

  // Most recent finalized diary for "O que aconteceu hoje"
  const diarioHoje = state.diarios
    .filter(d => d.obra_id === 'o01' && d.estado === 'finalizado')
    .sort((a, b) => b.data.localeCompare(a.data))[0];

  const diarioData = diarioHoje?.data ?? HOJE;
  const diarioTexto = (diarioHoje?.texto ?? []).filter(l => {
    const upper = l.trim().toUpperCase();
    return upper !== l.trim() || l.trim().length === 0; // exclude section headers
  });
  const diarioFotos = (diarioHoje?.fotos ?? []).slice(0, 3);

  // People working today (presencas on HOJE for obra o01)
  const presencasHoje = state.presencas.filter(p => p.obra_id === 'o01' && p.data === HOJE);
  const pessoasHoje = [...new Set(presencasHoje.map(p => p.pessoa_id))].map((pid) => {
    const pessoa = state.pessoas.find(p => p.id === pid);
    return { id: pid, name: pessoa?.nome ?? '?', role: pessoa?.funcao ?? '?' };
  });

  const toggleAmbiente = (id: string) => {
    setExpandedAmbientes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 32px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: '320px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#888' }}>
        <img
          src="https://images.unsplash.com/photo-1503174971373-b1f69350bdd1?w=1120&h=320&fit=crop&auto=format"
          alt="Reforma do apartamento Itaim Bibi"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
        {/* Text overlay */}
        <div style={{ position: 'absolute', bottom: '32px', left: '36px' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1.1', margin: 0, letterSpacing: '-0.02em' }}>
            Reforma do apartamento
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.88)', marginTop: '6px' }}>
            Itaim Bibi · início em {obra.inicio.split('-').reverse().join('/')}
          </p>
        </div>
      </div>

      {/* ── Faixa escopo ampliado ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        backgroundColor: '#FFF6D6', border: '1px solid #FFC213', borderRadius: '10px',
        padding: '14px 18px',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#D4A000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
          <path d="M8 2L1.5 13h13L8 2z"/><path d="M8 6v4M8 11.5v.5"/>
        </svg>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#363636', margin: 0, lineHeight: '1.6' }}>
          <strong>Escopo ampliado em 19/08.</strong>{' '}
          Dois serviços adicionais aprovados acrescentaram novos itens ao cronograma.
          O percentual pode recuar temporariamente até que os novos serviços sejam executados.
        </p>
      </div>

      {/* ── Andamento + Previsão ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>

        <Card>
          <TituloSecao margemInferior={20}>Andamento</TituloSecao>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Serviços TECTO */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: C.grafite }}>
                  Serviços da TECTO
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: C.tinta }}>
                  {tectoPct}%
                </span>
              </div>
              <div style={{ height: '12px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${tectoPct}%`, height: '100%', backgroundColor: C.acento, borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Obra completa */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 500, color: C.grafite }}>
                  Obra completa
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: C.tinta }}>
                  {obra.andamento_geral_pct}%
                </span>
              </div>
              <div style={{ height: '12px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${obra.andamento_geral_pct}%`, height: '100%', backgroundColor: C.grafite, borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '10px', lineHeight: '18px' }}>
                inclui marcenaria, marmoraria, vidro e ar-condicionado
              </p>
            </div>
          </div>
        </Card>

        {/* Previsão de Entrega */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '36px 28px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.neutro, marginBottom: '14px' }}>
            Previsão de entrega
          </p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: C.tinta, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            30 de setembro de 2026
          </p>
        </Card>
      </div>

      {/* ── Ambiente por ambiente ── */}
      <Card style={{ padding: '28px 0 0 0', overflow: 'hidden' }}>
        <div style={{ padding: '0 28px 20px' }}>
          <TituloSecao margemInferior={20}>Ambiente por ambiente</TituloSecao>
        </div>

        {ambientes.map((amb, idx) => {
          const pct = calcularPctAmbiente(state, amb.id);
          const done = pct === 100;
          const isOpen = expandedAmbientes.has(amb.id);
          const itens = state.itens_orcamento.filter(i => i.ambiente_id === amb.id);
          const barColor = done ? C.positivo : pct === 0 ? C.borda : C.acento;

          return (
            <div key={amb.id}>
              <button
                onClick={() => toggleAmbiente(amb.id)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 28px',
                  borderTop: idx > 0 ? `1px solid ${C.borda}` : 'none',
                  backgroundColor: isOpen ? '#FAFAFA' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: C.grafite, width: '160px', textAlign: 'left', flexShrink: 0 }}>
                  {amb.nome}
                </span>
                <div style={{ flex: 1, height: '6px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '999px' }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: C.tintaFraca, width: '38px', textAlign: 'right', flexShrink: 0 }}>
                  {pct}%
                </span>
                {done
                  ? <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: C.positivo, backgroundColor: C.positivoFundo, padding: '3px 10px', borderRadius: '999px', width: '88px', textAlign: 'center', flexShrink: 0 }}>Concluído</span>
                  : <div style={{ width: '88px', flexShrink: 0 }} />
                }
                <div style={{ color: C.tintaFraca }}>
                  <IconChevron open={isOpen} />
                </div>
              </button>

              {/* Expanded service list */}
              {isOpen && (
                <div style={{ backgroundColor: '#FAFAFA', borderTop: `1px solid ${C.borda}`, padding: '16px 28px 20px calc(28px + 160px + 16px)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {itens.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ marginTop: '1px', flexShrink: 0 }}>
                          {item.executado ? <IconCheck /> : <IconCircle />}
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: item.executado ? C.grafite : C.tintaFraca, lineHeight: '22px' }}>
                          {item.servico}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      {/* ── O Que Aconteceu Hoje + Quem Está na Sua Obra ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* O Que Aconteceu Hoje */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
            <TituloSecao margemInferior={20}>O que aconteceu hoje</TituloSecao>
            <DataComDiaSemana data={diarioData} style={{ justifyContent: 'flex-end', marginTop: '-2px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {diarioTexto.slice(0, 3).map((line, i) => (
              <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '23px', color: C.grafite }}>
                {line}
              </p>
            ))}
          </div>

          {diarioFotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {diarioFotos.map((url, i) => (
                <div key={i} style={{ aspectRatio: '1 / 1', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#CCC' }}>
                  <img src={url} alt={`Foto do dia ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}

          <Link to="/portal/diario" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite,
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
          }}>
            Ver todos os dias →
          </Link>
        </Card>

        {/* Quem Está na Sua Obra */}
        <Card>
          <TituloSecao margemInferior={20}>Quem está na sua obra</TituloSecao>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pessoasHoje.map(({ id, name, role }) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FAFAFA', borderRadius: '10px', padding: '12px 14px' }}>
                <Avatar pessoaId={id} nome={name} tamanho={38} />
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, lineHeight: '18px' }}>{name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '2px' }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
