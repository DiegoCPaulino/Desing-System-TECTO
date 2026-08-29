import React, { useMemo, useState } from 'react';
import {
  useStore,
  diasDaSemana,
  semanaEstado,
  semanaTemAlteracoesPendentes,
  pessoasDaGrade,
  resumoSemana,
  pessoasNaSemana,
  getCelula,
  tipoCelula,
  rotuloCelula,
  obrasNaoConcluidas,
  valorDiaria,
  GERENTE_ID,
  type CelulaValor,
} from '../state/store';
import type { Planejamento as Cel } from '../state/types';
import TituloSecao from '../components/TituloSecao';
import Avatar from '../components/Avatar';
import CabecalhoTabela from '../components/CabecalhoTabela';
import ValorMonetario from '../components/ValorMonetario';
import DataComDiaSemana from '../components/DataComDiaSemana';

type StoreState = ReturnType<typeof useStore.getState>;

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
  informativo: '#215FD7',
} as const;

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MOTIVOS = ['Doente', 'Dispensado pela empresa', 'Falta', 'Folga', 'Férias', 'Afastado', 'Obra parada'];

const OBRA_COR: Record<string, string> = {
  o01: C.informativo,
  o02: C.positivo,
  o04: C.grafite,
  o05: C.atencao,
};

function obraSigla(codigo: string): string {
  const parte = codigo.split(' - ')[1];
  return parte ?? codigo;
}
function diaNumero(data: string): string {
  return String(Number(data.split('-')[2]));
}
function dataHoraLegivel(iso: string): string {
  const dt = new Date(iso);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} às ${hh}h${mi}`;
}

function IconChevronDown() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 5.5 7 9l3.5-3.5" /></svg>;
}
function IconChevronLeft() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>;
}
function IconChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>;
}

export default function Planejamento() {
  const state = useStore();

  const [viewMode, setViewMode] = useState<'admin' | 'gerente'>('admin');
  const [semanaIdx, setSemanaIdx] = useState(0);
  const [menu, setMenu] = useState<{ pessoa_id: string; data: string; x: number; y: number } | null>(null);
  const [step, setStep] = useState<'root' | 'obra' | 'motivo' | 'recebe' | 'adicional'>('root');
  const [pendMotivo, setPendMotivo] = useState<string | null>(null);
  const [pendObra, setPendObra] = useState<string | null>(null);
  const [adTipo, setAdTipo] = useState<'fixo' | 'pct'>('fixo');
  const [adValor, setAdValor] = useState('');
  const [confirm, setConfirm] = useState<{ pessoa_id: string; data: string; valor: CelulaValor } | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; tom: 'ok' | 'erro' } | null>(null);

  const comoGerente = viewMode === 'gerente';
  const viewer = comoGerente ? state.pessoas.find((p) => p.id === GERENTE_ID) : state.pessoas.find((p) => p.id === 'p01');

  const semana = state.semanas[semanaIdx];
  const dias = useMemo(() => diasDaSemana(semana.inicio), [semana.inicio]);
  const sabado = dias[5];
  const estado = semanaEstado(state, semana.inicio);
  const publicada = estado === 'publicado';
  const pendentes = semanaTemAlteracoesPendentes(state, semana.inicio);

  const roster = useMemo(
    () => pessoasDaGrade(state, semana.inicio, comoGerente),
    [state, semana.inicio, comoGerente]
  );
  const resumo = resumoSemana(state, semana.inicio, roster);
  const obras = obrasNaoConcluidas(state);

  function abrirMenu(e: React.MouseEvent, pessoa_id: string, data: string) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(rect.left, window.innerWidth - 280);
    const y = Math.min(rect.bottom + 6, window.innerHeight - 340);
    setMenu({ pessoa_id, data, x, y });
    setStep('root');
    setPendMotivo(null);
    setPendObra(null);
    setAdValor('');
    setAdTipo('fixo');
  }
  function fecharMenu() {
    setMenu(null);
    setStep('root');
  }

  function gravar(pessoa_id: string, data: string, valor: CelulaValor, registrar: boolean) {
    state.gravarCelula({
      pessoa_id,
      data,
      semana_inicio: semana.inicio,
      valor,
      registrarAlteracao: registrar,
      alterado_por: viewer?.nome,
    });
  }

  // Resolve uma escolha da célula: aplica regras de perfil e de semana publicada.
  function resolver(valor: CelulaValor) {
    if (!menu) return;
    const { pessoa_id, data } = menu;

    // Regra do gerente: não pode alocar quem já está alocado em outra obra.
    if (comoGerente && valor.tipo === 'alocada') {
      const atual = getCelula(state, pessoa_id, data);
      if (tipoCelula(atual) === 'alocada' && atual!.obra_id !== valor.obra_id) {
        setAviso({ texto: 'Pessoa indisponível nesta data. Falar com a Administração.', tom: 'erro' });
        fecharMenu();
        return;
      }
    }

    if (publicada) {
      setConfirm({ pessoa_id, data, valor });
      fecharMenu();
      return;
    }
    gravar(pessoa_id, data, valor, false);
    fecharMenu();
  }

  function escolherObra(obra_id: string) {
    if (menu && menu.data === sabado) {
      setPendObra(obra_id);
      setStep('adicional');
      return;
    }
    resolver({ tipo: 'alocada', obra_id });
  }

  function escolherAdicional(tipo: 'fixo' | 'pct' | 'sem') {
    if (!menu || !pendObra) return;
    let adicional = 0;
    if (tipo === 'fixo') {
      adicional = Math.round((parseFloat(adValor.replace(',', '.')) || 0) * 100);
    } else if (tipo === 'pct') {
      const pct = parseFloat(adValor.replace(',', '.')) || 0;
      adicional = Math.round((valorDiaria(state, menu.pessoa_id) * pct) / 100);
    }
    resolver({ tipo: 'alocada', obra_id: pendObra, adicional_centavos: adicional });
  }

  function confirmarAlteracao() {
    if (!confirm) return;
    gravar(confirm.pessoa_id, confirm.data, confirm.valor, true);
    setConfirm(null);
    setAviso({ texto: 'Alteração registrada. As pessoas envolvidas foram notificadas.', tom: 'ok' });
  }

  function publicar() {
    const n = pessoasNaSemana(state, semana.inicio);
    state.publicarSemana(semana.inicio);
    setAviso({ texto: `Planejamento publicado. ${n} pessoas foram notificadas.`, tom: 'ok' });
  }
  function salvar() {
    state.salvarAlteracoes(semana.inicio);
    setAviso({ texto: 'Alterações salvas. As pessoas envolvidas foram notificadas.', tom: 'ok' });
  }

  const semanaLabel = `${diaNumero(dias[0])}–${diaNumero(dias[5])} de ${MESES[Number(dias[0].split('-')[1]) - 1]}`;

  return (
    <div style={{ padding: '32px 40px 80px', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Cabeçalho ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', margin: 0 }}>
              Planejamento semanal
            </h1>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600,
              padding: '3px 11px', borderRadius: '999px',
              backgroundColor: publicada ? '#EAF3EC' : '#F0F0F0',
              color: publicada ? C.positivo : C.tintaFraca,
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: publicada ? C.positivo : C.neutro }} />
              {publicada ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, marginTop: '6px' }}>
            Clique em uma célula para alocar, marcar ausência ou deixar em aberto.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.tintaFraca, marginBottom: '6px' }}>
              Visualizar como
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={viewMode}
                onChange={(e) => { setViewMode(e.target.value as 'admin' | 'gerente'); setSemanaIdx((i) => i); }}
                style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite,
                  backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px',
                  padding: '9px 36px 9px 14px', appearance: 'none', outline: 'none', cursor: 'pointer', minWidth: '196px',
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

          {!comoGerente && (
            publicada && !pendentes ? (
              <button disabled style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.neutro,
                backgroundColor: '#F0F0F0', border: 'none', borderRadius: '8px', padding: '10px 20px',
                cursor: 'not-allowed', whiteSpace: 'nowrap',
              }}>
                Publicado
              </button>
            ) : (
              <button
                onClick={publicada ? salvar : publicar}
                style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta,
                  backgroundColor: C.acento, border: 'none', borderRadius: '8px', padding: '10px 20px',
                  cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                }}
              >
                {publicada ? 'Salvar alterações' : 'Publicar planejamento'}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Seletor de semana ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <button
          onClick={() => setSemanaIdx((i) => Math.max(0, i - 1))}
          disabled={semanaIdx === 0}
          style={navBtn(semanaIdx === 0)}
        >
          <IconChevronLeft />
        </button>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: C.grafite,
          padding: '8px 18px', backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
          borderRadius: '8px', minWidth: '190px', textAlign: 'center', letterSpacing: '-0.01em',
        }}>
          Semana de {semanaLabel}
        </div>
        <button
          onClick={() => setSemanaIdx((i) => Math.min(state.semanas.length - 1, i + 1))}
          disabled={semanaIdx === state.semanas.length - 1}
          style={navBtn(semanaIdx === state.semanas.length - 1)}
        >
          <IconChevronRight />
        </button>
      </div>

      {/* ── Faixa de resumo ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <ResumoTile label="Pessoas na grade" valor={String(resumo.pessoasNaGrade)} />
        <ResumoTile label="Em aberto" valor={String(resumo.emAberto)} destaque={resumo.emAberto > 0} />
        <ResumoTile label="Ausências" valor={String(resumo.ausencias)} />
        <ResumoTile label="Custo previsto da semana" valor={<ValorMonetario valorCentavos={resumo.custoPrevisto} />} />
      </div>

      {/* ── Grade ── */}
      <div style={{ backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '12px', overflow: 'hidden' }}>
        {/* Cabeçalho da grade */}
        <div style={gridRow(true)}>
          <div style={{ ...nameCell, borderBottom: `1px solid ${C.borda}` }}>
            <CabecalhoTabela elemento="span">Pessoa</CabecalhoTabela>
          </div>
          {dias.map(d => (
            <div key={d} style={{ ...dayHeadCell, borderBottom: `1px solid ${C.borda}` }}>
              <DataComDiaSemana data={d} modo="grade" />
            </div>
          ))}
        </div>

        {roster.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: C.tintaFraca, fontSize: '14px' }}>
            Nenhuma pessoa nesta visão para a semana selecionada.
          </div>
        )}

        {roster.map((pid, idx) => {
          const pessoa = state.pessoas.find((p) => p.id === pid)!;
          return (
            <div key={pid} style={{ ...gridRow(false), borderTop: idx === 0 ? 'none' : `1px solid ${C.borda}` }}>
              <div style={nameCell}>
                <Avatar pessoaId={pessoa.id} nome={pessoa.nome} tamanho={30} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pessoa.nome}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.tintaFraca, margin: '1px 0 0' }}>{pessoa.funcao}</p>
                </div>
              </div>
              {dias.map((d) => {
                const cel = getCelula(state, pid, d);
                const aberto = !!menu && menu.pessoa_id === pid && menu.data === d;
                return (
                  <div
                    key={d}
                    onClick={(e) => abrirMenu(e, pid, d)}
                    style={{
                      ...cellBox,
                      backgroundColor: aberto ? '#FFFBEF' : 'transparent',
                      boxShadow: aberto ? `inset 0 0 0 2px ${C.acento}` : 'none',
                    }}
                  >
                    <CelulaConteudo state={state} cel={cel} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Legenda ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '16px' }}>
        {obras.map((o) => (
          <LegendaItem key={o.id} cor={OBRA_COR[o.id] ?? C.neutro} label={o.codigo} />
        ))}
        <LegendaItem cor={C.neutro} label="Ausência" quadrado />
        <LegendaItem cor={C.tintaFraca} label="Em aberto" tracejado />
      </div>

      {/* ── Menu ancorado ── */}
      {menu && (
        <>
          <div onClick={fecharMenu} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'fixed', left: menu.x, top: menu.y, zIndex: 41, width: '260px',
            backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)', overflow: 'hidden',
          }}>
            <MenuHeader
              pessoa={state.pessoas.find((p) => p.id === menu.pessoa_id)!.nome}
              data={menu.data}
              step={step}
              onBack={step === 'root' ? undefined : () => { setStep(step === 'recebe' ? 'motivo' : step === 'adicional' ? 'obra' : 'root'); }}
            />

            {step === 'root' && (
              <div style={{ padding: '6px' }}>
                <MenuOpt label="Alocar em uma obra" onClick={() => setStep('obra')} chevron />
                <MenuOpt label="Marcar ausência" onClick={() => setStep('motivo')} chevron />
                <MenuOpt label="Deixar em aberto" onClick={() => resolver({ tipo: 'aberto' })} />
                <MenuOpt label="Limpar" onClick={() => resolver({ tipo: 'limpar' })} tom="erro" />
              </div>
            )}

            {step === 'obra' && (
              <div style={{ padding: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                {obras.map((o) => (
                  <MenuOpt
                    key={o.id}
                    label={o.codigo}
                    dot={OBRA_COR[o.id] ?? C.neutro}
                    onClick={() => escolherObra(o.id)}
                  />
                ))}
              </div>
            )}

            {step === 'motivo' && (
              <div style={{ padding: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                {MOTIVOS.map((m) => (
                  <MenuOpt key={m} label={m} onClick={() => { setPendMotivo(m); setStep('recebe'); }} />
                ))}
              </div>
            )}

            {step === 'recebe' && pendMotivo && (
              <div style={{ padding: '14px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, margin: '0 0 4px' }}>{pendMotivo}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite, margin: '0 0 12px' }}>A pessoa recebe o dia?</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => resolver({ tipo: 'ausencia', motivo_ausencia: pendMotivo, recebe: true })} style={choiceBtn}>Recebe</button>
                  <button onClick={() => resolver({ tipo: 'ausencia', motivo_ausencia: pendMotivo, recebe: false })} style={choiceBtn}>Não recebe</button>
                </div>
              </div>
            )}

            {step === 'adicional' && (
              <div style={{ padding: '14px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite, margin: '0 0 4px' }}>Adicional de sábado</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, margin: '0 0 12px' }}>Trabalho no sábado pode ter adicional.</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <button onClick={() => setAdTipo('fixo')} style={segBtn(adTipo === 'fixo')}>Valor fixo</button>
                  <button onClick={() => setAdTipo('pct')} style={segBtn(adTipo === 'pct')}>Percentual</button>
                </div>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca }}>
                    {adTipo === 'fixo' ? 'Reais' : '%'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={adValor}
                    onChange={(e) => setAdValor(e.target.value)}
                    placeholder={adTipo === 'fixo' ? '0,00' : '0'}
                    style={{
                      width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', fontSize: '14px',
                      color: C.grafite, backgroundColor: C.fundo, border: `1px solid ${C.borda}`, borderRadius: '8px',
                      padding: '9px 12px 9px 34px', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => escolherAdicional(adTipo)} style={{ ...choiceBtn, backgroundColor: C.acento, borderColor: C.acento, color: C.tinta, fontWeight: 600 }}>Aplicar</button>
                  <button onClick={() => escolherAdicional('sem')} style={choiceBtn}>Sem adicional</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Confirmação de alteração em semana publicada ── */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: C.superficie, borderRadius: '14px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 48px rgba(0,0,0,0.24)' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: C.tinta, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
              Alterar semana publicada?
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, lineHeight: '21px', margin: '0 0 22px' }}>
              Esta semana já foi publicada. A alteração será registrada e as pessoas envolvidas serão notificadas.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirm(null)} style={{ ...choiceBtn, flex: 'none', padding: '9px 18px' }}>Cancelar</button>
              <button onClick={confirmarAlteracao} style={{ ...choiceBtn, flex: 'none', padding: '9px 18px', backgroundColor: C.acento, borderColor: C.acento, color: C.tinta, fontWeight: 600 }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Aviso (toast) ── */}
      {aviso && (
        <div
          onClick={() => setAviso(null)}
          style={{
            position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 60,
            backgroundColor: aviso.tom === 'erro' ? '#FBEBE8' : C.grafite,
            color: aviso.tom === 'erro' ? '#C0392B' : C.superficie,
            border: aviso.tom === 'erro' ? '1px solid #F1C6BE' : 'none',
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
            padding: '13px 20px', borderRadius: '10px', boxShadow: '0 10px 28px rgba(0,0,0,0.2)',
            cursor: 'pointer', maxWidth: '90vw',
          }}
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────

function CelulaConteudo({ state, cel }: { state: StoreState; cel?: Cel }) {
  const tipo = tipoCelula(cel);
  const alteradaTip = cel?.alterada
    ? `Alterado por ${cel.alteracao_por ?? '—'} em ${cel.alteracao_em ? dataHoraLegivel(cel.alteracao_em) : '—'}. Valor anterior: ${cel.valor_anterior ?? '—'}.`
    : undefined;

  const markers = (
    <>
      {cel && cel.adicional_centavos > 0 && (
        <span title="Adicional" style={{ position: 'absolute', top: '4px', right: '6px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: C.grafite, lineHeight: 1 }}>+</span>
      )}
      {cel?.alterada && (
        <span title={alteradaTip} style={{ position: 'absolute', top: '5px', left: '6px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: cel.alteracao_pendente ? C.atencao : C.informativo }} />
      )}
    </>
  );

  if (tipo === 'alocada') {
    const obra = state.obras.find((o) => o.id === cel!.obra_id)!;
    const cor = OBRA_COR[obra.id] ?? C.neutro;
    return (
      <div title={alteradaTip} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {markers}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: C.grafite,
          backgroundColor: '#F2F2F2', border: `1px solid ${C.borda}`, borderRadius: '7px', padding: '5px 10px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: cor }} />
          {obraSigla(obra.codigo)}
        </span>
      </div>
    );
  }
  if (tipo === 'ausencia') {
    return (
      <div title={alteradaTip} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
        {markers}
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: C.tintaFraca }}>{cel!.motivo_ausencia}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: cel!.recebe ? C.positivo : C.neutro }}>
          {cel!.recebe ? 'Recebe' : 'Não recebe'}
        </span>
      </div>
    );
  }
  if (tipo === 'aberto') {
    return (
      <div title={alteradaTip} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {markers}
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: C.tintaFraca,
          border: `1px dashed ${C.neutro}`, borderRadius: '7px', padding: '5px 10px',
        }}>
          Em aberto
        </span>
      </div>
    );
  }
  return (
    <div title={alteradaTip} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {markers}
    </div>
  );
}

function ResumoTile({ label, valor, destaque }: { label: string; valor: React.ReactNode; destaque?: boolean }) {
  return (
    <div style={{ backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '12px', padding: '18px 20px' }}>
      <TituloSecao>{label}</TituloSecao>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: destaque ? C.atencao : C.tinta, letterSpacing: '-0.02em', margin: '8px 0 0' }}>
        {valor}
      </p>
    </div>
  );
}

function MenuHeader({ pessoa, data, step, onBack }: { pessoa: string; data: string; step: string; onBack?: () => void }) {
  const [_, mm, dd] = data.split('-');
  return (
    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.borda}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: C.tintaFraca, display: 'flex' }}>
          <IconChevronLeft />
        </button>
      )}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: C.grafite, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pessoa}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.tintaFraca, margin: '1px 0 0' }}>{dd}/{mm}</p>
      </div>
    </div>
  );
}

function MenuOpt({ label, onClick, chevron, dot, tom }: { label: string; onClick: () => void; chevron?: boolean; dot?: string; tom?: 'erro' }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
        background: hover ? C.fundo : 'transparent', border: 'none', borderRadius: '8px',
        padding: '10px 12px', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
        color: tom === 'erro' ? '#C0392B' : C.grafite,
      }}
    >
      {dot && <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: dot, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {chevron && <span style={{ color: C.neutro, display: 'flex' }}><IconChevronRight /></span>}
    </button>
  );
}

function LegendaItem({ cor, label, quadrado, tracejado }: { cor: string; label: string; quadrado?: boolean; tracejado?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      <span style={{
        width: '11px', height: '11px', borderRadius: quadrado ? '2px' : '3px',
        backgroundColor: tracejado ? 'transparent' : cor,
        border: tracejado ? `1px dashed ${cor}` : 'none',
      }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>{label}</span>
    </div>
  );
}

// ─── Estilos compartilhados ───────────────────────────────────────────────

const GRID_COLS = '220px repeat(6, 1fr)';

function gridRow(header: boolean): React.CSSProperties {
  return { display: 'grid', gridTemplateColumns: GRID_COLS, backgroundColor: header ? C.fundo : C.superficie };
}
const nameCell: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRight: `1px solid ${C.borda}` };
const dayHeadCell: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px 8px', borderRight: `1px solid ${C.borda}` };
const cellBox: React.CSSProperties = { position: 'relative', minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRight: `1px solid ${C.borda}`, cursor: 'pointer' };

const choiceBtn: React.CSSProperties = {
  flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite,
  backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer',
};

function segBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 500,
    color: active ? C.tinta : C.tintaFraca, backgroundColor: active ? '#F2F2F2' : C.superficie,
    border: `1px solid ${active ? C.grafite : C.borda}`, borderRadius: '8px', padding: '8px 10px', cursor: 'pointer',
  };
}
function navBtn(disabled: boolean): React.CSSProperties {
  return {
    width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px',
    color: disabled ? C.neutro : C.grafite, cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
