import React, { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { HOJE } from '../state/dados-iniciais';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
} as const;

export type CampoCtxType = {
  setFooter: (f: React.ReactNode) => void;
  showSheet: (content: React.ReactNode) => void;
  hideSheet: () => void;
};

export const CampoCtx = React.createContext<CampoCtxType>({
  setFooter: () => {},
  showSheet: () => {},
  hideSheet: () => {},
});

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function formatarDataBR(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 9.5L10 3l7.5 6.5V17a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V9.5Z" />
      <path d="M7.5 18V12.5h5V18" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="15" rx="1" />
      <path d="M6.5 3v15M13.5 3v15" />
      <path d="M2 9h16M2 14h16" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3.5" width="16" height="15" rx="1.5" />
      <path d="M2 8.5h16M6.5 2V5M13.5 2V5" />
    </svg>
  );
}

export default function CampoLayout() {
  const { pathname } = useLocation();
  const diario = useStore((s) => s.diarios.find((d) => d.obra_id === 'o01' && d.data === HOJE));
  const diarioEstado = diario?.estado ?? 'rascunho';

  const [footerNode, setFooterNode] = useState<React.ReactNode>(null);
  const [sheetNode, setSheetNode] = useState<React.ReactNode>(null);

  const setFooter = useCallback((f: React.ReactNode) => setFooterNode(f), []);
  const showSheet = useCallback((c: React.ReactNode) => setSheetNode(c), []);
  const hideSheet = useCallback(() => setSheetNode(null), []);
  const ctxValue = useMemo(() => ({ setFooter, showSheet, hideSheet }), [setFooter, showSheet, hideSheet]);

  const navItems = [
    { label: 'Hoje', icon: <IconHome />, path: '/campo/diario' },
    { label: 'Minhas obras', icon: <IconBuilding />, path: '/campo/obras' },
    { label: 'Planejamento', icon: <IconCalendar />, path: '/campo/planejamento' },
  ];

  const badgeLabel = diarioEstado === 'finalizado' ? 'Finalizado' : 'Rascunho';
  const badgeBg = diarioEstado === 'finalizado' ? '#EDFAF3' : '#F0F0F0';
  const badgeColor = diarioEstado === 'finalizado' ? '#207A46' : '#666666';

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#282828',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 16px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <CampoCtx.Provider value={ctxValue}>
        {/* Phone frame */}
        <div
          style={{
            width: '390px',
            height: '844px',
            backgroundColor: C.fundo,
            borderRadius: '44px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Top bar ── */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: C.superficie,
              borderBottom: `1px solid ${C.borda}`,
              padding: '16px 20px 11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Logo TECTO */}
              <div style={{ backgroundColor: C.acento, padding: '4px 9px', borderRadius: '3px' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
                  TECTO
                </span>
              </div>
              {/* Obra */}
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.01em' }}>
                Obra 22 - MCL
              </span>
              {/* Avatar RD */}
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: C.grafite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>RD</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '5px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>
                {formatarDataBR(HOJE)}
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: badgeColor, backgroundColor: badgeBg, padding: '1px 7px', borderRadius: '999px' }}>
                {badgeLabel}
              </span>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
            <Outlet />
          </div>

          {/* ── Footer slot ── */}
          {footerNode}

          {/* ── Bottom nav ── */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: C.superficie,
              borderTop: `1px solid ${C.borda}`,
              display: 'flex',
            }}
          >
            {navItems.map(({ label, icon, path }) => {
              const active = pathname === path;
              return (
                <Link
                  key={label}
                  to={path}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '8px 0 10px',
                    textDecoration: 'none',
                    color: active ? C.tinta : C.tintaFraca,
                    borderTop: `2px solid ${active ? C.acento : 'transparent'}`,
                  }}
                >
                  {icon}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: active ? 600 : 400 }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ── Sheet overlay ── */}
          {sheetNode && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.52)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'flex-end',
              }}
              onClick={hideSheet}
            >
              <div onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
                {sheetNode}
              </div>
            </div>
          )}
        </div>
      </CampoCtx.Provider>
    </div>
  );
}
