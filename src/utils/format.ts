// Coloca as barras sozinho enquanto a pessoa digita: 01011990 -> 01/01/1990.
export function maskDate(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export const fmtInt = (n: number) => n.toLocaleString('pt-BR');

// Valida dd/mm/aaaa. Devolve a mensagem de erro ou null quando está tudo certo
// (ou quando ainda está incompleta e `partialOk` é verdadeiro).
export function birthDateError(v: string, partialOk = true): string | null {
  if (v.length < 10) return partialOk ? null : 'Digite sua data de nascimento completa.';
  const [dd, mm, yyyy] = v.split('/').map(Number);
  const dt = new Date(yyyy, mm - 1, dd);
  const valid = dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
  if (!valid) return 'Data inválida. Confira dia, mês e ano.';
  const year = new Date().getFullYear();
  if (yyyy < year - 100 || dt > new Date()) return 'Confira o ano de nascimento.';
  return null;
}
