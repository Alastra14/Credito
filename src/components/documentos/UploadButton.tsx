import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants';
import { formatFileSize, generateId } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface Props {
  creditoId: string;
  onUploaded: (data: { nombre: string; uri: string; tipo: string; tamano: number }) => Promise<void>;
}

export default function UploadButton({ creditoId, onUploaded }: Props) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handlePick() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled || result.assets.length === 0) return;

      setLoading(true);

      for (const asset of result.assets) {
        const tamano = asset.size ?? 0;

        if (tamano > MAX_FILE_SIZE_BYTES) {
          showToast({
            title: 'Archivo muy grande',
            message: `El archivo ${asset.name} supera el límite de ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`,
            type: 'warning'
          });
          continue;
        }

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
      }
    } catch (err: any) {
      showToast({
        title: 'Error',
        message: err.message || 'No se pudo subir el documento',
        type: 'error'
      });
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
