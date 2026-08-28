import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import type { TipoPerfil } from '../state/types';
import Avatar from '../components/Avatar';

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

const DEMO_USERS: Array<{
  pessoaId: string;
  nome: string;
  perfil: string;
  tipo: TipoPerfil;
  destino: string;
}> = [
  { pessoaId: 'p01', nome: 'Pedro Almeida', perfil: 'Administração', tipo: 'administracao', destino: '/' },
  { pessoaId: 'p03', nome: 'Fernanda Sousa', perfil: 'Financeiro', tipo: 'financeiro', destino: '/' },
  { pessoaId: 'p04', nome: 'Rafael Duarte', perfil: 'Gerente de Obras', tipo: 'gerente_obras', destino: '/' },
  { pessoaId: 'cliente-o01', nome: 'Mariana Costa Lima', perfil: 'Cliente', tipo: 'cliente', destino: '/portal' },
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

function IlustracaoLogin() {
  return (
    <svg
      data-componente="ilustracao-login"
      viewBox="0 0 720 1080"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <pattern id="grade-login" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" strokeOpacity="0.075" strokeWidth="1" />
        </pattern>
        <pattern id="hachura-login" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" strokeOpacity="0.12" strokeWidth="3" />
        </pattern>
        <filter id="sombra-planta" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#000000" floodOpacity="0.28" />
        </filter>
      </defs>

      <rect width="720" height="1080" fill="#272727" />
      <rect width="720" height="1080" fill="url(#grade-login)" />
      <path d="M484 -80 820 40 730 678 430 594Z" fill={C.acento} />
      <path d="M-120 852 212 682 438 1120 -46 1194Z" fill="#111111" />
      <circle cx="632" cy="914" r="162" fill="none" stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="1" />
      <circle cx="632" cy="914" r="118" fill="none" stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="1" />
      <path d="M514 914h236M632 796v236" stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="1" />

      <g transform="translate(78 165) rotate(-3 278 337)" filter="url(#sombra-planta)">
        <rect width="556" height="674" rx="8" fill="#F5F2E8" />
        <rect x="20" y="20" width="516" height="634" rx="3" fill="none" stroke="#BDB8AA" strokeWidth="1.5" />

        <g stroke="#343434" fill="none" strokeLinecap="square">
          <path d="M74 88H478V570H74Z" strokeWidth="12" />
          <path d="M74 288H260M326 288H478M310 88V232M310 302V430M310 496V570" strokeWidth="10" />
          <path d="M74 430H194M258 430H310M310 430H414M468 430H478" strokeWidth="10" />
          <path d="M194 288V352M194 414V430M414 288V352M414 408V430" strokeWidth="8" />
          <path d="M194 352A62 62 0 0 1 256 414M414 352A56 56 0 0 1 470 408M260 232A66 66 0 0 1 326 298M258 430A66 66 0 0 1 192 496M310 496A66 66 0 0 1 376 430" strokeWidth="2" />
        </g>

        <g fill="none" stroke={C.acento} strokeWidth="6">
          <path d="M112 82h112M352 82h84M68 328v62M484 474v58" />
        </g>

        <g fill="url(#hachura-login)" stroke="#777268" strokeWidth="1.5">
          <rect x="94" y="110" width="92" height="50" />
          <rect x="366" y="110" width="88" height="50" />
          <rect x="98" y="470" width="78" height="64" />
          <rect x="382" y="468" width="68" height="66" />
        </g>

        <g fill="#666158" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600" letterSpacing="1.1">
          <text x="112" y="220">SALA</text>
          <text x="362" y="220">COZINHA</text>
          <text x="104" y="382">SUÍTE</text>
          <text x="350" y="382">BANHO</text>
          <text x="104" y="548">QUARTO</text>
          <text x="366" y="548">SERVIÇO</text>
        </g>

        <g fill="none" stroke="#8D887E" strokeWidth="1">
          <path d="M74 608H478M74 598v20M478 598v20" />
          <path d="M42 88V570M32 88h20M32 570h20" />
        </g>
        <g fill="#777268" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="0.7">
          <text x="254" y="624">8,40 M</text>
          <text x="15" y="340" transform="rotate(-90 15 340)">11,20 M</text>
          <text x="74" y="54" fontSize="12" fontWeight="700">APARTAMENTO 22 · ESTUDO PRELIMINAR</text>
        </g>
      </g>

      <g transform="translate(522 700)">
        <rect width="134" height="54" rx="3" fill={C.acento} />
        <text x="16" y="22" fill="#000000" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.4">PLANTA</text>
        <text x="16" y="40" fill="#000000" fontFamily="Space Grotesk, sans-serif" fontSize="15" fontWeight="700">22 · MCL</text>
      </g>
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

      {/* ── Metade esquerda — composição vetorial local ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none', backgroundColor: '#272727' }} className="login-left">
        <style>{`@media (min-width: 900px) { .login-left { display: block !important; } }`}</style>
        <IlustracaoLogin />
        {/* Logo e tagline */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 1 }}>
          <div style={{ backgroundColor: C.acento, padding: '9px 16px', borderRadius: '4px', display: 'inline-block' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
              TECTO
            </span>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '52px', left: '40px', right: '40px', zIndex: 1 }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 600, color: '#FFFFFF', lineHeight: '1.35', letterSpacing: '-0.01em', maxWidth: '420px' }}>
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
                  <Avatar pessoaId={u.pessoaId} nome={u.nome} tamanho={36} />
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
