import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EstrategiaDetalle } from '@/types';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

interface Props {
  avalancha: EstrategiaDetalle;
  bolaNieve: EstrategiaDetalle;
}

interface FilaProps {
  label: string;
  valA: string;
  valB: string;
  mejorA?: boolean; // true = avalancha gana, false = bola de nieve gana, undefined = empate
}

function Fila({ label, valA, valB, mejorA }: FilaProps) {
  return (
    <View style={filaStyles.container}>
      <Text style={filaStyles.label}>{label}</Text>
      <View style={[filaStyles.celda, mejorA === true && filaStyles.celdaGanadora]}>
        {mejorA === true && <Ionicons name="checkmark-circle" size={12} color={colors.success.default} />}
        <Text style={[filaStyles.valor, mejorA === true && filaStyles.valorGanador]}>{valA}</Text>
      </View>
      <View style={[filaStyles.celda, mejorA === false && filaStyles.celdaGanadora]}>
        {mejorA === false && <Ionicons name="checkmark-circle" size={12} color={colors.success.default} />}
        <Text style={[filaStyles.valor, mejorA === false && filaStyles.valorGanador]}>{valB}</Text>
      </View>
    </View>
  );
}

const filaStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  label: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  celda: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  celdaGanadora: {
    backgroundColor: colors.success.light,
  },
  valor: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    textAlign: 'right',
  },
  valorGanador: {
    fontWeight: '700',
    color: colors.success.default,
  },
});

export default function ComparacionTabla({ avalancha, bolaNieve }: Props) {
  const aMenosMeses = avalancha.mesesTotal <= bolaNieve.mesesTotal;
  const aMenosInteres = avalancha.interesTotal <= bolaNieve.interesTotal;
  const aMenosCosto = avalancha.costoTotal <= bolaNieve.costoTotal;

  const mesesIguales = avalancha.mesesTotal === bolaNieve.mesesTotal;
  const interesIguales = avalancha.interesTotal === bolaNieve.interesTotal;

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.encabezadoLabel} />
        <View style={styles.encabezadoColA}>
          <Ionicons name="trending-down-outline" size={16} color={colors.destructive.default} />
          <Text style={styles.encabezadoTitulo}>Avalancha</Text>
        </View>
        <View style={styles.encabezadoColB}>
          <Ionicons name="snow-outline" size={16} color={colors.info.default} />
          <Text style={styles.encabezadoTitulo}>Bola de nieve</Text>
        </View>
      </View>

      <Fila
        label="Meses para liberarse"
        valA={`${avalancha.mesesTotal} meses`}
        valB={`${bolaNieve.mesesTotal} meses`}
        mejorA={mesesIguales ? undefined : aMenosMeses}
      />
      <Fila
        label="Intereses totales"
        valA={formatCurrency(avalancha.interesTotal)}
        valB={formatCurrency(bolaNieve.interesTotal)}
        mejorA={interesIguales ? undefined : aMenosInteres}
      />
      <Fila
        label="Costo total"
        valA={formatCurrency(avalancha.costoTotal)}
        valB={formatCurrency(bolaNieve.costoTotal)}
        mejorA={aMenosCosto ? true : false}
      />

      {/* Nota */}
      <View style={styles.nota}>
        <Ionicons name="information-circle-outline" size={14} color={colors.text.muted} />
        <Text style={styles.notaTexto}>
          Avalancha minimiza intereses. Bola de nieve da motivación al liquidar deudas pequeñas primero.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.md,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  encabezadoLabel: {
    flex: 1,
  },
  encabezadoColA: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  encabezadoColB: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  encabezadoTitulo: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text.primary,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.surface.muted,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  notaTexto: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    lineHeight: 16,
  },
});
