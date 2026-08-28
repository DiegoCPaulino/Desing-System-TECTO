import React from 'react';

interface AvatarProps {
  pessoaId: string;
  nome: string;
  tamanho?: number;
  style?: React.CSSProperties;
}

const FUNDOS = ['#E7F1FF', '#F3EEFF', '#F7EDE7', '#E9F2EE', '#EFEDE8', '#E8EEF4'];
const PELES = ['#F1C7A5', '#E6B087', '#CF8F68', '#AA694B', '#7D4938', '#553126'];
const CABELOS = ['#241F1C', '#3A2A22', '#5B3A29', '#6D5545', '#171717', '#827063'];
const ROUPAS = ['#363636', '#215FD7', '#6C4D8C', '#A6543D', '#496D5B', '#435C72'];

function hashPessoa(pessoaId: string): number {
  let hash = 2166136261;

  for (let i = 0; i < pessoaId.length; i += 1) {
    hash ^= pessoaId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export default function Avatar({ pessoaId, nome, tamanho = 36, style }: AvatarProps) {
  const hash = hashPessoa(pessoaId);
  const fundo = FUNDOS[hash % FUNDOS.length];
  const pele = PELES[Math.floor(hash / 7) % PELES.length];
  const cabelo = CABELOS[Math.floor(hash / 43) % CABELOS.length];
  const roupa = ROUPAS[Math.floor(hash / 257) % ROUPAS.length];
  const penteado = Math.floor(hash / 1543) % 4;
  const olhosY = 22 + (hash % 2);

  return (
    <div
      aria-label={`Retrato ilustrado de ${nome}`}
      role="img"
      title={nome}
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: '50%',
        backgroundColor: fundo,
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" width="100%" height="100%">
        <rect width="48" height="48" fill={fundo} />
        <path d="M7 48c1.2-9.1 7.1-14 17-14s15.8 4.9 17 14H7Z" fill={roupa} />
        <path d="M19 31h10v8.5c-1.6 1.3-3.2 2-5 2s-3.4-.7-5-2V31Z" fill={pele} />
        <circle cx="14" cy="23.5" r="3.2" fill={pele} />
        <circle cx="34" cy="23.5" r="3.2" fill={pele} />
        <rect x="13" y="8" width="22" height="28" rx="11" fill={pele} />

        {penteado === 0 && (
          <path d="M13 20.2V16C13 8.7 17.9 5 24 5s11 3.7 11 11v4.2l-3.1-2.5-1.2-5.2c-4 2.2-8.5 3.1-14.4 2.7l-.6 3.1-2.7 1.9Z" fill={cabelo} />
        )}
        {penteado === 1 && (
          <path d="M13 21V15.7C13 8.8 17.4 5 24.2 5c5.7 0 9.6 3.1 10.8 8.7-5.7.5-10.4-.9-14-4.2-.7 4.3-3.4 7.4-8 9.4V21Z" fill={cabelo} />
        )}
        {penteado === 2 && (
          <path d="M13.1 19.8v-4.1C13.1 8.6 17.7 5 24 5s10.9 3.6 10.9 10.7v4.1l-2.4-1.6-.8-5.5c-4.9 1.2-10.1 1.2-15.4 0l-.8 5.5-2.4 1.6Z" fill={cabelo} />
        )}
        {penteado === 3 && (
          <>
            <circle cx="24" cy="7.5" r="4.7" fill={cabelo} />
            <path d="M13 20v-4.2C13 9 17.3 6 24 6s11 3 11 9.8V20l-2.9-2-.9-5.2c-5 1.5-9.8 1.5-14.4 0l-.9 5.2-2.9 2Z" fill={cabelo} />
          </>
        )}

        <path d={`M17.5 ${olhosY - 2}c1-.7 2.1-.8 3.2-.2`} fill="none" stroke={cabelo} strokeWidth="1.1" strokeLinecap="round" />
        <path d={`M27.3 ${olhosY - 1.8}c1.1-.6 2.2-.5 3.2.2`} fill="none" stroke={cabelo} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="19.2" cy={olhosY} r="1" fill="#24201E" />
        <circle cx="28.8" cy={olhosY} r="1" fill="#24201E" />
        <path d="M24 23.5v3" fill="none" stroke="#9A6149" strokeWidth=".8" strokeLinecap="round" />
        <path d="M20.8 30c2 1.4 4.4 1.4 6.4 0" fill="none" stroke="#874A43" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
