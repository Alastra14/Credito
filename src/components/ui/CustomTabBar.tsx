import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import AppModal from '@/components/ui/Modal';
import { router } from 'expo-router';
import { useTabBar } from '@/lib/TabBarContext';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const currentRoute = state.routes[state.index].name;
  const { visible } = useTabBar();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 150, // 150 is enough to hide it completely
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [visible]);

  const navigateTo = (routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find(r => r.name === routeName)?.key || '',
      canPreventDefault: true,
    });

    if (currentRoute !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
        <View style={styles.tabBar}>
          {/* 1. Inicio */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigateTo('index')}
          >
            <Ionicons
              name={currentRoute === 'index' ? 'home' : 'home-outline'}
              size={24}
              color={currentRoute === 'index' ? colors.primary.default : colors.text.muted}
            />
          </TouchableOpacity>

          {/* 2. Créditos */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigateTo('creditos')}
          >
            <Ionicons
              name={currentRoute === 'creditos' ? 'wallet' : 'wallet-outline'}
              size={24}
              color={currentRoute === 'creditos' ? colors.primary.default : colors.text.muted}
            />
          </TouchableOpacity>

          {/* 3. Abono (Central) */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/pagos')}
              style={styles.actionButtonWrapper}
            >
              <LinearGradient
                colors={[colors.primary.default, colors.primary.dark]}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="cash-outline" size={32} color={colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 4. Menú (Sitemap) */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons
              name="grid-outline"
              size={24}
              color={colors.text.muted}
            />
          </TouchableOpacity>

          {/* 5. Configuraciones */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigateTo('configuracion/index')}
          >
            <Ionicons
              name={currentRoute === 'configuracion/index' ? 'settings' : 'settings-outline'}
              size={24}
              color={currentRoute === 'configuracion/index' ? colors.primary.default : colors.text.muted}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <AppModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Menú de Opciones"
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => { setModalVisible(false); router.push('/creditos/nuevo'); }}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.surface.muted }]}>
              <Ionicons name="add-circle-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.modalActionText}>Nuevo Crédito</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => { setModalVisible(false); router.push('/pagos'); }}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.surface.muted }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.modalActionText}>Registrar Pago</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => { setModalVisible(false); router.push('/proyecciones'); }}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.surface.muted }]}>
              <Ionicons name="trending-down-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.modalActionText}>Proyecciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => { setModalVisible(false); router.push('/priorizacion'); }}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.surface.muted }]}>
              <Ionicons name="podium-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.modalActionText}>Priorización</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalAction}
            onPress={() => { setModalVisible(false); router.push('/reportes'); }}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.surface.muted }]}>
              <Ionicons name="bar-chart-outline" size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.modalActionText}>Reportes</Text>
          </TouchableOpacity>
        </View>
      </AppModal>
    </>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md + 5, // 5px margin above the bottom
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface.inverse,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadow.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  actionButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonWrapper: {
    position: 'absolute',
    bottom: 10, // Elevate it above the tab bar
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.surface.background, // Matches app background to create cutout effect
    padding: 6,
    transform: [{ rotate: '45deg' }],
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingVertical: spacing.md,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.surface.background,
    ...shadow.sm,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
});
}
