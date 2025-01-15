import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranscription } from '../useTranscription';
import { FileUpload } from './FileUpload';
import { TranscriptionSettings } from './Settings';
import { Progress } from './Progress';
import { TranscriptionStatus } from '../types';

interface TranscriptionProps {
  apiKey: string;
}

export const Transcription: React.FC<TranscriptionProps> = ({ apiKey }) => {
  const {
    file,
    status,
    progress,
    result,
    error,
    handleFileChange,
    startTranscription,
    reset,
  } = useTranscription(apiKey);

  const [settings, setSettings] = useState({
    speakerDetection: false,
    speakerCount: 2,
  });

  const handleStartTranscription = async () => {
    await startTranscription(settings);
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;

    const textToCopy = result.utterances
      ? result.utterances
          .map((u) => `Speaker ${u.speaker}: ${u.text}`)
          .join('\n\n')
      : result.text;

    await navigator.clipboard.writeText(textToCopy);
  };

  const handleDownload = () => {
    if (!result) return;

    const textToDownload = result.utterances
      ? result.utterances
          .map((u) => `Speaker ${u.speaker}: ${u.text}`)
          .join('\n\n')
      : result.text;

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isProcessing = status === 'uploading' || status === 'processing';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Audio</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            file={file}
            onFileChange={handleFileChange}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <TranscriptionSettings
            speakerDetection={settings.speakerDetection}
            speakerCount={settings.speakerCount}
            onSettingsChange={setSettings}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <Progress progress={progress} />
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Transcription Result</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {result.utterances ? (
              <div className="space-y-4">
                {result.utterances.map((utterance, index) => (
                  <div key={index} className="space-y-1">
                    <div className="font-medium text-sm text-gray-500">
                      Speaker {utterance.speaker}
                    </div>
                    <p className="text-gray-900">{utterance.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-900">{result.text}</p>
            )}
          </CardContent>
        </Card>
      )}

      {file && status === 'idle' && (
        <div className="flex justify-end">
          <Button onClick={handleStartTranscription}>
            Start Transcription
          </Button>
        </div>
      )}
    </div>
  );
};