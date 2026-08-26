import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore, calcularPctObra, calcularPctAmbiente, formatarReais } from './state/store';

const C = {
  acento: '#FFC213',
  acentoFundo: '#FFF6D6',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  positivo: '#2E9E5B',
  atencao: '#E8833A',
  negativo: '#C94141',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
  informativoFundo: '#E7F1FF',
} as const;

function IconChevronRight() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l4 4-4 4"/></svg>;
}
function IconChevronDown() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5l4 4 4-4"/></svg>;
}

const ALL_TABS = ['Visão geral', 'Diários', 'Checklist', 'Andamento', 'Fotos', 'Financeiro', 'Documentos'];

const TAB_PATHS: Record<string, string> = {
  'Visão geral': '/obras/22-mcl',
  'Diários': '/obras/22-mcl/diarios',
  'Checklist': '/obras/22-mcl/checklist',
  'Andamento': '/obras/22-mcl/andamento',
  'Fotos': '/obras/22-mcl/fotos',
  'Financeiro': '/obras/22-mcl/financeiro',
  'Documentos': '/obras/22-mcl/documentos',
};

const TEAM = [
  { initials: 'RD', name: 'Rafael Duarte', role: 'Gerente de obras', bg: '#363636' },
  { initials: 'AC', name: 'Ana Carvalho', role: 'Assistente de gerenciamento', bg: '#5A5A5A' },
  { initials: 'MB', name: 'Marcos Bittencourt', role: 'Pedreiro', bg: '#7D7D7D' },
  { initials: 'JR', name: 'Jonas Ribeiro', role: 'Ajudante', bg: '#9A9A9A' },
  { initials: 'CM', name: 'Cleber Matos', role: 'Eletricista (terceirizado)', bg: '#5A5A5A' },
];

const ROOMS = [
  { name: 'Suíte Master', pct: 100, badge: { label: 'Concluída', bg: '#EDFAF3', color: '#207A46' } },
  { name: 'Banheiro da Suíte', pct: 80, badge: null },
  { name: 'Cozinha', pct: 45, badge: null },
  { name: 'Sala', pct: 20, badge: null },
  { name: 'Lavabo', pct: 0, badge: null },
];

const DIARY_TEXT = [
  'Assentamento de porcelanato na sala de estar — finalizadas 3 fiadas. Rejuntamento previsto para 23/08.',
  'Passagem de conduítes elétricos na cozinha concluída. Quadro de distribuição posicionado e fixado.',
  'Preparação de parede para instalação de box na suíte master iniciada.',
];

const DIARY_WORKERS = [
  { initials: 'MB', name: 'Marcos Bittencourt', role: 'Pedreiro', bg: '#7D7D7D' },
  { initials: 'JR', name: 'Jonas Ribeiro', role: 'Ajudante', bg: '#9A9A9A' },
  { initials: 'CM', name: 'Cleber Matos', role: 'Eletricista', bg: '#5A5A5A' },
];

const DIARY_PHOTOS = [
  'https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=280&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1634586648651-f1fb9ec10d90?w=280&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=280&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1674649207083-281c2517ab49?w=280&h=280&fit=crop&auto=format',
];

const FINANCIALS = [
  { label: 'Valor contratado', value: 'R$ 148.320,00', bold: false, separator: false },
  { label: 'Adicionais aprovados', value: 'R$ 12.480,00', bold: false, separator: false },
  { label: 'Total da obra', value: 'R$ 160.800,00', bold: false, separator: true },
  { label: 'Recebido', value: 'R$ 96.480,00', bold: false, separator: false },
  { label: 'A receber', value: 'R$ 64.320,00', bold: true, separator: false },
];

const COSTS = [
  {
    supplier: 'Mármores Paulista',
    service: 'Marmoraria banheiro e cozinha',
    value: 'R$ 18.400,00',
    badge: { label: 'Repassado com margem', bg: '#E7F1FF', color: '#215FD7' },
  },
  {
    supplier: 'Eletromed',
    service: 'Instalações de ar-condicionado',
    value: 'R$ 9.200,00',
    badge: { label: 'Reembolsável', bg: '#F5F5F5', color: '#555555' },
  },
  {
    supplier: 'NX Marcenaria',
    service: 'Marcenaria dormitórios',
    value: 'R$ 45.600,00',
    badge: { label: 'Direto do cliente', bg: '#EDFAF3', color: '#207A46' },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.tintaFraca }}>
      {children}
    </p>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.superficie, borderRadius: '12px', border: `1px solid ${C.borda}`, padding: '24px', ...style }}>
      {children}
    </div>
  );
}

function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color,
      backgroundColor: bg, padding: '3px 10px', borderRadius: '999px',
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      whiteSpace: 'nowrap' as const, flexShrink: 0,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function Avatar({ initials, bg, size = 36 }: { initials: string; bg: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: size * 0.33, fontWeight: 700, color: C.superficie }}>
        {initials}
      </span>
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: '5px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
    </div>
  );
}

function CardHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <SectionLabel>{children}</SectionLabel>
      {right}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ObraVisaoGeral() {
  const { pathname } = useLocation();
  const state = useStore();
  const perfilAtivo = state.perfil_ativo;
  const isAdmin = perfilAtivo === 'administracao';
  const [viewMode, setViewMode] = useState<'admin' | 'gerente'>(
    perfilAtivo === 'gerente_obras' ? 'gerente' : 'admin'
  );
  const obra = state.obras.find(o => o.id === 'o01')!;
  const ambientes = state.ambientes.filter(a => a.obra_id === 'o01');
  const tectoPct = calcularPctObra(state, 'o01');
  const vinculosObra = state.vinculos_obra.filter(v => v.obra_id === 'o01' && !v.fim);
  const teamMembers = vinculosObra.map((vo, i) => {
    const pessoa = state.pessoas.find(p => p.id === vo.pessoa_id);
    const bgs = ['#363636', '#5A5A5A', '#7D7D7D', '#9A9A9A'];
    return { initials: pessoa?.iniciais ?? '?', name: pessoa?.nome ?? '?', role: vo.papel === 'gerente' ? 'Gerente de obras' : 'Assistente', bg: bgs[i % bgs.length] };
  });
  const gerenteName = teamMembers.find(t => t.role === 'Gerente de obras')?.name ?? '—';
  const assistanteName = teamMembers.find(t => t.role === 'Assistente')?.name;
  // Diary (MCL 19/08 finalizado)
  const diarioFinalizado = state.diarios.find(d => d.obra_id === 'o01' && d.estado === 'finalizado');
  const diarioTexto = diarioFinalizado?.texto ?? [];
  const diarioFotos = diarioFinalizado?.fotos ?? [];
  const diarioPresencas = diarioFinalizado
    ? state.presencas.filter(p => p.diario_id === diarioFinalizado.id)
    : [];
  const diarioWorkers = diarioPresencas.map((pr, i) => {
    const pessoa = state.pessoas.find(p => p.id === pr.pessoa_id);
    return { initials: pessoa?.iniciais ?? '?', name: pessoa?.nome ?? '?', role: pessoa?.funcao ?? '?', bg: ['#7D7D7D','#9A9A9A','#5A5A5A','#363636'][i % 4] };
  });

  const tabs = viewMode === 'gerente'
    ? ALL_TABS.filter((t) => t !== 'Financeiro')
    : ALL_TABS;

  const isTabActive = (tab: string) => {
    const path = TAB_PATHS[tab];
    if (tab === 'Visão geral') return pathname === '/obras/22-mcl';
    return pathname === path;
  };

  const handleViewMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(e.target.value as 'admin' | 'gerente');
  };

  return (
    <div style={{ padding: '32px 40px 80px', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Migalha ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.tintaFraca }}>
        <Link to="/obras" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.informativo, fontWeight: 500, textDecoration: 'none' }}>
          Obras
        </Link>
        <IconChevronRight />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca }}>Obra 22 - MCL</span>
      </div>

      {/* ── Foto de capa ── */}
      <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#CCCCCC', flexShrink: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=1200&h=360&fit=crop&auto=format"
          alt="Apartamento em reforma"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* ── Cabeçalho da obra ── */}
      <Card style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.02em', color: C.tinta, margin: 0 }}>
                {obra.codigo}
              </h1>
              <StatusBadge label="Em andamento" bg={C.informativoFundo} color={C.informativo} />
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '22px', color: C.tintaFraca, marginTop: '8px' }}>
              {obra.cliente} · {obra.endereco}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px', flexWrap: 'wrap', gap: '0' }}>
              {[
                { label: 'Início', value: obra.inicio.split('-').reverse().join('/') },
                { label: 'Previsão', value: obra.previsao_termino.split('-').reverse().join('/') },
                { label: 'Gerente', value: gerenteName },
                ...(assistanteName ? [{ label: 'Assistente', value: assistanteName }] : []),
              ].map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && <div style={{ width: '1px', height: '32px', backgroundColor: C.borda, margin: '0 20px' }} />}
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.tintaFraca }}>{label}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: C.grafite, marginTop: '3px', whiteSpace: 'nowrap' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
            {isAdmin && (
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.tintaFraca, marginBottom: '6px' }}>
                Visualizar como
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={viewMode}
                  onChange={handleViewMode}
                  style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite,
                    backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
                    borderRadius: '8px', padding: '9px 36px 9px 14px',
                    appearance: 'none' as const, outline: 'none', cursor: 'pointer', minWidth: '196px',
                  }}
                >
                  <option value="admin">Administração</option>
                  <option value="gerente">Gerente de Obras</option>
                </select>
                <div style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.tintaFraca }}>
                  <IconChevronDown />
                </div>
              </div>
            </div>
            )}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link to="/portal" style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
                color: C.tintaFraca, backgroundColor: 'transparent',
                border: `1px solid ${C.borda}`,
                borderRadius: '8px', padding: '9px 16px', cursor: 'pointer',
                whiteSpace: 'nowrap' as const, letterSpacing: '-0.01em',
                textDecoration: 'none', display: 'inline-block',
              }}>
                Ver como o cliente vê
              </Link>
              <Link to="/campo/diario" style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
                color: C.tinta, backgroundColor: C.acento, border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                whiteSpace: 'nowrap' as const, letterSpacing: '-0.01em',
                textDecoration: 'none', display: 'inline-block',
              }}>
                Abrir diário de hoje
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Abas ── */}
      <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${C.borda}`, backgroundColor: C.superficie, borderRadius: '12px 12px 0 0', padding: '0 4px' }}>
        {tabs.map((tab) => {
          const active = isTabActive(tab);
          return (
            <Link
              key={tab}
              to={TAB_PATHS[tab]}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                color: active ? C.tinta : C.tintaFraca,
                backgroundColor: 'transparent',
                borderBottom: active ? `3px solid ${C.acento}` : '3px solid transparent',
                padding: '14px 18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
                letterSpacing: active ? '-0.01em' : 'normal',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '-1px',
                transition: 'color 0.15s ease',
              }}
            >
              {tab}
            </Link>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ANDAMENTO */}
          <Card>
            <CardHeader>Andamento</CardHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, flex: 1 }}>Andamento TECTO</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: C.grafite, fontWeight: 600 }}>{tectoPct}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${tectoPct}%`, height: '100%', backgroundColor: C.acento, borderRadius: '999px' }} />
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '7px', lineHeight: '18px' }}>
                  Escopo contratado da TECTO, calculado pelo checklist de execução.
                </p>
              </div>
              <div style={{ height: '1px', backgroundColor: C.borda }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, flex: 1 }}>Andamento Geral</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: C.grafite, fontWeight: 600 }}>{obra.andamento_geral_pct}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${obra.andamento_geral_pct}%`, height: '100%', backgroundColor: C.grafite, borderRadius: '999px' }} />
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '7px', lineHeight: '18px' }}>
                  Obra inteira, incluindo marcenaria, marmoraria, vidro e ar-condicionado.
                </p>
              </div>
            </div>
          </Card>

          {/* AMBIENTES */}
          <Card>
            <CardHeader>Ambientes</CardHeader>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ambientes.map((amb, i) => {
                const pct = calcularPctAmbiente(state, amb.id);
                const barColor = pct === 100 ? C.positivo : pct === 0 ? C.borda : C.acento;
                const badge = pct === 100 ? { label: 'Concluída', bg: '#EDFAF3', color: '#207A46' } : null;
                return (
                  <div key={amb.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 0', borderBottom: i < ambientes.length - 1 ? `1px solid ${C.borda}` : 'none' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, width: '160px', flexShrink: 0 }}>{amb.nome}</span>
                    <ProgressBar pct={pct} color={barColor} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, width: '34px', textAlign: 'right' as const, flexShrink: 0 }}>{pct}%</span>
                    {badge
                      ? <StatusBadge label={badge.label} bg={badge.bg} color={badge.color} />
                      : <div style={{ width: '80px', flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ÚLTIMO DIÁRIO */}
          {diarioFinalizado && (
          <Card>
            <CardHeader right={<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca }}>{diarioFinalizado.data.split('-').reverse().join('/')}</span>}>
              Último Diário
            </CardHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {diarioTexto.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.neutro, flexShrink: 0, marginTop: '2px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '21px', color: C.grafite }}>{line}</p>
                </div>
              ))}
            </div>
            {diarioFotos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {diarioFotos.map((url, i) => (
                <div key={i} style={{ aspectRatio: '1 / 1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#CCCCCC' }}>
                  <img src={url} alt={`Foto do diário ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
            )}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {diarioWorkers.map(({ initials, name, role, bg }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar initials={initials} bg={bg} size={34} />
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, lineHeight: '17px' }}>{name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro, lineHeight: '15px', marginTop: '1px' }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, backgroundColor: 'transparent', border: 'none', padding: '0', cursor: 'pointer', letterSpacing: '-0.01em' }}>
              Ver todos os diários →
            </button>
          </Card>
          )}
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* EQUIPE NA OBRA */}
          <Card>
            <CardHeader>Equipe na obra</CardHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {teamMembers.map(({ initials, name, role, bg }) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 10px', borderRadius: '10px', border: `1px solid ${C.borda}`, textAlign: 'center' as const }}>
                  <Avatar initials={initials} bg={bg} size={40} />
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, lineHeight: '17px' }}>{name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro, marginTop: '2px', lineHeight: '15px' }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* RESUMO FINANCEIRO / nota de gerente */}
          {viewMode === 'admin' ? (
            <>
              <Card>
                <CardHeader>Resumo Financeiro</CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {(() => {
                    const total = obra.valor_contratado_centavos + obra.adicionais_centavos;
                    const aReceber = total - obra.recebido_centavos;
                    const rows = [
                      { label: 'Valor contratado', value: formatarReais(obra.valor_contratado_centavos), bold: false, separator: false },
                      { label: 'Adicionais aprovados', value: formatarReais(obra.adicionais_centavos), bold: false, separator: false },
                      { label: 'Total da obra', value: formatarReais(total), bold: false, separator: true },
                      { label: 'Recebido', value: formatarReais(obra.recebido_centavos), bold: false, separator: false },
                      { label: 'A receber', value: formatarReais(aReceber), bold: true, separator: false },
                    ];
                    return rows.map(({ label, value, bold, separator }, i) => (
                      <div key={label}>
                        {separator && <div style={{ height: '1px', backgroundColor: C.borda, margin: '4px 0 8px' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rows.length - 1 && !rows[i + 1]?.separator ? `1px solid ${C.borda}` : 'none', gap: '12px' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: bold ? 600 : 400, color: bold ? C.tinta : C.grafite }}>{label}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: bold ? '16px' : '14px', fontWeight: bold ? 700 : 500, color: bold ? C.tinta : C.grafite, fontVariantNumeric: 'tabular-nums', textAlign: 'right' as const, whiteSpace: 'nowrap' as const, letterSpacing: '-0.01em' }}>{value}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>

              <Card>
                <CardHeader>Custos Externos</CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {COSTS.map(({ supplier, service, value, badge }, i) => (
                    <div key={supplier} style={{ padding: '14px 0', borderBottom: i < COSTS.length - 1 ? `1px solid ${C.borda}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: C.grafite, lineHeight: '17px' }}>{supplier}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '2px', lineHeight: '16px' }}>{service}</p>
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' as const, letterSpacing: '-0.01em', flexShrink: 0 }}>
                          {value}
                        </span>
                      </div>
                      <StatusBadge label={badge.label} bg={badge.bg} color={badge.color} />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <div style={{ backgroundColor: C.fundo, borderRadius: '12px', border: `1px solid ${C.borda}`, padding: '24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '22px', color: C.neutro, textAlign: 'center' as const }}>
                Valores do orçamento não são visíveis para este perfil.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
