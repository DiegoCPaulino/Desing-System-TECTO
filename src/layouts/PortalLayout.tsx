import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#F5F5F3',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
} as const;

const NAV_ITEMS = [
  { label: 'Minha obra', path: '/portal' },
  { label: 'Diário', path: '/portal/diario' },
  { label: 'Financeiro', path: '/portal/financeiro' },
];

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3"/>
      <path d="M10.5 11l3-3-3-3M13.5 8H6"/>
    </svg>
  );
}

export default function PortalLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Sem checagem de perfil aqui: GuardaPerfil, acima deste layout, já garantiu
  // que só o Cliente chega até o portal.
  const setPerfil = useStore(s => s.setPerfil);

  const handleLogout = () => {
    setPerfil(null);
    navigate('/entrar', { replace: true });
  };

  const isActive = (path: string) => {
    if (path === '/portal') return pathname === '/portal';
    return pathname === path;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.fundo, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{
        backgroundColor: C.superficie,
        borderBottom: `1px solid ${C.borda}`,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 32px', height: '66px', display: 'flex', alignItems: 'center', gap: '0' }}>

          {/* Logo */}
          <Link to="/portal" style={{ textDecoration: 'none', marginRight: 'auto' }}>
            <div style={{ backgroundColor: C.acento, padding: '7px 14px', borderRadius: '4px' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
                TECTO
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '0', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {NAV_ITEMS.map(({ label, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: active ? 600 : 400,
                    color: active ? C.tinta : C.tintaFraca,
                    textDecoration: 'none',
                    padding: '0 22px',
                    height: '66px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderBottom: active ? `3px solid ${C.acento}` : '3px solid transparent',
                    transition: 'color 0.15s ease',
                    letterSpacing: active ? '-0.01em' : 'normal',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite }}>
              Mariana Costa Lima
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: C.grafite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: C.superficie }}>
                MC
              </span>
            </div>
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
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.borda}`, backgroundColor: C.superficie, padding: '20px 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: C.acento, padding: '4px 10px', borderRadius: '3px', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
              TECTO
            </span>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.neutro }}>
            Rua Joaquim Floriano, 820 — Itaim Bibi
          </span>
        </div>
      </footer>
    </div>
  );
}
