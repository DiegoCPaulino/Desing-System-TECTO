import React from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
} as const;

export default function SemAcesso() {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: C.fundo, border: `1px solid ${C.borda}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.neutro} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.01em', margin: '0 0 10px' }}>
          Você não tem acesso a esta área
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.tintaFraca, lineHeight: '22px', marginBottom: '28px' }}>
          Esta seção está disponível apenas para o perfil de Administração.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
            color: C.tinta, backgroundColor: C.acento, border: 'none',
            borderRadius: '8px', padding: '11px 24px', cursor: 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          Voltar ao painel
        </button>
      </div>
    </div>
  );
}
