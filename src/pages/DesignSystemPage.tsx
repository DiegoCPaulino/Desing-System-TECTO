import React from 'react';
import { Link } from 'react-router-dom';
import TituloSecao from '../components/TituloSecao';

const C = {
  acento: '#FFC213',
  acentoFundo: '#FFF6D6',
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
  informativoFundo: '#E7F1FF',
} as const;

const PALETTE = [
  { name: 'acento', hex: '#FFC213' },
  { name: 'acento-fundo', hex: '#FFF6D6' },
  { name: 'tinta', hex: '#000000' },
  { name: 'grafite', hex: '#363636' },
  { name: 'tinta-fraca', hex: '#666666' },
  { name: 'borda', hex: '#E6E6E6' },
  { name: 'fundo', hex: '#FAFAFA' },
  { name: 'superficie', hex: '#FFFFFF' },
  { name: 'positivo', hex: '#2E9E5B' },
  { name: 'atencao', hex: '#E8833A' },
  { name: 'negativo', hex: '#C94141' },
  { name: 'neutro', hex: '#9A9A9A' },
  { name: 'informativo', hex: '#215FD7' },
  { name: 'informativo-fundo', hex: '#E7F1FF' },
] as const;

const BADGES = [
  { label: 'Em andamento', bg: '#E7F1FF', color: '#215FD7' },
  { label: 'Aguardando início', bg: '#F2F2F2', color: '#555555' },
  { label: 'Pausada', bg: '#FFF3E8', color: '#D4712A' },
  { label: 'Concluída', bg: '#EDFAF3', color: '#2E9E5B' },
  { label: 'Cancelada', bg: '#FDEAEA', color: '#C94141' },
  { label: 'Rascunho', bg: '#F5F5F5', color: '#9A9A9A' },
  { label: 'Publicado', bg: '#EDFAF3', color: '#207A46' },
  { label: 'Presente', bg: '#EDFAF3', color: '#2E9E5B' },
  { label: 'Ausente', bg: '#FDEAEA', color: '#C94141' },
  { label: 'Divergência', bg: '#FFF3E8', color: '#E8833A' },
];

const NAV_ITEMS_DS = [
  { label: 'Visão geral', selected: false },
  { label: 'Obras', selected: true },
  { label: 'Financeiro', selected: false },
  { label: 'Equipe', selected: false },
  { label: 'Documentos', selected: false },
  { label: 'Configurações', selected: false },
];

function IconBuilding() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14V6.5L8 2l6 4.5V14"/><path d="M6 14v-4h4v4"/><path d="M2 8.5h12"/></svg>;
}
function IconGrid() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>;
}

function InlineLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'Inter, sans-serif', fontSize: '11px', lineHeight: '16px',
      fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
      color: C.tintaFraca,
    }}>
      {children}
    </span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: C.superficie, borderRadius: '12px',
      border: `1px solid ${C.borda}`, padding: '32px', ...style,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', backgroundColor: C.borda, margin: '24px 0' }} />;
}

function Avatar({ initials, bg, size = 32 }: { initials: string; bg: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: size * 0.34, fontWeight: 700, color: C.superficie }}>
        {initials}
      </span>
    </div>
  );
}

function StatusBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color,
      backgroundColor: bg, padding: '4px 12px', borderRadius: '999px',
      display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' as const,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function ProgressBar({ pct, color = C.acento }: { pct: number; color?: string }) {
  return (
    <div style={{ height: '5px', backgroundColor: C.borda, borderRadius: '999px', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '999px' }} />
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div style={{ width: '100%', minWidth: '1440px', minHeight: '100vh', backgroundColor: C.fundo, fontFamily: 'Inter, sans-serif' }}>

      {/* ===== HEADER ===== */}
      <div style={{ backgroundColor: C.superficie, borderBottom: `1px solid ${C.borda}`, padding: '32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: C.acento, padding: '10px 18px', borderRadius: '4px', display: 'inline-flex' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>
                TECTO
              </span>
            </div>
            <div style={{ width: '1px', height: '36px', backgroundColor: C.borda }} />
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.tintaFraca }}>
                Design System
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.neutro, marginTop: '3px' }}>
                v1.0 · Agosto 2026
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, lineHeight: '22px' }}>
              Gestão de obras de reforma residencial
            </p>
            <Link to="/" style={{
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500,
              color: C.tintaFraca, textDecoration: 'none',
            }}>
              ← Voltar ao app
            </Link>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ padding: '48px 80px 96px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* PALETA DE CORES */}
        <Card>
          <TituloSecao margemInferior={24}>Paleta de Cores</TituloSecao>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {PALETTE.map(({ name, hex }) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <InlineLabel>{name}</InlineLabel>
                <div style={{
                  width: '96px', height: '96px', backgroundColor: hex, borderRadius: '8px',
                  border: ['#FAFAFA', '#FFFFFF', '#E6E6E6', '#FFF6D6', '#E7F1FF'].includes(hex) ? `1px solid ${C.borda}` : 'none',
                }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, letterSpacing: '0.01em' }}>
                  {hex}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* TIPOGRAFIA + REGRAS DE COR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '28px', alignItems: 'start' }}>
          <Card>
            <TituloSecao margemInferior={24}>Tipografia</TituloSecao>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { name: 'Display', spec: '32 / 40', font: "'Space Grotesk', sans-serif", weight: 700, size: '32px', lh: '40px', ls: '-0.02em', sample: 'Gestão de obras residenciais' },
                { name: 'Título', spec: '24 / 32', font: "'Space Grotesk', sans-serif", weight: 700, size: '24px', lh: '32px', ls: '-0.02em', sample: 'Obras em andamento' },
                { name: 'Subtítulo', spec: '18 / 26', font: "'Space Grotesk', sans-serif", weight: 600, size: '18px', lh: '26px', ls: '-0.01em', sample: 'Detalhes da obra reformada' },
                { name: 'Corpo', spec: '15 / 22', font: 'Inter, sans-serif', weight: 400, size: '15px', lh: '22px', ls: 'normal', sample: 'A reforma inclui pintura, revestimento e instalações elétricas.' },
                { name: 'Apoio', spec: '13 / 18', font: 'Inter, sans-serif', weight: 400, size: '13px', lh: '18px', ls: 'normal', sample: 'Atualizado em 12 ago. 2026 por Rafael Duarte' },
                { name: 'Label', spec: '11 / 16', font: 'Inter, sans-serif', weight: 600, size: '11px', lh: '16px', ls: '0.08em', upper: true, sample: 'Estado da obra' },
              ].map(({ name, spec, font, weight, size, lh, ls, sample, upper }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: '24px', padding: '20px 0', borderBottom: `1px solid ${C.borda}` }}>
                  <div style={{ minWidth: '148px', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: C.neutro, display: 'block' }}>{spec}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.tintaFraca, display: 'block', marginTop: '3px' }}>{name}</span>
                  </div>
                  <span style={{ fontFamily: font, fontSize: size, lineHeight: lh, fontWeight: weight, letterSpacing: ls, color: C.tinta, textTransform: upper ? 'uppercase' : 'none' as any }}>
                    {sample}
                  </span>
                </div>
              ))}
              <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '48px' }}>
                <div style={{ minWidth: '148px', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: C.neutro, display: 'block' }}>Tabulares</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.tintaFraca, display: 'block', marginTop: '3px' }}>Monetários</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {['R$ 148.320,00', 'R$ 47.500,00', 'R$ 9.280,50', 'R$ 1.540,00'].map((v) => (
                    <span key={v} style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: C.grafite, fontVariantNumeric: 'tabular-nums', textAlign: 'right' as const }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <TituloSecao margemInferior={24}>Regras de Cor</TituloSecao>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                'Amarelo #FFC213 nunca é cor de texto, ícone pequeno ou link. É sempre preenchimento, com texto preto por cima.',
                'Amarelo é exclusivo de: marca, botão primário e barra de progresso. Nunca usar amarelo para alerta ou aviso — alerta usa #E8833A.',
                'Item de menu selecionado usa fundo grafite #363636 com texto branco.',
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    backgroundColor: C.acento, width: '28px', height: '28px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 500, color: C.tinta }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '22px', color: C.grafite }}>{rule}</p>
                </div>
              ))}
              <Divider />
              <div>
                <InlineLabel>Regra 01 — exemplo</InlineLabel>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <div style={{ backgroundColor: C.acento, borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px', color: C.tinta }}>Botão primário</span>
                  </div>
                  <div style={{ backgroundColor: C.borda, borderRadius: '6px', padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '15px', color: '#BDBDBD', textDecoration: 'line-through' }}>Texto amarelo</span>
                  </div>
                </div>
              </div>
              <div>
                <InlineLabel>Regra 03 — exemplo</InlineLabel>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderRadius: '8px', backgroundColor: C.grafite }}>
                    <IconBuilding />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.superficie }}>Obras</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderRadius: '8px', color: C.tintaFraca }}>
                    <IconGrid />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca }}>Visão geral</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* BOTÕES */}
        <Card>
          <TituloSecao margemInferior={24}>Botões</TituloSecao>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '14px', borderBottom: `1px solid ${C.borda}`, marginBottom: '20px' }}>
              <div style={{ width: '110px', flexShrink: 0 }} />
              {['Normal', 'Hover', 'Desabilitado'].map((s) => (
                <div key={s} style={{ width: '160px' }}><InlineLabel>{s}</InlineLabel></div>
              ))}
            </div>
            {[
              {
                name: 'Primário', label: 'Salvar obra',
                states: [
                  { bg: C.acento, color: C.tinta, border: 'none', cursor: 'pointer' },
                  { bg: '#F0B800', color: C.tinta, border: 'none', cursor: 'pointer' },
                  { bg: C.acentoFundo, color: C.neutro, border: 'none', cursor: 'not-allowed' },
                ],
              },
              {
                name: 'Secundário', label: 'Cancelar',
                states: [
                  { bg: C.superficie, color: C.grafite, border: `1px solid ${C.borda}`, cursor: 'pointer' },
                  { bg: '#F2F2F2', color: C.grafite, border: `1px solid ${C.borda}`, cursor: 'pointer' },
                  { bg: C.fundo, color: '#C8C8C8', border: `1px solid ${C.borda}`, cursor: 'not-allowed' },
                ],
              },
              {
                name: 'Fantasma', label: 'Ver mais',
                states: [
                  { bg: 'transparent', color: C.grafite, border: 'none', cursor: 'pointer' },
                  { bg: '#F5F5F5', color: C.grafite, border: 'none', cursor: 'pointer' },
                  { bg: 'transparent', color: '#CCCCCC', border: 'none', cursor: 'not-allowed' },
                ],
              },
              {
                name: 'Destrutivo', label: 'Excluir obra',
                states: [
                  { bg: C.negativo, color: C.superficie, border: 'none', cursor: 'pointer' },
                  { bg: '#AF3030', color: C.superficie, border: 'none', cursor: 'pointer' },
                  { bg: '#F9ECEC', color: '#D8A8A8', border: 'none', cursor: 'not-allowed' },
                ],
              },
            ].map(({ name, label, states }, ri) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: ri < 3 ? `1px solid ${C.borda}` : 'none' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.tintaFraca, width: '110px', flexShrink: 0 }}>{name}</span>
                {states.map((s, i) => (
                  <button key={i} style={{
                    width: '160px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
                    padding: '10px 0', borderRadius: '8px', cursor: s.cursor,
                    backgroundColor: s.bg, color: s.color, border: s.border, letterSpacing: '-0.01em',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* CAMPOS + BADGES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          <Card>
            <TituloSecao margemInferior={24}>Campos de Formulário</TituloSecao>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, marginBottom: '6px' }}>Nome do cliente</label>
                <input type="text" placeholder="Ex: Mariana Costa Lima" style={{ width: '100%', boxSizing: 'border-box' as const, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${C.borda}`, backgroundColor: C.superficie, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, marginBottom: '6px' }}>Tipo de serviço</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ width: '100%', boxSizing: 'border-box' as const, appearance: 'none' as const, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, padding: '10px 40px 10px 14px', borderRadius: '8px', border: `1px solid ${C.borda}`, backgroundColor: C.superficie, outline: 'none' }}>
                    <option>Reforma completa</option>
                    <option>Pintura e acabamento</option>
                    <option>Instalação hidráulica</option>
                    <option>Instalação elétrica</option>
                  </select>
                  <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke={C.tintaFraca} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.negativo, marginBottom: '6px' }}>CEP do imóvel</label>
                <input type="text" defaultValue="01452-0" style={{ width: '100%', boxSizing: 'border-box' as const, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${C.negativo}`, backgroundColor: '#FFF8F8', outline: 'none' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.negativo, marginTop: '5px' }}>CEP inválido. Verifique e tente novamente.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.neutro, marginBottom: '6px' }}>Código da obra</label>
                <input type="text" value="22-MCL" disabled readOnly style={{ width: '100%', boxSizing: 'border-box' as const, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.neutro, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${C.borda}`, backgroundColor: C.fundo, outline: 'none', cursor: 'not-allowed' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.neutro, marginTop: '5px' }}>Gerado automaticamente. Não editável.</p>
              </div>
            </div>
          </Card>

          <Card>
            <TituloSecao margemInferior={24}>Badges de Estado</TituloSecao>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {BADGES.map(({ label, bg, color }) => (
                <StatusBadge key={label} label={label} bg={bg} color={color} />
              ))}
            </div>
            <Divider />
            <div>
              <InlineLabel>Uso em contexto</InlineLabel>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { code: 'Obra 22 - MCL', client: 'Mariana Costa Lima', badge: BADGES[0] },
                  { code: 'Obra 18 - GFR', client: 'Guilherme F. Rocha', badge: BADGES[3] },
                  { code: 'Obra 25 - ATB', client: 'Antônia T. Bicalho', badge: BADGES[2] },
                  { code: 'Obra 31 - MBP', client: 'Miguel Barros Pinto', badge: BADGES[1] },
                ].map(({ code, client, badge }) => (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.borda}` }}>
                    <div>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: C.tinta, letterSpacing: '-0.01em' }}>{code}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '2px' }}>{client}</p>
                    </div>
                    <StatusBadge label={badge.label} bg={badge.bg} color={badge.color} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* BARRA DE PROGRESSO */}
        <Card style={{ padding: '28px 32px' }}>
          <TituloSecao margemInferior={24}>Barra de Progresso</TituloSecao>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { label: 'Obra 22 - MCL', pct: 68, badge: BADGES[0] },
              { label: 'Obra 18 - GFR', pct: 100, badge: BADGES[3] },
              { label: 'Obra 25 - ATB', pct: 23, badge: BADGES[2] },
              { label: 'Obra 31 - MBP', pct: 5, badge: BADGES[1] },
            ].map(({ label, pct, badge }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, width: '128px', flexShrink: 0 }}>{label}</span>
                <ProgressBar pct={pct} color={pct === 100 ? C.positivo : C.acento} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca, width: '36px', textAlign: 'right' as const, flexShrink: 0 }}>{pct}%</span>
                <div style={{ flexShrink: 0 }}><StatusBadge label={badge.label} bg={badge.bg} color={badge.color} /></div>
              </div>
            ))}
          </div>
        </Card>

        {/* CARD DE OBRA + CHIP + NAV + TABELA */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 1fr', gap: '28px', alignItems: 'start' }}>

          {/* CARD DE OBRA */}
          <Card style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 16px' }}><TituloSecao margemInferior={24}>Card de Obra</TituloSecao></div>
            <div style={{ margin: '0 24px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${C.borda}`, marginBottom: '24px' }}>
              <div style={{ height: '196px', backgroundColor: '#CCCCCC', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=760&h=392&fit=crop&auto=format" alt="Cozinha em reforma" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '18px 20px 20px', backgroundColor: C.superficie }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em' }}>Obra 22 - MCL</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '3px' }}>Mariana Costa Lima</p>
                  </div>
                  <StatusBadge label={BADGES[0].label} bg={BADGES[0].bg} color={BADGES[0].color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <InlineLabel>Progresso</InlineLabel>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: C.tintaFraca }}>68%</span>
                </div>
                <ProgressBar pct={68} />
                <div style={{ marginTop: '16px', height: '1px', backgroundColor: C.borda }} />
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar initials="RD" bg={C.grafite} size={32} />
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite }}>Rafael Duarte</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro }}>Gerente de obra</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* MIDDLE COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <Card>
              <TituloSecao margemInferior={24}>Chip de Pessoa</TituloSecao>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { initials: 'RD', name: 'Rafael Duarte', role: 'Gerente de obra', bg: C.grafite },
                  { initials: 'AC', name: 'Ana Carvalho', role: 'Assistente de gerenciamento', bg: '#5A5A5A' },
                  { initials: 'MB', name: 'Marcos Bittencourt', role: 'Pedreiro', bg: '#7D7D7D' },
                  { initials: 'FS', name: 'Fernanda Sousa', role: 'Analista Financeiro', bg: '#9A9A9A' },
                ].map(({ initials, name, role, bg }) => (
                  <div key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px 8px 8px', borderRadius: '999px', border: `1px solid ${C.borda}`, backgroundColor: C.superficie, width: 'fit-content' }}>
                    <Avatar initials={initials} bg={bg} size={34} />
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, lineHeight: '18px' }}>{name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.neutro, lineHeight: '16px' }}>{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: '20px' }}>
              <div style={{ padding: '4px 12px 16px' }}><TituloSecao margemInferior={24}>Navegação Lateral</TituloSecao></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {NAV_ITEMS_DS.map(({ label, selected }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '8px',
                    backgroundColor: selected ? C.grafite : 'transparent',
                    color: selected ? C.superficie : C.tintaFraca,
                    cursor: 'pointer',
                  }}>
                    {selected ? <IconBuilding /> : <IconGrid />}
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: selected ? 500 : 400 }}>{label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* TABELA FINANCEIRA */}
          <Card>
            <TituloSecao margemInferior={24}>Tabela Financeira</TituloSecao>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  {['Descrição', 'Data', 'Valor'].map((h, i) => (
                    <th key={h} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.tintaFraca, textAlign: (i === 2 ? 'right' : 'left') as any, paddingBottom: '12px', borderBottom: `1px solid ${C.borda}`, paddingLeft: i === 1 ? '16px' : 0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { desc: 'Revestimento de piso', date: '12/08/2026', value: 'R$ 4.280,00', credit: true },
                  { desc: 'Mão de obra hidráulica', date: '08/08/2026', value: 'R$ 1.950,00', credit: true },
                  { desc: 'Tintas e materiais', date: '03/08/2026', value: 'R$ 680,00', credit: true },
                  { desc: 'Devolução — vidro quebrado', date: '01/08/2026', value: '−R$ 350,00', credit: false },
                  { desc: 'Instalação elétrica', date: '28/07/2026', value: 'R$ 3.120,00', credit: true },
                ].map(({ desc, date, value, credit }, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, padding: '14px 0', borderBottom: `1px solid ${C.borda}` }}>{desc}</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, padding: '14px 0 14px 16px', borderBottom: `1px solid ${C.borda}`, whiteSpace: 'nowrap' as const }}>{date}</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: credit ? C.grafite : C.negativo, padding: '14px 0', borderBottom: `1px solid ${C.borda}`, textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' as const }}>{value}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: C.tintaFraca, paddingTop: '18px' }}>Total acumulado</td>
                  <td style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: C.tinta, paddingTop: '18px', textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>R$ 9.680,00</td>
                </tr>
              </tfoot>
            </table>
          </Card>
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '16px' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: C.borda }} />
          <div style={{ backgroundColor: C.acento, padding: '4px 12px', borderRadius: '4px', display: 'inline-flex' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em' }}>TECTO</span>
          </div>
          <div style={{ height: '1px', flex: 1, backgroundColor: C.borda }} />
        </div>

      </div>
    </div>
  );
}
