import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, obraPorSlug, GERENTE_ID } from '../state/store';
import { HOJE } from '../state/dados-iniciais';
import TituloSecao from '../components/TituloSecao';
import Avatar from '../components/Avatar';
import DataComDiaSemana from '../components/DataComDiaSemana';

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  acento: '#FFC213',
  acentoFundo: '#FFFBEE',
  tinta: '#000000',
  grafite: '#363636',
  tintaFraca: '#666666',
  borda: '#E6E6E6',
  fundo: '#FAFAFA',
  superficie: '#FFFFFF',
  positivo: '#2E9E5B',
  positivoFundo: '#EDFAF3',
  atencao: '#E8833A',
  atencaoFundo: '#FFF3E8',
  neutro: '#9A9A9A',
  vermelho: '#C94141',
  vermelhoFundo: '#FDEAEA',
  info: '#215FD7',
  infoFundo: '#E7F1FF',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkerEntry {
  pessoa_id: string;
  periodo: 'dia_todo' | 'manha' | 'tarde';
  removido: boolean;
  motivoRemocao?: string;
  eraPlanejado: boolean;
}

interface Media {
  url: string;
  tipo: 'foto' | 'video';
}

type GravacaoEstado = 'idle' | 'gravando' | 'transcrevendo' | 'transcrito';

type SheetEstado =
  | null
  | { tipo: 'busca' }
  | { tipo: 'remocao'; pessoa_id: string; motivo: string }
  | { tipo: 'adicao'; pessoa_id: string }
  | { tipo: 'confirmacao'; contConfirmados: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const TEXTO_TRANSCRITO = `SERVIÇOS EXECUTADOS
- Assentamento de porcelanato na cozinha, cerca de 18 m²
- Rejunte do banheiro da suíte, concluído
- Limpeza e retirada de entulho no período da tarde
MATERIAIS RECEBIDOS
- Gesso, entregue pela manhã, armazenado na área de serviço
PRÓXIMO DIA
- Continuidade do porcelanato da cozinha`;

const FOTOS_INICIAIS: Media[] = [
  { url: 'https://images.unsplash.com/photo-1618832515490-e181c4794a45?w=280&h=280&fit=crop&auto=format', tipo: 'foto' },
  { url: 'https://images.unsplash.com/photo-1634586648651-f1fb9ec10d90?w=280&h=280&fit=crop&auto=format', tipo: 'foto' },
  { url: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=280&h=280&fit=crop&auto=format', tipo: 'foto' },
  { url: 'https://images.unsplash.com/photo-1674649207083-281c2517ab49?w=280&h=280&fit=crop&auto=format', tipo: 'foto' },
  { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=280&h=280&fit=crop&auto=format', tipo: 'foto' },
  { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=280&h=280&fit=crop&auto=format', tipo: 'foto' },
  { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=280&h=280&fit=crop&auto=format', tipo: 'video' },
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=280&h=280&fit=crop&auto=format', tipo: 'video' },
];

const FOTOS_EXTRA = [
  'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=280&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=280&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=280&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=280&h=280&fit=crop&auto=format',
];

const MOTIVOS_REMOCAO = ['Doente', 'Dispensado pela empresa', 'Falta', 'Folga', 'Outro'];
const MOTIVOS_SEM_EXECUCAO = ['Clima', 'Falta de material', 'Obra parada', 'Feriado', 'Outro'];

// ─── Small helpers ────────────────────────────────────────────────────────────

function formatarFinalizadoEm(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatarTimer(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── UI sub-components ────────────────────────────────────────────────────────

function PillSelector({ value, onChange, disabled }: { value: 'dia_todo' | 'manha' | 'tarde'; onChange: (v: 'dia_todo' | 'manha' | 'tarde') => void; disabled?: boolean }) {
  const opts: Array<{ v: 'dia_todo' | 'manha' | 'tarde'; l: string }> = [
    { v: 'dia_todo', l: 'Dia todo' },
    { v: 'manha', l: 'Manhã' },
    { v: 'tarde', l: 'Tarde' },
  ];
  return (
    <div style={{ display: 'flex', gap: '2px', backgroundColor: C.fundo, borderRadius: '8px', padding: '2px', border: `1px solid ${C.borda}` }}>
      {opts.map(({ v, l }) => (
        <button
          key={v}
          onClick={() => !disabled && onChange(v)}
          style={{
            padding: '4px 7px', borderRadius: '6px', border: 'none', cursor: disabled ? 'default' : 'pointer',
            backgroundColor: value === v ? C.superficie : 'transparent',
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: value === v ? 600 : 400,
            color: value === v ? C.grafite : C.neutro,
            boxShadow: value === v ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.12s',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function IconX() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12" /></svg>;
}

function IconMic() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="1" width="6" height="10" rx="3" />
      <path d="M3 9a7 7 0 0 0 14 0" />
      <path d="M10 16v3M7 19h6" />
    </svg>
  );
}

function IconPlay() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="3,1 13,7 3,13" fill="white" /></svg>;
}

function IconPlus() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}

function IconSearch() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4.5" /><path d="M13 13l-2.5-2.5" /></svg>;
}

function IconCheck() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l5 5 9-9" /></svg>;
}

// ─── Sheet components ──────────────────────────────────────────────────────────

function SheetBase({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: C.superficie, borderRadius: '24px 24px 0 0', padding: '0 20px 28px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '40px', height: '4px', backgroundColor: C.borda, borderRadius: '2px', margin: '12px auto 20px' }} />
      {children}
    </div>
  );
}

function DivergenciaRemocaoSheet({
  pessoa,
  motivo,
  onSelecionarMotivo,
  onConfirmar,
  onCancelar,
}: {
  pessoa: { nome: string; iniciais: string };
  motivo: string;
  onSelecionarMotivo: (m: string) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const [motivoOutro, setMotivoOutro] = useState('');
  const motivoFinal = motivo === 'Outro' ? motivoOutro.trim() || 'Outro' : motivo;

  return (
    <SheetBase>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '17px', fontWeight: 700, color: C.tinta, marginBottom: '6px' }}>
        Diferente do planejado
      </h3>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, lineHeight: '20px', marginBottom: '16px' }}>
        <strong>{pessoa.nome}</strong> estava planejado para esta obra hoje.
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: C.tintaFraca, marginBottom: '10px' }}>
        O que aconteceu?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        {MOTIVOS_REMOCAO.map((m) => (
          <button
            key={m}
            onClick={() => onSelecionarMotivo(m)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${motivo === m ? C.grafite : C.borda}`,
              backgroundColor: motivo === m ? '#F5F5F5' : C.superficie,
              fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, cursor: 'pointer', textAlign: 'left' as const,
            }}
          >
            <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${motivo === m ? C.grafite : C.borda}`, backgroundColor: motivo === m ? C.grafite : 'transparent', flexShrink: 0 }} />
            {m}
          </button>
        ))}
      </div>
      {motivo === 'Outro' && (
        <input
          autoFocus
          value={motivoOutro}
          onChange={(e) => setMotivoOutro(e.target.value)}
          placeholder="Descreva o motivo..."
          style={{ padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${C.borda}`, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, width: '100%', boxSizing: 'border-box' as const, outline: 'none', marginBottom: '12px' }}
        />
      )}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, lineHeight: '17px', marginBottom: '6px' }}>
        A Administração decidirá se o dia é pago.
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, lineHeight: '17px', marginBottom: '18px' }}>
        O planejamento será atualizado. Administração e Financeiro serão notificados.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => motivo && onConfirmar()}
          disabled={!motivo}
          style={{
            padding: '13px', borderRadius: '10px', border: 'none', cursor: motivo ? 'pointer' : 'not-allowed',
            backgroundColor: motivo ? C.tinta : C.borda,
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700,
            color: motivo ? C.superficie : C.neutro, transition: 'opacity 0.15s',
          }}
        >
          Confirmar
        </button>
        <button
          onClick={onCancelar}
          style={{ padding: '13px', borderRadius: '10px', border: `1.5px solid ${C.borda}`, backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </SheetBase>
  );
}

function DivergenciaAdicaoSheet({
  pessoa,
  onConfirmar,
  onCancelar,
}: {
  pessoa: { nome: string; iniciais: string };
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <SheetBase>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '17px', fontWeight: 700, color: C.tinta, marginBottom: '6px' }}>
        Diferente do planejado
      </h3>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, lineHeight: '20px', marginBottom: '12px' }}>
        <strong>{pessoa.nome}</strong> não estava planejado para esta obra hoje. Ele está alocado em outra obra.
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, lineHeight: '17px', marginBottom: '20px' }}>
        O planejamento será atualizado. Administração e Financeiro serão notificados.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onConfirmar}
          style={{ padding: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: C.tinta, fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: C.superficie }}
        >
          Confirmar
        </button>
        <button
          onClick={onCancelar}
          style={{ padding: '13px', borderRadius: '10px', border: `1.5px solid ${C.borda}`, backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </SheetBase>
  );
}

function BuscaWorkerSheet({
  disponíveis,
  buscarTexto,
  onBuscar,
  onSelecionar,
  onFechar,
}: {
  disponíveis: { id: string; nome: string; funcao: string }[];
  buscarTexto: string;
  onBuscar: (v: string) => void;
  onSelecionar: (id: string) => void;
  onFechar: () => void;
}) {
  const filtrados = disponíveis.filter(
    (p) =>
      buscarTexto === '' ||
      p.nome.toLowerCase().includes(buscarTexto.toLowerCase()) ||
      p.funcao.toLowerCase().includes(buscarTexto.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: C.superficie, borderRadius: '24px 24px 0 0', padding: '0 20px 28px', height: '60vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '40px', height: '4px', backgroundColor: C.borda, borderRadius: '2px', margin: '12px auto 16px' }} />
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, color: C.tinta, marginBottom: '12px' }}>
        Adicionar trabalhador
      </h3>
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: C.neutro }}>
          <IconSearch />
        </span>
        <input
          autoFocus
          value={buscarTexto}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscar por nome ou função..."
          style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px 10px 34px', borderRadius: '8px', border: `1.5px solid ${C.borda}`, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, outline: 'none', backgroundColor: C.fundo }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtrados.length === 0 ? (
          <p style={{ textAlign: 'center' as const, color: C.neutro, fontFamily: 'Inter, sans-serif', fontSize: '14px', padding: '24px 0' }}>
            Nenhuma pessoa encontrada
          </p>
        ) : (
          filtrados.map(({ id, nome, funcao }) => (
            <button
              key={id}
              onClick={() => onSelecionar(id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderBottom: `1px solid ${C.borda}`, textAlign: 'left' as const }}
            >
              <Avatar pessoaId={id} nome={nome} tamanho={36} />
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite }}>{nome}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>{funcao}</p>
              </div>
            </button>
          ))
        )}
      </div>
      <button
        onClick={onFechar}
        style={{ marginTop: '12px', padding: '13px', borderRadius: '10px', border: `1.5px solid ${C.borda}`, backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.grafite, cursor: 'pointer' }}
      >
        Cancelar
      </button>
    </div>
  );
}

function ConfirmacaoSheet({ contConfirmados, onClose }: { contConfirmados: number; onClose: () => void }) {
  return (
    <SheetBase>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' as const, padding: '8px 0 4px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: C.positivoFundo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.positivo }}>
          <IconCheck />
        </div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: C.tinta }}>
          Diário finalizado.
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, lineHeight: '21px' }}>
          {contConfirmados} presenças e {contConfirmados} diárias registradas.<br />
          O cliente já pode ver o diário de hoje.
        </p>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: C.acento, fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: C.tinta, marginTop: '4px' }}
        >
          OK
        </button>
      </div>
    </SheetBase>
  );
}

// ─── Recording wave animation ──────────────────────────────────────────────────

function WaveGravacao({ segundos }: { segundos: number }) {
  const heights = [16, 24, 32, 20, 28, 36, 22, 30, 18, 26];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '36px' }}>
        {heights.map((h, i) => (
          <div
            key={i}
            className={`wave-bar wave-bar-${i % 4}`}
            style={{
              width: '3px',
              height: `${h}px`,
              backgroundColor: '#C94141',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '14px', fontWeight: 600, color: '#C94141' }}>
        {formatarTimer(segundos)}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DiarioObra() {
  const { obraId } = useParams<{ obraId: string }>();
  const state = useStore();
  const obra = obraId ? obraPorSlug(state, obraId) : undefined;

  if (!obra) return null;
  if (obra.tipo === 'pequeno_servico') {
    return (
      <div style={{ padding: '48px 40px', fontFamily: 'Inter, sans-serif', color: C.neutro, fontSize: '14px', textAlign: 'center' as const }}>
        {obra.codigo} é um pequeno serviço e não tem Diário de Obra.
      </div>
    );
  }

  // key={obra.id} força remontagem completa ao trocar de obra, resetando o formulário
  return <DiarioObraConteudo key={obra.id} obraId={obra.id} obraCodigo={obra.codigo} />;
}

function DiarioObraConteudo({ obraId, obraCodigo }: { obraId: string; obraCodigo: string }) {
  const s = useStore();
  const finalizarDiario = useStore((st) => st.finalizarDiario);
  const perfilAtivo = s.perfil_ativo;
  const pessoaAtuante = perfilAtivo === 'gerente_obras' ? GERENTE_ID : perfilAtivo === 'financeiro' ? 'p03' : 'p01';

  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);
  const showSheet = useCallback((c: React.ReactNode) => setSheetContent(c), []);
  const hideSheet = useCallback(() => setSheetContent(null), []);

  const diarioIdHoje = s.diarios.find((d) => d.obra_id === obraId && d.data === HOJE)?.id ?? `d_${obraId}_${HOJE}`;
  const diario = s.diarios.find((d) => d.id === diarioIdHoje);
  const finalizado = diario?.estado === 'finalizado';

  // People helpers
  const pessoasMap = Object.fromEntries(s.pessoas.map((p) => [p.id, p]));

  // Pre-populate workers from published planejamento da obra em HOJE
  const planejadosHoje = s.planejamento.filter(
    (p) => p.obra_id === obraId && p.data === HOJE && p.estado === 'publicado'
  );

  // ── Form state (pre-finalization) ──
  const [houveExecucao, setHouveExecucao] = useState(true);
  const [motivoSemExecucao, setMotivoSemExecucao] = useState('');
  const [motivoOutroTexto, setMotivoOutroTexto] = useState('');
  const [workers, setWorkers] = useState<WorkerEntry[]>(() =>
    planejadosHoje.map((pl) => ({
      pessoa_id: pl.pessoa_id,
      periodo: 'dia_todo' as const,
      removido: false,
      eraPlanejado: true,
    }))
  );
  const [texto, setTexto] = useState('');
  const [gravacaoEstado, setGravacaoEstado] = useState<GravacaoEstado>('idle');
  const [segundosGravacao, setSegundosGravacao] = useState(0);
  const [textoTranscrito, setTextoTranscrito] = useState(false);
  const [fotosLocais, setFotosLocais] = useState<Media[]>(FOTOS_INICIAIS);
  const [sheetEstado, setSheetEstado] = useState<SheetEstado>(null);
  const [buscarTexto, setBuscarTexto] = useState('');

  const extraFotoIdxRef = useRef(0);

  // ── Recording timer ──
  useEffect(() => {
    if (gravacaoEstado !== 'gravando') return;
    const timer = setInterval(() => setSegundosGravacao((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [gravacaoEstado]);

  // ── Derived ──
  const confirmadosCount = workers.filter((w) => !w.removido).length;
  const totalCount = workers.length;

  // ── Handlers ──
  const handleTogglePeriodo = useCallback((pid: string, periodo: 'dia_todo' | 'manha' | 'tarde') => {
    setWorkers((prev) => prev.map((w) => (w.pessoa_id === pid ? { ...w, periodo } : w)));
  }, []);

  const handleRemoverWorker = useCallback((pid: string) => {
    const worker = workers.find((w) => w.pessoa_id === pid);
    if (!worker) return;
    if (worker.eraPlanejado) {
      setSheetEstado({ tipo: 'remocao', pessoa_id: pid, motivo: '' });
    } else {
      setWorkers((prev) => prev.filter((w) => w.pessoa_id !== pid));
    }
  }, [workers]);

  const handleDesfazerRemocao = useCallback((pid: string) => {
    setWorkers((prev) => prev.map((w) => (w.pessoa_id === pid ? { ...w, removido: false, motivoRemocao: undefined } : w)));
  }, []);

  const handleConfirmarRemocao = useCallback(() => {
    if (!sheetEstado || sheetEstado.tipo !== 'remocao') return;
    const { pessoa_id, motivo } = sheetEstado;
    const motivoFinal = motivo || 'Não especificado';
    setWorkers((prev) => prev.map((w) => (w.pessoa_id === pessoa_id ? { ...w, removido: true, motivoRemocao: motivoFinal } : w)));
    setSheetEstado(null);
    hideSheet();
  }, [sheetEstado, hideSheet]);

  const handleCancelarRemocao = useCallback(() => {
    setSheetEstado(null);
    hideSheet();
  }, [hideSheet]);

  const handleSelecionarWorker = useCallback((pid: string) => {
    setBuscarTexto('');
    const jaEstaAtivo = workers.some((w) => w.pessoa_id === pid && !w.removido);
    if (jaEstaAtivo) { setSheetEstado(null); hideSheet(); return; }

    // Check if planned in another obra today
    const emOutraObra = s.planejamento.some(
      (pl) => pl.pessoa_id === pid && pl.data === HOJE && pl.estado === 'publicado' && pl.obra_id && pl.obra_id !== obraId
    );

    if (emOutraObra) {
      setSheetEstado({ tipo: 'adicao', pessoa_id: pid });
    } else {
      const jaRemovido = workers.find((w) => w.pessoa_id === pid && w.removido);
      if (jaRemovido) {
        setWorkers((prev) => prev.map((w) => (w.pessoa_id === pid ? { ...w, removido: false, motivoRemocao: undefined } : w)));
      } else {
        setWorkers((prev) => [...prev, { pessoa_id: pid, periodo: 'dia_todo', removido: false, eraPlanejado: false }]);
      }
      setSheetEstado(null);
      hideSheet();
    }
  }, [workers, s.planejamento, hideSheet]);

  const handleConfirmarAdicao = useCallback(() => {
    if (!sheetEstado || sheetEstado.tipo !== 'adicao') return;
    const { pessoa_id } = sheetEstado;
    const jaRemovido = workers.find((w) => w.pessoa_id === pessoa_id && w.removido);
    if (jaRemovido) {
      setWorkers((prev) => prev.map((w) => (w.pessoa_id === pessoa_id ? { ...w, removido: false, motivoRemocao: undefined } : w)));
    } else {
      setWorkers((prev) => [...prev, { pessoa_id: pessoa_id, periodo: 'dia_todo', removido: false, eraPlanejado: false }]);
    }
    setSheetEstado(null);
    hideSheet();
  }, [sheetEstado, workers, hideSheet]);

  const handleToggleGravacao = useCallback(() => {
    if (gravacaoEstado === 'idle' || gravacaoEstado === 'transcrito') {
      setGravacaoEstado('gravando');
      setSegundosGravacao(0);
    } else if (gravacaoEstado === 'gravando') {
      setGravacaoEstado('transcrevendo');
      setTimeout(() => {
        setTexto(TEXTO_TRANSCRITO);
        setTextoTranscrito(true);
        setGravacaoEstado('transcrito');
      }, 2000);
    }
  }, [gravacaoEstado]);

  const handleAdicionarFoto = useCallback(() => {
    const url = FOTOS_EXTRA[extraFotoIdxRef.current % FOTOS_EXTRA.length];
    extraFotoIdxRef.current += 1;
    setFotosLocais((prev) => [{ url, tipo: 'foto' }, ...prev]);
  }, []);

  const handleFinalizar = useCallback(() => {
    const confirmados = workers
      .filter((w) => !w.removido)
      .map((w) => ({ pessoa_id: w.pessoa_id, periodo: w.periodo }));

    const removidosPlanejados = workers
      .filter((w) => w.removido && w.eraPlanejado)
      .map((w) => ({ pessoa_id: w.pessoa_id, motivo: w.motivoRemocao ?? 'Não especificado' }));

    const motivoFinalSemExecucao = !houveExecucao
      ? motivoSemExecucao === 'Outro' ? motivoOutroTexto.trim() || 'Outro' : motivoSemExecucao
      : undefined;

    finalizarDiario({
      diario_id: diarioIdHoje,
      obra_id: obraId,
      data: HOJE,
      texto_linhas: texto ? texto.split('\n').filter((l) => l.trim()) : [],
      fotos: fotosLocais.map((f) => f.url),
      confirmados,
      removidos_planejados: removidosPlanejados,
      finalizado_por: pessoaAtuante,
      houve_execucao: houveExecucao,
      motivo_sem_execucao: motivoFinalSemExecucao,
    });

    const cont = confirmados.length;
    showSheet(<ConfirmacaoSheet contConfirmados={cont} onClose={hideSheet} />);
  }, [workers, texto, fotosLocais, houveExecucao, motivoSemExecucao, motivoOutroTexto, diarioIdHoje, obraId, pessoaAtuante, finalizarDiario, showSheet, hideSheet]);

  const handleSalvarRascunho = useCallback(() => {
    showSheet(
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '120px' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#FFFFFF', padding: '10px 20px', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500 }}>
          Rascunho salvo
        </div>
      </div>
    );
    setTimeout(hideSheet, 1600);
  }, [showSheet, hideSheet]);

  // ── Sheet updates ──
  useEffect(() => {
    if (!sheetEstado) { hideSheet(); return; }

    if (sheetEstado.tipo === 'remocao') {
      const pessoa = pessoasMap[sheetEstado.pessoa_id];
      if (!pessoa) return;
      showSheet(
        <DivergenciaRemocaoSheet
          pessoa={pessoa}
          motivo={sheetEstado.motivo}
          onSelecionarMotivo={(m) => setSheetEstado((prev) => prev && prev.tipo === 'remocao' ? { ...prev, motivo: m } : prev)}
          onConfirmar={handleConfirmarRemocao}
          onCancelar={handleCancelarRemocao}
        />
      );
    } else if (sheetEstado.tipo === 'adicao') {
      const pessoa = pessoasMap[sheetEstado.pessoa_id];
      if (!pessoa) return;
      showSheet(
        <DivergenciaAdicaoSheet
          pessoa={pessoa}
          onConfirmar={handleConfirmarAdicao}
          onCancelar={() => { setSheetEstado(null); hideSheet(); }}
        />
      );
    } else if (sheetEstado.tipo === 'busca') {
      const ativosIds = new Set(workers.filter((w) => !w.removido).map((w) => w.pessoa_id));
      const disponíveis = s.pessoas
        .filter((p) => p.ativo && !ativosIds.has(p.id))
        .map((p) => ({ id: p.id, nome: p.nome, funcao: p.funcao }));
      showSheet(
        <BuscaWorkerSheet
          disponíveis={disponíveis}
          buscarTexto={buscarTexto}
          onBuscar={(v) => setBuscarTexto(v)}
          onSelecionar={handleSelecionarWorker}
          onFechar={() => { setSheetEstado(null); setBuscarTexto(''); hideSheet(); }}
        />
      );
    }
  }, [sheetEstado, buscarTexto, workers, pessoasMap, showSheet, hideSheet, handleConfirmarRemocao, handleCancelarRemocao, handleConfirmarAdicao, handleSelecionarWorker, s.pessoas]);

  const cabecalho = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' as const, gap: '12px' }}>
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: C.tinta, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Diário de hoje
        </h1>
        <p style={{ margin: 0, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.tintaFraca }}>{obraCodigo} ·</span>
          <DataComDiaSemana data={HOJE} />
        </p>
      </div>
      <span style={{
        fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600,
        color: finalizado ? '#207A46' : C.tintaFraca, backgroundColor: finalizado ? C.positivoFundo : '#F0F0F0',
        padding: '3px 10px', borderRadius: '999px',
      }}>
        {finalizado ? 'Finalizado' : 'Rascunho'}
      </span>
    </div>
  );

  const overlaySheet = sheetContent && (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.52)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={hideSheet}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
        {sheetContent}
      </div>
    </div>
  );

  // ── Read-only view ──
  if (finalizado && diario) {
    const finalizadoPorPessoa = diario.finalizado_por ? pessoasMap[diario.finalizado_por] : null;
    const finalizadoEmFmt = diario.finalizado_em ? formatarFinalizadoEm(diario.finalizado_em) : '—';
    const presencasFinais = s.presencas.filter((p) => p.diario_id === diarioIdHoje);

    return (
      <div style={{ padding: '28px 40px 80px', fontFamily: 'Inter, sans-serif', backgroundColor: C.fundo, minHeight: '100%' }}>
        {cabecalho}
        <div style={{ maxWidth: '640px', backgroundColor: C.superficie, borderRadius: '12px', border: `1px solid ${C.borda}`, overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{ backgroundColor: C.infoFundo, padding: '10px 16px', borderBottom: `1px solid #D0E4FF` }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.info, lineHeight: '17px' }}>
            Diário finalizado em {finalizadoEmFmt} por {finalizadoPorPessoa?.nome ?? '—'}. Alterações somente pela Administração.
          </p>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Houve execução */}
          <div>
            <TituloSecao margemInferior={12}>Houve trabalho</TituloSecao>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite }}>
              {diario.houve_execucao === false ? 'Não teve execução' : 'Sim, teve execução'}
            </span>
            {diario.motivo_sem_execucao && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.tintaFraca, marginTop: '4px' }}>{diario.motivo_sem_execucao}</p>
            )}
          </div>
          {/* Quem trabalhou */}
          {presencasFinais.length > 0 && (
            <div>
              <TituloSecao margemInferior={12}>Quem trabalhou</TituloSecao>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {presencasFinais.map((pr, i) => {
                  const p = pessoasMap[pr.pessoa_id];
                  if (!p) return null;
                  const periodoLabel = pr.periodo === 'dia_todo' ? 'Dia todo' : pr.periodo === 'manha' ? 'Manhã' : 'Tarde';
                  return (
                    <div key={pr.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < presencasFinais.length - 1 ? `1px solid ${C.borda}` : 'none' }}>
                      <Avatar pessoaId={p.id} nome={p.nome} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite }}>{p.nome}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>{p.funcao}</p>
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>{periodoLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Relato */}
          {diario.texto.length > 0 && (
            <div>
              <TituloSecao margemInferior={12}>O que foi executado</TituloSecao>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, lineHeight: '21px', whiteSpace: 'pre-wrap' as const }}>
                {diario.texto.join('\n')}
              </p>
            </div>
          )}
          {/* Fotos */}
          {diario.fotos.length > 0 && (
            <div>
              <TituloSecao margemInferior={12}>{diario.fotos.length} fotos</TituloSecao>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {diario.fotos.slice(0, 9).map((url, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#CCCCCC' }}>
                    <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
        {overlaySheet}
      </div>
    );
  }

  // ── Form view ──
  const fotosCount = fotosLocais.filter((f) => f.tipo === 'foto').length;
  const videosCount = fotosLocais.filter((f) => f.tipo === 'video').length;

  return (
    <div style={{ padding: '28px 40px 80px', fontFamily: 'Inter, sans-serif', backgroundColor: C.fundo, minHeight: '100%' }}>
      {cabecalho}
      <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Section 3: Houve trabalho hoje? ── */}
      <div>
        <TituloSecao margemInferior={12}>Houve trabalho hoje?</TituloSecao>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: true, label: 'Sim, teve execução' },
            { value: false, label: 'Não teve execução' },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => setHouveExecucao(value)}
              style={{
                flex: 1, padding: '13px 8px', borderRadius: '10px',
                border: `2px solid ${houveExecucao === value ? C.grafite : C.borda}`,
                backgroundColor: houveExecucao === value ? '#F5F5F5' : C.superficie,
                fontFamily: 'Inter, sans-serif', fontSize: '13px',
                fontWeight: houveExecucao === value ? 700 : 400,
                color: houveExecucao === value ? C.tinta : C.tintaFraca,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section for "não teve execução" ── */}
      {!houveExecucao && (
        <div>
          <TituloSecao margemInferior={12}>Motivo</TituloSecao>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MOTIVOS_SEM_EXECUCAO.map((m) => (
              <button
                key={m}
                onClick={() => setMotivoSemExecucao(m)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 12px', borderRadius: '8px',
                  border: `1.5px solid ${motivoSemExecucao === m ? C.grafite : C.borda}`,
                  backgroundColor: motivoSemExecucao === m ? '#F5F5F5' : C.superficie,
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite,
                  cursor: 'pointer', textAlign: 'left' as const,
                }}
              >
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${motivoSemExecucao === m ? C.grafite : C.borda}`, backgroundColor: motivoSemExecucao === m ? C.grafite : 'transparent', flexShrink: 0 }} />
                {m}
              </button>
            ))}
            {motivoSemExecucao === 'Outro' && (
              <input
                autoFocus
                value={motivoOutroTexto}
                onChange={(e) => setMotivoOutroTexto(e.target.value)}
                placeholder="Descreva o motivo..."
                style={{ padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${C.borda}`, fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.grafite, outline: 'none', marginTop: '4px' }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Sections 4–6: only when houveExecucao ── */}
      {houveExecucao && (
        <>
          {/* ── Section 4: Quem trabalhou hoje ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.tintaFraca }}>
                Quem trabalhou hoje
              </p>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: C.grafite }}>
                {confirmadosCount} de {totalCount} confirmados
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {workers.map((w, i) => {
                const p = pessoasMap[w.pessoa_id];
                if (!p) return null;
                return (
                  <div
                    key={w.pessoa_id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 0',
                      borderBottom: i < workers.length - 1 ? `1px solid ${C.borda}` : 'none',
                      opacity: w.removido ? 0.45 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Avatar pessoaId={p.id} nome={p.nome} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: C.grafite, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.tintaFraca, marginTop: '1px' }}>
                        {w.removido ? w.motivoRemocao ?? 'Removido' : p.funcao}
                      </p>
                    </div>
                    {w.removido ? (
                      <button
                        onClick={() => handleDesfazerRemocao(w.pessoa_id)}
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: C.info, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                      >
                        Desfazer
                      </button>
                    ) : (
                      <>
                        <PillSelector
                          value={w.periodo}
                          onChange={(v) => handleTogglePeriodo(w.pessoa_id, v)}
                        />
                        <button
                          onClick={() => handleRemoverWorker(w.pessoa_id)}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${C.borda}`, backgroundColor: C.superficie, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.neutro, flexShrink: 0 }}
                        >
                          <IconX />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSheetEstado({ tipo: 'busca' })}
              style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '10px', border: `1.5px dashed ${C.borda}`, backgroundColor: C.superficie, fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: C.tintaFraca, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Adicionar quem veio
            </button>
          </div>

          {/* ── Section 5: O que foi executado ── */}
          <div>
            <TituloSecao margemInferior={12}>O que foi executado</TituloSecao>

            {/* Recording button */}
            {gravacaoEstado !== 'transcrito' && (
              <button
                onClick={handleToggleGravacao}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  backgroundColor: gravacaoEstado === 'gravando' ? '#FFF0F0' : gravacaoEstado === 'transcrevendo' ? '#F0F0F0' : C.tinta,
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '10px', transition: 'background-color 0.2s',
                }}
              >
                {gravacaoEstado === 'idle' && (
                  <>
                    <span style={{ color: C.superficie }}><IconMic /></span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.superficie }}>
                      Gravar relato de voz
                    </span>
                  </>
                )}
                {gravacaoEstado === 'gravando' && (
                  <>
                    <WaveGravacao segundos={segundosGravacao} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#C94141', whiteSpace: 'nowrap' as const }}>
                      Gravando... toque para parar
                    </span>
                  </>
                )}
                {gravacaoEstado === 'transcrevendo' && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: C.grafite, width: '100%', textAlign: 'center' as const }}>
                    Transcrevendo e organizando...
                  </span>
                )}
              </button>
            )}

            {/* Transcription note */}
            {textoTranscrito && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca, marginBottom: '6px', lineHeight: '17px' }}>
                Transcrito e organizado automaticamente · toque para editar
              </p>
            )}

            <textarea
              value={texto}
              onChange={(e) => { setTexto(e.target.value); if (textoTranscrito) setTextoTranscrito(false); }}
              placeholder="Descreva o que foi feito hoje..."
              rows={6}
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                padding: '12px', borderRadius: '10px',
                border: `1.5px solid ${textoTranscrito ? C.borda : C.borda}`,
                fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '20px',
                color: C.grafite, resize: 'vertical' as const,
                outline: 'none', backgroundColor: C.superficie,
              }}
            />
          </div>

          {/* ── Section 6: Fotos e vídeos ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: C.tintaFraca }}>
                Fotos e vídeos
              </p>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.tintaFraca }}>
                {fotosCount} {fotosCount === 1 ? 'foto' : 'fotos'} · {videosCount} {videosCount === 1 ? 'vídeo' : 'vídeos'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {/* Add button */}
              <button
                onClick={handleAdicionarFoto}
                style={{
                  aspectRatio: '1', borderRadius: '8px',
                  border: `2px dashed ${C.borda}`, backgroundColor: C.superficie,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.neutro,
                }}
              >
                <IconPlus />
              </button>
              {fotosLocais.map((media, i) => (
                <div key={`${media.url}-${i}`} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', position: 'relative', backgroundColor: '#CCCCCC' }}>
                  <img src={media.url} alt={`${media.tipo === 'video' ? 'Vídeo' : 'Foto'} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' }} />
                  {media.tipo === 'video' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconPlay />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Ações ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '20px', borderTop: `1px solid ${C.borda}` }}>
        <button
          onClick={handleFinalizar}
          style={{ padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: C.acento, fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: C.tinta, letterSpacing: '-0.01em' }}
        >
          Finalizar diário
        </button>
        <button
          onClick={handleSalvarRascunho}
          style={{ padding: '12px', borderRadius: '10px', border: `1.5px solid ${C.borda}`, backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, color: C.grafite, cursor: 'pointer' }}
        >
          Salvar rascunho
        </button>
      </div>
      </div>
      {overlaySheet}
    </div>
  );
}
