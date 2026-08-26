import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import type { TipoPerfil } from '../state/types';

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

const AVATAR_BGS: Record<string, string> = {
  PA: '#363636',
  FS: '#7D7D7D',
  RD: '#5A5A5A',
  MC: '#9A9A9A',
};

const DEMO_USERS: Array<{
  initials: string;
  nome: string;
  perfil: string;
  tipo: TipoPerfil;
  destino: string;
}> = [
  { initials: 'PA', nome: 'Pedro Almeida', perfil: 'Administração', tipo: 'administracao', destino: '/' },
  { initials: 'FS', nome: 'Fernanda Sousa', perfil: 'Financeiro', tipo: 'financeiro', destino: '/' },
  { initials: 'RD', nome: 'Rafael Duarte', perfil: 'Gerente de Obras', tipo: 'gerente_obras', destino: '/' },
  { initials: 'MC', nome: 'Mariana Costa Lima', perfil: 'Cliente', tipo: 'cliente', destino: '/portal' },
];

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

export default function Login() {
  const navigate = useNavigate();
  const setPerfil = useStore(s => s.setPerfil);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleEntrar = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleDemo = (tipo: TipoPerfil, destino: string) => {
    setPerfil(tipo);
    navigate(destino, { replace: true });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── Metade esquerda — foto ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="login-left">
        <style>{`@media (min-width: 900px) { .login-left { display: block !important; } }`}</style>
        <img
          src="https://images.unsplash.com/photo-1503174971373-b1f69350bdd1?w=960&h=1080&fit=crop&auto=format"
          alt="Apartamento em reforma"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Overlay escurecimento */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)' }} />
        {/* Logo e tagline */}
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

      {/* ── Metade direita — formulário ── */}
      <div style={{ flex: 1, backgroundColor: C.superficie, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo mobile only */}
          <div style={{ display: 'none', marginBottom: '32px' }} className="login-mobile-logo">
            <style>{`@media (max-width: 899px) { .login-mobile-logo { display: block !important; } }`}</style>
            <div style={{ backgroundColor: C.acento, padding: '7px 14px', borderRadius: '4px', display: 'inline-block' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
                TECTO
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Entrar
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.tintaFraca, marginBottom: '32px' }}>
            Acesse com seu e-mail e senha
          </p>

          {/* Form */}
          <form onSubmit={handleEntrar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, marginBottom: '6px' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.grafite,
                  backgroundColor: C.fundo, border: `1px solid ${C.borda}`,
                  borderRadius: '8px', padding: '12px 14px', outline: 'none',
                }}
                onFocus={e => (e.target.style.border = `1px solid ${C.grafite}`)}
                onBlur={e => (e.target.style.border = `1px solid ${C.borda}`)}
              />
            </div>

            {/* Senha */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, marginBottom: '6px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
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
                  onClick={() => setMostrarSenha(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.neutro, display: 'flex', padding: '4px' }}
                >
                  <IconEye open={mostrarSenha} />
                </button>
              </div>
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600,
                color: C.tinta, backgroundColor: C.acento, border: 'none',
                borderRadius: '8px', padding: '13px', cursor: 'pointer',
                letterSpacing: '-0.01em', width: '100%', marginTop: '4px',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Entrar
            </button>
          </form>

          {/* Esqueci minha senha */}
          <p style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Esqueci minha senha
            </button>
          </p>

          {/* Demo block */}
          <div style={{ marginTop: '36px' }}>
            <div style={{ height: '1px', backgroundColor: C.borda, marginBottom: '20px' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.tintaFraca, marginBottom: '12px' }}>
              Demonstração
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DEMO_USERS.map(u => (
                <button
                  key={u.tipo}
                  type="button"
                  onClick={() => handleDemo(u.tipo, u.destino)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    fontFamily: 'Inter, sans-serif', background: 'none',
                    border: `1px solid ${C.borda}`, borderRadius: '8px',
                    padding: '10px 14px', cursor: 'pointer',
                    textAlign: 'left', width: '100%',
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.grafite;
                    e.currentTarget.style.background = C.fundo;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.borda;
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: AVATAR_BGS[u.initials] ?? '#7D7D7D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#FFF' }}>
                      {u.initials}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, lineHeight: '18px' }}>
                      {u.nome}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '1px' }}>
                      {u.perfil}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Link primeiro acesso */}
          <p style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              to="/entrar/primeiro-acesso"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, textDecoration: 'none', borderBottom: `1px solid ${C.borda}` }}
            >
              ver tela de primeiro acesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
