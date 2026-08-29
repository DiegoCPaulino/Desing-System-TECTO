import React, { useState } from 'react';
import { useStore } from '../state/store';
import type { TipoVinculo } from '../state/types';
import Avatar from '../components/Avatar';
import ChipVinculo from '../components/ChipVinculo';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
  informativoFundo: '#E7F1FF',
} as const;

type FilterKey = 'todos' | TipoVinculo;

const FILTER_TABS: { label: string; key: FilterKey }[] = [
  { label: 'Todos', key: 'todos' },
  { label: 'Funcionário próprio', key: 'funcionario_proprio' },
  { label: 'Terceirizado', key: 'terceirizado' },
  { label: 'Gerente de Obras', key: 'gerente_obras' },
  { label: 'Assistente', key: 'assistente_gerenciamento' },
  { label: 'Administração', key: 'administracao' },
  { label: 'Financeiro', key: 'financeiro' },
];

export default function Equipe() {
  const state = useStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');

  const pessoas = state.pessoas.filter(p => p.ativo).map((pessoa) => {
    const tipo = state.vinculos.find(v => v.pessoa_id === pessoa.id)!.tipo;
    return { pessoa, tipo };
  });

  const filtered = pessoas.filter(({ pessoa, tipo }) => {
    const matchFilter = activeFilter === 'todos' || tipo === activeFilter;
    const matchSearch = search === '' || pessoa.nome.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '40px', color: C.tinta, margin: 0 }}>
            Equipe
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.tintaFraca, marginTop: '4px' }}>
            {pessoas.length} pessoas com vínculo ativo
          </p>
        </div>
        <button style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta, backgroundColor: C.acento, border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', letterSpacing: '-0.01em', flexShrink: 0 }}>
          + Nova pessoa
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${C.borda}`, flex: 1 }}>
          {FILTER_TABS.map(({ label, key }) => {
            const active = activeFilter === key;
            return (
              <button key={key} onClick={() => setActiveFilter(key)} style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: active ? 600 : 400,
                color: active ? C.tinta : C.tintaFraca, backgroundColor: 'transparent', border: 'none',
                borderBottom: active ? `3px solid ${C.acento}` : '3px solid transparent',
                padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap' as const, marginBottom: '-1px',
              }}>
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: C.neutro, pointerEvents: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M13.5 13.5l-3-3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Buscar pessoa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '9px 14px 9px 34px', outline: 'none', width: '200px' }}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.neutro, fontSize: '14px' }}>
          Nenhuma pessoa encontrada.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {filtered.map(({ pessoa, tipo }) => {
            return (
              <div key={pessoa.id} style={{
                backgroundColor: C.superficie, borderRadius: '12px', border: `1px solid ${C.borda}`,
                padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '12px', textAlign: 'center',
              }}>
                <Avatar pessoaId={pessoa.id} nome={pessoa.nome} tamanho={52} />
                <div>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 600, color: C.tinta, letterSpacing: '-0.01em', lineHeight: '20px' }}>
                    {pessoa.nome}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '4px', lineHeight: '18px' }}>
                    {pessoa.funcao}
                  </p>
                </div>
                <ChipVinculo tipo={tipo} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
