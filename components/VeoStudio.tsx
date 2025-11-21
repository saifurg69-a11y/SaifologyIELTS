import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';

const VeoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      const imgBase64 = image ? image.split(',')[1] : undefined;
      const url = await generateVideo(prompt, imgBase64);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Video generation failed. Ensure you have selected a billed project key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-3 mb-6">
        <span className="material-icons text-3xl text-purple-600">movie_creation</span>
        <h2 className="text-2xl font-bold">Dynamic Study Aids (Veo)</h2>
      </div>
      <p className="mb-6 text-gray-600">
        Transform static images into 720p videos to practice describing moving scenes. 
        <br/><span className="text-xs text-purple-500">Powered by Veo 3.1</span>
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reference Image (Optional)</label>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {image && <img src={image} alt="Ref" className="h-32 object-cover rounded border" />}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Prompt</label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the motion e.g., 'The waves are crashing on the shore', 'Cinematic drone shot of the city'"
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 h-32"
                />
            </div>
        </div>

        <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 font-semibold shadow-md transition-all"
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Video (may take 1-2 mins)...
                </span>
            ) : 'Generate Video'}
        </button>

        {videoUrl && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Generated Result</h3>
                <video controls src={videoUrl} className="w-full rounded-lg shadow-lg" autoPlay loop />
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800 font-medium">Practice Task: Describe the movement in this video for 60 seconds.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VeoStudio;
