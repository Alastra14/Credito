import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { CreditoFormData, TipoCredito, EstadoCredito } from '@/types';
import { TIPOS_CREDITO, ESTADOS_CREDITO, TIPOS_CREDITO_CON_PLAZO } from '@/lib/constants';
import { spacing, borderRadius, shadow, fontSize } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { parseNumber, parseOptionalInt, parseOptionalFloat } from '@/lib/utils';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';
import { useToast } from '@/components/ui/Toast';
import AppModal from '@/components/ui/Modal';

interface Props {
  initialData?: Partial<CreditoFormData>;
  onSubmit: (data: CreditoFormData) => Promise<void>;
  onCancel: () => void;
}

type Errors = Partial<Record<keyof CreditoFormData, string>>;

const TIPO_OPTIONS = TIPOS_CREDITO.map(t => ({ label: t.label, value: t.value }));
const ESTADO_OPTIONS = ESTADOS_CREDITO.map(e => ({ label: e.label, value: e.value }));

export default function CreditoForm({ initialData, onSubmit, onCancel }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [tipo, setTipo] = useState<TipoCredito>(initialData?.tipo ?? 'personal');
  const [saldo, setSaldo] = useState(initialData?.saldoActual != null ? initialData.saldoActual.toFixed(2) : '');
  const [limiteCredito, setLimiteCredito] = useState(initialData?.limiteCredito != null ? initialData.limiteCredito.toFixed(2) : '');
  const [tasa, setTasa] = useState(initialData?.tasaAnual != null ? initialData.tasaAnual.toFixed(2) : '');
  const [estado, setEstado] = useState<EstadoCredito>(initialData?.estado ?? 'activo');
  const [plazo, setPlazo] = useState(initialData?.plazoMeses?.toString() ?? '');
  const [cuota, setCuota] = useState(initialData?.cuotaMensual != null ? initialData.cuotaMensual.toFixed(2) : '');
  const [pagoMinimo, setPagoMinimo] = useState(initialData?.pagoMinimo != null ? initialData.pagoMinimo.toFixed(2) : '');
  const [fechaCorte, setFechaCorte] = useState(initialData?.fechaCorte?.toString() ?? '');
  const [fechaLimite, setFechaLimite] = useState(initialData?.fechaLimitePago?.toString() ?? '');
  const [institucion, setInstitucion] = useState(initialData?.institucion ?? '');
  const [notas, setNotas] = useState(initialData?.notas ?? '');
  const [documentosPendientes, setDocumentosPendientes] = useState<{nombre: string, tipo: string, uri: string, tamano: number}[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showAIConfigModal, setShowAIConfigModal] = useState(false);

  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();
  const { showToast } = useToast();

  const esTarjeta = tipo === 'tarjeta_credito';
  const tienePlazo = TIPOS_CREDITO_CON_PLAZO.includes(tipo);

  const handleUploadStatement = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || result.assets.length === 0) return;

      setLoadingAI(true);
      
      const provider = await SecureStore.getItemAsync('ai_provider') || 'openai';
      const apiKey = await SecureStore.getItemAsync('ai_api_key') || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        setShowAIConfigModal(true);
        setLoadingAI(false);
        return;
      }

      // Check if any file is a PDF and provider is OpenAI
      const hasPdf = result.assets.some(asset => (asset.mimeType || '').includes('pdf'));
      if (hasPdf && provider === 'openai') {
        showToast({
          title: 'Aviso',
          message: 'OpenAI no soporta PDFs directamente en esta versión. Por favor, usa Claude o Gemini, o sube imágenes.',
          type: 'warning'
        });
        setLoadingAI(false);
        return;
      }

      // Read all files as base64
      const filesData = await Promise.all(result.assets.map(async (asset) => {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
        return {
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          name: asset.name,
          size: asset.size || 0,
          base64
        };
      }));

      const systemPrompt = `Eres un asistente experto en finanzas. Extrae la siguiente información del estado de cuenta de la tarjeta de crédito y devuélvela ESTRICTAMENTE en formato JSON.
Campos requeridos:
- nombre (string, ej. "Tarjeta Oro BBVA")
- saldoActual (number, el saldo a pagar o deuda total)
- limiteCredito (number, el límite de crédito total otorgado)
- tasaAnual (number, la tasa de interés anual o CAT, si no la encuentras pon 0)
- pagoMinimo (number, el pago mínimo requerido)
- fechaCorte (number, el día del mes en que corta, ej. 15)
- fechaLimitePago (number, el día del mes límite para pagar, ej. 5)
- institucion (string, el nombre del banco, ej. "BBVA")

Responde SOLO con el JSON, sin markdown ni texto adicional.`;

      let content = '';

      if (provider === 'openai') {
        const imageContents = filesData.map(f => ({
          type: 'image_url',
          image_url: { url: `data:${f.mimeType};base64,${f.base64}` }
        }));
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Extrae los datos de este estado de cuenta:' },
                  ...imageContents
                ]
              }
            ],
            temperature: 0.1
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        content = data.choices[0].message.content;
      } else if (provider === 'claude') {
        const documentContents = filesData.map(f => ({
          type: f.mimeType.includes('pdf') ? 'document' : 'image',
          source: {
            type: 'base64',
            media_type: f.mimeType,
            data: f.base64
          }
        }));

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: [
                  ...documentContents,
                  { type: 'text', text: 'Extrae los datos de este estado de cuenta:' }
                ]
              }
            ],
            temperature: 0.1
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        content = data.content[0].text;
      } else if (provider === 'gemini') {
        const inlineDataContents = filesData.map(f => ({
          inline_data: {
            mime_type: f.mimeType,
            data: f.base64
          }
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              {
                parts: [
                  { text: 'Extrae los datos de este estado de cuenta:' },
                  ...inlineDataContents
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1
            }
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        content = data.candidates[0].content.parts[0].text;
      }

      // Limpiar posible markdown (```json ... ```)
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const extracted = JSON.parse(cleanJson);

      setNombre(extracted.nombre || '');
      setTipo('tarjeta_credito');
      setSaldo(extracted.saldoActual?.toString() || '');
      setLimiteCredito(extracted.limiteCredito?.toString() || '');
      setTasa(extracted.tasaAnual?.toString() || '');
      setPagoMinimo(extracted.pagoMinimo?.toString() || '');
      setFechaCorte(extracted.fechaCorte?.toString() || '');
      setFechaLimite(extracted.fechaLimitePago?.toString() || '');
      setInstitucion(extracted.institucion || '');
      
      const nuevosDocumentos = filesData.map(f => ({
        nombre: f.name,
        tipo: f.mimeType,
        uri: f.uri,
        tamano: f.size
      }));

      setDocumentosPendientes(prev => [...prev, ...nuevosDocumentos]);

      showToast({
        title: '¡Éxito!',
        message: `Se han extraído los datos correctamente y ${filesData.length > 1 ? 'los documentos se guardarán' : 'el documento se guardará'} al guardar el crédito.`,
        type: 'success'
      });

    } catch (error: any) {
      console.error(error);
      
      let errorMessage = error.message || 'No se pudo procesar el documento.';
      
      // Detectar errores comunes de cuota/saldo en las APIs
      const errorStr = errorMessage.toLowerCase();
      if (errorStr.includes('quota') || errorStr.includes('rate limit') || errorStr.includes('insufficient') || errorStr.includes('billing') || errorStr.includes('429')) {
        errorMessage = 'Has excedido el límite o saldo de tu API Key. Por favor, verifica tu facturación en la plataforma de la IA o intenta con otro proveedor en Configuración.';
      }

      showToast({
        title: 'Error de IA',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoadingAI(false);
    }
  };

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
        limiteCredito: esTarjeta ? parseOptionalFloat(limiteCredito) : undefined,
        tasaAnual: parseNumber(tasa),
        estado,
        plazoMeses: tienePlazo ? parseOptionalInt(plazo) : undefined,
        cuotaMensual: cuota ? parseOptionalFloat(cuota) : undefined,
        pagoMinimo: esTarjeta ? parseOptionalFloat(pagoMinimo) : undefined,
        fechaCorte: esTarjeta ? parseOptionalInt(fechaCorte) : undefined,
        fechaLimitePago: esTarjeta ? parseOptionalInt(fechaLimite) : undefined,
        institucion: institucion.trim() || undefined,
        notas: notas.trim() || undefined,
        documentosPendientes: documentosPendientes.length > 0 ? documentosPendientes : undefined,
      };
      await onSubmit(data);
    } catch (err: any) {
      showToast({
        title: 'Error',
        message: err.message || 'No se pudo guardar el crédito',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      scrollEventThrottle={scrollEventThrottle}
    >
      <TouchableOpacity 
        style={styles.aiButton} 
        onPress={handleUploadStatement}
        disabled={loadingAI}
      >
        <View style={styles.aiIconContainer}>
          <Ionicons name="sparkles" size={24} color={colors.surface.background} />
        </View>
        <View style={styles.aiTextContainer}>
          <Text style={styles.aiTitle}>
            {loadingAI ? 'Analizando documento...' : 'Subir Statement'}
          </Text>
          <Text style={styles.aiSubtitle}>
            {loadingAI ? 'La IA está extrayendo los datos' : 'Autocompletar con IA'}
          </Text>
        </View>
        {!loadingAI && <Ionicons name="cloud-upload-outline" size={24} color={colors.primary.default} />}
      </TouchableOpacity>

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

      {esTarjeta && (
        <Input
          label="Límite de crédito"
          value={limiteCredito}
          onChangeText={setLimiteCredito}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      )}

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

      <AppModal
        visible={showAIConfigModal}
        onClose={() => setShowAIConfigModal(false)}
        title="IA no configurada"
      >
        <Text style={styles.modalText}>
          No tienes una API Key configurada para usar la Inteligencia Artificial. ¿Deseas configurarla ahora?
        </Text>
        <View style={styles.modalActions}>
          <Button 
            variant="outline" 
            onPress={() => setShowAIConfigModal(false)}
            style={styles.modalBtn}
          >
            Cancelar
          </Button>
          <Button 
            onPress={() => {
              setShowAIConfigModal(false);
              router.push('/configuracion');
            }}
            style={styles.modalBtn}
          >
            Configurar
          </Button>
        </View>
      </AppModal>
    </ScrollView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  btnCancel: {
    flex: 1,
  },
  btnSubmit: {
    flex: 2,
  },
  modalText: {
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
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.light,
    ...shadow.sm,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  aiSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
}
