import type { AmortizacionRow } from '@/types';

/**
 * Calcula la cuota mensual usando la fórmula francesa.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calcularCuotaMensual(
  saldo: number,
  tasaAnual: number,
  mesesRestantes: number,
): number {
  if (mesesRestantes <= 0) return Math.round(saldo * 100) / 100;
  const r = tasaAnual / 12 / 100;
  if (r === 0) return Math.round((saldo / mesesRestantes) * 100) / 100;
  const factor = Math.pow(1 + r, mesesRestantes);
  const cuota = (saldo * r * factor) / (factor - 1);
  return Math.round(cuota * 100) / 100;
}

/**
 * Genera la tabla de amortización mes a mes.
 */
export function calcularTablaAmortizacion(
  saldo: number,
  tasaAnual: number,
  mesesRestantes: number,
  cuotaMensual?: number,
): AmortizacionRow[] {
  const r = tasaAnual / 12 / 100;
  const cuota = cuotaMensual ?? calcularCuotaMensual(saldo, tasaAnual, mesesRestantes);
  const rows: AmortizacionRow[] = [];

  let saldoActual = saldo;
  let mes = 1;

  while (saldoActual > 0.01 && mes <= 600) {
    const interes = saldoActual * r;
    const capital = Math.min(cuota - interes, saldoActual);
    const pagoReal = capital + interes;
    saldoActual = Math.max(saldoActual - capital, 0);

    rows.push({
      mes,
      cuota: Math.round(pagoReal * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      capital: Math.round(capital * 100) / 100,
      saldoRestante: Math.round(saldoActual * 100) / 100,
    });
    mes++;
  }

  return rows;
}

/**
 * Calcula el interés total que se pagará.
 */
export function calcularInteresTotal(tabla: AmortizacionRow[]): number {
  return tabla.reduce((acc, row) => acc + row.interes, 0);
}
