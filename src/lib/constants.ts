import type { TipoCredito, EstadoCredito, TipoPago, EstadoPago } from '@/types';

export const TIPOS_CREDITO: { value: TipoCredito; label: string; icon: string }[] = [
  { value: 'tarjeta_credito', label: 'Tarjeta de Crédito', icon: 'card-outline' },
  { value: 'hipoteca', label: 'Hipoteca', icon: 'home-outline' },
  { value: 'auto', label: 'Auto', icon: 'car-outline' },
  { value: 'personal', label: 'Préstamo Personal', icon: 'person-outline' },
  { value: 'otro', label: 'Otro', icon: 'ellipsis-horizontal-outline' },
];

export const ESTADOS_CREDITO: { value: EstadoCredito; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const TIPOS_PAGO: { value: TipoPago; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'extra', label: 'Pago Extra' },
  { value: 'adelanto', label: 'Adelanto' },
];

export const ESTADOS_PAGO_LABEL: Record<EstadoPago, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
  parcial: 'Parcial',
};

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const TIPOS_CREDITO_CON_PLAZO: TipoCredito[] = [
  'hipoteca',
  'auto',
  'personal',
  'otro',
];

