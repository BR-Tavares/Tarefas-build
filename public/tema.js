// Gerenciador de Tema e Cores de Fundo Pastel com Alto Contraste
// Suporta: amarelo, bege, verde, azul, cinza e padrao (branco/cinza neutro)
// Otimizado para leitura em celulares ao ar livre sob luz solar direta.

export const TEMAS_PASTEL = {
  amarelo: {
    id: 'amarelo',
    nome: 'Amarelo pastel',
    corAmostra: '#FFF9D2',
    bg: '#FBF3C4',
    surface: '#FFFDEB',
    border: '#E8DC94',
    borderStrong: '#A89940',
  },
  bege: {
    id: 'bege',
    nome: 'Bege pastel',
    corAmostra: '#F5ECE1',
    bg: '#EDE0D0',
    surface: '#FAF5EE',
    border: '#DAC7B2',
    borderStrong: '#998368',
  },
  verde: {
    id: 'verde',
    nome: 'Verde pastel',
    corAmostra: '#E2F3E5',
    bg: '#D5ECD9',
    surface: '#EDF8EE',
    border: '#AFD7B6',
    borderStrong: '#5E9B68',
  },
  azul: {
    id: 'azul',
    nome: 'Azul pastel',
    corAmostra: '#E0F0FE',
    bg: '#D2E7FA',
    surface: '#ECF5FD',
    border: '#A9CEF3',
    borderStrong: '#518CC4',
  },
  cinza: {
    id: 'cinza',
    nome: 'Cinza claro',
    corAmostra: '#EAECEF',
    bg: '#DFE2E6',
    surface: '#F4F5F7',
    border: '#BCC1C8',
    borderStrong: '#767C85',
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
        title="Fundo ${t.nome}"
        aria-label="Fundo ${t.nome}"
        aria-pressed="${t.id === temaAtivoId ? 'true' : 'false'}"
        style="background:${t.corAmostra};"
      ></button>
    `
    )
    .join('');

  return `
    <div class="paleta-fundo-container" title="Escolha a cor do fundo para facilitar a leitura ao ar livre">
      <span class="paleta-rotulo">Fundo:</span>
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
