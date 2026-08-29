import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, obraSlug, formatarReais } from '../state/store';
import {
  fichaDaPessoa,
  novoLancamentoParaPessoa,
  ROTULO_CICLO,
  ROTULO_PERFIL,
  ROTULO_TIPO_VINCULO,
} from '../state/pessoa';
import { HOJE } from '../state/dados-iniciais';
import { saldoDevedorDaPessoa } from '../state/fechamento';
import TituloSecao from '../components/TituloSecao';
import CabecalhoTabela from '../components/CabecalhoTabela';
import ValorMonetario from '../components/ValorMonetario';
import EstadoVazio from '../components/EstadoVazio';
import Avatar from '../components/Avatar';
import ChipVinculo from '../components/ChipVinculo';
import EmBreve from './EmBreve';

/**
 * FICHA DA PESSOA — o `INV-01` virando interface.
 *
 * Esta tela existe para tornar visível a distinção que é a mais difícil de
 * explicar em palavras e a mais fácil de mostrar:
 *
 *   PESSOA   o ser humano. Existe uma vez, para sempre.
 *   VÍNCULO  o contrato de trabalho. Vários ao longo do tempo, um ativo.
 *   USUÁRIO  a credencial de acesso. Pode não existir.
 *   PAPEL    o que a credencial pode fazer. Vem do Usuário, nunca da Pessoa.
 *
 * Por isso as quatro camadas são quatro blocos, e não uma ficha achatada com
 * "cargo: gerente". É o que permite um terceirizado virar funcionário próprio
 * sem cadastro duplicado — e é o que a Cena 3 demonstra.
 *
 * A tela não implementa regra nenhuma: `criarLancamento` valida, e o botão só
 * chama. Se faltar validação, ela falta em todo lugar.
 */

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

function dataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano.slice(2)}`;
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l4 4-4 4" />
    </svg>
  );
}

function Cartao({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '12px', padding: '20px', ...style }}>
      {children}
    </div>
  );
}

/** Rótulo de camada, para os quatro blocos do INV-01 se lerem como camadas. */
function Camada({ numero, nome }: { numero: number; nome: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
          color: C.tinta,
          backgroundColor: C.acento,
          borderRadius: '4px',
          width: '18px',
          height: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {numero}
      </span>
      <CabecalhoTabela elemento="span">{nome}</CabecalhoTabela>
    </span>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: React.ReactNode }) {
  return (
    <div>
      <CabecalhoTabela elemento="div">{rotulo}</CabecalhoTabela>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: valor ? C.grafite : C.neutro, marginTop: '3px' }}>
        {valor ?? 'não informado'}
      </p>
    </div>
  );
}

const TD: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  color: C.grafite,
  padding: '11px 12px',
  borderBottom: `1px solid ${C.borda}`,
  verticalAlign: 'middle',
};

export default function FichaPessoa() {
  const { pessoaId } = useParams<{ pessoaId: string }>();
  const state = useStore();
  const criarLancamentoParaPessoa = useStore((s) => s.criarLancamentoParaPessoa);
  const perfil = useStore((s) => s.perfil_ativo);

  const [folha, setFolha] = useState(false);
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [feito, setFeito] = useState<string | undefined>(undefined);

  const ficha = useMemo(() => (pessoaId ? fichaDaPessoa(state, pessoaId) : undefined), [state, pessoaId]);
  if (!ficha) return <EmBreve />;

  const { pessoa, vinculos, vinculo_ativo, usuario, papel, contratos, lancamentos, obras } = ficha;
  const podeLancar = perfil === 'administracao' || perfil === 'financeiro';
  const saldo = saldoDevedorDaPessoa(state, pessoa.id);

  // Uma parcela é adiantamento; mais de uma é empréstimo. A RN-094 diz que são
  // a MESMA entidade, diferenciada pelo número de parcelas — por isso a tela
  // não oferece os dois numa lista, o que deixaria criar um "adiantamento em
  // quatro parcelas", que não existe.
  const n = parseInt(parcelas, 10) || 1;
  const tipoDerivado = n > 1 ? 'Empréstimo' : 'Adiantamento';

  function lancar() {
    setErro(undefined);
    setFeito(undefined);
    const centavos = Math.round(parseFloat(valor.replace(/\./g, '').replace(',', '.')) * 100);
    if (!Number.isFinite(centavos) || centavos <= 0) {
      setErro('Informe um valor maior que zero.');
      return;
    }
    // Quem escolhe o ciclo é o estado, nunca a tela: `novoLancamentoParaPessoa`
    // devolve o primeiro ciclo ABERTO da pessoa, e recusa quando não há nenhum.
    const dados = novoLancamentoParaPessoa(state, pessoa.id, centavos, n, HOJE);
    if (!dados) {
      setErro('Esta pessoa não tem ciclo de pagamento aberto. Sem ciclo não há onde descontar o lançamento.');
      return;
    }
    const falha = criarLancamentoParaPessoa(dados);
    if (falha) {
      setErro(falha);
      return;
    }
    setFeito(`${tipoDerivado} de ${formatarReais(centavos)} lançado.`);
    setValor('');
    setParcelas('1');
    setFolha(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Migalha ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.tintaFraca }}>
        <Link to="/equipe" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.informativo, fontWeight: 500, textDecoration: 'none' }}>
          Equipe
        </Link>
        <IconChevronRight />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca }}>{pessoa.nome}</span>
      </div>

      {/* ── Cabeçalho ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Avatar pessoaId={pessoa.id} nome={pessoa.nome} tamanho={56} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 600, color: C.tinta, letterSpacing: '-0.02em', margin: 0 }}>
            {pessoa.nome}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, marginTop: '2px' }}>
            {pessoa.funcao}
            {!pessoa.ativo && <span style={{ color: C.negativo }}> · desativada</span>}
          </p>
        </div>
        {vinculo_ativo && <ChipVinculo tipo={vinculo_ativo.tipo} />}
      </div>

      {/* ── A explicação do INV-01 ── */}
      <div style={{ backgroundColor: C.informativoFundo, borderRadius: '10px', padding: '12px 16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.grafite, lineHeight: '19px' }}>
          Quatro camadas separadas, de propósito. A <strong style={{ fontWeight: 600 }}>Pessoa</strong> existe uma
          vez; o <strong style={{ fontWeight: 600 }}>Vínculo</strong> é o contrato de trabalho e pode mudar; o{' '}
          <strong style={{ fontWeight: 600 }}>Usuário</strong> é a credencial e pode não existir; o{' '}
          <strong style={{ fontWeight: 600 }}>Papel</strong> vem da credencial. É o que deixa um terceirizado virar
          funcionário próprio sem virar cadastro novo.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* ── Camada 1 · Pessoa ── */}
        <Cartao>
          <Camada numero={1} nome="Pessoa" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Campo rotulo="Nome" valor={pessoa.nome} />
            <Campo rotulo="CPF" valor={pessoa.cpf} />
            <Campo rotulo="RG" valor={pessoa.rg} />
            <Campo rotulo="Nascimento" valor={pessoa.nascimento && dataCurta(pessoa.nascimento)} />
            <Campo rotulo="Telefone" valor={pessoa.telefone} />
            <Campo rotulo="Endereço" valor={pessoa.endereco} />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '14px', lineHeight: '17px' }}>
            Os campos da <strong style={{ color: C.grafite, fontWeight: 500 }}>RN-001</strong> são do cadastro da
            Pessoa e não mudam quando o vínculo muda.
          </p>
        </Cartao>

        {/* ── Camadas 3 e 4 · Usuário e Papel ── */}
        <Cartao>
          <Camada numero={3} nome="Usuário — a credencial" />
          {usuario ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Campo rotulo="Nome de exibição" valor={usuario.nome_exibicao} />
              <Campo rotulo="E-mail" valor={usuario.email} />
            </div>
          ) : (
            <EstadoVazio
              compacto
              mensagem="Esta pessoa não acessa o sistema. Ela trabalha, aparece no diário e recebe — só não tem login."
            />
          )}

          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: `1px solid ${C.borda}` }}>
            <Camada numero={4} nome="Papel — o que a credencial pode fazer" />
            {papel ? (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: C.tinta,
                  backgroundColor: C.acentoFundo,
                  border: `1px solid ${C.acento}`,
                  borderRadius: '999px',
                  padding: '5px 13px',
                }}
              >
                {ROTULO_PERFIL[papel]}
              </span>
            ) : (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.neutro }}>
                Sem credencial não há papel. O papel é do Usuário, nunca da Pessoa.
              </p>
            )}
          </div>
        </Cartao>
      </div>

      {/* ── Camada 2 · Linha do tempo de vínculos ── */}
      <Cartao>
        <Camada numero={2} nome="Vínculo — a linha do tempo" />
        {vinculos.length === 0 ? (
          <EstadoVazio
            compacto
            mensagem="Esta pessoa ainda não tem vínculo. O cadastro dela existe; o contrato de trabalho é um passo à parte."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vinculos.map(({ vinculo, ativo }) => (
              <div
                key={vinculo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                  backgroundColor: ativo ? C.acentoFundo : C.fundo,
                  border: `1px solid ${ativo ? C.acento : C.borda}`,
                  borderRadius: '10px',
                  padding: '13px 16px',
                }}
              >
                <span style={{ flex: 1, minWidth: '180px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta }}>
                    {ROTULO_TIPO_VINCULO[vinculo.tipo]}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, display: 'block', marginTop: '2px' }}>
                    {dataCurta(vinculo.inicio)} — {vinculo.fim ? dataCurta(vinculo.fim) : 'sem data de fim'}
                  </span>
                </span>

                {vinculo.ciclo_pagamento && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.grafite }}>
                    Ciclo {ROTULO_CICLO[vinculo.ciclo_pagamento]?.toLowerCase() ?? vinculo.ciclo_pagamento}
                  </span>
                )}

                {vinculo.valor_diaria_centavos !== undefined && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.grafite }}>
                    Diária de <ValorMonetario valorCentavos={vinculo.valor_diaria_centavos} alinhamento="left" style={{ fontSize: '13px' }} />
                  </span>
                )}

                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: ativo ? C.positivo : C.tintaFraca,
                    backgroundColor: ativo ? '#E8F5ED' : '#F2F2F2',
                    borderRadius: '6px',
                    padding: '3px 9px',
                  }}
                >
                  {ativo ? 'Ativo' : 'Encerrado'}
                </span>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '12px', lineHeight: '17px' }}>
          Vínculo encerrado <strong style={{ color: C.grafite, fontWeight: 500 }}>nunca é excluído</strong> — ele
          ganha data de fim e continua na linha do tempo. Um ativo por vez.
        </p>
      </Cartao>

      {/* ── Obras ── */}
      {obras.length > 0 && (
        <Cartao>
          <TituloSecao margemInferior="14px">Obras em que trabalhou</TituloSecao>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {obras.map(({ obra, dias }) => (
              <Link
                key={obra.id}
                to={`/obras/${obraSlug(obra)}`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: C.grafite,
                  backgroundColor: C.fundo,
                  border: `1px solid ${C.borda}`,
                  borderRadius: '999px',
                  padding: '7px 14px',
                  textDecoration: 'none',
                }}
              >
                {obra.codigo}
                <span style={{ color: C.tintaFraca }}> · {dias} {dias === 1 ? 'dia' : 'dias'}</span>
              </Link>
            ))}
          </div>
        </Cartao>
      )}

      {/* ── Contratos de terceirizado ── */}
      {contratos.length > 0 && (
        <Cartao>
          <TituloSecao margemInferior="14px">Contratos por obra</TituloSecao>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Obra</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Escopo</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Situação</CabecalhoTabela>
                <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Pago</CabecalhoTabela>
                <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Total</CabecalhoTabela>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.contrato.id}>
                  <td style={{ ...TD, color: C.tinta, fontWeight: 500 }}>{c.obra?.codigo ?? '—'}</td>
                  <td style={TD}>
                    {c.contrato.escopo}
                    {c.parcelas.length > 0 && (
                      <span style={{ color: C.tintaFraca, fontSize: '12px' }}>
                        {' '}· {c.parcelas.filter((p) => p.situacao === 'paga').length} de {c.parcelas.length} parcelas pagas
                      </span>
                    )}
                  </td>
                  <td style={TD}>{c.contrato.situacao === 'ativo' ? 'Ativo' : c.contrato.situacao === 'concluido' ? 'Concluído' : 'Cancelado'}</td>
                  <td style={{ ...TD, textAlign: 'right' }}><ValorMonetario valorCentavos={c.pago_centavos} /></td>
                  <td style={{ ...TD, textAlign: 'right' }}><ValorMonetario valorCentavos={c.contrato.valor_centavos} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '12px', lineHeight: '17px' }}>
            A parcela do contrato não tem data de vencimento nem etapa: se a cobrança é por data fixa ou por etapa
            concluída é a <strong style={{ color: C.grafite, fontWeight: 500 }}>Q-005</strong>, ainda em aberto.
          </p>
        </Cartao>
      )}

      {/* ── Adiantamentos e empréstimos ── */}
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <TituloSecao>Adiantamentos e empréstimos</TituloSecao>
          {podeLancar && !folha && (
            <button
              onClick={() => { setFolha(true); setFeito(undefined); }}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta, backgroundColor: C.acento, border: 'none', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer' }}
            >
              Lançar
            </button>
          )}
        </div>

        {saldo > 0 && (
          <div style={{ backgroundColor: '#FBEAEA', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.grafite }}>
              Saldo devedor a rolar para o próximo ciclo:{' '}
              <ValorMonetario valorCentavos={saldo} alinhamento="left" style={{ fontSize: '13px', color: C.negativo, fontWeight: 600 }} />
            </span>
          </div>
        )}

        {feito && (
          <div role="status" style={{ backgroundColor: '#E8F5ED', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.positivo, fontWeight: 500 }}>{feito}</span>
          </div>
        )}

        {folha && (
          <div style={{ backgroundColor: C.fundo, border: `1px solid ${C.borda}`, borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <CabecalhoTabela elemento="span">Valor</CabecalhoTabela>
                <input
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '9px 12px', outline: 'none', width: '140px' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <CabecalhoTabela elemento="span">Parcelas</CabecalhoTabela>
                <input
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  inputMode="numeric"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, backgroundColor: C.superficie, border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '9px 12px', outline: 'none', width: '90px' }}
                />
              </label>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <CabecalhoTabela elemento="div">Isto será um</CabecalhoTabela>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta, marginTop: '4px' }}>
                  {tipoDerivado}
                </p>
              </div>
              <button
                onClick={lancar}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.tinta, backgroundColor: C.acento, border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}
              >
                Lançar
              </button>
              <button
                onClick={() => { setFolha(false); setErro(undefined); }}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca, backgroundColor: 'transparent', border: `1px solid ${C.borda}`, borderRadius: '8px', padding: '10px 16px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>

            {erro && (
              <p role="alert" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.negativo, marginTop: '12px' }}>
                {erro}
              </p>
            )}

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '12px', lineHeight: '17px' }}>
              O tipo não se escolhe: uma parcela é adiantamento, mais de uma é empréstimo. São a mesma entidade
              na <strong style={{ color: C.grafite, fontWeight: 500 }}>RN-094</strong>, e oferecer as duas numa
              lista deixaria criar um adiantamento parcelado, que não existe.
            </p>
          </div>
        )}

        {lancamentos.length === 0 ? (
          <EstadoVazio compacto mensagem="Nenhum adiantamento ou empréstimo para esta pessoa." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Tipo</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Data</CabecalhoTabela>
                <CabecalhoTabela scope="col" style={{ padding: '0 12px 8px' }}>Parcelas</CabecalhoTabela>
                <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Pendente</CabecalhoTabela>
                <CabecalhoTabela scope="col" alinhamento="right" style={{ padding: '0 12px 8px' }}>Valor</CabecalhoTabela>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => {
                const estorno = l.lancamento.tipo === 'estorno';
                return (
                  <tr key={l.lancamento.id}>
                    <td style={{ ...TD, color: C.tinta, fontWeight: 500 }}>
                      {estorno ? 'Estorno' : l.lancamento.tipo === 'emprestimo' ? 'Empréstimo' : 'Adiantamento'}
                      {l.estornado && (
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: C.negativo, backgroundColor: '#FBEAEA', borderRadius: '6px', padding: '2px 8px', marginLeft: '8px' }}>
                          estornado
                        </span>
                      )}
                      {estorno && l.lancamento.motivo && (
                        <span style={{ display: 'block', fontSize: '12px', color: C.tintaFraca, fontWeight: 400, marginTop: '2px' }}>
                          {l.lancamento.motivo}
                        </span>
                      )}
                    </td>
                    <td style={TD}>{dataCurta(l.lancamento.data)}</td>
                    <td style={TD}>
                      {l.parcelas.length === 0
                        ? '—'
                        : `${l.parcelas.filter((p) => p.situacao === 'paga').length} de ${l.parcelas.length} pagas`}
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      {l.pendente_centavos > 0 ? (
                        <ValorMonetario valorCentavos={l.pendente_centavos} style={{ color: C.atencao }} />
                      ) : (
                        <span style={{ color: C.neutro }}>—</span>
                      )}
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <ValorMonetario valorCentavos={l.lancamento.valor_centavos} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginTop: '12px', lineHeight: '17px' }}>
          Lançamento estornado <strong style={{ color: C.grafite, fontWeight: 500 }}>continua na lista</strong>: o
          estorno é um registro novo apontando para ele, nunca uma alteração do original.
        </p>
      </Cartao>
    </div>
  );
}
