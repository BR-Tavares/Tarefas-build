// Gerenciador de Tema e Cores de Fundo Pastel com Alto Contraste
// Suporta: amarelo, bege, verde, azul, cinza
// Altera tanto o fundo da interface (--bg) quanto o fundo da própria folha e de seus cartões (--surface),
// com amostras bem diferenciadas e visíveis.

export const TEMAS_PASTEL = {
  amarelo: {
    id: 'amarelo',
    nome: 'Amarelo pastel',
    corAmostra: '#FDE047', // amarelo vibrante e inconfundível no botão
    bg: '#FEF9C3',        // fundo externo da tela
    surface: '#FEF08A',   // fundo da folha e cartões (amarelo pastel nítido)
    surfaceInner: '#FEF9C3',
    border: '#EAB308',
    borderStrong: '#CA8A04',
  },
  bege: {
    id: 'bege',
    nome: 'Bege pastel',
    corAmostra: '#D7BA89', // bege/areia nítido
    bg: '#F5EBE1',
    surface: '#EAD7C0',   // fundo da folha e cartões (bege pastel nítido)
    surfaceInner: '#F5EBE1',
    border: '#C8A97E',
    borderStrong: '#997345',
  },
  verde: {
    id: 'verde',
    nome: 'Verde pastel',
    corAmostra: '#86EFAC', // verde pastel nítido
    bg: '#DCFCE7',
    surface: '#BBF7D0',   // fundo da folha e cartões (verde pastel nítido)
    surfaceInner: '#DCFCE7',
    border: '#4ADE80',
    borderStrong: '#16A34A',
  },
  azul: {
    id: 'azul',
    nome: 'Azul pastel',
    corAmostra: '#93C5FD', // azul celeste nítido
    bg: '#DBEAFE',
    surface: '#BFDBFE',   // fundo da folha e cartões (azul pastel nítido)
    surfaceInner: '#DBEAFE',
    border: '#60A5FA',
    borderStrong: '#2563EB',
  },
  cinza: {
    id: 'cinza',
    nome: 'Cinza claro',
    corAmostra: '#CBD5E1', // cinza nítido
    bg: '#F1F5F9',
    surface: '#E2E8F0',   // fundo da folha e cartões (cinza pastel nítido)
    surfaceInner: '#F8FAFC',
    border: '#94A3B8',
    borderStrong: '#475569',
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
        title="Fundo da folha: ${t.nome}"
        aria-label="Fundo da folha: ${t.nome}"
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
