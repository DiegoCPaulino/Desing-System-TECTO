import type { AppState, Ambiente, Midia } from './types';

/**
 * MÍDIA POR AMBIENTE.
 *
 * Funções puras. As mutações vivem no store, em `adicionarMidiaNaObra` e
 * dentro de `finalizarDiario`.
 *
 * O protótipo guardava foto como URL solta em `Diario.fotos`, sem ambiente —
 * por isso o filtro por ambiente da tela de Fotos era decorativo. A coleção
 * `midias` é a modelagem real; `Diario.fotos` continua existindo porque as
 * telas atuais leem dali, e as duas são mantidas em sincronia por quem grava.
 *
 * `ambiente_id` é **obrigatório**. Foto sem ambiente é foto que ninguém acha
 * depois, e é o que a lacuna 3 do `docs/ABERTO.md` §7 pede que vire regra.
 */

export interface NovaMidia {
  obra_id: string;
  ambiente_id: string;
  url: string;
  tipo: 'foto' | 'video';
  data: string;
  diario_id?: string;
}

export interface ResultadoMidia {
  ok: boolean;
  erro?: string;
  midias?: Midia[];
}

/** Ambientes da obra — o que o formulário de envio deve oferecer. */
export function ambientesDaObra(state: AppState, obra_id: string): Ambiente[] {
  return state.ambientes.filter((a) => a.obra_id === obra_id);
}

export function midiasDaObra(state: AppState, obra_id: string): Midia[] {
  return state.midias
    .filter((m) => m.obra_id === obra_id)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export function midiasDoAmbiente(state: AppState, obra_id: string, ambiente_id: string): Midia[] {
  return midiasDaObra(state, obra_id).filter((m) => m.ambiente_id === ambiente_id);
}

export function midiasDoDiario(state: AppState, diario_id: string): Midia[] {
  return state.midias.filter((m) => m.diario_id === diario_id);
}

/**
 * Só os ambientes que têm mídia, para o filtro não oferecer opção vazia.
 * Devolve o Ambiente inteiro mais a contagem.
 */
export function ambientesComMidia(
  state: AppState,
  obra_id: string
): Array<{ ambiente: Ambiente; quantidade: number }> {
  const porAmbiente = new Map<string, number>();
  for (const m of midiasDaObra(state, obra_id)) {
    porAmbiente.set(m.ambiente_id, (porAmbiente.get(m.ambiente_id) ?? 0) + 1);
  }
  return ambientesDaObra(state, obra_id)
    .filter((a) => porAmbiente.has(a.id))
    .map((ambiente) => ({ ambiente, quantidade: porAmbiente.get(ambiente.id)! }));
}

/** Agrupado por data, da mais recente para a mais antiga — o formato da galeria. */
export function midiasPorData(
  state: AppState,
  obra_id: string,
  ambiente_id?: string
): Array<{ data: string; midias: Midia[] }> {
  const lista = ambiente_id
    ? midiasDoAmbiente(state, obra_id, ambiente_id)
    : midiasDaObra(state, obra_id);

  const porData = new Map<string, Midia[]>();
  for (const m of lista) {
    const atual = porData.get(m.data) ?? [];
    atual.push(m);
    porData.set(m.data, atual);
  }
  return [...porData.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([data, midias]) => ({ data, midias }));
}

/**
 * Cria uma mídia. Recusa sem ambiente, e recusa ambiente que não seja da obra
 * — trocar de obra no formulário sem trocar o ambiente é o erro fácil de
 * cometer, e ele deixaria a foto num álbum que não é o dela.
 *
 * Não altera o estado recebido.
 */
export function criarMidia(state: AppState, nova: NovaMidia): ResultadoMidia {
  if (!state.obras.some((o) => o.id === nova.obra_id)) {
    return { ok: false, erro: 'Obra não encontrada.' };
  }
  if (!nova.ambiente_id) {
    return { ok: false, erro: 'Escolha o ambiente. Foto sem ambiente não aparece no álbum dele.' };
  }
  const ambiente = state.ambientes.find((a) => a.id === nova.ambiente_id);
  if (!ambiente) {
    return { ok: false, erro: 'Ambiente não encontrado.' };
  }
  if (ambiente.obra_id !== nova.obra_id) {
    return {
      ok: false,
      erro: `O ambiente "${ambiente.nome}" pertence a outra obra.`,
    };
  }
  if (!nova.url.trim()) {
    return { ok: false, erro: 'A mídia precisa de um arquivo.' };
  }

  const midia: Midia = {
    id: `md_${nova.obra_id}_${nova.ambiente_id}_${state.midias.length + 1}`,
    obra_id: nova.obra_id,
    diario_id: nova.diario_id,
    ambiente_id: nova.ambiente_id,
    url: nova.url.trim(),
    tipo: nova.tipo,
    data: nova.data,
  };

  return { ok: true, midias: [...state.midias, midia] };
}
