import React from 'react';
import { useMatches, Link } from 'react-router-dom';

const C = {
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
} as const;

export default function EmBreve() {
  const matches = useMatches();
  const current = matches[matches.length - 1];
  const title = (current?.handle as { title?: string })?.title ?? 'Esta tela';

  return (
    <div style={{
      padding: '60px 40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '60vh',
      backgroundColor: C.fundo,
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        backgroundColor: C.superficie,
        borderRadius: '12px',
        border: `1px solid ${C.borda}`,
        padding: '48px 40px',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: C.tinta,
          letterSpacing: '-0.02em',
          lineHeight: '32px',
          margin: 0,
        }}>
          {title}
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          color: C.tintaFraca,
          marginTop: '12px',
          lineHeight: '22px',
        }}>
          Esta tela ainda será construída.
        </p>
        <div style={{ marginTop: '28px' }}>
          <Link to="/" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: C.grafite,
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}>
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}
