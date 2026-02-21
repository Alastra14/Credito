import type { Credito, EstrategiaDetalle, ResultadoEstrategias } from '@/types';
import { calcularCuotaMensual } from './amortizacion';

interface CreditoSim {
  id: string;
  nombre: string;
  saldo: number;
  tasa: number;
  pagoMinimo: number;
}

function simularEstrategia(
  creditosInput: Credito[],
  presupuesto: number,
  ordenarPor: 'tasa' | 'saldo',
  nombreEstrategia: string,
): EstrategiaDetalle {
  const creditos: CreditoSim[] = creditosInput
    .filter(c => c.estado === 'activo' && c.saldoActual > 0)
    .map(c => ({
      id: c.id,
      nombre: c.nombre,
      saldo: c.saldoActual,
      tasa: c.tasaAnual,
      pagoMinimo:
        c.pagoMinimo ??
        c.cuotaMensual ??
        calcularCuotaMensual(c.saldoActual, c.tasaAnual, c.plazoMeses ?? 60),
    }));

  if (creditos.length === 0) {
    return {
      nombre: nombreEstrategia,
      ordenCreditos: [],
      mesesTotal: 0,
      interesTotal: 0,
      costoTotal: 0,
    };
  }

  // Ordenar según la estrategia
  if (ordenarPor === 'tasa') {
    creditos.sort((a, b) => b.tasa - a.tasa);
  } else {
    creditos.sort((a, b) => a.saldo - b.saldo);
  }

  const saldos: Record<string, number> = {};
  creditos.forEach(c => { saldos[c.id] = c.saldo; });

  let interesTotal = 0;
  let costoTotal = 0;
  let mes = 0;
  const MAX_MESES = 600;

  while (mes < MAX_MESES) {
    const activos = creditos.filter(c => saldos[c.id] > 0.01);
    if (activos.length === 0) break;
    mes++;

    // Calcular intereses del mes y aplicar pagos mínimos
    let totalMinimos = 0;
    activos.forEach(c => {
      totalMinimos += Math.min(c.pagoMinimo, saldos[c.id]);
    });

    const excedente = Math.max(presupuesto - totalMinimos, 0);

    activos.forEach(c => {
      const interesMes = (saldos[c.id] * c.tasa) / 12 / 100;
      interesTotal += interesMes;
      saldos[c.id] += interesMes;

      const minimo = Math.min(c.pagoMinimo, saldos[c.id]);
      saldos[c.id] -= minimo;
      costoTotal += minimo;
    });

    // Aplicar excedente al primer crédito activo (objetivo de la estrategia)
    let excedentePendiente = excedente;
    for (const c of activos) {
      if (excedentePendiente <= 0 || saldos[c.id] <= 0) break;
      const extra = Math.min(excedentePendiente, saldos[c.id]);
      saldos[c.id] -= extra;
      costoTotal += extra;
      excedentePendiente -= extra;
    }

    activos.forEach(c => {
      saldos[c.id] = Math.max(saldos[c.id], 0);
    });
  }

  return {
    nombre: nombreEstrategia,
    ordenCreditos: creditos.map(c => c.nombre),
    mesesTotal: mes,
    interesTotal: Math.round(interesTotal * 100) / 100,
    costoTotal: Math.round(costoTotal * 100) / 100,
  };
}

export function calcularEstrategias(
  creditos: Credito[],
  presupuesto: number,
): ResultadoEstrategias {
  const avalancha = simularEstrategia(creditos, presupuesto, 'tasa', 'Avalancha');
  const bolaNieve = simularEstrategia(creditos, presupuesto, 'saldo', 'Bola de nieve');
  return { avalancha, bolaNieve };
}
