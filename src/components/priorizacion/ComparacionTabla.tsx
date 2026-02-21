import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EstrategiaDetalle } from '@/types';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
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
  const { colors } = useTheme();
  const filaStyles = getFilaStyles(colors);
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

function getFilaStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.text.primary,
  },
  label: {
    flex: 1,
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  celda: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  celdaGanadora: {
    backgroundColor: colors.primary.default,
  },
  valor: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    textAlign: 'right',
    fontWeight: '900',
   fontFamily: 'SpaceGrotesk_700Bold',},
  valorGanador: {
    fontWeight: '900',
    color: colors.text.primary,
  },
});
}

export default function ComparacionTabla({ avalancha, bolaNieve }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    paddingHorizontal: spacing.sm,
  },
  encabezadoColB: {
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  encabezadoTitulo: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.surface.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  notaTexto: {
    flex: 1,
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
}
