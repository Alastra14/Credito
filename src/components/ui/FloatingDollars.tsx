import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/lib/ThemeContext';

const { width } = Dimensions.get('window');
const DOLLAR_COUNT = 12;

const CURRENCY_ICONS = [
  'logo-usd', // Dólar / Peso
  'logo-euro', // Euro
  'logo-yen', // Yen
  'logo-bitcoin', // Crypto (opcional, o puedes usar otro)
];

export default function FloatingDollars() {
  const { colors } = useTheme();
  const items = useRef(
    Array.from({ length: DOLLAR_COUNT }).map(() => ({
      anim: new Animated.Value(0),
      startX: Math.random() * width,
      endX: Math.random() * width,
      scale: 0.4 + Math.random() * 1.5,
      delay: Math.random() * 2000,
      duration: 4000 + Math.random() * 3000,
      icon: CURRENCY_ICONS[Math.floor(Math.random() * CURRENCY_ICONS.length)],
    }))
  ).current;

  useEffect(() => {
    items.forEach(({ anim, delay, duration }) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    });
  }, [items]);

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 24 }]} pointerEvents="none">
      {items.map((item, i) => {
        const translateX = item.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [item.startX, item.endX],
        });
        const translateY = item.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [250, -50],
        });
        const opacity = item.anim.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 0.15, 0.15, 0],
        });
        const scale = item.scale;

        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            }}
          >
            <Ionicons name={item.icon as any} size={32} color={colors.text.muted} />
          </Animated.View>
        );
      })}
    </View>
  );
}
