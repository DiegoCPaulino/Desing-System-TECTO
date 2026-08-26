import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { useStore } from './state/store';
import AppLayout from './layouts/AppLayout';
import CampoLayout from './layouts/CampoLayout';
import PortalLayout from './layouts/PortalLayout';
import PainelDoDia from './PainelDoDia';
import ObraVisaoGeral from './ObraVisaoGeral';
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

/** Layout wrapper that only renders children for admin profile */
function AdminOnly() {
  const perfil = useStore(s => s.perfil_ativo);
  if (perfil !== 'administracao') return React.createElement(SemAcesso);
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
      { index: true, Component: PainelDoDia },
      { path: 'obras', Component: CarteiraDObras },
      { path: 'obras/22-mcl', Component: ObraVisaoGeral },
      { path: 'obras/22-mcl/diarios', handle: { title: 'Diários da obra' }, Component: ObraDiarios },
      { path: 'obras/22-mcl/checklist', handle: { title: 'Checklist de execução' }, Component: ObraChecklist },
      { path: 'obras/22-mcl/andamento', handle: { title: 'Andamento' }, Component: ObraAndamento },
      { path: 'obras/22-mcl/fotos', handle: { title: 'Fotos' }, Component: ObraFotos },
      { path: 'obras/22-mcl/financeiro', handle: { title: 'Financeiro da obra' }, Component: EmBreve },
      { path: 'obras/22-mcl/documentos', handle: { title: 'Documentos' }, Component: EmBreve },
      { path: 'obras/:obraId', handle: { title: 'Obra' }, Component: EmBreve },
      { path: 'planejamento', handle: { title: 'Planejamento semanal' }, Component: Planejamento },
      { path: 'equipe', Component: Equipe },
      { path: 'equipe/:pessoaId', handle: { title: 'Ficha da pessoa' }, Component: EmBreve },
      // Rotas restritas a Administração
      {
        Component: AdminOnly,
        children: [
          { path: 'orcamentos', handle: { title: 'Orçamentos' }, Component: EmBreve },
          { path: 'financeiro', handle: { title: 'Fechamento de ciclo' }, Component: EmBreve },
          { path: 'indicadores', handle: { title: 'Indicadores' }, Component: EmBreve },
        ],
      },
      { path: '*', handle: { title: 'Página não encontrada' }, Component: EmBreve },
    ],
  },

  // ── Design system ──────────────────────────────────────────────────────────
  { path: '/design-system', Component: DesignSystemPage },

  // ── Campo (gerente/assistente) ─────────────────────────────────────────────
  {
    path: '/campo',
    Component: CampoLayout,
    children: [
      { path: 'diario', Component: DiarioObra },
      { path: 'obras', handle: { title: 'Minhas obras' }, Component: EmBreve },
      { path: 'planejamento', handle: { title: 'Planejamento' }, Component: EmBreve },
    ],
  },

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
