import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, calcularPctObra, getGerenteDaObra, obraSlug } from '../state/store';
import Avatar from '../components/Avatar';
import EstadoVazio from '../components/EstadoVazio';

const C = {
  acento: '#FFC213',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  positivo: '#2E9E5B',
  atencao: '#E8833A',
  negativo: '#C94141',
  neutro: '#9A9A9A',
  informativo: '#215FD7',
} as const;

const ESTADO_PT: Record<string, string> = {
  em_andamento: 'Em andamento',
  aguardando_inicio: 'Aguardando início',
  pausada: 'Pausada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  em_andamento:     { bg: '#E7F1FF', color: '#215FD7' },
  aguardando_inicio:{ bg: '#F2F2F2', color: '#555555' },
  pausada:          { bg: '#FFF3E8', color: '#D4712A' },
  concluida:        { bg: '#EDFAF3', color: '#2E9E5B' },
  cancelada:        { bg: '#FDEAEA', color: '#C94141' },
};

const FILTER_TABS = [
  { label: 'Todas', key: 'todas' },
  { label: 'Em andamento', key: 'em_andamento' },
  { label: 'Aguardando início', key: 'aguardando_inicio' },
  { label: 'Pausadas', key: 'pausada' },
  { label: 'Concluídas', key: 'concluida' },
];

const OBRA_PHOTOS: Record<string, string> = {
  o01: 'https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=640&h=360&fit=crop&auto=format',
  o02: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=640&h=360&fit=crop&auto=format',
  o03: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=640&h=360&fit=crop&auto=format',
  o04: 'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?w=640&h=360&fit=crop&auto=format',
  o05: 'https://images.unsplash.com/photo-1634586648651-f1fb9ec10d90?w=640&h=360&fit=crop&auto=format',
};

function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color,
      backgroundColor: bg, padding: '3px 10px', borderRadius: '999px',
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      whiteSpace: 'nowrap' as const, flexShrink: 0,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}
function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? C.positivo : C.acento;
  return (
    <div style={{ height: '5px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '999px' }} />
    </div>
  );
}
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M13.5 13.5l-3-3"/></svg>;
}

export default function CarteiraDObras() {
  const navigate = useNavigate();
  const state = useStore();
  const [activeFilter, setActiveFilter] = useState('todas');
  const [search, setSearch] = useState('');

  const perfil = state.perfil_ativo;
  const isGerente = perfil === 'gerente_obras';

  // Para gerente_obras, mostrar apenas as obras que ele gerencia
  const obrasVisiveis = isGerente
    ? state.obras.filter(o => {
        const vo = state.vinculos_obra.find(v => v.obra_id === o.id && v.pessoa_id === 'p04' && v.papel === 'gerente' && !v.fim);
        return !!vo;
      })
    : state.obras;

  const obras = obrasVisiveis.map(obra => ({
    obra,
    pct: calcularPctObra(state, obra.id),
    gerente: getGerenteDaObra(state, obra.id),
  }));

  const filtered = obras.filter(({ obra }) => {
    const matchFilter = activeFilter === 'todas' || obra.estado === activeFilter;
    const matchSearch =
      search === '' ||
      obra.codigo.toLowerCase().includes(search.toLowerCase()) ||
      obra.cliente.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '40px', color: C.tinta, margin: 0 }}>
            Carteira de obras
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.tintaFraca, marginTop: '4px' }}>
            {obrasVisiveis.length} {isGerente ? 'obras sob sua gestão' : 'obras cadastradas'}
          </p>
        </div>
        <button style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta, backgroundColor: C.acento, border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', letterSpacing: '-0.01em', flexShrink: 0 }}>
          + Nova obra
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
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar obra ou cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '9px 14px 9px 34px', outline: 'none', width: '240px' }}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EstadoVazio mensagem="Não há obras nesta visão. Ajuste a busca ou escolha outro status para continuar." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {filtered.map(({ obra, pct, gerente }) => {
            const statusStyle = STATUS_STYLES[obra.estado] ?? STATUS_STYLES.em_andamento;
            const statusLabel = ESTADO_PT[obra.estado] ?? obra.estado;
            const gerenteNome = gerente ? gerente.nome : '—';
            const photo = OBRA_PHOTOS[obra.id];
            const isSmall = obra.tipo === 'pequeno_servico';
            return (
              <div
                key={obra.id}
                onClick={() => navigate(`/obras/${obraSlug(obra)}`)}
                style={{ backgroundColor: C.superficie, borderRadius: '12px', border: `1px solid ${C.borda}`, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                {/* Photo */}
                <div style={{ height: '184px', backgroundColor: '#D8D8D8', position: 'relative', overflow: 'hidden' }}>
                  {photo && <img src={photo} alt={obra.codigo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  {isSmall && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.54)', borderRadius: '999px', padding: '4px 10px' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500, color: '#FFFFFF' }}>Pequeno serviço</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '18px 20px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em', lineHeight: '22px' }}>
                      {obra.codigo}
                    </p>
                    <StatusBadge label={statusLabel} bg={statusStyle.bg} color={statusStyle.color} />
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginBottom: '2px' }}>{obra.cliente}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginBottom: '18px' }}>{obra.endereco.split('—')[1]?.trim() ?? obra.endereco}</p>

                  {/* Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.neutro }}>Progresso</span>
                    <ProgressBar pct={pct} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, flexShrink: 0 }}>{pct}%</span>
                  </div>

                  {/* Manager */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.borda}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {gerente ? (
                      <Avatar pessoaId={gerente.id} nome={gerente.nome} tamanho={30} />
                    ) : (
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: C.borda, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.neutro }}>—</div>
                    )}
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, lineHeight: '17px' }}>{gerenteNome}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro, lineHeight: '15px' }}>Gerente de obras</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
