import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AbasDaObra from '../components/AbasDaObra';
import { useStore, calcularPctAmbiente, getPessoaNome, obraPorSlug } from '../state/store';
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
  neutro: '#9A9A9A',
} as const;

function formatarDataCurta(iso: string): string {
  const date = iso.slice(0, 10);
  const [, m, d] = date.split('-');
  return `${d}/${m}`;
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="4.5" /><path d="M13.5 13.5l-3-3" /></svg>;
}
function IconX() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l10 10M14 4L4 14" /></svg>;
}
function IconWarning() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2L1.5 13h13L8 2z" /><path d="M8 6v4M8 11.5v.5" /></svg>;
}

export default function ObraChecklist() {
  const state = useStore();
  const { obraId } = useParams<{ obraId: string }>();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'todos' | 'pendentes' | 'concluidos'>('todos');
  const [expandedAmbientes, setExpandedAmbientes] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState(false);
  const [foraDescricao, setForaDescricao] = useState('');
  const [foraQtd, setForaQtd] = useState('1');
  const [foraUnidade, setForaUnidade] = useState('vb');

  const perfilAtivo = state.perfil_ativo;
  const pessoaId = perfilAtivo === 'gerente_obras' ? 'p04' : perfilAtivo === 'financeiro' ? 'p03' : 'p01';

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;
  if (!obra) return null;

  const ambientes = state.ambientes.filter(a => a.obra_id === obra.id);

  const foraEscopoCount = state.itens_fora_escopo.filter(
    i => i.obra_id === obra.id && i.estado === 'rascunho'
  ).length;

  const itensDaVisao = (ambienteId: string) => {
    const itens = state.itens_orcamento.filter(i => i.ambiente_id === ambienteId);
    const pelaBusca = search
      ? itens.filter(i => i.servico.toLowerCase().includes(search.toLowerCase()))
      : itens;
    return filterTab === 'pendentes'
      ? pelaBusca.filter(i => !i.executado)
      : filterTab === 'concluidos'
      ? pelaBusca.filter(i => i.executado)
      : pelaBusca;
  };

  const haItensNaVisao = ambientes.some(amb => itensDaVisao(amb.id).length > 0);

  const toggleAmbiente = (id: string) => {
    setExpandedAmbientes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleMarcar = (itemId: string, checked: boolean, ambienteId: string) => {
    let confirmacao = checked ? 'Marcado.' : 'Desmarcado.';
    if (checked) {
      const itensAmbiente = state.itens_orcamento.filter(i => i.ambiente_id === ambienteId);
      const outrosPendentes = itensAmbiente.filter(i => i.id !== itemId && !i.executado);
      if (outrosPendentes.length === 0) {
        const amb = ambientes.find(a => a.id === ambienteId);
        if (amb) confirmacao = `Marcado. ${amb.nome} concluído.`;
      }
    }
    state.marcarItem({ item_id: itemId, executado: checked, pessoa_id: pessoaId });
    setToast(confirmacao);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSalvarFora = () => {
    if (!foraDescricao.trim()) return;
    state.adicionarItemForaEscopo({
      obra_id: obra.id,
      descricao: foraDescricao.trim(),
      quantidade: parseFloat(foraQtd) || 1,
      unidade: foraUnidade.trim() || 'vb',
      criado_por: pessoaId,
    });
    setForaDescricao('');
    setForaQtd('1');
    setForaUnidade('vb');
    setSidePanel(false);
    setToast('Rascunho salvo.');
    setTimeout(() => setToast(null), 3000);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite,
    backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px',
    padding: '10px 14px', outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500,
    color: C.tintaFraca, letterSpacing: '0.04em', textTransform: 'uppercase',
  };

  return (
    <div style={{ padding: '28px 40px 80px', fontFamily: 'Inter, sans-serif', backgroundColor: C.fundo, minHeight: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <AbasDaObra obra={obra} titulo="Checklist" mostrarTitulo={false} />
      </div>

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" data-confirmacao-acao="true" style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: C.grafite, color: '#FFFFFF', fontFamily: 'Inter, sans-serif',
          fontSize: '14px', fontWeight: 500, padding: '12px 24px', borderRadius: '8px',
          zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Fora do escopo banner */}
      {foraEscopoCount > 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          backgroundColor: '#FFF6D6', border: '1px solid #FFC213', borderRadius: '10px',
          padding: '12px 18px', marginBottom: '20px', color: C.grafite,
          fontFamily: 'Inter, sans-serif', fontSize: '14px',
        }}>
          <span style={{ color: '#D4A000', flexShrink: 0 }}><IconWarning /></span>
          <span>
            <strong>{foraEscopoCount}</strong>{' '}
            {foraEscopoCount === 1 ? 'serviço fora do escopo aguardando' : 'serviços fora do escopo aguardando'}{' '}
            revisão da Administração.
          </span>
        </div>
      ) : (
        <EstadoVazio
          compacto
          mensagem="Esta obra ainda não tem serviços fora do escopo. Registre aqui o que precisa de orçamento adicional."
          acao={(
            <button
              onClick={() => setSidePanel(true)}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
                color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
                borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
              }}
            >
              Registrar fora do escopo
            </button>
          )}
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: C.neutro, pointerEvents: 'none' }}>
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar serviço…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px', maxWidth: '320px' }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', border: `1px solid ${C.borda}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: C.superficie }}>
          {(['todos', 'pendentes', 'concluidos'] as const).map(tab => {
            const labels = { todos: 'Todos', pendentes: 'Pendentes', concluidos: 'Concluídos' };
            const active = filterTab === tab;
            return (
              <button key={tab} onClick={() => setFilterTab(tab)} style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: active ? 600 : 400,
                color: active ? C.tinta : C.tintaFraca, backgroundColor: active ? C.acento : 'transparent',
                border: 'none', padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => setSidePanel(true)}
            style={{
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
              color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
              borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            + Registrar fora do escopo
          </button>
        </div>
      </div>

      {/* Ambiente blocks */}
      {ambientes.length === 0 ? (
        <EstadoVazio mensagem="Esta obra ainda não tem ambientes. O checklist aparece aqui quando a estrutura da obra for cadastrada." />
      ) : !haItensNaVisao ? (
        <EstadoVazio
          mensagem={
            search
              ? 'Não há serviços com esta busca. Limpe o termo para ver o checklist da obra.'
              : filterTab === 'pendentes'
              ? 'Esta obra está com o checklist em dia. Novos serviços pendentes aparecem aqui.'
              : 'Esta obra ainda não tem serviços concluídos. O primeiro aparece aqui quando for marcado.'
          }
          tom={filterTab === 'pendentes' && !search ? 'positivo' : 'neutro'}
        />
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ambientes.map(amb => {
          const allItens = state.itens_orcamento.filter(i => i.ambiente_id === amb.id);
          const tabFiltered = itensDaVisao(amb.id);

          if (tabFiltered.length === 0 && (search !== '' || filterTab !== 'todos')) return null;

          const pct = calcularPctAmbiente(state, amb.id);
          const executadoCount = allItens.filter(i => i.executado).length;
          const isOpen = expandedAmbientes.has(amb.id);
          const isDone = pct === 100;

          return (
            <div key={amb.id} style={{
              backgroundColor: C.superficie, borderRadius: '12px',
              border: `1px solid ${C.borda}`, overflow: 'hidden',
            }}>
              {/* Ambiente header */}
              <button
                onClick={() => toggleAmbiente(amb.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', backgroundColor: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: C.tinta }}>
                    {amb.nome}
                  </span>
                  {isDone && (
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
                      color: C.positivo, backgroundColor: '#EDFAF3', padding: '2px 9px',
                      borderRadius: '999px', flexShrink: 0,
                    }}>Concluído</span>
                  )}
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, flexShrink: 0 }}>
                  {executadoCount} de {allItens.length} concluídos
                </span>
                <div style={{ width: '100px', height: '4px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: isDone ? C.positivo : C.acento, borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, width: '34px', textAlign: 'right', flexShrink: 0 }}>
                  {pct}%
                </span>
                <span style={{ color: C.neutro, flexShrink: 0 }}><IconChevron open={isOpen} /></span>
              </button>

              {/* Items list */}
              {isOpen && (
                <div>
                  {tabFiltered.length === 0 ? (
                    <EstadoVazio
                      compacto
                      mensagem="Este ambiente ainda não tem serviços. Eles aparecem aqui quando o orçamento for detalhado."
                      style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0 }}
                    />
                  ) : tabFiltered.map(item => (
                    <label key={item.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '14px 20px', borderTop: `1px solid ${C.borda}`,
                      cursor: 'pointer',
                      backgroundColor: item.executado ? '#FAFAFA' : C.superficie,
                    }}>
                      <input
                        type="checkbox"
                        aria-label={`${item.executado ? 'Desmarcar' : 'Marcar'} ${item.servico}`}
                        checked={item.executado}
                        onChange={e => handleMarcar(item.id, e.target.checked, amb.id)}
                        style={{
                          width: '20px', height: '20px', cursor: 'pointer',
                          flexShrink: 0, marginTop: '1px',
                          accentColor: C.acento,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '14px',
                          textDecoration: item.executado ? 'line-through' : 'none',
                          color: item.executado ? C.neutro : C.grafite,
                          lineHeight: '22px',
                        }}>
                          {item.servico}
                        </span>
                        {item.executado && item.executado_por && item.executado_em && (
                          <p style={{
                            fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#888888',
                            margin: '3px 0 0', lineHeight: '16px',
                          }}>
                            marcado por {getPessoaNome(state, item.executado_por)} em {formatarDataCurta(item.executado_em)}
                          </p>
                        )}
                      </div>
                      <span style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca,
                        flexShrink: 0, whiteSpace: 'nowrap', marginTop: '1px',
                      }}>
                        {item.quantidade} {item.unidade}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Side panel backdrop + panel */}
      {sidePanel && (
        <>
          <div
            onClick={() => setSidePanel(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 100 }}
          />
          <div style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: '440px',
            backgroundColor: C.superficie, zIndex: 101, padding: '32px',
            boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700,
                color: C.tinta, margin: 0, letterSpacing: '-0.02em',
              }}>
                Fora do escopo
              </h3>
              <button
                onClick={() => setSidePanel(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.neutro, padding: '4px', borderRadius: '4px', display: 'flex' }}
              >
                <IconX />
              </button>
            </div>

            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca,
              margin: 0, lineHeight: '1.6',
            }}>
              Serviços fora do escopo ficam em rascunho até a Administração revisar e transformar em orçamento adicional.
            </p>

            {/* Descrição */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Descrição do serviço</label>
              <textarea
                value={foraDescricao}
                onChange={e => setForaDescricao(e.target.value)}
                placeholder="Descreva o serviço a ser adicionado…"
                rows={3}
                style={{
                  ...inputStyle, resize: 'vertical', lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>

            {/* Quantidade + Unidade */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Quantidade</label>
                <input
                  type="number"
                  value={foraQtd}
                  onChange={e => setForaQtd(e.target.value)}
                  min="0.1"
                  step="0.1"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Unidade</label>
                <input
                  type="text"
                  value={foraUnidade}
                  onChange={e => setForaUnidade(e.target.value)}
                  placeholder="vb, m², un, m…"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSidePanel(false)}
                style={{
                  flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                  color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`,
                  borderRadius: '8px', padding: '11px', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarFora}
                disabled={!foraDescricao.trim()}
                style={{
                  flex: 2, fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
                  backgroundColor: foraDescricao.trim() ? C.acento : '#F0F0F0',
                  border: 'none', borderRadius: '8px', padding: '11px', cursor: foraDescricao.trim() ? 'pointer' : 'not-allowed',
                  color: foraDescricao.trim() ? C.tinta : C.neutro,
                }}
              >
                Salvar rascunho
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
