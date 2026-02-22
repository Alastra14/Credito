import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Crypto from 'expo-crypto';
import { useTheme } from '@/lib/ThemeContext';
import type { EstadoPago, TipoCredito } from '@/types';

export function generateId(): string {
  return Crypto.randomUUID();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  } catch {
    return dateString;
  }
}

export function formatMonthYear(mes: number, anio: number): string {
  const date = new Date(anio, mes - 1, 1);
  return format(date, 'MMMM yyyy', { locale: es });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function estadoPagoColor(estado: EstadoPago, colors: any): string {
  switch (estado) {
    case 'pagado':    return colors.success.default;
    case 'parcial':   return colors.info.default;
    case 'vencido':   return colors.destructive.default;
    case 'pendiente': return colors.warning.default;
  }
}

export function estadoPagoBgColor(estado: EstadoPago, colors: any): string {
  switch (estado) {
    case 'pagado':    return colors.success.light;
    case 'parcial':   return colors.info.light;
    case 'vencido':   return colors.destructive.light;
    case 'pendiente': return colors.warning.light;
  }
}

export function estadoPagoTextColor(estado: EstadoPago, colors: any): string {
  switch (estado) {
    case 'pagado':    return colors.success.text;
    case 'parcial':   return colors.info.text;
    case 'vencido':   return colors.destructive.text;
    case 'pendiente': return colors.warning.text;
  }
}

export function tipoIcon(tipo: TipoCredito): string {
  switch (tipo) {
    case 'tarjeta_credito': return 'card-outline';
    case 'hipoteca':        return 'home-outline';
    case 'auto':            return 'car-outline';
    case 'personal':        return 'person-outline';
    default:                return 'ellipsis-horizontal-outline';
  }
}

export function tipoLabel(tipo: TipoCredito): string {
  switch (tipo) {
    case 'tarjeta_credito': return 'Tarjeta de Crédito';
    case 'hipoteca':        return 'Hipoteca';
    case 'auto':            return 'Auto';
    case 'personal':        return 'Préstamo Personal';
    default:                return 'Otro';
  }
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function parseNumber(value: string): number {
  const n = parseFloat(value.replace(',', '.'));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

export function parseOptionalInt(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

export function parseOptionalFloat(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = parseFloat(value.replace(',', '.'));
  return isNaN(n) ? undefined : Math.round(n * 100) / 100;
}
