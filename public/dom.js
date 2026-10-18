// Utilitários seguros de DOM e formatação

export function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function mostrarAviso(mensagem, tipo = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText =
      'position:fixed;bottom:16px;right:16px;left:16px;max-width:400px;margin:0 auto;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  const bg = tipo === 'erro' ? '#C62828' : tipo === 'sucesso' ? '#2E7D32' : '#1F2328';
  el.style.cssText = `background:${bg};color:#fff;padding:10px 14px;border-radius:10px;font-size:12.5px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.18);pointer-events:auto;`;
  el.textContent = mensagem;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3200);
}
