import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, obraPorSlug } from '../state/store';
import { documentosDaObra, especialidadesComDocumento } from '../state/documentos';
import AbasDaObra from '../components/AbasDaObra';
import CabecalhoTabela from '../components/CabecalhoTabela';
import EstadoVazio from '../components/EstadoVazio';
import EmBreve from './EmBreve';

/**
 * DOCUMENTOS DA OBRA — projetos e contratos, por especialidade.
 *
 * A fronteira com o Financeiro da obra, que é fácil de embaralhar: **nota
 * fiscal não vive aqui.** A nota é sempre a nota de um custo, então ela mora em
 * `custos_obra` e aparece no Financeiro, filtrável por tipo de nota. Aqui ficam
 * os documentos que não são dinheiro — o projeto elétrico, o contrato do
 * marceneiro, a ART.
 *
 * `documentos.ts` já separa as duas listagens; esta tela consome só a primeira.
 *
 * A rota é `TODOS_INTERNOS`, incluindo o Gerente de Obras: ele precisa do
 * projeto para tocar a obra. É o oposto do Financeiro da obra, que o exclui.
 */

const C = {
  acento: '#FFC213',
  acentoFundo: '#FFF6D6',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
} as const;

function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano.slice(2)}`;
}

function IconDocumento() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2H4.5a1 1 0 00-1 1v12a1 1 0 001 1h9a1 1 0 001-1V6l-4-4z" />
      <path d="M10.5 2v4h4" />
    </svg>
  );
}

export default function ObraDocumentos() {
  const { obraId } = useParams<{ obraId: string }>();
  const state = useStore();
  const [especialidadeId, setEspecialidadeId] = useState<string | undefined>(undefined);

  const obra = obraId ? obraPorSlug(state, obraId) : undefined;

  const dados = useMemo(() => {
    if (!obra) return undefined;
    const todos = documentosDaObra(state, obra.id);
    return {
      todos,
      especialidades: especialidadesComDocumento(state, obra.id),
      // O filtro roda sobre a lista já montada, e não numa segunda consulta:
      // duas leituras da mesma coisa divergem quando uma delas muda.
      visiveis: especialidadeId
        ? todos.filter((d) => d.documento.especialidade_id === especialidadeId)
        : todos,
    };
  }, [state, obra, especialidadeId]);

  if (!obra || !dados) return <EmBreve />;

  // Agrupado por tipo de topo — Projeto, Contrato. A taxonomia tem um nível de
  // profundidade, e os tipos de nota são filhos de "Nota fiscal", que não
  // aparece aqui.
  const porTipo = new Map<string, typeof dados.visiveis>();
  for (const d of dados.visiveis) {
    const chave = d.tipo?.nome ?? 'Sem tipo';
    porTipo.set(chave, [...(porTipo.get(chave) ?? []), d]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AbasDaObra
        obra={obra}
        titulo="Documentos"
        resumo={`${dados.todos.length} ${dados.todos.length === 1 ? 'documento' : 'documentos'}`}
      />

      {/* ── Filtro por especialidade ── */}
      {dados.especialidades.length > 0 && (
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
          <CabecalhoTabela elemento="span" style={{ marginRight: '4px' }}>Especialidade</CabecalhoTabela>
          {[{ id: undefined as string | undefined, rotulo: `Todas (${dados.todos.length})` },
            ...dados.especialidades.map((e) => ({ id: e.especialidade.id, rotulo: `${e.especialidade.nome} (${e.quantidade})` }))
          ].map((f) => {
            const ativo = f.id === especialidadeId;
            return (
              <button
                key={f.id ?? 'todas'}
                onClick={() => setEspecialidadeId(f.id)}
                aria-pressed={ativo}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: ativo ? 600 : 400,
                  color: ativo ? C.tinta : C.tintaFraca,
                  backgroundColor: ativo ? C.acentoFundo : C.superficie,
                  border: `1px solid ${ativo ? C.acento : C.borda}`,
                  borderRadius: '999px',
                  padding: '6px 13px',
                  cursor: 'pointer',
                }}
              >
                {f.rotulo}
              </button>
            );
          })}
        </div>
      )}

      {dados.visiveis.length === 0 ? (
        <EstadoVazio
          mensagem={
            especialidadeId
              ? 'Nenhum documento desta especialidade nesta obra. Escolha outra especialidade ou veja todas.'
              : 'Esta obra ainda não tem projetos nem contratos. Eles aparecem aqui quando alguém enviar o primeiro.'
          }
        />
      ) : (
        [...porTipo.entries()].map(([tipoNome, lista]) => (
          <div key={tipoNome} style={{ backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
              <CabecalhoTabela elemento="span">{tipoNome}</CabecalhoTabela>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>
                {lista.length}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {lista.map(({ documento, especialidade }) => (
                <div
                  key={documento.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    backgroundColor: C.fundo,
                    border: `1px solid ${C.borda}`,
                    borderRadius: '10px',
                    padding: '14px 16px',
                  }}
                >
                  <span style={{ color: C.tintaFraca, flexShrink: 0, marginTop: '1px' }}>
                    <IconDocumento />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.tinta, lineHeight: '19px' }}>
                      {documento.nome}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '4px', lineHeight: '17px' }}>
                      {especialidade ? (
                        <span style={{ color: C.informativo }}>{especialidade.nome}</span>
                      ) : (
                        <span style={{ color: C.neutro }}>sem especialidade</span>
                      )}
                      {' · '}
                      {dataCurta(documento.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, lineHeight: '17px' }}>
        Nota fiscal não aparece aqui. A nota é sempre a nota de um custo, então ela vive no{' '}
        <strong style={{ color: C.grafite, fontWeight: 500 }}>Financeiro da obra</strong>, filtrável por tipo de
        nota — depósito de material, parte elétrica, compra online.
      </p>
    </div>
  );
}
