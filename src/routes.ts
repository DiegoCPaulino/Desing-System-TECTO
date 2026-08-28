import React from 'react';
import { createBrowserRouter, Navigate, Outlet, redirect, useMatches, useParams } from 'react-router-dom';
import { useStore, obraPorSlug, gerenteTemAcessoAObra } from './state/store';
import type { TipoPerfil } from './state/types';
import AppLayout from './layouts/AppLayout';
import PortalLayout from './layouts/PortalLayout';
import PainelDoDia from './pages/PainelDoDia';
import ObraVisaoGeral from './pages/ObraVisaoGeral';
import CarteiraDObras from './pages/CarteiraDObras';
import Equipe from './pages/Equipe';
import EmBreve from './pages/EmBreve';
import DesignSystemPage from './pages/DesignSystemPage';
import Planejamento from './pages/Planejamento';
import DiarioObra from './pages/DiarioObra';
import ObraChecklist from './pages/ObraChecklist';
import ObraAndamento from './pages/ObraAndamento';
import ObraDiarios from './pages/ObraDiarios';
import ObraFotos from './pages/ObraFotos';
import PortalMinhaObra from './pages/PortalMinhaObra';
import PortalDiario from './pages/PortalDiario';
import PortalFinanceiro from './pages/PortalFinanceiro';
import Login from './pages/Login';
import PrimeiroAcesso from './pages/PrimeiroAcesso';
import SemAcesso from './pages/SemAcesso';
import Fechamento from './pages/Fechamento';

type RouteHandle = { title?: string; perfis?: TipoPerfil[]; obraScoped?: boolean };

// Perfis internos (não-cliente) que podem estar autenticados dentro do AppLayout.
const TODOS_INTERNOS: TipoPerfil[] = ['administracao', 'financeiro', 'gerente_obras'];
const ADMIN_FINANCEIRO: TipoPerfil[] = ['administracao', 'financeiro'];
const SO_CLIENTE: TipoPerfil[] = ['cliente'];

/**
 * Roteamento de entrada do Cliente: a porta de entrada dele é o portal, não o
 * Painel. Roda como loader, antes de qualquer render, para que o Cliente não
 * veja nem um quadro do layout interno.
 *
 * Não é permissão — quem decide permissão é GuardaPerfil. Por isso vale só para
 * "/", e não para as demais rotas internas, onde o Cliente continua vendo
 * SemAcesso em vez de ser redirecionado em silêncio.
 */
function entradaDoCliente() {
  if (useStore.getState().perfil_ativo === 'cliente') return redirect('/portal');
  return null;
}

/**
 * Guarda de acesso por rota, única camada de permissão do sistema. Cada rota
 * folha declara `handle.perfis` — perfil fora da lista (ou rota sem perfis
 * declarados) cai em SemAcesso, nunca em redirecionamento silencioso. Rotas com
 * `handle.obraScoped` também checam, para o Gerente de Obras, se ele está
 * vinculado à obra do parâmetro :obraId.
 *
 * Vale para as duas árvores, a interna e o portal. Nenhum layout checa perfil.
 */
function GuardaPerfil() {
  const perfil = useStore((s) => s.perfil_ativo);
  const state = useStore();
  const matches = useMatches();
  const params = useParams();
  const handle = (matches[matches.length - 1]?.handle ?? {}) as RouteHandle;
  const perfis = handle.perfis ?? [];

  // Falta de sessão não é falta de permissão: vai para o login, não para
  // SemAcesso.
  if (!perfil) return React.createElement(Navigate, { to: '/entrar', replace: true });
  if (!perfis.includes(perfil)) return React.createElement(SemAcesso);

  if (handle.obraScoped && perfil === 'gerente_obras') {
    const obra = params.obraId ? obraPorSlug(state, params.obraId) : undefined;
    if (!obra || !gerenteTemAcessoAObra(state, obra.id)) return React.createElement(SemAcesso);
  }

  return React.createElement(Outlet);
}

// Tabela de rotas. Exportada separada do router para poder ser inspecionada e
// exercitada fora do navegador, sem construir um BrowserRouter.
export const rotas = [
  // ── Login ──────────────────────────────────────────────────────────────────
  { path: '/entrar', Component: Login },
  { path: '/entrar/primeiro-acesso', Component: PrimeiroAcesso },

  // ── Internal app ───────────────────────────────────────────────────────────
  {
    path: '/',
    Component: AppLayout,
    children: [
      {
        Component: GuardaPerfil,
        children: [
          { index: true, loader: entradaDoCliente, handle: { perfis: TODOS_INTERNOS }, Component: PainelDoDia },
          { path: 'obras', handle: { perfis: TODOS_INTERNOS }, Component: CarteiraDObras },
          { path: 'obras/:obraId', handle: { perfis: TODOS_INTERNOS, obraScoped: true }, Component: ObraVisaoGeral },
          { path: 'obras/:obraId/diario', handle: { perfis: TODOS_INTERNOS, obraScoped: true, title: 'Diário de hoje' }, Component: DiarioObra },
          { path: 'obras/:obraId/diarios', handle: { perfis: TODOS_INTERNOS, obraScoped: true, title: 'Diários da obra' }, Component: ObraDiarios },
          { path: 'obras/:obraId/checklist', handle: { perfis: TODOS_INTERNOS, obraScoped: true, title: 'Checklist de execução' }, Component: ObraChecklist },
          { path: 'obras/:obraId/andamento', handle: { perfis: TODOS_INTERNOS, obraScoped: true, title: 'Andamento' }, Component: ObraAndamento },
          { path: 'obras/:obraId/fotos', handle: { perfis: TODOS_INTERNOS, obraScoped: true, title: 'Fotos' }, Component: ObraFotos },
          { path: 'obras/:obraId/financeiro', handle: { perfis: ADMIN_FINANCEIRO, obraScoped: true, title: 'Financeiro da obra' }, Component: EmBreve },
          { path: 'obras/:obraId/documentos', handle: { perfis: TODOS_INTERNOS, obraScoped: true, title: 'Documentos' }, Component: EmBreve },
          { path: 'planejamento', handle: { perfis: TODOS_INTERNOS, title: 'Planejamento semanal' }, Component: Planejamento },
          { path: 'equipe', handle: { perfis: TODOS_INTERNOS }, Component: Equipe },
          { path: 'equipe/:pessoaId', handle: { perfis: TODOS_INTERNOS, title: 'Ficha da pessoa' }, Component: EmBreve },
          { path: 'orcamentos', handle: { perfis: ADMIN_FINANCEIRO, title: 'Orçamentos' }, Component: EmBreve },
          { path: 'financeiro', handle: { perfis: ADMIN_FINANCEIRO, title: 'Fechamento de ciclo' }, Component: Fechamento },
          { path: 'indicadores', handle: { perfis: ADMIN_FINANCEIRO, title: 'Indicadores' }, Component: EmBreve },
          { path: '*', handle: { perfis: TODOS_INTERNOS, title: 'Página não encontrada' }, Component: EmBreve },
        ],
      },
    ],
  },

  // ── Design system ──────────────────────────────────────────────────────────
  { path: '/design-system', Component: DesignSystemPage },

  // ── Portal do cliente ──────────────────────────────────────────────────────
  // GuardaPerfil fica acima do PortalLayout, e não dentro dele como na árvore
  // interna: quem não é Cliente vê SemAcesso puro, sem o cabeçalho do portal
  // — que traz o nome do cliente — desenhado em volta do bloqueio.
  {
    path: '/portal',
    Component: GuardaPerfil,
    children: [
      {
        Component: PortalLayout,
        children: [
          { index: true, handle: { perfis: SO_CLIENTE }, Component: PortalMinhaObra },
          { path: 'diario', handle: { perfis: SO_CLIENTE }, Component: PortalDiario },
          { path: 'financeiro', handle: { perfis: SO_CLIENTE }, Component: PortalFinanceiro },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(rotas);
