import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { CreditoFormData, TipoCredito, EstadoCredito } from '@/types';
import { TIPOS_CREDITO, ESTADOS_CREDITO, TIPOS_CREDITO_CON_PLAZO } from '@/lib/constants';
import { spacing } from '@/lib/theme';
import { parseNumber, parseOptionalInt, parseOptionalFloat } from '@/lib/utils';

interface Props {
  initialData?: Partial<CreditoFormData>;
  onSubmit: (data: CreditoFormData) => Promise<void>;
  onCancel: () => void;
}

type Errors = Partial<Record<keyof CreditoFormData, string>>;

const TIPO_OPTIONS = TIPOS_CREDITO.map(t => ({ label: t.label, value: t.value }));
const ESTADO_OPTIONS = ESTADOS_CREDITO.map(e => ({ label: e.label, value: e.value }));

export default function CreditoForm({ initialData, onSubmit, onCancel }: Props) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [tipo, setTipo] = useState<TipoCredito>(initialData?.tipo ?? 'personal');
  const [saldo, setSaldo] = useState(initialData?.saldoActual?.toString() ?? '');
  const [tasa, setTasa] = useState(initialData?.tasaAnual?.toString() ?? '');
  const [estado, setEstado] = useState<EstadoCredito>(initialData?.estado ?? 'activo');
  const [plazo, setPlazo] = useState(initialData?.plazoMeses?.toString() ?? '');
  const [cuota, setCuota] = useState(initialData?.cuotaMensual?.toString() ?? '');
  const [pagoMinimo, setPagoMinimo] = useState(initialData?.pagoMinimo?.toString() ?? '');
  const [fechaCorte, setFechaCorte] = useState(initialData?.fechaCorte?.toString() ?? '');
  const [fechaLimite, setFechaLimite] = useState(initialData?.fechaLimitePago?.toString() ?? '');
  const [institucion, setInstitucion] = useState(initialData?.institucion ?? '');
  const [notas, setNotas] = useState(initialData?.notas ?? '');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const esTarjeta = tipo === 'tarjeta_credito';
  const tienePlazo = TIPOS_CREDITO_CON_PLAZO.includes(tipo);

  function validate(): boolean {
    const e: Errors = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!saldo || isNaN(Number(saldo)) || Number(saldo) < 0) e.saldoActual = 'Ingresa un saldo válido';
    if (!tasa || isNaN(Number(tasa)) || Number(tasa) < 0) e.tasaAnual = 'Ingresa una tasa válida';
    if (tienePlazo && plazo && (isNaN(Number(plazo)) || Number(plazo) <= 0)) {
      e.plazoMeses = 'Ingresa un plazo válido en meses';
    }
    if (esTarjeta) {
      if (fechaCorte && (isNaN(Number(fechaCorte)) || Number(fechaCorte) < 1 || Number(fechaCorte) > 31)) {
        e.fechaCorte = 'Día entre 1 y 31';
      }
      if (fechaLimite && (isNaN(Number(fechaLimite)) || Number(fechaLimite) < 1 || Number(fechaLimite) > 31)) {
        e.fechaLimitePago = 'Día entre 1 y 31';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const data: CreditoFormData = {
        nombre: nombre.trim(),
        tipo,
        saldoActual: parseNumber(saldo),
        saldoOriginal: parseNumber(saldo),
        tasaAnual: parseNumber(tasa),
        estado,
        plazoMeses: tienePlazo ? parseOptionalInt(plazo) : undefined,
        cuotaMensual: cuota ? parseOptionalFloat(cuota) : undefined,
        pagoMinimo: esTarjeta ? parseOptionalFloat(pagoMinimo) : undefined,
        fechaCorte: esTarjeta ? parseOptionalInt(fechaCorte) : undefined,
        fechaLimitePago: esTarjeta ? parseOptionalInt(fechaLimite) : undefined,
        institucion: institucion.trim() || undefined,
        notas: notas.trim() || undefined,
      };
      await onSubmit(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el crédito');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Input
        label="Nombre del crédito *"
        value={nombre}
        onChangeText={setNombre}
        placeholder="ej. Tarjeta BBVA"
        error={errors.nombre}
        autoFocus
      />

      <Select
        label="Tipo *"
        options={TIPO_OPTIONS}
        value={tipo}
        onChange={v => setTipo(v as TipoCredito)}
      />

      <Input
        label="Saldo actual *"
        value={saldo}
        onChangeText={setSaldo}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.saldoActual}
      />

      <Input
        label="Tasa anual (%) *"
        value={tasa}
        onChangeText={setTasa}
        placeholder="ej. 24.5"
        keyboardType="decimal-pad"
        error={errors.tasaAnual}
      />

      {tienePlazo && (
        <Input
          label="Plazo (meses)"
          value={plazo}
          onChangeText={setPlazo}
          placeholder="ej. 36"
          keyboardType="number-pad"
          error={errors.plazoMeses}
        />
      )}

      <Input
        label="Cuota mensual"
        value={cuota}
        onChangeText={setCuota}
        placeholder="Calculada automáticamente si está vacía"
        keyboardType="decimal-pad"
        hint="Se calcula con amortización francesa si no la ingresas"
      />

      {esTarjeta && (
        <>
          <Input
            label="Pago mínimo"
            value={pagoMinimo}
            onChangeText={setPagoMinimo}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Día de corte"
                value={fechaCorte}
                onChangeText={setFechaCorte}
                placeholder="ej. 5"
                keyboardType="number-pad"
                error={errors.fechaCorte}
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Día límite de pago"
                value={fechaLimite}
                onChangeText={setFechaLimite}
                placeholder="ej. 25"
                keyboardType="number-pad"
                error={errors.fechaLimitePago}
              />
            </View>
          </View>
        </>
      )}

      <Input
        label="Institución"
        value={institucion}
        onChangeText={setInstitucion}
        placeholder="ej. BBVA, Banamex..."
      />

      <Select
        label="Estado"
        options={ESTADO_OPTIONS}
        value={estado}
        onChange={v => setEstado(v as EstadoCredito)}
      />

      <Input
        label="Notas"
        value={notas}
        onChangeText={setNotas}
        placeholder="Información adicional..."
        multiline
        numberOfLines={3}
      />

      <View style={styles.actions}>
        <Button variant="outline" onPress={onCancel} style={styles.btnCancel}>
          Cancelar
        </Button>
        <Button onPress={handleSubmit} loading={loading} style={styles.btnSubmit}>
          Guardar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btnCancel: {
    flex: 1,
  },
  btnSubmit: {
    flex: 2,
  },
});
