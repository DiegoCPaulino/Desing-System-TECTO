import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useStore, calcularPctObra, calcularPctAmbiente, formatarReais, obraSlug, obraPorSlug } from '../state/store';
import EmBreve from './EmBreve';

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

const ESTADO_PT: Record<string, string> = {
  em_andamento: 'Em andamento',
  aguardando_inicio: 'Aguardando início',
  pausada: 'Pausada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  em_andamento: { bg: '#E7F1FF', color: '#215FD7' },
  aguardando_inicio: { bg: '#F2F2F2', color: '#555555' },
  pausada: { bg: '#FFF3E8', color: '#D4712A' },
  concluida: { bg: '#EDFAF3', color: '#2E9E5B' },
  cancelada: { bg: '#FDEAEA', color: '#C94141' },
};

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
  const { obraId } = useParams<{ obraId: string }>();
  const state = useStore();
  const perfilAtivo = state.perfil_ativo;
  const temVisaoTotal = perfilAtivo === 'administracao' || perfilAtivo === 'financeiro';
  const [viewMode, setViewMode] = useState<'admin' | 'gerente'>(
    perfilAtivo === 'gerente_obras' ? 'gerente' : 'admin'
  );

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;
  if (!obra) return <EmBreve />;

  const isPequenoServico = obra.tipo === 'pequeno_servico';
  const slug = obraSlug(obra);
  const basePath = `/obras/${slug}`;
  const TAB_PATHS: Record<string, string> = {
    'Visão geral': basePath,
    'Diários': `${basePath}/diarios`,
    'Checklist': `${basePath}/checklist`,
    'Andamento': `${basePath}/andamento`,
    'Fotos': `${basePath}/fotos`,
    'Financeiro': `${basePath}/financeiro`,
    'Documentos': `${basePath}/documentos`,
  };

  const ambientes = state.ambientes.filter(a => a.obra_id === obra.id);
  const tectoPct = calcularPctObra(state, obra.id);
  const vinculosObra = state.vinculos_obra.filter(v => v.obra_id === obra.id && !v.fim);
  const teamMembers = vinculosObra.map((vo, i) => {
    const pessoa = state.pessoas.find(p => p.id === vo.pessoa_id);
    const bgs = ['#363636', '#5A5A5A', '#7D7D7D', '#9A9A9A'];
    return { initials: pessoa?.iniciais ?? '?', name: pessoa?.nome ?? '?', role: vo.papel === 'gerente' ? 'Gerente de obras' : 'Assistente', bg: bgs[i % bgs.length] };
  });
  const gerenteName = teamMembers.find(t => t.role === 'Gerente de obras')?.name ?? '—';
  const assistanteName = teamMembers.find(t => t.role === 'Assistente')?.name;

  const diarioFinalizado = state.diarios.find(d => d.obra_id === obra.id && d.estado === 'finalizado');
  const diarioTexto = diarioFinalizado?.texto ?? [];
  const diarioFotos = diarioFinalizado?.fotos ?? [];
  const diarioPresencas = diarioFinalizado
    ? state.presencas.filter(p => p.diario_id === diarioFinalizado.id)
    : [];
  const diarioWorkers = diarioPresencas.map((pr, i) => {
    const pessoa = state.pessoas.find(p => p.id === pr.pessoa_id);
    return { initials: pessoa?.iniciais ?? '?', name: pessoa?.nome ?? '?', role: pessoa?.funcao ?? '?', bg: ['#7D7D7D','#9A9A9A','#5A5A5A','#363636'][i % 4] };
  });

  const tabsDisponiveis = isPequenoServico ? ALL_TABS.filter(t => t !== 'Diários') : ALL_TABS;
  const tabs = viewMode === 'gerente'
    ? tabsDisponiveis.filter((t) => t !== 'Financeiro')
    : tabsDisponiveis;

  const isTabActive = (tab: string) => {
    const path = TAB_PATHS[tab];
    if (tab === 'Visão geral') return pathname === basePath;
    return pathname === path;
  };

  const handleViewMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(e.target.value as 'admin' | 'gerente');
  };

  const statusStyle = STATUS_STYLES[obra.estado] ?? STATUS_STYLES.em_andamento;
  const statusLabel = ESTADO_PT[obra.estado] ?? obra.estado;

  return (
    <div style={{ padding: '32px 40px 80px', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Migalha ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.tintaFraca }}>
        <Link to="/obras" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.informativo, fontWeight: 500, textDecoration: 'none' }}>
          Obras
        </Link>
        <IconChevronRight />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca }}>{obra.codigo}</span>
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
              <StatusBadge label={statusLabel} bg={statusStyle.bg} color={statusStyle.color} />
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
            {temVisaoTotal && (
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
              {!isPequenoServico && (
                <Link to={`${basePath}/diario`} style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
                  color: C.tinta, backgroundColor: C.acento, border: 'none',
                  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                  whiteSpace: 'nowrap' as const, letterSpacing: '-0.01em',
                  textDecoration: 'none', display: 'inline-block',
                }}>
                  Abrir diário de hoje
                </Link>
              )}
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
            {ambientes.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro, lineHeight: '21px' }}>
                Nenhum ambiente cadastrado para esta obra ainda.
              </p>
            ) : (
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
            )}
          </Card>

          {/* ÚLTIMO DIÁRIO */}
          {!isPequenoServico && (
          <Card>
            <CardHeader right={diarioFinalizado && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca }}>{diarioFinalizado.data.split('-').reverse().join('/')}</span>}>
              Último Diário
            </CardHeader>
            {!diarioFinalizado ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro, lineHeight: '21px' }}>
                Nenhum diário registrado para esta obra ainda.
              </p>
            ) : (
            <>
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
            </>
            )}
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
