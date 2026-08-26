import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  positivo: '#2E9E5B',
  positivoFundo: '#EDFAF3',
} as const;

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" fill="currentColor"/>
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z"/>
        <circle cx="9" cy="9" r="2.5"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l14 14M7.5 7.6A2.5 2.5 0 0 0 11.4 11.5M5.2 5.3C3.3 6.5 1.9 8 1.9 8s2.7 5.5 7.1 5.5a7.2 7.2 0 0 0 3.2-.8M10.7 4.7A6.9 6.9 0 0 0 9 4.5C4.6 4.5 1.9 8.6 1.9 8.6"/>
    </svg>
  );
}

export default function PrimeiroAcesso() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const temMinimo = novaSenha.length >= 10;
  const temMaiuscula = /[A-Z]/.test(novaSenha);
  const temNumero = /\d/.test(novaSenha);
  const semNome = novaSenha.length === 0 || !novaSenha.toLowerCase().includes('pedro') && !novaSenha.toLowerCase().includes('almeida');
  const senhasIguais = novaSenha.length > 0 && novaSenha === confirmar;

  const tudoOk = temMinimo && temMaiuscula && temNumero && semNome && senhasIguais;

  const requisitos = [
    { label: 'Mínimo de 10 caracteres', ok: temMinimo },
    { label: 'Uma letra maiúscula', ok: temMaiuscula },
    { label: 'Um número', ok: temNumero },
    { label: 'Não pode conter seu nome, CPF ou data de nascimento', ok: semNome },
    { label: 'Senhas coincidem', ok: senhasIguais },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── Metade esquerda — foto ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="pa-left">
        <style>{`@media (min-width: 900px) { .pa-left { display: block !important; } }`}</style>
        <img
          src="https://images.unsplash.com/photo-1503174971373-b1f69350bdd1?w=960&h=1080&fit=crop&auto=format"
          alt="Apartamento em reforma"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)' }} />
        <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
          <div style={{ backgroundColor: C.acento, padding: '9px 16px', borderRadius: '4px', display: 'inline-block' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
              TECTO
            </span>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '52px', left: '40px', right: '40px' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 500, color: '#FFFFFF', lineHeight: '1.35', letterSpacing: '-0.01em' }}>
            Gestão de obras de reforma residencial
          </p>
        </div>
      </div>

      {/* ── Metade direita ── */}
      <div style={{ flex: 1, backgroundColor: C.superficie, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Crie sua senha
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.tintaFraca, lineHeight: '22px', marginBottom: '32px' }}>
            Sua senha foi gerada pelo sistema. Por segurança, escolha uma nova antes de continuar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Nova senha */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, marginBottom: '6px' }}>
                Nova senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarNova ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="••••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite,
                    backgroundColor: C.fundo, border: `1px solid ${C.borda}`,
                    borderRadius: '8px', padding: '12px 44px 12px 14px', outline: 'none',
                  }}
                  onFocus={e => (e.target.style.border = `1px solid ${C.grafite}`)}
                  onBlur={e => (e.target.style.border = `1px solid ${C.borda}`)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarNova(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.neutro, display: 'flex', padding: '4px' }}
                >
                  <IconEye open={mostrarNova} />
                </button>
              </div>
            </div>

            {/* Confirmar */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, marginBottom: '6px' }}>
                Confirmar nova senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="••••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite,
                    backgroundColor: C.fundo, border: `1px solid ${C.borda}`,
                    borderRadius: '8px', padding: '12px 44px 12px 14px', outline: 'none',
                  }}
                  onFocus={e => (e.target.style.border = `1px solid ${C.grafite}`)}
                  onBlur={e => (e.target.style.border = `1px solid ${C.borda}`)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.neutro, display: 'flex', padding: '4px' }}
                >
                  <IconEye open={mostrarConfirmar} />
                </button>
              </div>
            </div>

            {/* Requisitos */}
            <div style={{ backgroundColor: C.fundo, borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {requisitos.map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: req.ok ? C.positivo : C.neutro, transition: 'color 0.2s ease' }}>
                  {req.ok ? <IconCheck /> : <IconDot />}
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '18px' }}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão */}
            <button
              type="button"
              disabled={!tudoOk}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600,
                color: C.tinta, backgroundColor: tudoOk ? C.acento : '#E8E8E4',
                border: 'none', borderRadius: '8px', padding: '13px',
                cursor: tudoOk ? 'pointer' : 'default',
                letterSpacing: '-0.01em', width: '100%',
                transition: 'background-color 0.2s ease, opacity 0.15s ease',
              }}
              onMouseEnter={e => { if (tudoOk) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Criar senha e entrar
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link
              to="/entrar"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, textDecoration: 'none', borderBottom: `1px solid ${C.borda}` }}
            >
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
