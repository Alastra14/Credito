import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { hasPin, setPin, verifyPin } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import Logo from '@/components/ui/Logo';

const { width, height } = Dimensions.get('window');

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [pin, setPinState] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'set' | 'confirm'>('enter');
  const { showToast } = useToast();
  
  // Animaciones para la transición sofisticada
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const dialRotationAnim = useRef(new Animated.Value(0)).current;
  const [isUnlocked, setIsUnlocked] = useState(false);

  const spinInterpolate = dialRotationAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['0deg', '144deg', '-72deg', '216deg', '0deg']
  });

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const exists = await hasPin();
    if (!exists) {
      setStep('set');
      setIsSettingPin(true);
    }
  };

  const triggerSuccessAnimation = () => {
    setIsUnlocked(true);
    
    Animated.sequence([
      Animated.delay(300), // Pausa para ver el candado abierto
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 5, // Zoom profundo como entrando a la caja fuerte
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ]).start(() => {
      onLogin();
    });
  };

  const handleKeyPress = async (key: string) => {
    if (key === 'backspace') {
      const newLen = Math.max(0, pin.length - 1);
      setPinState(prev => prev.slice(0, -1));
      Animated.spring(dialRotationAnim, {
        toValue: newLen,
        useNativeDriver: true,
      }).start();
    } else if (pin.length < 4) {
      const newPin = pin + key;
      setPinState(newPin);
      
      Animated.spring(dialRotationAnim, {
        toValue: newPin.length,
        useNativeDriver: true,
      }).start();

      if (newPin.length === 4) {
        if (step === 'enter') {
          const isValid = await verifyPin(newPin);
          if (isValid) {
            triggerSuccessAnimation();
          } else {
            showToast({ title: 'Error', message: 'PIN incorrecto', type: 'error' });
            setPinState('');
            Animated.spring(dialRotationAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else if (step === 'set') {
          setConfirmPin(newPin);
          setPinState('');
          setStep('confirm');
          Animated.spring(dialRotationAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else if (step === 'confirm') {
          if (newPin === confirmPin) {
            await setPin(newPin);
            showToast({ title: 'Éxito', message: 'PIN configurado correctamente', type: 'success' });
            triggerSuccessAnimation();
          } else {
            showToast({ title: 'Error', message: 'Los PINs no coinciden', type: 'error' });
            setPinState('');
            setConfirmPin('');
            setStep('set');
            Animated.spring(dialRotationAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        }
      }
    }
  };

  const renderKey = (key: string, icon?: any) => (
    <TouchableOpacity
      style={styles.key}
      onPress={() => handleKeyPress(key)}
      activeOpacity={0.7}
    >
      {icon ? (
        <Ionicons name={icon} size={28} color={colors.text.primary} />
      ) : (
        <Text style={styles.keyText}>{key}</Text>
      )}
    </TouchableOpacity>
  );

  const getTitle = () => {
    if (step === 'enter') return 'Ingresa tu PIN';
    if (step === 'set') return 'Crea un PIN de 4 dígitos';
    if (step === 'confirm') return 'Confirma tu PIN';
    return '';
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface.background,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ]
        }
      ]}
    >
      {/* Login UI */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Animated.View style={[styles.logoContainer, { transform: [{ rotate: spinInterpolate }] }]}>
            <Ionicons 
              name={isUnlocked ? "lock-open" : "lock-closed"} 
              size={100} 
              color={colors.primary.default} 
            />
          </Animated.View>
          <Text style={styles.title}>Debtless</Text>
          <Text style={styles.subtitle}>{getTitle()}</Text>
        </View>

        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                pin.length > i && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        <View style={styles.keypad}>
          <View style={styles.keyRow}>
            {renderKey('1')}
            {renderKey('2')}
            {renderKey('3')}
          </View>
          <View style={styles.keyRow}>
            {renderKey('4')}
            {renderKey('5')}
            {renderKey('6')}
          </View>
          <View style={styles.keyRow}>
            {renderKey('7')}
            {renderKey('8')}
            {renderKey('9')}
          </View>
          <View style={styles.keyRow}>
            <View style={styles.keyEmpty} />
            {renderKey('0')}
            {renderKey('backspace', 'backspace-outline')}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logoContainer: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: fontSize.lg,
      color: colors.text.secondary,
    },
    pinContainer: {
      flexDirection: 'row',
      gap: spacing.lg,
      marginBottom: spacing.xxl * 2,
    },
    pinDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.text.muted,
      backgroundColor: 'transparent',
    },
    pinDotFilled: {
      backgroundColor: colors.primary.default,
      borderColor: colors.primary.default,
    },
    keypad: {
      width: '100%',
      maxWidth: 320,
      gap: spacing.md,
    },
    keyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    key: {
      flex: 1,
      aspectRatio: 1,
      backgroundColor: colors.surface.card,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.sm,
    },
    keyText: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.text.primary,
     fontFamily: 'SpaceGrotesk_700Bold',},
    keyEmpty: {
      flex: 1,
      aspectRatio: 1,
    },
  });
}
