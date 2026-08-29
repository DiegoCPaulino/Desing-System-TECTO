import type { AppState, Notificacao, TipoPerfil } from './types';

/**
 * NOTIFICAÇÕES — leitura por perfil.
 *
 * Funções puras. A mutação vive no store, em `marcarNotificacoesComoLidas`.
 *
 * A `Q-027` pergunta "quem recebe qual notificação, e existe uma central ou só
 * o aviso no momento". A central foi decidida pelo prompt da T4; o destinatário
 * é a decisão `[SÓ PROTÓTIPO]` registrada em `docs/DECISOES.md`: por perfil.
 */

/** As notificações endereçadas a este perfil, da mais recente para a mais antiga. */
export function notificacoesDoPerfil(state: AppState, perfil: TipoPerfil): Notificacao[] {
  return state.notificacoes
    .filter((n) => n.destinatario_perfis.includes(perfil))
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** As que este perfil ainda não leu. É o que o contador do sino deve mostrar. */
export function naoLidasDoPerfil(state: AppState, perfil: TipoPerfil): Notificacao[] {
  return notificacoesDoPerfil(state, perfil).filter((n) => !n.lida_por.includes(perfil));
}

export function contarNaoLidas(state: AppState, perfil: TipoPerfil): number {
  return naoLidasDoPerfil(state, perfil).length;
}

export function foiLidaPor(n: Notificacao, perfil: TipoPerfil): boolean {
  return n.lida_por.includes(perfil);
}

/**
 * Marca como lidas, **para um perfil só**, as notificações endereçadas a ele.
 *
 * `ids` restringe a um subconjunto; sem ele, marca todas as do perfil — que é
 * o comportamento de "abrir o painel zera o contador".
 *
 * Marcar por perfil é o ponto inteiro da decisão: com um `lida` booleano, o
 * Pedro abrir o painel apagaria o aviso que o Rafael ainda não viu.
 *
 * Não altera o estado recebido. Devolve o array novo.
 */
export function marcarComoLidas(
  state: AppState,
  perfil: TipoPerfil,
  ids?: string[]
): Notificacao[] {
  const alvo = ids ? new Set(ids) : undefined;
  return state.notificacoes.map((n) => {
    if (!n.destinatario_perfis.includes(perfil)) return n;
    if (alvo && !alvo.has(n.id)) return n;
    if (n.lida_por.includes(perfil)) return n;
    return { ...n, lida_por: [...n.lida_por, perfil] };
  });
}
