import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import CabecalhoTabela from '../components/CabecalhoTabela';
import DataComDiaSemana from '../components/DataComDiaSemana';
import TituloSecao from '../components/TituloSecao';
import ValorMonetario from '../components/ValorMonetario';
import ChipVinculo from '../components/ChipVinculo';
import { useStore } from '../state/store';
import { HOJE } from '../state/dados-iniciais';
import type { TipoVinculo } from '../state/types';

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

const TIPOS_VINCULO: TipoVinculo[] = [
  'funcionario_proprio',
  'terceirizado',
  'gerente_obras',
  'assistente_gerenciamento',
  'administracao',
  'financeiro',
];

function BlocoReferencia({
  nome,
  descricao,
  children,
}: {
  nome: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-componente-documentado={nome}
      style={{
        backgroundColor: C.superficie,
        border: `1px solid ${C.borda}`,
        borderRadius: '12px',
        padding: 'clamp(22px, 3vw, 32px)',
        minWidth: 0,
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', lineHeight: '28px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em' }}>
          {nome}
        </h2>
        <p style={{ margin: '5px 0 0', fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '19px', color: C.tintaFraca }}>
          {descricao}
        </p>
      </div>
      {children}
    </section>
  );
}

function RotuloEstado({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.neutro }}>
      {children}
    </span>
  );
}

export default function DesignSystemPage() {
  const pessoas = useStore(state => state.pessoas);
  const pessoaReferencia = pessoas[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.fundo, fontFamily: 'Inter, sans-serif', color: C.grafite }}>
      <header style={{ backgroundColor: C.superficie, borderBottom: `1px solid ${C.borda}` }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '24px clamp(20px, 5vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: C.acento, padding: '8px 14px', borderRadius: '4px' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '19px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.04em' }}>TECTO</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', lineHeight: '30px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.02em' }}>
                Componentes compartilhados
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', lineHeight: '18px', color: C.tintaFraca }}>
                Referência visual das implementações usadas no protótipo
              </p>
            </div>
          </div>
          <Link to="/" style={{ fontSize: '13px', fontWeight: 500, color: C.grafite, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            ← Voltar ao app
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '40px clamp(20px, 5vw, 48px) 80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '20px', color: C.tintaFraca }}>
            Esta página usa diretamente os seis componentes do design system em <code style={{ fontFamily: "'JetBrains Mono', monospace", color: C.grafite }}>src/components</code>. As variações abaixo correspondem às propriedades públicas de cada um.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))', gap: '24px', alignItems: 'start' }}>
          <BlocoReferencia
            nome="TituloSecao"
            descricao="Título visual de seção. O bloco amarelo é acento; o texto permanece em grafite."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <RotuloEstado>h2 · padrão</RotuloEstado>
                <div style={{ marginTop: '12px' }}><TituloSecao>Ambiente por ambiente</TituloSecao></div>
              </div>
              <div>
                <RotuloEstado>h3</RotuloEstado>
                <div style={{ marginTop: '12px' }}><TituloSecao as="h3">Equipe planejada</TituloSecao></div>
              </div>
              <div>
                <RotuloEstado>p · margem inferior</RotuloEstado>
                <div style={{ marginTop: '12px', borderBottom: `1px solid ${C.borda}` }}>
                  <TituloSecao as="p" margemInferior={18}>Resumo do dia</TituloSecao>
                </div>
              </div>
            </div>
          </BlocoReferencia>

          <BlocoReferencia
            nome="Avatar"
            descricao="Retrato ilustrado e determinístico pelo id da pessoa, sem foto ou dependência de rede."
          >
            {pessoaReferencia && (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '22px', flexWrap: 'wrap' }}>
                  {[28, 36, 48, 64].map(tamanho => (
                    <div key={tamanho} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px' }}>
                      <Avatar pessoaId={pessoaReferencia.id} nome={pessoaReferencia.nome} tamanho={tamanho} />
                      <RotuloEstado>{tamanho}px</RotuloEstado>
                    </div>
                  ))}
                </div>
                <div style={{ height: '1px', backgroundColor: C.borda, margin: '26px 0 22px' }} />
                <RotuloEstado>Elenco completo · {pessoas.length} identidades</RotuloEstado>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '12px' }}>
                  {pessoas.map(pessoa => (
                    <Avatar key={pessoa.id} pessoaId={pessoa.id} nome={pessoa.nome} tamanho={32} />
                  ))}
                </div>
              </>
            )}
          </BlocoReferencia>

          <BlocoReferencia
            nome="CabecalhoTabela"
            descricao="Inter Semibold, caixa alta e espaçamento 0.08em. Disponível como th, span ou div."
          >
            <RotuloEstado>th · alinhamentos</RotuloEstado>
            <div style={{ marginTop: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '360px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <CabecalhoTabela scope="col" style={{ padding: '12px 10px', borderBottom: `1px solid ${C.borda}` }}>Pessoa</CabecalhoTabela>
                    <CabecalhoTabela scope="col" alinhamento="center" style={{ padding: '12px 10px', borderBottom: `1px solid ${C.borda}` }}>Período</CabecalhoTabela>
                    <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '12px 10px', borderBottom: `1px solid ${C.borda}` }}>Estado</CabecalhoTabela>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 10px', fontSize: '14px', color: C.grafite }}>Dado de exemplo</td>
                    <td style={{ padding: '14px 10px', fontSize: '14px', color: C.tintaFraca, textAlign: 'center' }}>Célula</td>
                    <td style={{ padding: '14px 10px', fontSize: '14px', color: C.tintaFraca, textAlign: 'right' }}>Célula</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ height: '1px', backgroundColor: C.borda, margin: '22px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <RotuloEstado>span</RotuloEstado>
                <div style={{ marginTop: '10px' }}><CabecalhoTabela elemento="span">Nome da coluna</CabecalhoTabela></div>
              </div>
              <div>
                <RotuloEstado>div</RotuloEstado>
                <CabecalhoTabela elemento="div" alinhamento="right" style={{ marginTop: '10px' }}>Total</CabecalhoTabela>
              </div>
            </div>
          </BlocoReferencia>

          <BlocoReferencia
            nome="DataComDiaSemana"
            descricao="Data civil derivada do ISO, com o dia da semana legível e coerente."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <RotuloEstado>Padrão</RotuloEstado>
                <div style={{ marginTop: '10px' }}><DataComDiaSemana data={HOJE} /></div>
              </div>
              <div>
                <RotuloEstado>Destaque</RotuloEstado>
                <div style={{ marginTop: '10px' }}><DataComDiaSemana data={HOJE} modo="destaque" /></div>
              </div>
              <div>
                <RotuloEstado>Grade compacta</RotuloEstado>
                <div style={{ marginTop: '10px', width: '54px', padding: '10px', border: `1px solid ${C.borda}`, borderRadius: '8px', textAlign: 'center' }}>
                  <DataComDiaSemana data={HOJE} modo="grade" />
                </div>
              </div>
            </div>
          </BlocoReferencia>

          <BlocoReferencia
            nome="ValorMonetario"
            descricao="Formata centavos, preserva símbolo e número na mesma linha, usa numerais tabulares e destaca valores negativos."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '18px' }}>
                <div>
                  <RotuloEstado>Positivo</RotuloEstado>
                  <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 700 }}>
                    <ValorMonetario valorCentavos={14832000} alinhamento="left" />
                  </div>
                </div>
                <div>
                  <RotuloEstado>Zero</RotuloEstado>
                  <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 700 }}>
                    <ValorMonetario valorCentavos={0} alinhamento="left" />
                  </div>
                </div>
                <div>
                  <RotuloEstado>Negativo</RotuloEstado>
                  <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 700 }}>
                    <ValorMonetario valorCentavos={-40000} alinhamento="left" />
                  </div>
                </div>
              </div>

              <div>
                <RotuloEstado>Coluna de tabela · alinhado à direita</RotuloEstado>
                <div style={{ marginTop: '10px', padding: '12px 14px', border: `1px solid ${C.borda}`, borderRadius: '8px', textAlign: 'right', fontSize: '15px' }}>
                  <ValorMonetario valorCentavos={1248000} />
                </div>
              </div>

              <div>
                <RotuloEstado>Tela estreita · símbolo e número inseparáveis</RotuloEstado>
                <div style={{ marginTop: '10px', width: '128px', maxWidth: '100%', overflowX: 'auto', padding: '10px 12px', border: `1px solid ${C.borda}`, borderRadius: '8px', fontSize: '15px' }}>
                  <ValorMonetario valorCentavos={16080000} alinhamento="left" />
                </div>
              </div>
            </div>
          </BlocoReferencia>

          <BlocoReferencia
            nome="ChipVinculo"
            descricao="Seis tipos de vínculo diferenciados primeiro por tratamento visual, sem reutilizar cores semânticas."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <RotuloEstado>Padrão · seis tipos</RotuloEstado>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {TIPOS_VINCULO.map(tipo => <ChipVinculo key={tipo} tipo={tipo} />)}
                </div>
              </div>
              <div>
                <RotuloEstado>Compacto · seis tipos</RotuloEstado>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {TIPOS_VINCULO.map(tipo => <ChipVinculo key={tipo} tipo={tipo} compacto />)}
                </div>
              </div>
            </div>
          </BlocoReferencia>
        </div>
      </main>
    </div>
  );
}
