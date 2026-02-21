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
import { spacing, fontSize, borderRadius } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';

export default function PriorizacionScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [resultado, setResultado] = useState<ResultadoEstrategias | null>(null);
  const [sumaMins, setSumaMins] = useState(0);
  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();

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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      scrollEventThrottle={scrollEventThrottle}
    >
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
              <Ionicons name="calculator-outline" size={20} color={colors.text.inverse} />
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

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { marginBottom: 0 },
  infoText: { fontSize: fontSize.sm, color: colors.text.secondary, lineHeight: 20, fontWeight: '500' },
  bold: { fontWeight: '900', color: colors.text.primary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statItem: { flex: 1, alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface.muted, borderRadius: borderRadius.lg },
  statNum: { fontSize: fontSize.xl, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.5, fontFamily: 'SpaceGrotesk_700Bold' },
  statLbl: { fontSize: 10, color: colors.text.secondary, textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', marginTop: 4 },
  hint: { fontSize: 11, color: colors.text.secondary, marginBottom: spacing.md, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  input: {
    flex: 1, borderWidth: 2, borderColor: colors.surface.border,
    borderRadius: borderRadius.lg, padding: spacing.md,
    fontSize: fontSize.md, color: colors.text.primary, fontWeight: '700',
  },
  calcBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface.inverse,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  calcBtnText: { color: colors.text.inverse, fontWeight: '900', fontSize: fontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  estrategiasRow: { flexDirection: 'row', gap: spacing.md },
  estrategiaCol: { flex: 1 },
  ordenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  ordenTitle: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text.primary, flex: 1, textTransform: 'uppercase' },
  ordenItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  ordenNumBox: {
    width: 28, height: 28, borderRadius: borderRadius.full,
    backgroundColor: colors.surface.inverse, alignItems: 'center', justifyContent: 'center',
  },
  ordenNum: { fontSize: fontSize.xs, color: colors.text.inverse, fontWeight: '900' },
  ordenNombre: { fontSize: fontSize.md, color: colors.text.primary, flex: 1, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, color: colors.text.secondary, fontWeight: '900', textTransform: 'uppercase' },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.text.secondary, textAlign: 'center', fontWeight: '500' },
  cta: {
    backgroundColor: colors.surface.card, borderRadius: borderRadius.xl,
    padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.surface.border,
  },
  ctaText: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
});
}
