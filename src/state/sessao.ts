import type { AppState, Obra, Pessoa, Usuario } from './types';

/**
 * QUEM ESTÁ LOGADO.
 *
 * Funções puras, sem dependência do store — como `fechamento.ts` e
 * `visibilidade.ts`.
 *
 * O protótipo guardava só o `perfil_ativo`, e perfil não é identidade: dois
 * gerentes têm o mesmo perfil e obras diferentes. Era essa a falta que obrigava
 * o `PortalLayout` a ter "Mariana Costa Lima" escrito no código, e as três
 * páginas do Portal a fixarem a obra `o01`.
 *
 * Use `obraDoClienteAtivo` no Portal. Escolher "a primeira obra" seria apenas
 * trocar um valor escrito no código por outro.
 */

/** O estado mais o pedaço de sessão que o store acrescenta. */
export type EstadoComSessao = AppState & { usuario_ativo_id: string | null };

export function usuarioAtivo(s: EstadoComSessao): Usuario | undefined {
  if (!s.usuario_ativo_id) return undefined;
  return s.usuarios.find((u) => u.id === s.usuario_ativo_id);
}

/**
 * A Pessoa por trás da credencial (`INV-01`). Existe para os três perfis
 * internos; para o Cliente é `undefined`, porque ele ainda não é uma Pessoa no
 * estado — ver a nota em `Usuario`.
 */
export function pessoaAtiva(s: EstadoComSessao): Pessoa | undefined {
  const u = usuarioAtivo(s);
  if (!u?.pessoa_id) return undefined;
  return s.pessoas.find((p) => p.id === u.pessoa_id);
}

/**
 * A Obra do Cliente logado. `undefined` para qualquer outro perfil — e é assim
 * que deve ser: um Gerente não tem "a obra dele", tem várias, e quem responde
 * isso é `obrasDoGerenteAtivo`.
 */
export function obraDoClienteAtivo(s: EstadoComSessao): Obra | undefined {
  const u = usuarioAtivo(s);
  if (!u || u.perfil !== 'cliente' || !u.obra_id) return undefined;
  return s.obras.find((o) => o.id === u.obra_id);
}

/** As obras que o Gerente logado gerencia, por `vinculos_obra` ativo. */
export function obrasDoGerenteAtivo(s: EstadoComSessao): Obra[] {
  const pessoa = pessoaAtiva(s);
  if (!pessoa) return [];
  const ids = new Set(
    s.vinculos_obra
      .filter((v) => v.pessoa_id === pessoa.id && v.papel === 'gerente' && !v.fim)
      .map((v) => v.obra_id)
  );
  return s.obras.filter((o) => ids.has(o.id));
}

/**
 * O nome de quem está logado, para cabeçalhos.
 *
 * Para o Cliente vem de `Obra.cliente`, que é a fonte da verdade sobre de quem
 * é a obra — e não do `nome_exibicao` do Usuário, que é só o rótulo da
 * credencial. Se os dois divergirem, quem manda é a Obra.
 */
export function nomeDoUsuarioAtivo(s: EstadoComSessao): string {
  const u = usuarioAtivo(s);
  if (!u) return '';
  if (u.perfil === 'cliente') {
    return obraDoClienteAtivo(s)?.cliente ?? u.nome_exibicao;
  }
  return pessoaAtiva(s)?.nome ?? u.nome_exibicao;
}

/** Iniciais para avatar, derivadas do nome de quem está logado. */
export function iniciaisDoUsuarioAtivo(s: EstadoComSessao): string {
  const pessoa = pessoaAtiva(s);
  if (pessoa) return pessoa.iniciais;
  const nome = nomeDoUsuarioAtivo(s);
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Chave estável para o avatar ilustrado. Usa o id da Pessoa quando existe, e
 * o id do Usuário quando não — assim o Cliente também tem retrato próprio e
 * determinístico, sem depender de virar Pessoa antes.
 */
export function chaveDeAvatarDoUsuarioAtivo(s: EstadoComSessao): string {
  return pessoaAtiva(s)?.id ?? usuarioAtivo(s)?.id ?? '';
}
