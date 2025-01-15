import React, { useState } from 'react';
import { uploadFile, getTranscriptionResult } from '../api/assemblyai';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (file) {
      const uploadUrl = await uploadFile(file);
      const transcriptionResult = await getTranscriptionResult(uploadUrl);
      setTranscription(transcriptionResult.text);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload and Transcribe</button>
      </form>
      {transcription && <p>Transcription: {transcription}</p>}
    </div>
  );
};

export default FileUpload;
