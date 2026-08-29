import React from 'react';
import { useStore, calcularIndicadores, calcularPendencias, getGerenteDaObra } from '../state/store';
import { HOJE } from '../state/dados-iniciais';
import TituloSecao from '../components/TituloSecao';
import Avatar from '../components/Avatar';
import CabecalhoTabela from '../components/CabecalhoTabela';
import ValorMonetario from '../components/ValorMonetario';

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
} as const;

function IconWarning() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 1.5 1 13h13L7.5 1.5Z"/><path d="M7.5 6.5v3M7.5 11v.5"/></svg>;
}
function IconDocMissing() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 1.5H4A1.5 1.5 0 0 0 2.5 3v9A1.5 1.5 0 0 0 4 13.5h7A1.5 1.5 0 0 0 12.5 12V5.5L8.5 1.5Z"/><path d="M8.5 1.5V5.5H12.5"/><path d="M6 9.5l3 0M6 12l2 0"/></svg>;
}
function IconClock() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="7.5" r="6"/><path d="M7.5 4.5v3.5l2.5 2"/></svg>;
}
function IconSplit() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 1.5v12M3 6l4.5-4.5L12 6"/></svg>;
}

function iconParaTipo(tipo: string) {
  if (tipo === 'divergencia') return { Icon: IconWarning, iconBg: '#FFF1E8', iconColor: C.atencao };
  if (tipo === 'rateio') return { Icon: IconSplit, iconBg: '#FFF1E8', iconColor: C.atencao };
  if (tipo === 'decisao_pagamento') return { Icon: IconWarning, iconBg: '#FFF1E8', iconColor: C.atencao };
  if (tipo === 'diario') return { Icon: IconDocMissing, iconBg: '#F5F5F5', iconColor: C.tintaFraca };
  return { Icon: IconClock, iconBg: '#F5F5F5', iconColor: C.tintaFraca };
}

function badgeParaTipo(tipo: string) {
  if (tipo === 'divergencia') return { label: 'Divergência', bg: '#FFF3E8', color: C.atencao };
  if (tipo === 'rateio') return { label: 'Rateio pendente', bg: '#FFF3E8', color: C.atencao };
  if (tipo === 'decisao_pagamento') return { label: 'Decisão pendente', bg: '#FFF3E8', color: C.atencao };
  return null;
}

function acaoParaTipo(tipo: string) {
  if (tipo === 'divergencia') return 'Revisar';
  if (tipo === 'rateio') return 'Definir';
  if (tipo === 'decisao_pagamento') return 'Decidir';
  if (tipo === 'diario') return 'Cobrar';
  return 'Ver';
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
function SmallBtn({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500,
      color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
      padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
      whiteSpace: 'nowrap' as const, flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

function formatarDataLonga(dataStr: string): string {
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const [y, m, d] = dataStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const diaSemana = dias[dt.getDay()];
  const capitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  return `${capitalizado}, ${d} de ${meses[m - 1]} de ${y}`;
}

function formatarDataCurta(dataStr: string): string {
  const [y, m, d] = dataStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function PainelDoDia() {
  const state = useStore();
  const ind = calcularIndicadores(state);
  const pendencias = calcularPendencias(state);

  // Indicadores
  const pessoasAtivas = state.pessoas.filter(p => p.ativo).length;
  const obrasEmAndamento = state.obras.filter(o => o.estado === 'em_andamento').length;
  const obrasAguardando = state.obras.filter(o => o.estado === 'aguardando_inicio').length;

  // Fechamentos abertos agrupados por data
  const fechamentosAbertos = state.fechamentos.filter(f => f.estado === 'aberto');
  const gruposFechamento = Object.values(
    fechamentosAbertos.reduce((acc, f) => {
      const key = f.ciclo + '_' + f.periodo_fim;
      if (!acc[key]) acc[key] = { ciclo: f.ciclo, periodo_fim: f.periodo_fim, qtd: 0, total: 0 };
      acc[key].qtd++;
      acc[key].total += f.total_centavos;
      return acc;
    }, {} as Record<string, { ciclo: string; periodo_fim: string; qtd: number; total: number }>)
  ).sort((a, b) => a.periodo_fim.localeCompare(b.periodo_fim));

  const nomesCiclo: Record<string, string> = { semanal: 'Ciclo semanal', quinzenal: 'Ciclo quinzenal', mensal: 'Ciclo mensal' };

  // Quem está onde hoje
  const presHoje = state.presencas.filter(p => p.data === HOJE);
  const obrasComPresenca = [...new Set(presHoje.map(p => p.obra_id))];

  const whereRows = obrasComPresenca.map(obraId => {
    const obra = state.obras.find(o => o.id === obraId)!;
    const peopleIds = [...new Set(presHoje.filter(p => p.obra_id === obraId).map(p => p.pessoa_id))];
    const gerente = getGerenteDaObra(state, obraId);
    const diarioHoje = state.diarios.find(d => d.obra_id === obraId && d.data === HOJE);
    const diarioLabel = diarioHoje
      ? (diarioHoje.estado === 'finalizado' ? 'Finalizado' : 'Rascunho')
      : 'Pendente';
    const avatars = peopleIds.slice(0, 3).map((pid) => {
      const pessoa = state.pessoas.find(p => p.id === pid);
      return { id: pid, nome: pessoa?.nome ?? pid };
    });
    const extra = Math.max(0, peopleIds.length - 3);
    return { obra, avatars, extra, gerente, diarioLabel };
  });

  // Fotos do último diário finalizado da MCL
  const fotosMCL = state.diarios.find(d => d.obra_id === 'o01' && d.estado === 'finalizado')?.fotos ?? [];

  // Indicador de string "a fechar"
  const maisProximoFech = gruposFechamento[0];

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>

      {/* ===== TITLE ===== */}
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.02em', color: C.tinta, margin: 0 }}>
          Painel
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', lineHeight: '22px', color: C.tintaFraca, marginTop: '4px' }}>
          {formatarDataLonga(HOJE)}
        </p>
      </div>

      {/* ===== INDICATOR CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <Card style={{ padding: '24px' }}>
          <TituloSecao>Pessoas em campo hoje</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.02em', color: C.tinta, marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            {ind.pessoasEmCampo}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '18px', color: C.tintaFraca, marginTop: '6px' }}>
            de {pessoasAtivas} com vínculo ativo
          </p>
        </Card>

        <Card style={{ padding: '24px' }}>
          <TituloSecao>Obras em andamento</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.02em', color: C.tinta, marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            {obrasEmAndamento}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '18px', color: C.tintaFraca, marginTop: '6px' }}>
            {obrasAguardando} aguardando início
          </p>
        </Card>

        <Card style={{ padding: '24px' }}>
          <TituloSecao>Diários pendentes</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.02em', color: ind.diariosPendentes > 0 ? C.atencao : C.tinta, marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            {ind.diariosPendentes}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '18px', color: C.tintaFraca, marginTop: '6px' }}>
            de ontem e hoje
          </p>
        </Card>

        <Card style={{ padding: '24px' }}>
          <TituloSecao>A fechar esta semana</TituloSecao>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.02em', color: C.tinta, marginTop: '12px', fontVariantNumeric: 'tabular-nums' }}>
            <ValorMonetario valorCentavos={ind.totalAFechar} />
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '18px', color: C.tintaFraca, marginTop: '6px' }}>
            {maisProximoFech ? `${maisProximoFech.qtd} pessoas · ciclo ${maisProximoFech.ciclo}` : '—'}
          </p>
        </Card>
      </div>

      {/* ===== BODY ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ─── LEFT ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* PRECISA DA SUA ATENÇÃO */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <TituloSecao>Precisa da sua atenção</TituloSecao>
              {pendencias.length > 0 && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, color: C.superficie, backgroundColor: C.atencao, padding: '2px 8px', borderRadius: '999px' }}>
                  {pendencias.length}
                </span>
              )}
            </div>
            {pendencias.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro }}>Sem pendências no momento.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pendencias.map(({ id, tipo, descricao, detalhe }, i) => {
                  const { Icon, iconBg, iconColor } = iconParaTipo(tipo);
                  const badge = badgeParaTipo(tipo);
                  const acao = acaoParaTipo(tipo);
                  return (
                    <div key={id} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0',
                      borderBottom: i < pendencias.length - 1 ? `1px solid ${C.borda}` : 'none',
                    }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
                        <Icon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px', color: C.grafite }}>
                          {descricao}
                        </p>
                        {detalhe && (
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: '18px', color: C.tintaFraca, marginTop: '2px' }}>
                            {detalhe}
                          </p>
                        )}
                      </div>
                      {badge && <StatusBadge label={badge.label} bg={badge.bg} color={badge.color} />}
                      <SmallBtn>{acao}</SmallBtn>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* QUEM ESTÁ ONDE HOJE */}
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <TituloSecao>Quem está onde hoje</TituloSecao>
            </div>
            {whereRows.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro }}>Nenhuma presença registrada hoje.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr>
                    {['Obra', 'Pessoas', 'Gerente', 'Diário'].map((h, i) => (
                      <CabecalhoTabela key={h} scope="col" style={{
                        paddingBottom: '12px', borderBottom: `1px solid ${C.borda}`,
                        paddingLeft: i > 0 ? '20px' : 0, paddingRight: i < 3 ? '20px' : 0,
                      }}>
                        {h}
                      </CabecalhoTabela>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {whereRows.map(({ obra, avatars, extra, gerente, diarioLabel }, i) => (
                    <tr key={obra.id} style={{ borderBottom: i < whereRows.length - 1 ? `1px solid ${C.borda}` : 'none' }}>
                      <td style={{ padding: '14px 20px 14px 0' }}>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: C.tinta, letterSpacing: '-0.01em', lineHeight: '18px' }}>{obra.codigo}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '2px', lineHeight: '16px' }}>{obra.cliente}</p>
                      </td>
                      <td style={{ padding: '14px 20px', verticalAlign: 'middle' as const }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {avatars.map((a, j) => (
                            <Avatar
                              key={a.id}
                              pessoaId={a.id}
                              nome={a.nome}
                              tamanho={28}
                              style={{
                                border: `2px solid ${C.superficie}`,
                                marginLeft: j === 0 ? 0 : '-9px',
                                position: 'relative',
                                zIndex: avatars.length - j + 1,
                              }}
                            />
                          ))}
                          {extra > 0 && (
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: C.fundo, border: `2px solid ${C.borda}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-9px',
                              fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: C.tintaFraca,
                            }}>
                              +{extra}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, whiteSpace: 'nowrap' as const, verticalAlign: 'middle' as const }}>
                        {gerente?.nome ?? '—'}
                      </td>
                      <td style={{ padding: '14px 0', verticalAlign: 'middle' as const }}>
                        <StatusBadge
                          label={diarioLabel}
                          bg={diarioLabel === 'Finalizado' ? '#EDFAF3' : diarioLabel === 'Rascunho' ? '#F5F5F5' : '#FFF1E8'}
                          color={diarioLabel === 'Finalizado' ? '#207A46' : diarioLabel === 'Rascunho' ? C.neutro : C.atencao}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* ─── RIGHT ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ÚLTIMAS FOTOS */}
          <Card>
            <div style={{ marginBottom: '16px' }}>
              <TituloSecao>Últimas fotos</TituloSecao>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {fotosMCL.slice(0, 6).map((url, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1 / 1', backgroundColor: '#CCCCCC' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)', padding: '22px 8px 8px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500, color: '#FFFFFF', lineHeight: '14px' }}>
                      Obra 22 - MCL · {formatarDataCurta(HOJE)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* PRÓXIMOS FECHAMENTOS */}
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <TituloSecao>Próximos fechamentos</TituloSecao>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {gruposFechamento.map(({ ciclo, periodo_fim, qtd, total }, i) => {
                const diasAte = Math.ceil((new Date(periodo_fim).getTime() - new Date(HOJE).getTime()) / 86400000);
                const urgente = diasAte <= 2;
                return (
                  <div key={ciclo + periodo_fim} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0', borderBottom: i < gruposFechamento.length - 1 ? `1px solid ${C.borda}` : 'none', gap: '12px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, lineHeight: '18px' }}>
                          {nomesCiclo[ciclo] ?? ciclo}
                        </p>
                        {urgente && (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500, color: C.atencao, backgroundColor: '#FFF1E8', padding: '1px 7px', borderRadius: '999px' }}>
                            {diasAte === 0 ? 'hoje' : diasAte === 1 ? 'amanhã' : `em ${diasAte}d`}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, lineHeight: '16px' }}>
                          {qtd} {qtd === 1 ? 'pessoa' : 'pessoas'}
                        </p>
                        <span style={{ color: C.borda }}>·</span>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, lineHeight: '16px' }}>
                          {formatarDataCurta(periodo_fim)}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: C.tinta, fontVariantNumeric: 'tabular-nums', textAlign: 'right' as const, whiteSpace: 'nowrap' as const, letterSpacing: '-0.01em' }}>
                      <ValorMonetario valorCentavos={total} />
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
