// ─── Enumeraciones ───────────────────────────────────────────────────────────

export type TipoCredito =
  | 'tarjeta_credito'
  | 'hipoteca'
  | 'auto'
  | 'personal'
  | 'otro';

export type EstadoCredito = 'activo' | 'pagado' | 'cancelado';

export type TipoPago = 'normal' | 'extra' | 'adelanto';

export type EstadoPago = 'pagado' | 'pendiente' | 'vencido' | 'parcial';

// ─── Entidades principales ────────────────────────────────────────────────────

export interface Credito {
  id: string;
  nombre: string;
  tipo: TipoCredito;
  saldoActual: number;
  saldoOriginal: number;
  tasaAnual: number;
  fechaCorte: number | null;
  fechaLimitePago: number | null;
  pagoMinimo: number | null;
  cuotaMensual: number | null;
  plazoMeses: number | null;
  estado: EstadoCredito;
  institucion: string | null;
  notas: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreditoConPagos extends Credito {
  pagos: Pago[];
  documentos: Documento[];
}

export interface Pago {
  id: string;
  creditoId: string;
  mes: number;
  anio: number;
  monto: number;
  fecha: string;
  tipo: TipoPago;
  estado: EstadoPago;
  notas: string | undefined;
  creadoEn: string;
}

export interface Documento {
  id: string;
  creditoId: string;
  nombre: string;
  tipo: string;
  uri: string;
  tamano: number;
  creadoEn: string;
}

// ─── Formularios ─────────────────────────────────────────────────────────────

export interface CreditoFormData {
  nombre: string;
  tipo: TipoCredito;
  saldoActual: number;
  saldoOriginal: number;
  tasaAnual: number;
  estado: EstadoCredito;
  plazoMeses?: number;
  cuotaMensual?: number;
  pagoMinimo?: number;
  fechaCorte?: number;
  fechaLimitePago?: number;
  institucion?: string;
  notas?: string;
}

// ─── Cálculos ─────────────────────────────────────────────────────────────────

export interface AmortizacionRow {
  mes: number;
  cuota: number;
  interes: number;
  capital: number;
  saldoRestante: number;
}

export interface PagoMensualEstado {
  mes: number;
  estado: EstadoPago;
  pago: Pago | null;
}

// ─── Estrategias de pago ──────────────────────────────────────────────────────

/** Resumen por estrategia (Avalancha / Bola de nieve) */
export interface EstrategiaDetalle {
  nombre: string;
  mesesTotal: number;
  interesTotal: number;
  costoTotal: number;
  ordenCreditos: string[];
}

/** Resultado de calcularEstrategias() */
export interface ResultadoEstrategias {
  avalancha: EstrategiaDetalle;
  bolaNieve: EstrategiaDetalle;
}

// Re-exports from calculos (so screens can import from '@/types')
export type { ProyeccionMes, ProyeccionCredito } from '@/lib/calculos/proyeccion';
