import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Pago, TipoPago } from '@/types';
import { TIPOS_PAGO, MESES } from '@/lib/constants';
import { spacing } from '@/lib/theme';
import { parseNumber, today } from '@/lib/utils';

interface Props {
  creditoId: string;
  mesIndex: number; // 0-based
  anio: number;
  montoSugerido?: number;
  pagoExistente?: Pago | null;
  onSubmit: (data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>) => Promise<void>;
  onCancel: () => void;
}

const TIPO_OPTIONS = TIPOS_PAGO.map(t => ({ label: t.label, value: t.value }));

export default function PagoForm({
  mesIndex,
  anio,
  montoSugerido,
  pagoExistente,
  onSubmit,
  onCancel,
}: Props) {
  const [monto, setMonto] = useState(
    pagoExistente?.monto?.toString() ?? montoSugerido?.toString() ?? ''
  );
  const [tipo, setTipo] = useState<TipoPago>(pagoExistente?.tipo ?? 'normal');
  const [fecha, setFecha] = useState(pagoExistente?.fecha ?? today());
  const [notas, setNotas] = useState(pagoExistente?.notas ?? '');
  const [loading, setLoading] = useState(false);
  const [errMonto, setErrMonto] = useState('');

  async function handleSubmit() {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setErrMonto('Ingresa un monto válido');
      return;
    }
    setErrMonto('');
    setLoading(true);
    try {
      await onSubmit({
        mes: mesIndex + 1,
        anio,
        monto: parseNumber(monto),
        fecha,
        tipo,
        estado: 'pagado',
        notas: notas.trim() || undefined,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar el pago');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Input
        label={`Monto — ${MESES[mesIndex]} ${anio}`}
        value={monto}
        onChangeText={setMonto}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errMonto}
        autoFocus
      />

      <Select
        label="Tipo de pago"
        options={TIPO_OPTIONS}
        value={tipo}
        onChange={v => setTipo(v as TipoPago)}
      />

      <Input
        label="Fecha de pago"
        value={fecha}
        onChangeText={setFecha}
        placeholder="YYYY-MM-DD"
        hint="Formato: AAAA-MM-DD"
      />

      <Input
        label="Notas"
        value={notas}
        onChangeText={setNotas}
        placeholder="Opcional..."
        multiline
        numberOfLines={2}
      />

      <View style={styles.actions}>
        <Button variant="outline" onPress={onCancel} style={styles.btnCancel}>
          Cancelar
        </Button>
        <Button onPress={handleSubmit} loading={loading} style={styles.btnSubmit}>
          Registrar pago
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btnCancel: { flex: 1 },
  btnSubmit: { flex: 2 },
});
