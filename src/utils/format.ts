// Coloca as barras sozinho enquanto a pessoa digita: 01011990 -> 01/01/1990.
export function maskDate(text: string) {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export const fmtInt = (n: number) => n.toLocaleString('pt-BR');
