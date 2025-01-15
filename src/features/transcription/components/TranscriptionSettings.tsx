import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TranscriptionSettingsProps {
  speakerDetection: boolean;
  speakerCount: number;
  onSettingsChange: (settings: { speakerDetection: boolean; speakerCount: number }) => void;
  disabled?: boolean;
}

export const TranscriptionSettings: React.FC<TranscriptionSettingsProps> = ({
  speakerDetection,
  speakerCount,
  onSettingsChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-5 w-5 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900">Transcription Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="speaker-detection">Speaker Detection</Label>
            <p className="text-sm text-gray-500">
              Identify different speakers in the audio
            </p>
          </div>
          <Switch
            id="speaker-detection"
            checked={speakerDetection}
            onCheckedChange={(checked) => {
              onSettingsChange({
                speakerDetection: checked,
                speakerCount,
              });
            }}
            disabled={disabled}
          />
        </div>

        {speakerDetection && (
          <div className="ml-6">
            <Label htmlFor="speaker-count">Number of Speakers</Label>
            <Select
              value={String(speakerCount)}
              onValueChange={(value) => {
                onSettingsChange({
                  speakerDetection,
                  speakerCount: parseInt(value),
                });
              }}
              disabled={disabled}
            >
              <SelectTrigger id="speaker-count" className="w-32">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num} Speakers
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};