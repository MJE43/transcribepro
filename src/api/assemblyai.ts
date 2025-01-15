const API_URL = 'https://api.assemblyai.com/v2';
const API_KEY = 'YOUR_API_KEY_HERE';

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'authorization': API_KEY,
    },
    body: formData,
  });

  const data = await response.json();
  return data.upload_url;
}

export async function getTranscriptionResult(transcriptionId: string): Promise<any> {
  const response = await fetch(`${API_URL}/transcript/${transcriptionId}`, {
    method: 'GET',
    headers: {
      'authorization': API_KEY,
    },
  });

  const data = await response.json();
  return data;
}
