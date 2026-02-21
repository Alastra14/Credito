import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants';
import { formatFileSize, generateId } from '@/lib/utils';

interface Props {
  creditoId: string;
  onUploaded: (data: { nombre: string; uri: string; tipo: string; tamano: number }) => Promise<void>;
}

export default function UploadButton({ creditoId, onUploaded }: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePick() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const tamano = asset.size ?? 0;

      if (tamano > MAX_FILE_SIZE_BYTES) {
        Alert.alert(
          'Archivo muy grande',
          `El archivo supera el límite de ${formatFileSize(MAX_FILE_SIZE_BYTES)}. Tamaño: ${formatFileSize(tamano)}`
        );
        return;
      }

      setLoading(true);

      // Copiar al directorio de la app (persiste entre reinicios)
      const dir = FileSystem.documentDirectory + `creditos/${creditoId}/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      const ext = asset.name.split('.').pop() ?? 'bin';
      const destName = `${generateId()}.${ext}`;
      const destUri = dir + destName;

      await FileSystem.copyAsync({ from: asset.uri, to: destUri });

      await onUploaded({
        nombre: asset.name,
        uri: destUri,
        tipo: asset.mimeType ?? 'application/octet-stream',
        tamano,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo subir el documento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onPress={handlePick}
      loading={loading}
      icon={<Ionicons name="cloud-upload-outline" size={16} color="inherit" />}
    >
      Adjuntar documento
    </Button>
  );
}
