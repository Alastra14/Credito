import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import EstrategiaCard from '@/components/priorizacion/EstrategiaCard';
import ComparacionTabla from '@/components/priorizacion/ComparacionTabla';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CreditoConPagos, ResultadoEstrategias } from '@/types';
import { getCreditos } from '@/lib/database';
import { calcularEstrategias } from '@/lib/calculos/priorizacion';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

export default function PriorizacionScreen() {
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [resultado, setResultado] = useState<ResultadoEstrategias | null>(null);
  const [sumaMins, setSumaMins] = useState(0);

  const cargar = useCallback(async () => {
    const cs = await getCreditos();
    const activos = cs.filter(c => c.estado === 'activo') as CreditoConPagos[];
    setCreditos(activos);
    const suma = activos.reduce((acc, c) => acc + (c.pagoMinimo ?? c.cuotaMensual ?? 0), 0);
    setSumaMins(suma);
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  function calcular() {
    const presup = parseFloat(presupuesto) || sumaMins;
    if (creditos.length === 0) return;
    const res = calcularEstrategias(creditos, presup);
    setResultado(res);
  }

  const recomendada =
    resultado
      ? resultado.avalancha.costoTotal <= resultado.bolaNieve.costoTotal
        ? 'avalancha'
        : 'bolaNieve'
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Info */}
      <Card style={styles.card}>
        <CardHeader title="Estrategias de pago de deuda" />
        <CardContent>
          <Text style={styles.infoText}>
            Compara el método <Text style={styles.bold}>Avalancha</Text> (paga primero la deuda con mayor tasa de interés)
            contra el método <Text style={styles.bold}>Bola de nieve</Text> (paga primero la deuda con menor saldo).
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{creditos.length}</Text>
              <Text style={styles.statLbl}>Créditos activos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{formatCurrency(sumaMins)}</Text>
              <Text style={styles.statLbl}>Pagos mínimos/mes</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Presupuesto */}
      <Card style={styles.card}>
        <CardHeader title="Presupuesto mensual disponible" />
        <CardContent>
          <Text style={styles.hint}>
            Mínimo recomendado: {formatCurrency(sumaMins)}. Ingresa un monto mayor para acelerar el pago.
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`${sumaMins.toFixed(2)}`}
              placeholderTextColor={colors.text.disabled}
              keyboardType="numeric"
              value={presupuesto}
              onChangeText={setPresupuesto}
            />
            <TouchableOpacity style={styles.calcBtn} onPress={calcular}>
              <Ionicons name="calculator-outline" size={18} color={colors.primary.text} />
              <Text style={styles.calcBtnText}>Calcular</Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado ? (
        <>
          <View style={styles.estrategiasRow}>
            <View style={styles.estrategiaCol}>
              <EstrategiaCard
                estrategia={resultado.avalancha}
                esRecomendada={recomendada === 'avalancha'}
              />
            </View>
            <View style={styles.estrategiaCol}>
              <EstrategiaCard
                estrategia={resultado.bolaNieve}
                esRecomendada={recomendada === 'bolaNieve'}
              />
            </View>
          </View>

          <ComparacionTabla
            avalancha={resultado.avalancha}
            bolaNieve={resultado.bolaNieve}
          />

          <Card style={styles.card}>
            <CardContent>
              <View style={styles.ordenRow}>
                <Ionicons name="list-outline" size={18} color={colors.primary.default} />
                <Text style={styles.ordenTitle}>
                  Orden de pago — {recomendada === 'avalancha' ? 'Avalancha (recomendada)' : 'Bola de nieve (recomendada)'}
                </Text>
              </View>
              {(recomendada === 'avalancha' ? resultado.avalancha : resultado.bolaNieve)
                .ordenCreditos.map((name, i) => (
                  <View key={i} style={styles.ordenItem}>
                    <View style={styles.ordenNumBox}>
                      <Text style={styles.ordenNum}>{i + 1}</Text>
                    </View>
                    <Text style={styles.ordenNombre}>{name}</Text>
                  </View>
                ))}
            </CardContent>
          </Card>
        </>
      ) : (
        creditos.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="ribbon-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyTitle}>Sin créditos activos</Text>
            <Text style={styles.emptySubtitle}>Agrega créditos para comparar estrategias.</Text>
          </View>
        ) : (
          <View style={styles.cta}>
            <Text style={styles.ctaText}>
              Ingresa tu presupuesto y presiona <Text style={styles.bold}>Calcular</Text> para ver las estrategias.
            </Text>
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.md, gap: spacing.sm },
  card: { marginBottom: 0 },
  infoText: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  bold: { fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  statItem: { flex: 1, alignItems: 'center', padding: spacing.sm, backgroundColor: colors.surface.muted, borderRadius: borderRadius.md },
  statNum: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary.default },
  statLbl: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center' },
  hint: { fontSize: fontSize.xs, color: colors.text.muted, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1, borderWidth: 1, borderColor: colors.surface.border,
    borderRadius: borderRadius.md, padding: spacing.sm,
    fontSize: fontSize.md, color: colors.text.primary,
  },
  calcBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary.default,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  calcBtnText: { color: colors.primary.text, fontWeight: '600', fontSize: fontSize.sm },
  estrategiasRow: { flexDirection: 'row', gap: spacing.sm },
  estrategiaCol: { flex: 1 },
  ordenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  ordenTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text.primary, flex: 1 },
  ordenItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  ordenNumBox: {
    width: 24, height: 24, borderRadius: borderRadius.full,
    backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center',
  },
  ordenNum: { fontSize: fontSize.xs, color: colors.primary.text, fontWeight: '700' },
  ordenNombre: { fontSize: fontSize.sm, color: colors.text.primary, flex: 1 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: fontSize.lg, color: colors.text.secondary, fontWeight: '600' },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.text.muted, textAlign: 'center' },
  cta: {
    backgroundColor: colors.surface.card, borderRadius: borderRadius.md,
    padding: spacing.lg, alignItems: 'center',
  },
  ctaText: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
});
