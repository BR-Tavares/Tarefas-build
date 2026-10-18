// Feriados nacionais (2026 e 2027) pré-carregados ao criar a equipe
// e utilitários de data no fuso America/Sao_Paulo.

export const FERIADOS_NACIONAIS_PADRAO = [
  // 2026
  '2026-01-01', // Confraternização Universal
  '2026-02-16', // Carnaval
  '2026-02-17', // Carnaval
  '2026-04-03', // Paixão de Cristo
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-06-04', // Corpus Christi
  '2026-09-07', // Independência do Brasil
  '2026-10-12', // Nossa Senhora Aparecida
  '2026-11-02', // Finados
  '2026-11-15', // Proclamação da República
  '2026-11-20', // Dia Nacional de Zumbi e da Consciência Negra
  '2026-12-25', // Natal
  // 2027
  '2027-01-01', // Confraternização Universal
  '2027-02-08', // Carnaval
  '2027-02-09', // Carnaval
  '2027-03-26', // Paixão de Cristo
  '2027-04-21', // Tiradentes
  '2027-05-01', // Dia do Trabalho
  '2027-05-27', // Corpus Christi
  '2027-09-07', // Independência do Brasil
  '2027-10-12', // Nossa Senhora Aparecida
  '2027-11-02', // Finados
  '2027-11-15', // Proclamação da República
  '2027-11-20', // Dia Nacional de Zumbi e da Consciência Negra
  '2027-12-25', // Natal
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Retorna a data de hoje no fuso America/Sao_Paulo no formato AAAA-MM-DD.
export function hojeSP() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = partes.find((p) => p.type === 'year').value;
  const m = partes.find((p) => p.type === 'month').value;
  const d = partes.find((p) => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

// Formata '2026-10-22' -> '22/10'
export function formatarDataCurta(iso) {
  if (!iso || iso.length < 10) return '—';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

// Formata '2026-10-22' -> '22/10/2026'
export function formatarDataCompleta(iso) {
  if (!iso || iso.length < 10) return '—';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

// Formata '2026-10-22' -> 'Qui 22/10' (como no esboço tela_missao_funcionario.svg)
export function formatarDiaRegistro(iso) {
  if (!iso || iso.length < 10) return '—';
  const dt = new Date(iso.slice(0, 10) + 'T12:00:00Z');
  const sem = DIAS_SEMANA[dt.getUTCDay()];
  return `${sem} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}
