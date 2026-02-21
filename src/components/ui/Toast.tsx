import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, shadow, borderRadius } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = (options: ToastOptions) => {
    setToast(options);
    
    // Reset values
    translateY.setValue(100);
    opacity.setValue(0);

    // Slide up and fade in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide after duration
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    }, options.duration || 3000);
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  const getColor = (type: ToastType) => {
    switch (type) {
      case 'success': return colors.success.default;
      case 'error': return colors.destructive.default;
      case 'warning': return colors.warning.default;
      case 'info': return colors.info.default;
      default: return colors.info.default;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <View style={styles.toastContent}>
            <Ionicons name={getIcon(toast.type || 'info')} size={24} color={getColor(toast.type || 'info')} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{toast.title}</Text>
              {toast.message && <Text style={styles.message}>{toast.message}</Text>}
            </View>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface.inverse,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadow.md,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  title: {
    color: colors.text.inverse,
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  message: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
}
