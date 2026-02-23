import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pago, TipoPago } from '@/types';
import { TIPOS_PAGO, MESES } from '@/lib/constants';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { parseNumber, today, formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface Props {
  creditoId: string;
  creditoTipo?: string;
  mesIndex: number; // 0-based
  anio: number;
  montoSugerido?: number;
  saldoActual?: number;
  pagoExistente?: Pago | null;
  onSubmit: (data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>, nuevoSaldo?: number) => Promise<void>;
  onCancel: () => void;
}

const { width } = Dimensions.get('window');

export default function PagoForm({
  creditoTipo,
  mesIndex,
  anio,
  montoSugerido,
  saldoActual,
  pagoExistente,
  onSubmit,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [monto, setMonto] = useState(
    pagoExistente?.monto != null ? pagoExistente.monto.toFixed(2) : montoSugerido != null ? montoSugerido.toFixed(2) : '0'
  );
  const [nuevoSaldo, setNuevoSaldo] = useState('');
  const [tipo, setTipo] = useState<TipoPago>(pagoExistente?.tipo ?? 'normal');
  const [fecha, setFecha] = useState(pagoExistente?.fecha ?? today());
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Si no hay pago existente, pre-seleccionar el mes siguiente al actual
  // (o el mes actual si estamos en el mismo mes que se está pagando)
  React.useEffect(() => {
    if (!pagoExistente) {
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      
      // Si el mes que estamos viendo es el actual o anterior, y no hay pago,
      // sugerimos la fecha de hoy.
      // Si el mes que estamos viendo es futuro, sugerimos el primer día de ese mes.
      if (anio > currentYear || (anio === currentYear && mesIndex > currentMonth)) {
        const futureDate = new Date(anio, mesIndex, 1);
        setFecha(futureDate.toISOString().split('T')[0]);
      } else {
        setFecha(today());
      }
    }
  }, [mesIndex, anio, pagoExistente]);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setMonto(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (key === '.') {
      if (!monto.includes('.')) {
        setMonto(prev => prev + '.');
      }
    } else {
      // Limit to 2 decimal places
      const dotIndex = monto.indexOf('.');
      if (dotIndex !== -1 && monto.length - dotIndex > 2) return;
      setMonto(prev => (prev === '0' ? key : prev + key));
    }
  };

  async function handleSubmit() {
    const numMonto = parseNumber(monto);
    if (!numMonto || isNaN(numMonto) || numMonto <= 0) {
      showToast({
        title: 'Error',
        message: 'Ingresa un monto válido',
        type: 'error'
      });
      return;
    }
    
    let numNuevoSaldo: number | undefined;
    if (creditoTipo === 'tarjeta_credito') {
      numNuevoSaldo = parseNumber(nuevoSaldo);
      if (nuevoSaldo && (isNaN(numNuevoSaldo) || numNuevoSaldo < 0)) {
        showToast({
          title: 'Error',
          message: 'Ingresa un saldo válido',
          type: 'error'
        });
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        mes: mesIndex + 1,
        anio,
        monto: numMonto,
        fecha,
        tipo,
        estado: 'pagado',
        notas: undefined,
      }, numNuevoSaldo);
    } catch (err: any) {
      showToast({
        title: 'Error',
        message: err.message || 'No se pudo registrar el pago',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  const renderKey = (key: string, label?: string, icon?: any) => (
    <TouchableOpacity
      style={styles.key}
      onPress={() => handleKeyPress(key)}
      activeOpacity={0.7}
    >
      {icon ? (
        <Ionicons name={icon} size={24} color={colors.text.primary} />
      ) : (
        <Text style={styles.keyText}>{label || key}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Section - ATM Display */}
      <View style={styles.atmDisplay}>
        <Text style={styles.atmTitle}>Pago de {MESES[mesIndex]}</Text>
        <Text style={styles.atmTotalLabel}>Total a abonar</Text>
        <Text style={styles.atmTotalValue}>${monto}</Text>
        
        {/* Decorative Card Element */}
        <View style={styles.atmCardDeco}>
          <Ionicons name="wifi" size={20} color="#FFF" style={{ transform: [{ rotate: '90deg' }] }} />
          <View style={styles.atmChip} />
        </View>
      </View>

      {/* Bottom Section - Inputs & Keypad */}
      <View style={styles.bottomSection}>
        {/* Quick Buttons */}
        <View style={styles.quickButtonsRow}>
          {montoSugerido !== undefined && montoSugerido > 0 && (
            <TouchableOpacity 
              style={styles.quickBtn} 
              onPress={() => setMonto(montoSugerido.toString())}
            >
              <Text style={styles.quickBtnText}>Mínimo: ${montoSugerido}</Text>
            </TouchableOpacity>
          )}
          {saldoActual !== undefined && saldoActual > 0 && (
            <TouchableOpacity 
              style={[styles.quickBtn, styles.quickBtnPrimary]} 
              onPress={() => setMonto(saldoActual.toString())}
            >
              <Text style={[styles.quickBtnText, styles.quickBtnTextPrimary]}>Pagar Todo: ${saldoActual}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Tipo de pago</Text>
          <TouchableOpacity 
            style={styles.inputBox}
            onPress={() => {
              const nextIndex = (TIPOS_PAGO.findIndex(t => t.value === tipo) + 1) % TIPOS_PAGO.length;
              setTipo(TIPOS_PAGO[nextIndex].value as TipoPago);
            }}
          >
            <Text style={styles.inputValue}>{TIPOS_PAGO.find(t => t.value === tipo)?.label}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {creditoTipo === 'tarjeta_credito' && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nuevo Saldo (Opcional)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={[styles.inputValue, { padding: 0, margin: 0 }]}
                value={nuevoSaldo}
                onChangeText={setNuevoSaldo}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.text.muted}
              />
            </View>
          </View>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          <View style={styles.keyRow}>
            {renderKey('1')}
            {renderKey('2')}
            {renderKey('3')}
            {renderKey('backspace', '', 'backspace-outline')}
          </View>
          <View style={styles.keyRow}>
            {renderKey('4')}
            {renderKey('5')}
            {renderKey('6')}
            <TouchableOpacity style={[styles.key, styles.keyAction]} onPress={onCancel}>
              <Text style={styles.keyActionText}>Canc.</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyRow}>
            {renderKey('7')}
            {renderKey('8')}
            {renderKey('9')}
            <TouchableOpacity 
              style={[styles.key, styles.keyAction, styles.keyActionPrimary, loading && styles.processBtnDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={[styles.keyActionText, styles.keyActionTextPrimary]}>
                {loading ? '...' : 'Pagar'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyRow}>
            <View style={styles.keyEmpty} />
            {renderKey('0')}
            {renderKey('.')}
            <View style={styles.keyEmpty} />
          </View>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadow.lg,
  },
  atmDisplay: {
    backgroundColor: colors.surface.inverse,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  atmTitle: {
    color: colors.text.muted,
    fontSize: fontSize.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  atmTotalLabel: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  atmTotalValue: {
    color: colors.text.inverse,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    alignSelf: 'flex-start',
    marginTop: -8,
   fontFamily: 'SpaceGrotesk_700Bold',},
  atmCardDeco: {
    position: 'absolute',
    top: -20,
    right: -40,
    width: 160,
    height: 100,
    backgroundColor: '#222',
    borderRadius: borderRadius.lg,
    transform: [{ rotate: '15deg' }],
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333',
    ...shadow.md,
  },
  atmChip: {
    width: 32,
    height: 24,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
  bottomSection: {
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface.muted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  quickBtnPrimary: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  quickBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
   fontFamily: 'SpaceGrotesk_700Bold',},
  quickBtnTextPrimary: {
    color: colors.surface.background,
  },
  inputRow: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.background,
    ...shadow.sm,
  },
  inputPrefix: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    marginRight: spacing.sm,
   fontFamily: 'SpaceGrotesk_700Bold',},
  inputValue: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
   fontFamily: 'SpaceGrotesk_700Bold',},
  processBtn: {
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  processBtnDisabled: {
    opacity: 0.7,
  },
  processBtnText: {
    color: colors.surface.background,
    fontSize: fontSize.md,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  keypad: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  key: {
    flex: 1,
    backgroundColor: colors.surface.muted,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.text.primary,
   fontFamily: 'SpaceGrotesk_700Bold',},
  keyAction: {
    backgroundColor: colors.surface.border,
  },
  keyActionPrimary: {
    backgroundColor: colors.text.primary,
  },
  keyActionText: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  keyActionTextPrimary: {
    color: colors.surface.background,
  },
  keyEmpty: {
    flex: 1,
  },
});
}
