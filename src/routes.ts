import React from 'react';
import { createBrowserRouter, Outlet, useMatches, useParams } from 'react-router-dom';
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

type RouteHandle = { title?: string; perfis?: TipoPerfil[]; obraScoped?: boolean };

// Perfis internos (não-cliente) que podem estar autenticados dentro do AppLayout.
const TODOS_INTERNOS: TipoPerfil[] = ['administracao', 'financeiro', 'gerente_obras'];
const ADMIN_FINANCEIRO: TipoPerfil[] = ['administracao', 'financeiro'];

/**
 * Guarda de acesso por rota. Cada rota folha declara `handle.perfis` — perfil
 * fora da lista (ou rota sem perfis declarados) cai em SemAcesso, nunca em
 * redirecionamento silencioso. Rotas com `handle.obraScoped` também checam,
 * para o Gerente de Obras, se ele está vinculado à obra do parâmetro :obraId.
 */
function GuardaPerfil() {
  const perfil = useStore((s) => s.perfil_ativo);
  const state = useStore();
  const matches = useMatches();
  const params = useParams();
  const handle = (matches[matches.length - 1]?.handle ?? {}) as RouteHandle;
  const perfis = handle.perfis ?? [];

  if (!perfil || !perfis.includes(perfil)) return React.createElement(SemAcesso);

  if (handle.obraScoped && perfil === 'gerente_obras') {
    const obra = params.obraId ? obraPorSlug(state, params.obraId) : undefined;
    if (!obra || !gerenteTemAcessoAObra(state, obra.id)) return React.createElement(SemAcesso);
  }

  return React.createElement(Outlet);
}

export const router = createBrowserRouter([
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
          { index: true, handle: { perfis: TODOS_INTERNOS }, Component: PainelDoDia },
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
          { path: 'financeiro', handle: { perfis: ADMIN_FINANCEIRO, title: 'Fechamento de ciclo' }, Component: EmBreve },
          { path: 'indicadores', handle: { perfis: ADMIN_FINANCEIRO, title: 'Indicadores' }, Component: EmBreve },
          { path: '*', handle: { perfis: TODOS_INTERNOS, title: 'Página não encontrada' }, Component: EmBreve },
        ],
      },
    ],
  },

  // ── Design system ──────────────────────────────────────────────────────────
  { path: '/design-system', Component: DesignSystemPage },

  // ── Portal do cliente ──────────────────────────────────────────────────────
  {
    path: '/portal',
    Component: PortalLayout,
    children: [
      { index: true, Component: PortalMinhaObra },
      { path: 'diario', Component: PortalDiario },
      { path: 'financeiro', Component: PortalFinanceiro },
    ],
  },
]);
