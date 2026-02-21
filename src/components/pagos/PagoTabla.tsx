import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/components/ui/Badge';
import { PagoMensualEstado, Pago } from '@/types';
import { MESES } from '@/lib/constants';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  pagosEstado: PagoMensualEstado[];
  anio: number;
  onPagar: (mesIndex: number, pagoExistente: Pago | null) => void;
  onEliminar: (pago: Pago) => void;
}

export default function PagoTabla({ pagosEstado, anio, onPagar, onEliminar }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <FlatList
      data={pagosEstado}
      keyExtractor={item => `${item.mes}-${anio}`}
      contentContainerStyle={styles.lista}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const mesLabel = MESES[item.mes - 1];
        const pagado = item.estado === 'pagado';
        return (
          <View style={[styles.fila, item.estado === 'vencido' && styles.filaVencida]}>
            <View style={styles.mesCol}>
              <Text style={styles.mesLabel}>{mesLabel}</Text>
              <Text style={styles.anioLabel}>{anio}</Text>
            </View>

            <View style={styles.montoCol}>
              {item.pago ? (
                <>
                  <Text style={styles.monto}>{formatCurrency(item.pago.monto)}</Text>
                  <Text style={styles.fecha}>{formatDate(item.pago.fecha)}</Text>
                </>
              ) : (
                <Text style={styles.montoVacio}>—</Text>
              )}
            </View>

            <View style={styles.estadoCol}>
              <Badge estado={item.estado} />
            </View>

            <View style={styles.accionesCol}>
              {pagado && item.pago ? (
                <TouchableOpacity
                  onPress={() => onEliminar(item.pago!)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.destructive.default} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => onPagar(item.mes - 1, item.pago ?? null)}
                  style={styles.pagarBtn}
                >
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text style={styles.pagarLabel}>Pagar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  lista: {
    gap: spacing.md,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  filaVencida: {
    borderLeftWidth: 6,
    borderLeftColor: colors.destructive.default,
  },
  mesCol: {
    width: 64,
  },
  mesLabel: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
   fontFamily: 'SpaceGrotesk_700Bold',},
  anioLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '900',
   fontFamily: 'SpaceGrotesk_700Bold',},
  montoCol: {
    flex: 1,
  },
  monto: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
   fontFamily: 'SpaceGrotesk_700Bold',},
  fecha: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '900',
   fontFamily: 'SpaceGrotesk_700Bold',},
  montoVacio: {
    fontSize: fontSize.md,
    color: colors.text.disabled,
    fontWeight: '900',
   fontFamily: 'SpaceGrotesk_700Bold',},
  estadoCol: {
    marginHorizontal: spacing.sm,
  },
  accionesCol: {
    width: 72,
    alignItems: 'flex-end',
  },
  pagarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  pagarLabel: {
    fontSize: 10,
    color: colors.surface.background,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
}
