import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Bienvenido a Debtless',
    description: 'La mejor forma de gestionar tus créditos y salir de deudas rápidamente.',
    icon: 'wallet-outline',
  },
  {
    id: '2',
    title: 'Control Total',
    description: 'Registra tus tarjetas, préstamos y pagos en un solo lugar.',
    icon: 'pie-chart-outline',
  },
  {
    id: '3',
    title: 'Estrategias Inteligentes',
    description: 'Descubre qué deudas pagar primero para ahorrar en intereses.',
    icon: 'trending-down-outline',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        {currentIndex === 0 ? (
          <View style={{ marginBottom: spacing.xxl }}>
            <Logo size={200} />
          </View>
        ) : (
          <View style={styles.iconContainer}>
            <Ionicons name={slide.icon as any} size={100} color={colors.primary.default} />
          </View>
        )}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <Button onPress={handleNext} style={styles.button}>
          {currentIndex === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
        </Button>
      </View>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    slide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    iconContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.surface.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxl,
      ...shadow.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    description: {
      fontSize: fontSize.lg,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    footer: {
      padding: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.surface.card,
      marginHorizontal: 5,
    },
    activeDot: {
      backgroundColor: colors.primary.default,
      width: 20,
    },
    button: {
      width: '100%',
    },
  });
}
