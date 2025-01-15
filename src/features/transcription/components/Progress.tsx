import React from 'react';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { TranscriptionProgress } from '../types';

interface ProgressProps {
  progress: TranscriptionProgress;
}

export const Progress: React.FC<ProgressProps> = ({ progress }) => {
  const getProgressValue = () => {
    switch (progress.status) {
      case 'uploading':
        return progress.uploadProgress * 0.4; // Upload is 40% of total progress
      case 'processing':
        return 40 + (progress.processingProgress * 0.6); // Processing is 60% of total progress
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'uploading':
        return `Uploading... ${Math.round(progress.uploadProgress)}%`;
      case 'processing':
        return 'Processing transcription...';
      case 'completed':
        return 'Transcription complete!';
      default:
        return 'Starting...';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{getStatusText()}</span>
        <span className="text-gray-500">{Math.round(getProgressValue())}%</span>
      </div>
      <ProgressBar
        value={getProgressValue()}
        className="w-full h-2"
      />
    </div>
  );
};