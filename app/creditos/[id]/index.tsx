import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import AppModal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CreditoConPagos } from '@/types';
import { getCreditoById, deleteCredito } from '@/lib/database';
import { cancelNotificationsForCredito } from '@/lib/notifications';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, tipoLabel, tipoIcon } from '@/lib/utils';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';
import { useToast } from '@/components/ui/Toast';
import PagosCreditoScreen from './_pagos';
import DocumentosCreditoScreen from './_documentos';

type Tab = 'detalle' | 'pagos' | 'documentos';

export default function CreditoDetailScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dataStyles = getDataStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [credito, setCredito] = useState<CreditoConPagos | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('detalle');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { onScroll, scrollEventThrottle } = useScrollHideTabBar();
  const { showToast } = useToast();
  const { width } = Dimensions.get('window');
  const scrollViewRef = useRef<ScrollView>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    const c = await getCreditoById(id);
    setCredito(c);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (!credito) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.background }}>
      <Text style={{ color: colors.text.secondary, fontSize: fontSize.md }}>Cargando...</Text>
    </View>
  );

  const pagadosCount = credito.pagos.filter(p => p.estado === 'pagado').length;

  function confirmDelete() {
    setShowDeleteModal(true);
  }

  async function handleDelete() {
    if (!credito) return;
    await cancelNotificationsForCredito(credito.id);
    await deleteCredito(credito.id);
    showToast({
      title: 'Crédito eliminado',
      message: `El crédito "${credito.nombre}" ha sido eliminado.`,
      type: 'info'
    });
    setShowDeleteModal(false);
    router.replace('/creditos');
  }

  const handleTabPress = (tab: Tab, index: number) => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleMomentumScrollEnd = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    const tabs: Tab[] = ['detalle', 'pagos', 'documentos'];
    if (tabs[index] && tabs[index] !== activeTab) {
      setActiveTab(tabs[index]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs Header */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'detalle' && styles.activeTab]}
          onPress={() => handleTabPress('detalle', 0)}
        >
          <Text style={[styles.tabText, activeTab === 'detalle' && styles.activeTabText]}>Detalle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pagos' && styles.activeTab]}
          onPress={() => handleTabPress('pagos', 1)}
        >
          <Text style={[styles.tabText, activeTab === 'pagos' && styles.activeTabText]}>Pagos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documentos' && styles.activeTab]}
          onPress={() => handleTabPress('documentos', 2)}
        >
          <Text style={[styles.tabText, activeTab === 'documentos' && styles.activeTabText]}>Docs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={{ flex: 1 }}
        scrollEnabled={false}
      >
        {/* Tab 1: Detalle */}
        <View style={{ width, flex: 1 }}>
          <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.content}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
          >
            {/* Encabezado */}
        <View style={styles.heroRow}>
          <View style={styles.iconBox}>
            <Ionicons name={tipoIcon(credito.tipo) as any} size={32} color={colors.text.primary} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.nombre}>{credito.nombre}</Text>
            <Text style={styles.tipo}>{tipoLabel(credito.tipo)}</Text>
            {credito.institucion && <Text style={styles.institucion}>{credito.institucion}</Text>}
          </View>
        <Badge
          variant={
            credito.estado === 'activo' ? 'default' :
            credito.estado === 'pagado' ? 'success' : 'secondary'
          }
        >
          {credito.estado === 'activo' ? 'Activo' :
           credito.estado === 'pagado' ? 'Pagado' : 'Cancelado'}
        </Badge>
      </View>

      {/* Datos financieros */}
      <Card style={styles.card}>
        <CardHeader title="Información financiera" />
        <CardContent>
          <View style={styles.grid}>
            <DataItem label="Saldo actual" value={formatCurrency(credito.saldoActual)} />
            {credito.limiteCredito != null && (
              <DataItem label="Límite de crédito" value={formatCurrency(credito.limiteCredito)} />
            )}
            <DataItem label="Tasa anual" value={`${credito.tasaAnual.toFixed(2)}%`} />
            {credito.cuotaMensual != null && (
              <DataItem label="Cuota mensual" value={formatCurrency(credito.cuotaMensual)} />
            )}
            {credito.pagoMinimo != null && (
              <DataItem label="Pago mínimo" value={formatCurrency(credito.pagoMinimo)} />
            )}
            {credito.plazoMeses != null && (
              <DataItem label="Plazo" value={`${credito.plazoMeses} meses`} />
            )}
            {credito.fechaLimitePago != null && (
              <DataItem label="Día límite" value={`Día ${credito.fechaLimitePago}`} />
            )}
            {credito.fechaCorte != null && (
              <DataItem label="Día de corte" value={`Día ${credito.fechaCorte}`} />
            )}
          </View>
          {credito.notas && (
            <Text style={styles.notas}>{credito.notas}</Text>
          )}
        </CardContent>
      </Card>

      {/* Progreso */}
      {credito.plazoMeses != null && credito.plazoMeses > 0 && (
        <Card style={styles.card}>
          <CardHeader title="Progreso de pagos" />
          <CardContent>
            <View style={styles.progresoRow}>
              <View style={styles.progresoBar}>
                <View style={[
                  styles.progresoFill,
                  { width: `${Math.min(100, (pagadosCount / credito.plazoMeses) * 100)}%` }
                ]} />
              </View>
              <Text style={styles.progresoLabel}>{pagadosCount}/{credito.plazoMeses}</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <View style={styles.modalActions}>
        <Button 
          variant="outline" 
          onPress={() => router.push(`/creditos/${id}/editar`)}
          style={styles.modalBtn}
        >
          Editar
        </Button>
        <Button 
          onPress={confirmDelete}
          style={[styles.modalBtn, { backgroundColor: colors.destructive.default }]}
        >
          Eliminar
        </Button>
      </View>
          </ScrollView>
        </View>

        {/* Tab 2: Pagos */}
        <View style={{ width, flex: 1 }}>
          <PagosCreditoScreen />
        </View>

        {/* Tab 3: Documentos */}
        <View style={{ width, flex: 1 }}>
          <DocumentosCreditoScreen />
        </View>
      </ScrollView>

      <AppModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar crédito"
      >
        <Text style={styles.modalText}>
          ¿Seguro que deseas eliminar "{credito?.nombre}"? Se eliminarán todos sus pagos y documentos.
        </Text>
        <View style={styles.modalActions}>
          <Button 
            variant="outline" 
            onPress={() => setShowDeleteModal(false)}
            style={styles.modalBtn}
          >
            Cancelar
          </Button>
          <Button 
            onPress={handleDelete}
            style={[styles.modalBtn, { backgroundColor: colors.destructive.default }]}
          >
            Eliminar
          </Button>
        </View>
      </AppModal>
    </View>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const dataStyles = getDataStyles(colors);
  return (
    <View style={dataStyles.item}>
      <Text style={dataStyles.label}>{label}</Text>
      <Text style={dataStyles.value}>{value}</Text>
    </View>
  );
}

function getDataStyles(colors: any) {
  return StyleSheet.create({
  item: { width: '48%', marginBottom: spacing.md },
  label: { fontSize: 10, color: colors.text.secondary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: fontSize.md, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.5, fontFamily: 'SpaceGrotesk_700Bold' },
});
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  scrollContainer: { flex: 1 },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderBottomWidth: 2,
    borderBottomColor: colors.text.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary.default,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: colors.text.primary,
    fontWeight: '900',
  },
  content: { padding: spacing.lg, gap: spacing.md },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  iconBox: {
    width: 64, height: 64,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.xl,
    ...shadow.sm,
  },
  heroInfo: { flex: 1 },
  nombre: { fontSize: fontSize.xxl, fontWeight: '900', color: colors.text.primary, letterSpacing: -1, textTransform: 'uppercase' },
  tipo: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '900', textTransform: 'uppercase' },
  institucion: { fontSize: fontSize.xs, color: colors.text.secondary, fontWeight: '900', textTransform: 'uppercase' },
  card: { marginBottom: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  notas: { fontSize: fontSize.sm, color: colors.text.secondary, marginTop: spacing.md, fontWeight: '600' },
  progresoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progresoBar: {
    flex: 1, height: 16, backgroundColor: colors.surface.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%', backgroundColor: colors.primary.default,
  },
  progresoLabel: { fontSize: fontSize.sm, color: colors.text.primary, fontWeight: '900' },
  acciones: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  accionBtn: { alignItems: 'center', gap: 8 },
  accionLabel: { fontSize: fontSize.xs, color: colors.text.primary, fontWeight: '900', textTransform: 'uppercase' },  modalText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },});
}
