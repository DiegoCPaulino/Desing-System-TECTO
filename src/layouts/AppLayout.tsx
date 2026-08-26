import React from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore, calcularPendencias } from '../state/store';
import SemAcesso from '../pages/SemAcesso';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  atencao: '#E8833A',
} as const;

function IconPainel() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>;
}
function IconObras() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14V6.5L8 2l6 4.5V14"/><path d="M6 14v-4h4v4"/><path d="M2 8.5h12"/></svg>;
}
function IconPlanejamento() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3" width="13" height="11.5" rx="1.5"/><path d="M1.5 7h13M5 1.5V4M11 1.5V4"/></svg>;
}
function IconOrcamentos() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 2H4A1.5 1.5 0 0 0 2.5 3.5v10A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 12 2h-1.5"/><path d="M5.5 1.5h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5Z"/><path d="M5.5 8h5M5.5 11h3.5"/></svg>;
}
function IconFinanceiro() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v7M6.25 5.75h2.5a1.25 1.25 0 0 1 0 2.5h-1.5a1.25 1.25 0 0 0 0 2.5h2.5"/></svg>;
}
function IconIndicadores() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 11V7M5.5 11V4M9 11V8M12.5 11V5"/><path d="M1 12.5h12.5"/></svg>;
}
function IconEquipe() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5" r="2.5"/><path d="M1 14c0-3.038 2.462-5.5 5.5-5.5S12 10.962 12 14"/><path d="M11.5 3.5a2 2 0 0 1 0 4M14 14c0-2-1.2-3.7-2.5-4.3"/></svg>;
}
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M13.5 13.5l-3-3"/></svg>;
}
function IconBell() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2a5.5 5.5 0 0 0-5.5 5.5v3L2 13h14l-1.5-2.5v-3A5.5 5.5 0 0 0 9 2Z"/><path d="M7.5 15a1.5 1.5 0 0 0 3 0"/></svg>;
}
function IconReload() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 2.5A6 6 0 1 0 13 7"/><path d="M13 2.5V5.5H10"/></svg>;
}
function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
      <path d="M10.5 11l3-3-3-3M13.5 8H6"/>
    </svg>
  );
}

const NAV_ADMIN = [
  { label: 'Painel', path: '/', Icon: IconPainel },
  { label: 'Obras', path: '/obras', Icon: IconObras },
  { label: 'Planejamento', path: '/planejamento', Icon: IconPlanejamento },
  { label: 'Orçamentos', path: '/orcamentos', Icon: IconOrcamentos },
  { label: 'Financeiro', path: '/financeiro', Icon: IconFinanceiro },
  { label: 'Indicadores', path: '/indicadores', Icon: IconIndicadores },
  { label: 'Equipe', path: '/equipe', Icon: IconEquipe },
];

const NAV_GERENTE = [
  { label: 'Painel', path: '/', Icon: IconPainel },
  { label: 'Obras', path: '/obras', Icon: IconObras },
  { label: 'Planejamento', path: '/planejamento', Icon: IconPlanejamento },
];

function isActive(itemPath: string, currentPath: string) {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const state = useStore();
  const pendencias = calcularPendencias(state);

  const perfil = state.perfil_ativo;

  // Guard: sem perfil → login. Cliente não tem acesso às rotas internas —
  // bloqueio visível, nunca redirecionamento silencioso.
  if (!perfil) return <Navigate to="/entrar" replace />;
  if (perfil === 'cliente') return <SemAcesso />;

  const isAdmin = perfil === 'administracao';
  const isFinanceiro = perfil === 'financeiro';
  const acessoTotal = isAdmin || isFinanceiro;
  const navItems = acessoTotal ? NAV_ADMIN : NAV_GERENTE;

  // Derive user info from profile
  const pessoaId = isAdmin ? 'p01' : isFinanceiro ? 'p03' : 'p04';
  const pessoa = state.pessoas.find(p => p.id === pessoaId);
  const perfilLabel = isAdmin ? 'ADMINISTRAÇÃO' : isFinanceiro ? 'FINANCEIRO' : 'GERENTE DE OBRAS';

  const handleLogout = () => {
    state.setPerfil(null);
    navigate('/entrar', { replace: true });
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', backgroundColor: C.fundo }}>
      <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', height: '100%' }}>

        {/* ===== SIDEBAR ===== */}
        <aside style={{ width: '248px', flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.superficie, borderRight: `1px solid ${C.borda}` }}>

          {/* Logo */}
          <div style={{ padding: '28px 24px 20px', flexShrink: 0 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <div style={{ backgroundColor: C.acento, padding: '9px 16px', borderRadius: '4px' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
                  TECTO
                </span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            {navItems.map(({ label, path, Icon }) => {
              const active = isActive(path, pathname);
              return (
                <Link key={label} to={path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '8px',
                    backgroundColor: active ? C.grafite : 'transparent',
                    color: active ? C.superficie : C.tintaFraca,
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}>
                    <Icon />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: active ? 500 : 400 }}>
                      {label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.borda}`, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: C.grafite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: C.superficie }}>
                {pessoa?.iniciais ?? (isAdmin ? 'PA' : 'RD')}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pessoa?.nome ?? (isAdmin ? 'Pedro Almeida' : 'Rafael Duarte')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.tintaFraca }}>
                  {perfilLabel}
                </p>
                {acessoTotal && (
                  <button
                    onClick={() => state.resetarDados()}
                    title="Restaurar dados iniciais"
                    style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: C.neutro, display: 'flex', alignItems: 'center', lineHeight: 1, borderRadius: '4px' }}
                  >
                    <IconReload />
                  </button>
                )}
              </div>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sair"
              style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: C.neutro, display: 'flex', alignItems: 'center', borderRadius: '6px', flexShrink: 0, transition: 'color 0.12s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.grafite)}
              onMouseLeave={e => (e.currentTarget.style.color = C.neutro)}
            >
              <IconLogout />
            </button>
          </div>
        </aside>

        {/* ===== MAIN AREA ===== */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Top bar */}
          <div style={{ height: '60px', flexShrink: 0, backgroundColor: C.superficie, borderBottom: `1px solid ${C.borda}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: C.neutro, pointerEvents: 'none' }}>
                <IconSearch />
              </div>
              <input
                type="text"
                placeholder="Buscar obra, pessoa…"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, backgroundColor: C.fundo, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '8px 14px 8px 34px', outline: 'none', width: '220px' }}
              />
            </div>

            <div style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', border: `1px solid ${C.borda}`, backgroundColor: C.superficie, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.grafite }}>
                <IconBell />
              </div>
              {pendencias.length > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: C.atencao, borderRadius: '50%', width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.superficie}` }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: '#fff' }}>
                    {pendencias.length}
                  </span>
                </div>
              )}
            </div>

            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: C.grafite, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: C.superficie }}>
                {pessoa?.iniciais ?? (isAdmin ? 'PA' : 'RD')}
              </span>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: C.fundo }}>
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}
