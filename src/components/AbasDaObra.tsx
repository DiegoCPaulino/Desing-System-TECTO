import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore, obraSlug } from '../state/store';
import type { Obra } from '../state/types';

/**
 * Cabeçalho e abas da Obra, para as telas que são abas.
 *
 * Por que existe: até aqui só `ObraVisaoGeral` desenhava a barra de abas. As
 * demais — Diários, Checklist, Andamento, Fotos — são componentes de rota
 * próprios e nasciam sem cabeçalho nenhum. Quem clicava em "Fotos" perdia a
 * migalha, perdia as abas e não tinha caminho de volta para a obra a não ser o
 * botão do navegador. Numa demonstração ao vivo isso é encalhe.
 *
 * As regras de visibilidade são as mesmas de `ObraVisaoGeral`, e é de propósito
 * que sejam repetidas aqui em vez de importadas de lá: aquele arquivo é uma
 * tela, não um módulo de regra, e importar de tela para componente inverte a
 * dependência.
 *
 *  - Pequeno serviço não tem aba de Diários (`INV-02`).
 *  - O Gerente de Obras não vê a aba Financeiro. A rota já bloqueia com
 *    `SemAcesso`; esconder a aba evita oferecer o que vai negar.
 */

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  superficie: '#FFFFFF',
  informativo: '#215FD7',
} as const;

const TODAS_AS_ABAS = [
  'Visão geral',
  'Diários',
  'Checklist',
  'Andamento',
  'Fotos',
  'Financeiro',
  'Documentos',
] as const;

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l4 4-4 4" />
    </svg>
  );
}

type AbasDaObraProps = {
  obra: Obra;
  /** Título da tela, sob a migalha. */
  titulo: string;
  /** Uma linha de contexto à direita do título — contagem, total, período. */
  resumo?: React.ReactNode;
  /** Ação principal da tela, alinhada à direita. */
  acao?: React.ReactNode;
  /**
   * `false` desenha só migalha e abas, sem o título.
   *
   * É o que permite acrescentar a navegação às telas que já desenham o próprio
   * cabeçalho — Fotos, Andamento, Checklist, Diários — inserindo uma linha e
   * removendo nada. Ali o `titulo` ainda é obrigatório: ele nomeia a posição
   * atual na migalha.
   */
  mostrarTitulo?: boolean;
};

export default function AbasDaObra({ obra, titulo, resumo, acao, mostrarTitulo = true }: AbasDaObraProps) {
  const { pathname } = useLocation();
  const perfil = useStore((s) => s.perfil_ativo);

  const base = `/obras/${obraSlug(obra)}`;
  const caminho: Record<string, string> = {
    'Visão geral': base,
    'Diários': `${base}/diarios`,
    'Checklist': `${base}/checklist`,
    'Andamento': `${base}/andamento`,
    'Fotos': `${base}/fotos`,
    'Financeiro': `${base}/financeiro`,
    'Documentos': `${base}/documentos`,
  };

  const abas = TODAS_AS_ABAS.filter((aba) => {
    if (aba === 'Diários' && obra.tipo === 'pequeno_servico') return false;
    if (aba === 'Financeiro' && perfil === 'gerente_obras') return false;
    return true;
  });

  const ativa = (aba: string) =>
    aba === 'Visão geral' ? pathname === base : pathname === caminho[aba];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Migalha ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.tintaFraca }}>
        <Link
          to="/obras"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.informativo, fontWeight: 500, textDecoration: 'none' }}
        >
          Obras
        </Link>
        <IconChevronRight />
        <Link
          to={base}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.informativo, fontWeight: 500, textDecoration: 'none' }}
        >
          {obra.codigo}
        </Link>
        <IconChevronRight />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca }}>{titulo}</span>
      </div>

      {/* ── Título da tela ── */}
      {mostrarTitulo && (
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 600, color: C.tinta, letterSpacing: '-0.02em', margin: 0 }}>
            {titulo}
          </h1>
          {resumo && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca }}>{resumo}</span>
          )}
        </div>
        {acao}
      </div>
      )}

      {/* ── Abas ── */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderBottom: `1px solid ${C.borda}`,
          backgroundColor: C.superficie,
          borderRadius: '12px 12px 0 0',
          padding: '0 4px',
          overflowX: 'auto',
        }}
      >
        {abas.map((aba) => {
          const atual = ativa(aba);
          return (
            <Link
              key={aba}
              to={caminho[aba]}
              aria-current={atual ? 'page' : undefined}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: atual ? 600 : 400,
                color: atual ? C.tinta : C.tintaFraca,
                backgroundColor: 'transparent',
                borderBottom: atual ? `3px solid ${C.acento}` : '3px solid transparent',
                padding: '14px 18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: atual ? '-0.01em' : 'normal',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '-1px',
                transition: 'color 0.15s ease',
              }}
            >
              {aba}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
