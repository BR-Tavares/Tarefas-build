// Gerenciador de Tema e Cores de Fundo com Tons Mais Escuros e Profundos (Local)
// Suporta: amarelo, bege, verde, azul, cinza
// Altera tanto o fundo da interface (--bg) quanto o fundo da própria folha e de seus cartões (--surface),
// mantendo contraste absoluto para o texto preto e leitura clara.

export const TEMAS_PASTEL = {
  amarelo: {
    id: 'amarelo',
    nome: 'Amarelo ocre/mostarda',
    corAmostra: '#EAB308', // amarelo mais fechado/escuro
    bg: '#FDE047',        // fundo externo mais encorpado
    surface: '#FACC15',   // folha e cartões amarelo mais escuro
    surfaceInner: '#FEF08A',
    border: '#CA8A04',
    borderStrong: '#854D0E',
  },
  bege: {
    id: 'bege',
    nome: 'Bege camelo/areia escuro',
    corAmostra: '#C19A6B', // bege bem mais escuro
    bg: '#E5D3BD',
    surface: '#D2B48C',   // folha e cartões bege mais escuro/encorpado
    surfaceInner: '#EAD7C0',
    border: '#A88456',
    borderStrong: '#6E4E27',
  },
  verde: {
    id: 'verde',
    nome: 'Verde sálvia/oliva claro',
    corAmostra: '#4ADE80', // verde mais fechado
    bg: '#86EFAC',
    surface: '#4ADE80',   // folha e cartões verde mais escuro/visível
    surfaceInner: '#BBF7D0',
    border: '#16A34A',
    borderStrong: '#14532D',
  },
  azul: {
    id: 'azul',
    nome: 'Azul jeans/aço',
    corAmostra: '#60A5FA', // azul mais encorpado
    bg: '#93C5FD',
    surface: '#60A5FA',   // folha e cartões azul mais escuro
    surfaceInner: '#BFDBFE',
    border: '#2563EB',
    borderStrong: '#1E3A8A',
  },
  cinza: {
    id: 'cinza',
    nome: 'Cinza chumbo claro',
    corAmostra: '#94A3B8', // cinza mais escuro
    bg: '#CBD5E1',
    surface: '#94A3B8',   // folha e cartões cinza médio
    surfaceInner: '#E2E8F0',
    border: '#64748B',
    borderStrong: '#334155',
  },
};

const CHAVE_STORAGE = 'tarefas_tema_fundo';

export function obterTemaAtual() {
  try {
    return localStorage.getItem(CHAVE_STORAGE) || 'amarelo';
  } catch {
    return 'amarelo';
  }
}

export function aplicarTema(idTema) {
  const tema = TEMAS_PASTEL[idTema] || TEMAS_PASTEL.amarelo;
  const root = document.documentElement;

  root.style.setProperty('--bg', tema.bg);
  root.style.setProperty('--surface', tema.surface);
  root.style.setProperty('--surface-inner', tema.surfaceInner || tema.bg);
  root.style.setProperty('--border', tema.border);
  root.style.setProperty('--border-strong', tema.borderStrong);
  root.setAttribute('data-tema', tema.id);

  try {
    localStorage.setItem(CHAVE_STORAGE, tema.id);
  } catch {}

  // Atualiza botões ativos na UI
  document.querySelectorAll('.paleta-cor-quadrado').forEach((el) => {
    const ativo = el.getAttribute('data-tema-id') === tema.id;
    el.classList.toggle('ativo', ativo);
    el.setAttribute('aria-pressed', ativo ? 'true' : 'false');
  });
}

// Inicia tema assim que o módulo é importado
aplicarTema(obterTemaAtual());

export function renderizarSeletorTemaHTML(temaAtivoId = obterTemaAtual()) {
  const opcoes = Object.values(TEMAS_PASTEL)
    .map(
      (t) => `
      <button
        type="button"
        class="paleta-cor-quadrado ${t.id === temaAtivoId ? 'ativo' : ''}"
        data-tema-id="${t.id}"
        title="Cor da folha: ${t.nome}"
        aria-label="Cor da folha: ${t.nome}"
        aria-pressed="${t.id === temaAtivoId ? 'true' : 'false'}"
        style="background:${t.corAmostra} !important;"
      ></button>
    `
    )
    .join('');

  return `
    <div class="paleta-fundo-container" title="Escolha a cor da folha para facilitar a leitura ao ar livre">
      <span class="paleta-rotulo">Cor da folha:</span>
      <div class="paleta-cores-grade">
        ${opcoes}
      </div>
    </div>
  `;
}

export function conectarEventosSeletorTema(container = document) {
  container.querySelectorAll('.paleta-cor-quadrado').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-tema-id');
      if (id) {
        aplicarTema(id);
      }
    });
  });
}
