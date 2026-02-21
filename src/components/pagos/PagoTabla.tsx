import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/components/ui/Badge';
import { PagoMensualEstado, Pago } from '@/types';
import { MESES } from '@/lib/constants';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  pagosEstado: PagoMensualEstado[];
  anio: number;
  onPagar: (mesIndex: number, pagoExistente: Pago | null) => void;
  onEliminar: (pago: Pago) => void;
}

export default function PagoTabla({ pagosEstado, anio, onPagar, onEliminar }: Props) {
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

const styles = StyleSheet.create({
  lista: {
    gap: spacing.xs,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadow.sm,
  },
  filaVencida: {
    borderLeftWidth: 3,
    borderLeftColor: colors.destructive.default,
  },
  mesCol: {
    width: 56,
  },
  mesLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  anioLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  montoCol: {
    flex: 1,
  },
  monto: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  fecha: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  montoVacio: {
    fontSize: fontSize.sm,
    color: colors.text.disabled,
  },
  estadoCol: {
    marginHorizontal: spacing.xs,
  },
  accionesCol: {
    width: 64,
    alignItems: 'flex-end',
  },
  pagarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  pagarLabel: {
    fontSize: fontSize.xs,
    color: '#fff',
    fontWeight: '600',
  },
});
