import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/LanguageContext';
import AppModal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const DB_NAME = 'creditos.db';
const AI_PROVIDER_KEY = 'ai_provider';
const AI_API_KEY = 'ai_api_key';

type AiProvider = 'openai' | 'claude' | 'gemini';

const AI_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
    url: 'https://platform.openai.com/api-keys',
    instructions: 'Ve a platform.openai.com, inicia sesión, ve a la sección de API Keys y crea una nueva clave secreta.',
  },
  {
    id: 'claude',
    name: 'Claude',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/512px-Anthropic_logo.svg.png',
    url: 'https://console.anthropic.com/settings/keys',
    instructions: 'Ve a console.anthropic.com, inicia sesión, ve a Settings > API Keys y genera una nueva clave.',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/512px-Google_Gemini_logo.svg.png',
    url: 'https://aistudio.google.com/app/apikey',
    instructions: 'Ve a Google AI Studio, inicia sesión con tu cuenta de Google y haz clic en "Get API key".',
  },
];

export default function ConfiguracionScreen() {
  const { colors, themePreference, setThemePreference } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');
  const [aiApiKey, setAiApiKey] = useState('');
  const [savingAi, setSavingAi] = useState(false);
  const [dbToImport, setDbToImport] = useState<string | null>(null);
  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();
  const { showToast } = useToast();

  useEffect(() => {
    loadAiSettings();
  }, []);

  const loadAiSettings = async () => {
    try {
      const provider = await SecureStore.getItemAsync(AI_PROVIDER_KEY);
      const key = await SecureStore.getItemAsync(AI_API_KEY);
      if (provider) setAiProvider(provider as AiProvider);
      if (key) setAiApiKey(key);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const saveAiSettings = async () => {
    try {
      setSavingAi(true);
      await SecureStore.setItemAsync(AI_PROVIDER_KEY, aiProvider);
      await SecureStore.setItemAsync(AI_API_KEY, aiApiKey);
      showToast({
        title: 'Éxito',
        message: 'Configuración de IA guardada correctamente.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      showToast({
        title: 'Error',
        message: 'No se pudo guardar la configuración de IA.',
        type: 'error'
      });
    } finally {
      setSavingAi(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);

      if (!fileInfo.exists) {
        showToast({
          title: 'Error',
          message: 'No se encontró la base de datos.',
          type: 'error'
        });
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showToast({
          title: 'Error',
          message: 'La opción de compartir no está disponible en este dispositivo.',
          type: 'error'
        });
        return;
      }

      await Sharing.shareAsync(dbPath, {
        mimeType: 'application/x-sqlite3',
        dialogTitle: 'Exportar copia de seguridad',
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: 'Error',
        message: 'Ocurrió un error al exportar la base de datos.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      // Basic validation
      if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
        showToast({
          title: 'Archivo inválido',
          message: 'Por favor selecciona un archivo de base de datos SQLite (.db o .sqlite)',
          type: 'warning'
        });
        return;
      }

      setDbToImport(file.uri);
    } catch (error) {
      console.error(error);
      showToast({
        title: 'Error',
        message: 'Ocurrió un error al importar la base de datos.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = async () => {
    if (!dbToImport) return;
    try {
      const dbDir = `${FileSystem.documentDirectory}SQLite`;
      const dbPath = `${dbDir}/${DB_NAME}`;
      
      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(dbDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
      }

      // Copy the imported file to the database path
      await FileSystem.copyAsync({
        from: dbToImport,
        to: dbPath,
      });

      showToast({
        title: 'Éxito',
        message: 'La base de datos ha sido restaurada. Por favor, reinicia la aplicación para aplicar los cambios.',
        type: 'success'
      });
    } catch (e) {
      console.error(e);
      showToast({
        title: 'Error',
        message: 'No se pudo restaurar la base de datos.',
        type: 'error'
      });
    } finally {
      setDbToImport(null);
    }
  };

  const [activeMenu, setActiveMenu] = useState<'main' | 'apariencia' | 'ia' | 'lenguaje' | 'datos'>('main');

  const renderMainMenu = () => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.actionRow} onPress={() => setActiveMenu('apariencia')}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface.muted }]}>
          <Ionicons name="color-palette-outline" size={24} color={colors.primary.default} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{t('appearance')}</Text>
          <Text style={styles.actionSubtitle}>Tema claro, oscuro o automático</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.actionRow} onPress={() => setActiveMenu('ia')}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface.muted }]}>
          <Ionicons name="hardware-chip-outline" size={24} color={colors.info.default} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Inteligencia Artificial</Text>
          <Text style={styles.actionSubtitle}>Configura tu proveedor de IA</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.actionRow} onPress={() => setActiveMenu('lenguaje')}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface.muted }]}>
          <Ionicons name="language-outline" size={24} color={colors.success.default} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{t('language')}</Text>
          <Text style={styles.actionSubtitle}>Español, English, 日本語</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.actionRow} onPress={() => setActiveMenu('datos')}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface.muted }]}>
          <Ionicons name="server-outline" size={24} color={colors.warning.default} />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Datos y Copias</Text>
          <Text style={styles.actionSubtitle}>Exportar y restaurar base de datos</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </TouchableOpacity>
    </View>
  );

  const renderApariencia = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveMenu('main')}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>{t('appearance')}</Text>
      <View style={styles.card}>
        <View style={styles.themeContainer}>
          <Text style={styles.inputLabel}>{t('theme')}</Text>
          <View style={styles.themeRow}>
            {[
              { id: 'light', label: t('light'), icon: 'sunny-outline' },
              { id: 'dark', label: t('dark'), icon: 'moon-outline' },
              { id: 'system', label: t('system'), icon: 'phone-portrait-outline' }
            ].map((t_item) => (
              <TouchableOpacity
                key={t_item.id}
                style={[
                  styles.themeButton,
                  themePreference === t_item.id && styles.themeButtonActive,
                ]}
                onPress={() => setThemePreference(t_item.id as any)}
              >
                <Ionicons 
                  name={t_item.icon as any} 
                  size={24} 
                  color={themePreference === t_item.id ? colors.surface.background : colors.text.primary} 
                />
                <Text
                  style={[
                    styles.themeText,
                    themePreference === t_item.id && styles.themeTextActive,
                  ]}
                >
                  {t_item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );

  const renderLenguaje = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveMenu('main')}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>{t('language')}</Text>
      <View style={styles.card}>
        <View style={styles.themeContainer}>
          <Text style={styles.inputLabel}>{t('selectLanguage')}</Text>
          <View style={styles.themeRow}>
            {[
              { id: 'es', label: 'Español', icon: 'language-outline' },
              { id: 'en', label: 'English', icon: 'language-outline' },
              { id: 'ja', label: '日本語', icon: 'language-outline' }
            ].map((l_item) => (
              <TouchableOpacity
                key={l_item.id}
                style={[
                  styles.themeButton,
                  language === l_item.id && styles.themeButtonActive,
                ]}
                onPress={() => setLanguage(l_item.id as any)}
              >
                <Ionicons 
                  name={l_item.icon as any} 
                  size={24} 
                  color={language === l_item.id ? colors.surface.background : colors.text.primary} 
                />
                <Text
                  style={[
                    styles.themeText,
                    language === l_item.id && styles.themeTextActive,
                  ]}
                >
                  {l_item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );

  const renderIA = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveMenu('main')}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Inteligencia Artificial</Text>
      <Text style={styles.description}>
        Configura tu proveedor de IA y tu API Key para habilitar funciones avanzadas como la extracción automática de datos de estados de cuenta.
      </Text>

      <View style={styles.card}>
        <View style={styles.aiProviderContainer}>
          <Text style={styles.inputLabel}>Proveedor de IA</Text>
          <View style={styles.providerRow}>
            {AI_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerButton,
                  aiProvider === provider.id && styles.providerButtonActive,
                ]}
                onPress={() => setAiProvider(provider.id as AiProvider)}
              >
                <Image source={{ uri: provider.logo }} style={styles.providerLogo} resizeMode="contain" />
                <Text
                  style={[
                    styles.providerText,
                    aiProvider === provider.id && styles.providerTextActive,
                  ]}
                >
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.aiKeyContainer}>
          <Text style={styles.inputLabel}>API Key</Text>
          <TextInput
            style={styles.input}
            value={aiApiKey}
            onChangeText={setAiApiKey}
            placeholder={`Ingresa tu API Key de ${AI_PROVIDERS.find(p => p.id === aiProvider)?.name}`}
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.saveButton, savingAi && styles.saveButtonDisabled]}
            onPress={saveAiSettings}
            disabled={savingAi}
          >
            <Text style={styles.saveButtonText}>
              {savingAi ? 'Guardando...' : 'Guardar Configuración'}
            </Text>
          </TouchableOpacity>

          <View style={styles.aiInstructionsContainer}>
            <Text style={styles.aiInstructionsTitle}>¿Cómo conseguir tu API Key?</Text>
            <Text style={styles.aiInstructionsText}>
              {AI_PROVIDERS.find(p => p.id === aiProvider)?.instructions}
            </Text>
            <TouchableOpacity 
              style={styles.aiInstructionsLink}
              onPress={() => {
                const url = AI_PROVIDERS.find(p => p.id === aiProvider)?.url;
                if (url) Linking.openURL(url);
              }}
            >
              <Text style={styles.aiInstructionsLinkText}>Obtener API Key aquí</Text>
              <Ionicons name="open-outline" size={14} color={colors.primary.default} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );

  const renderDatos = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveMenu('main')}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Datos y Copias de Seguridad</Text>
      <Text style={styles.description}>
        Tus datos se guardan localmente en tu dispositivo. Puedes exportar una copia de seguridad para guardarla en la nube o transferirla a otro dispositivo.
      </Text>

      <View style={styles.card}>
        <View style={styles.themeContainer}>
          <Text style={styles.inputLabel}>Opciones de Datos</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[styles.themeButton, { flex: 1 }]}
              onPress={handleExport}
              disabled={loading}
            >
              <Ionicons name="cloud-upload-outline" size={24} color={colors.text.primary} />
              <Text style={styles.themeText}>Exportar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeButton, { flex: 1 }]}
              onPress={handleImport}
              disabled={loading}
            >
              <Ionicons name="cloud-download-outline" size={24} color={colors.text.primary} />
              <Text style={styles.themeText}>Restaurar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      scrollEventThrottle={scrollEventThrottle}
    >
      {activeMenu === 'main' && (
        <>
          {/* Perfil */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={40} color={colors.surface.background} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Mi Perfil</Text>
              <Text style={styles.profileEmail}>usuario@credito.app</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {renderMainMenu()}
        </>
      )}

      {activeMenu === 'apariencia' && renderApariencia()}
      {activeMenu === 'ia' && renderIA()}
      {activeMenu === 'lenguaje' && renderLenguaje()}
      {activeMenu === 'datos' && renderDatos()}

      <AppModal
        visible={!!dbToImport}
        onClose={() => setDbToImport(null)}
        title="Restaurar copia de seguridad"
      >
        <Text style={styles.modalText}>
          ¿Estás seguro? Esto sobrescribirá todos tus datos actuales y la aplicación se reiniciará.
        </Text>
        <View style={styles.modalActions}>
          <Button 
            variant="outline" 
            onPress={() => setDbToImport(null)}
            style={styles.modalBtn}
          >
            Cancelar
          </Button>
          <Button 
            onPress={confirmImport}
            style={[styles.modalBtn, { backgroundColor: colors.destructive.default }]}
          >
            Restaurar
          </Button>
        </View>
      </AppModal>
    </ScrollView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  content: {
    padding: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xxl,
    ...shadow.md,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    ...shadow.md,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  themeContainer: {
    padding: spacing.lg,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
    gap: spacing.xs,
  },
  themeButtonActive: {
    borderColor: colors.text.primary,
    backgroundColor: colors.text.primary,
  },
  themeText: {
    fontSize: fontSize.xs,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  themeTextActive: {
    color: colors.surface.background,
  },
  divider: {
    height: 2,
    backgroundColor: colors.surface.border,
  },
  aiProviderContainer: {
    padding: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  providerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  providerButtonActive: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.light,
  },
  providerLogo: {
    width: 32,
    height: 32,
    marginBottom: spacing.xs,
  },
  providerText: {
    fontSize: fontSize.xs,
    fontWeight: '900',
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  providerTextActive: {
    color: colors.text.primary,
  },
  aiKeyContainer: {
    padding: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface.background,
    borderWidth: 2,
    borderColor: colors.surface.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.surface.background,
    fontSize: fontSize.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiInstructionsContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface.muted,
    borderRadius: borderRadius.md,
  },
  aiInstructionsTitle: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  aiInstructionsText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  aiInstructionsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiInstructionsLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: colors.primary.default,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
}
