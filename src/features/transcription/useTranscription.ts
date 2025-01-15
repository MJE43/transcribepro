import { useState, useCallback } from 'react';
import AssemblyAIClient from '../../api/assemblyai';
import {
  TranscriptionStatus,
  TranscriptionSettings,
  TranscriptionProgress,
  TranscriptionResult,
} from './types';

export const useTranscription = (apiKey: string) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [progress, setProgress] = useState<TranscriptionProgress>({
    uploadProgress: 0,
    processingProgress: 0,
    status: 'idle',
  });
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setProgress({
      uploadProgress: 0,
      processingProgress: 0,
      status: 'idle',
    });
    setResult(null);
    setError(null);
  }, []);

  const startTranscription = useCallback(
    async (settings: TranscriptionSettings) => {
      if (!file) return;

      try {
        setStatus('uploading');
        setError(null);

        const client = new AssemblyAIClient(apiKey);

        const result = await client.transcribeAudio(
          file,
          {
            speaker_labels: settings.speakerDetection,
            speakers_expected: settings.speakerDetection ? settings.speakerCount : undefined,
          },
          {
            onUploadProgress: (progress) => {
              setProgress((prev) => ({
                ...prev,
                uploadProgress: progress,
                status: 'uploading',
              }));
            },
            onTranscriptionProgress: (status) => {
              setProgress((prev) => ({
                ...prev,
                processingProgress: status.status === 'completed' ? 100 : 50,
                status: status.status === 'completed' ? 'completed' : 'processing',
              }));
            },
          }
        );

        setStatus('completed');
        setResult({
          text: result.text || '',
          utterances: result.utterances,
          confidence: result.confidence || 0,
          audioDuration: result.audio_duration || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription failed');
        setStatus('error');
      }
    },
    [file, apiKey]
  );

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    file,
    status,
    progress,
    result,
    error,
    handleFileChange,
    startTranscription,
    reset,
  };
};