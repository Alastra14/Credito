import type { Credito } from '@/types';
import { calcularTablaAmortizacion, calcularCuotaMensual } from './amortizacion';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ProyeccionMes {
  mes: number;
  fecha: string;
  saldoRestante: number;
  saldoFinal: number; // alias de saldoRestante para la gráfica
  cuota: number;
  interes: number;
  capital: number;
}

export interface ProyeccionCredito {
  id: string;          // alias de creditoId para la gráfica
  nombre: string;      // alias de creditoNombre para la gráfica
  creditoId: string;
  creditoNombre: string;
  meses: ProyeccionMes[];
  fechaFinalizacion: string;
  interesTotal: number;
  costoTotal: number;
}

export function calcularProyeccion(
  credito: Credito,
  pagoExtra = 0,
): ProyeccionCredito {
  const cuotaBase =
    (credito.cuotaMensual ??
      calcularCuotaMensual(credito.saldoActual, credito.tasaAnual, credito.plazoMeses ?? 360)) +
    pagoExtra;
  const tabla = calcularTablaAmortizacion(
    credito.saldoActual,
    credito.tasaAnual,
    credito.plazoMeses ?? 360,
    cuotaBase,
  );

  const hoy = new Date();
  const meses: ProyeccionMes[] = tabla.map((row, i) => ({
    mes: row.mes,
    fecha: format(addMonths(hoy, i + 1), 'MMM yyyy', { locale: es }),
    saldoRestante: row.saldoRestante,
    saldoFinal: row.saldoRestante,
    cuota: row.cuota,
    interes: row.interes,
    capital: row.capital,
  }));

  const fechaFin = addMonths(hoy, tabla.length);
  const interesTotal = tabla.reduce((a, r) => a + r.interes, 0);
  const costoTotal = tabla.reduce((a, r) => a + r.cuota, 0);

  return {
    id: credito.id,
    nombre: credito.nombre,
    creditoId: credito.id,
    creditoNombre: credito.nombre,
    meses,
    fechaFinalizacion: format(fechaFin, 'MMMM yyyy', { locale: es }),
    interesTotal: Math.round(interesTotal * 100) / 100,
    costoTotal: Math.round(costoTotal * 100) / 100,
  };
}

export function calcularProyeccionMultiple(
  creditos: Credito[],
  pagoExtra = 0,
): { mes: string; [creditoId: string]: number | string }[] {
  const proyecciones = creditos.map(c => calcularProyeccion(c, pagoExtra));
  const maxMeses = Math.max(...proyecciones.map(p => p.meses.length));

  const resultado: { mes: string; [creditoId: string]: number | string }[] = [];

  for (let i = 0; i < Math.min(maxMeses, 120); i++) {
    const entry: { mes: string; [creditoId: string]: number | string } = {
      mes: proyecciones[0]?.meses[i]?.fecha ?? `Mes ${i + 1}`,
    };
    for (const p of proyecciones) {
      entry[p.creditoId] = p.meses[i]?.saldoRestante ?? 0;
    }
    resultado.push(entry);
  }

  return resultado;
}
