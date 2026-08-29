import type { AppState, TipoPerfil } from './types';
import DADOS from './dados-iniciais';
import {
  chaveDeAvatarDoUsuarioAtivo,
  nomeDoUsuarioAtivo,
  obraDoClienteAtivo,
  obrasDoGerenteAtivo,
  pessoaAtiva,
  usuarioAtivo,
  type EstadoComSessao,
} from './sessao';
import { contarNaoLidas, marcarComoLidas, naoLidasDoPerfil, notificacoesDoPerfil } from './notificacoes';

/** Testes de identidade da sessão e de notificações por perfil. */

interface Resultado {
  nome: string;
  ok: boolean;
  detalhe?: string;
}

const resultados: Resultado[] = [];

function teste(nome: string, corpo: () => void) {
  try {
    corpo();
    resultados.push({ nome, ok: true });
  } catch (e) {
    resultados.push({ nome, ok: false, detalhe: (e as Error).message });
  }
}

function igual(recebido: unknown, esperado: unknown, oQue: string) {
  if (recebido !== esperado) {
    throw new Error(`${oQue}: esperado ${String(esperado)}, recebido ${String(recebido)}`);
  }
}

function verdadeiro(valor: boolean, oQue: string) {
  if (!valor) throw new Error(`${oQue}: esperado verdadeiro`);
}

function falso(valor: boolean, oQue: string) {
  if (valor) throw new Error(`${oQue}: esperado falso`);
}

function estado(): AppState {
  return JSON.parse(JSON.stringify(DADOS)) as AppState;
}

/** O estado com alguém logado, como o store monta. */
function logadoComo(perfil: TipoPerfil): EstadoComSessao {
  const e = estado();
  const u = e.usuarios.find((x) => x.perfil === perfil && x.ativo)!;
  return { ...e, usuario_ativo_id: u.id };
}

// ═══════════════════════════════════════════════════════════════════════════
// Identidade
// ═══════════════════════════════════════════════════════════════════════════

teste('sem sessão, não há usuário ativo', () => {
  const s: EstadoComSessao = { ...estado(), usuario_ativo_id: null };
  igual(usuarioAtivo(s), undefined, 'usuário');
  igual(nomeDoUsuarioAtivo(s), '', 'nome');
  igual(obraDoClienteAtivo(s), undefined, 'obra');
});

teste('INV-01: o usuário interno aponta para uma Pessoa', () => {
  for (const perfil of ['administracao', 'financeiro', 'gerente_obras'] as TipoPerfil[]) {
    const s = logadoComo(perfil);
    const pessoa = pessoaAtiva(s);
    verdadeiro(!!pessoa, `${perfil} tem Pessoa por trás da credencial`);
    igual(nomeDoUsuarioAtivo(s), pessoa!.nome, `${perfil}: nome vem da Pessoa`);
  }
});

teste('o nome do Cliente vem da Obra, não do rótulo da credencial', () => {
  const s = logadoComo('cliente');
  const obra = obraDoClienteAtivo(s)!;
  igual(obra.id, 'o01', 'a obra do cliente logado');
  igual(nomeDoUsuarioAtivo(s), obra.cliente, 'nome derivado de Obra.cliente');
  igual(nomeDoUsuarioAtivo(s), 'Mariana Costa Lima', 'e é quem se espera');
});

teste('renomear o cliente da obra muda o nome exibido — nada fica escrito no código', () => {
  const s = logadoComo('cliente');
  const outro: EstadoComSessao = {
    ...s,
    obras: s.obras.map((o) => (o.id === 'o01' ? { ...o, cliente: 'Outra Pessoa' } : o)),
  };
  igual(nomeDoUsuarioAtivo(outro), 'Outra Pessoa', 'o nome acompanha a obra');
});

teste('só o Cliente tem "a obra dele"', () => {
  for (const perfil of ['administracao', 'financeiro', 'gerente_obras'] as TipoPerfil[]) {
    igual(obraDoClienteAtivo(logadoComo(perfil)), undefined, `${perfil} não tem obra única`);
  }
});

teste('o Gerente logado tem as obras que gerencia', () => {
  const obras = obrasDoGerenteAtivo(logadoComo('gerente_obras'));
  igual(obras.length, 3, 'Rafael gerencia três obras');
  verdadeiro(obras.some((o) => o.id === 'o01'), 'inclui a Obra 22');
  falso(obras.some((o) => o.id === 'o02'), 'não inclui a GFR, que é da Sofia');
});

teste('a chave de avatar é estável e existe para todos os perfis', () => {
  for (const perfil of ['administracao', 'financeiro', 'gerente_obras', 'cliente'] as TipoPerfil[]) {
    const chave = chaveDeAvatarDoUsuarioAtivo(logadoComo(perfil));
    verdadeiro(chave.length > 0, `${perfil} tem chave de avatar`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Q-027 — notificações por perfil
// ═══════════════════════════════════════════════════════════════════════════

teste('cada perfil vê só o que é endereçado a ele', () => {
  const e = estado();
  const admin = notificacoesDoPerfil(e, 'administracao');
  const gerente = notificacoesDoPerfil(e, 'gerente_obras');
  verdadeiro(admin.length > gerente.length, 'a Administração recebe mais');
  verdadeiro(
    gerente.every((n) => n.destinatario_perfis.includes('gerente_obras')),
    'o Gerente só recebe o que é dele'
  );
});

teste('RN-136: o Cliente não recebe notificação interna', () => {
  igual(notificacoesDoPerfil(estado(), 'cliente').length, 0, 'nenhuma para o Cliente');
});

teste('o diário faltando vai para o Gerente, que é quem preenche', () => {
  const doGerente = notificacoesDoPerfil(estado(), 'gerente_obras');
  verdadeiro(
    doGerente.some((n) => n.tipo === 'diario_pendente'),
    'o Gerente é avisado do diário que falta'
  );
});

teste('Q-027: Pedro ler NÃO zera o contador do Rafael', () => {
  // É o caso concreto que a decisão existe para evitar.
  let e = estado();
  const antesGerente = contarNaoLidas(e, 'gerente_obras');
  verdadeiro(antesGerente > 0, 'o Gerente tem não lidas para começar');

  e = { ...e, notificacoes: marcarComoLidas(e, 'administracao') };

  igual(contarNaoLidas(e, 'administracao'), 0, 'a Administração zerou');
  igual(contarNaoLidas(e, 'gerente_obras'), antesGerente, 'o Gerente não foi tocado');
});

teste('marcar como lida é idempotente', () => {
  let e = estado();
  e = { ...e, notificacoes: marcarComoLidas(e, 'financeiro') };
  const depoisDaPrimeira = JSON.stringify(e.notificacoes);
  e = { ...e, notificacoes: marcarComoLidas(e, 'financeiro') };
  igual(JSON.stringify(e.notificacoes), depoisDaPrimeira, 'a segunda passada não muda nada');
});

teste('dá para marcar só um subconjunto', () => {
  const e = estado();
  const naoLidas = naoLidasDoPerfil(e, 'administracao');
  verdadeiro(naoLidas.length >= 2, 'há pelo menos duas não lidas');

  const depois = marcarComoLidas(e, 'administracao', [naoLidas[0].id]);
  const restantes = depois.filter(
    (n) => n.destinatario_perfis.includes('administracao') && !n.lida_por.includes('administracao')
  );
  igual(restantes.length, naoLidas.length - 1, 'só uma foi marcada');
});

teste('marcar não alcança notificação de outro destinatário', () => {
  const e = estado();
  const soDoGerente = e.notificacoes.filter(
    (n) => n.destinatario_perfis.includes('gerente_obras') && !n.destinatario_perfis.includes('financeiro')
  );
  verdadeiro(soDoGerente.length > 0, 'existe notificação exclusiva do Gerente');

  const depois = marcarComoLidas(e, 'financeiro', soDoGerente.map((n) => n.id));
  for (const n of depois.filter((x) => soDoGerente.some((y) => y.id === x.id))) {
    falso(n.lida_por.includes('financeiro'), 'o Financeiro não marca o que não é dele');
  }
});

teste('o contador do sino é o número de não lidas do perfil', () => {
  const e = estado();
  for (const perfil of ['administracao', 'financeiro', 'gerente_obras'] as TipoPerfil[]) {
    igual(
      contarNaoLidas(e, perfil),
      naoLidasDoPerfil(e, perfil).length,
      `${perfil}: contador e lista concordam`
    );
  }
});

// ═══════════════════════════════════════════════════════════════════════════

export function rodarTestes(): { total: number; falhas: number; resultados: Resultado[] } {
  const falhas = resultados.filter((r) => !r.ok).length;
  return { total: resultados.length, falhas, resultados };
}
