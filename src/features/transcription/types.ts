export type TranscriptionStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface TranscriptionSettings {
  speakerDetection: boolean;
  speakerCount: number;
}

export interface TranscriptionProgress {
  uploadProgress: number;
  processingProgress: number;
  status: TranscriptionStatus;
}

export interface TranscriptionResult {
  text: string;
  utterances?: Array<{
    speaker: string | number;
    text: string;
  }>;
  confidence: number;
  audioDuration: number;
}