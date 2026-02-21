import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProyeccionChart from '@/components/charts/ProyeccionChart';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CreditoConPagos, ProyeccionCredito } from '@/types';
import { getCreditos } from '@/lib/database';
import { calcularProyeccion } from '@/lib/calculos/proyeccion';
import { colors, spacing, fontSize, borderRadius, shadow } from '@/lib/theme';
import { formatCurrency, tipoLabel } from '@/lib/utils';

export default function ProyeccionesScreen() {
  const [todosCreditos, setTodosCreditos] = useState<CreditoConPagos[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [pagoExtra, setPagoExtra] = useState('');
  const [proyecciones, setProyecciones] = useState<ProyeccionCredito[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const cs = await getCreditos();
    const activos = cs.filter(c => c.estado === 'activo') as CreditoConPagos[];
    setTodosCreditos(activos);
    if (activos.length > 0 && seleccionados.size === 0) {
      const ids = new Set(activos.slice(0, 3).map(c => c.id));
      setSeleccionados(ids);
    }
  }, [seleccionados.size]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  // Calcular proyecciones cuando cambia selección o pago extra
  const calcular = useCallback(() => {
    const creditosSeleccionados = todosCreditos.filter(c => seleccionados.has(c.id));
    if (creditosSeleccionados.length === 0) {
      setProyecciones([]);
      return;
    }
    const extra = parseFloat(pagoExtra) || 0;
    const result = creditosSeleccionados.map(c => calcularProyeccion(c, extra));
    setProyecciones(result);
  }, [todosCreditos, seleccionados, pagoExtra]);

  useFocusEffect(useCallback(() => { calcular(); }, [calcular]));

  function toggleCredito(id: string) {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Selector de créditos */}
      <Card style={styles.card}>
        <CardHeader title="Seleccionar créditos (máx. 5)" />
        <CardContent>
          {todosCreditos.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.checkRow, seleccionados.has(c.id) && styles.checkRowSelected]}
              onPress={() => toggleCredito(c.id)}
            >
              <Ionicons
                name={seleccionados.has(c.id) ? 'checkbox' : 'square-outline'}
                size={20}
                color={seleccionados.has(c.id) ? colors.primary.default : colors.text.muted}
              />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.checkNombre}>{c.nombre}</Text>
                <Text style={styles.checkSub}>{tipoLabel(c.tipo)} · {formatCurrency(c.saldoActual)}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {todosCreditos.length === 0 && (
            <Text style={styles.emptyTxt}>No hay créditos activos.</Text>
          )}
        </CardContent>
      </Card>

      {/* Pago extra */}
      <Card style={styles.card}>
        <CardHeader title="Pago extra mensual (opcional)" />
        <CardContent>
          <TextInput
            style={styles.input}
            placeholder="$0.00"
            placeholderTextColor={colors.text.disabled}
            keyboardType="numeric"
            value={pagoExtra}
            onChangeText={setPagoExtra}
            onBlur={calcular}
          />
        </CardContent>
      </Card>

      {/* Gráfica */}
      {proyecciones.length > 0 && (
        <Card style={styles.card}>
          <CardHeader title="Proyección de saldos" />
          <CardContent>
            <ProyeccionChart proyecciones={proyecciones} />
          </CardContent>
        </Card>
      )}

      {/* Tablas de amortización */}
      {proyecciones.map(p => (
        <Card key={p.id} style={styles.card}>
          <TouchableOpacity
            style={styles.acordeonHeader}
            onPress={() => setExpandido(expandido === p.id ? null : p.id)}
          >
            <Text style={styles.acordeonTitle}>{p.nombre}</Text>
            <Ionicons
              name={expandido === p.id ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color={colors.text.muted}
            />
          </TouchableOpacity>
          {expandido === p.id && (
            <View>
              {/* Cabecera de tabla */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.6 }]}>Mes</Text>
                <Text style={[styles.th, { flex: 1 }]}>Cuota</Text>
                <Text style={[styles.th, { flex: 1 }]}>Interés</Text>
                <Text style={[styles.th, { flex: 1 }]}>Capital</Text>
                <Text style={[styles.th, { flex: 1 }]}>Saldo</Text>
              </View>
              {p.meses.map((m, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.td, { flex: 0.6 }]}>{i + 1}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>${m.cuota.toFixed(0)}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>${m.interes.toFixed(0)}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>${m.capital.toFixed(0)}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>${m.saldoFinal.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.md, gap: spacing.sm },
  card: { marginBottom: 0 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
  checkRowSelected: { backgroundColor: colors.primary.light },
  checkNombre: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text.primary },
  checkSub: { fontSize: fontSize.xs, color: colors.text.muted },
  emptyTxt: { color: colors.text.muted, textAlign: 'center', paddingVertical: spacing.md },
  input: {
    borderWidth: 1, borderColor: colors.surface.border,
    borderRadius: borderRadius.md, padding: spacing.sm,
    fontSize: fontSize.md, color: colors.text.primary,
  },
  acordeonHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  acordeonTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.primary },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surface.muted,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderTopWidth: 1, borderTopColor: colors.surface.border,
  },
  th: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text.secondary, textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tableRowAlt: { backgroundColor: colors.surface.muted },
  td: { fontSize: fontSize.xs, color: colors.text.primary, textAlign: 'right' },
});
