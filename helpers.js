export function formatCurrencyInput(value) {
  if (!Number(value) && value !== 0 && value !== "0") return "";

  const amount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return `${amount}`;
}
