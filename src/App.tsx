import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transcription } from './features/transcription/components/Transcription';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('assemblyai-api-key') || '';
  });

  const handleApiKeySubmit = (newKey: string) => {
    localStorage.setItem('assemblyai-api-key', newKey);
    setApiKey(newKey);
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <Mic className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Voice Transcription
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your AssemblyAI API key to get started
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => handleApiKeySubmit(apiKey)}
            >
              Get Started
            </Button>
            <div className="text-center">
              <a
                href="https://www.assemblyai.com/dashboard/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Need an API key? Sign up for AssemblyAI
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Mic className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Voice Transcription
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Change API Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  type="password"
                  placeholder="Enter new API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => handleApiKeySubmit(apiKey)}
                >
                  Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Transcription apiKey={apiKey} />
      </main>
    </div>
  );
};

export default App;