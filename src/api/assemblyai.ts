// Types for AssemblyAI API responses and options
export interface TranscriptionConfig {
  audio_url: string;
  language_detection?: boolean;
  punctuate?: boolean;
  format_text?: boolean;
  speaker_labels?: boolean;
  speakers_expected?: number;
}

export interface TranscriptionStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  utterances?: Array<{
    speaker: string | number;
    text: string;
    start: number;
    end: number;
  }>;
  speaker_labels?: boolean;
  confidence?: number;
  language_code?: string;
  audio_duration?: number;
}

export interface UploadResponse {
  upload_url: string;
}

class AssemblyAIClient {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.assemblyai.com/v2';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('AssemblyAI API key is required');
    }
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const headers = {
      'Authorization': this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AssemblyAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Uploads an audio file to AssemblyAI
   * @param file The audio file to upload
   * @param onProgress Optional callback for upload progress
   * @returns Promise with the upload URL
   */
  async uploadAudio(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // First, read the file as an ArrayBuffer
      const buffer = await file.arrayBuffer();

      // Create request options with the file buffer
      const uploadOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      };

      // If progress callback is provided, use XMLHttpRequest instead of fetch
      if (onProgress) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              onProgress(progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.upload_url);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.open('POST', `${this.baseUrl}/upload`);
          xhr.setRequestHeader('Authorization', this.apiKey);
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          xhr.send(buffer);
        });
      }

      // If no progress callback, use regular fetch
      const response = await this.makeRequest<UploadResponse>(
        '/upload',
        uploadOptions
      );
      return response.upload_url;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Submits a transcription request
   * @param config Transcription configuration options
   * @returns Promise with the transcription ID
   */
  async submitTranscription(config: TranscriptionConfig): Promise<string> {
    try {
      const response = await this.makeRequest<{ id: string }>(
        '/transcript',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_url: config.audio_url,
            language_detection: config.language_detection ?? true,
            punctuate: config.punctuate ?? true,
            format_text: config.format_text ?? true,
            speaker_labels: config.speaker_labels ?? false,
            speakers_expected: config.speaker_labels ? config.speakers_expected : undefined,
          }),
        }
      );

      return response.id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Transcription request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Checks the status of a transcription
   * @param transcriptionId The ID of the transcription to check
   * @returns Promise with the transcription status
   */
  async getTranscriptionStatus(transcriptionId: string): Promise<TranscriptionStatus> {
    try {
      return await this.makeRequest<TranscriptionStatus>(
        `/transcript/${transcriptionId}`,
        { method: 'GET' }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Status check failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Polls for transcription completion
   * @param transcriptionId The ID of the transcription to poll
   * @param options Polling options (interval and timeout)
   * @param onProgress Optional callback for progress updates
   * @returns Promise with the completed transcription
   */
  async pollTranscriptionCompletion(
    transcriptionId: string,
    options: {
      interval?: number;
      timeout?: number;
    } = {},
    onProgress?: (status: TranscriptionStatus) => void
  ): Promise<TranscriptionStatus> {
    const interval = options.interval || 3000;
    const timeout = options.timeout || 300000; // 5 minutes default
    const startTime = Date.now();

    while (true) {
      const status = await this.getTranscriptionStatus(transcriptionId);
      
      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'error') {
        throw new Error(status.error || 'Transcription failed');
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Transcription timed out');
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  /**
   * Convenience method to handle the complete transcription process
   * @param file Audio file to transcribe
   * @param config Transcription configuration
   * @param callbacks Optional progress callbacks
   * @returns Promise with the completed transcription
   */
  async transcribeAudio(
    file: File,
    config: Omit<TranscriptionConfig, 'audio_url'>,
    callbacks?: {
      onUploadProgress?: (progress: number) => void;
      onTranscriptionProgress?: (status: TranscriptionStatus) => void;
    }
  ): Promise<TranscriptionStatus> {
    // Upload the file
    const uploadUrl = await this.uploadAudio(file, callbacks?.onUploadProgress);

    // Submit transcription request
    const transcriptionId = await this.submitTranscription({
      ...config,
      audio_url: uploadUrl,
    });

    // Poll for completion
    return await this.pollTranscriptionCompletion(
      transcriptionId,
      undefined,
      callbacks?.onTranscriptionProgress
    );
  }
}

export default AssemblyAIClient;