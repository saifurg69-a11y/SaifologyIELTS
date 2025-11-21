import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const newImage = await editImage(base64Data, prompt);
      setImage(newImage);
    } catch (err) {
      console.error(err);
      alert("Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-3 mb-6">
        <span className="material-icons text-3xl text-yellow-500">image_edit_auto</span>
        <h2 className="text-2xl font-bold">Visual Vocabulary Builder</h2>
      </div>
      <p className="mb-4 text-gray-600">
        Upload a practice image and use AI to modify it. Great for generating unique "Describe this image" prompts for Speaking Part 2 or Writing Task 1.
        <br/><span className="text-xs text-gray-400">Powered by Nano Banana (Gemini 2.5 Flash Image)</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
           <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center bg-gray-50 relative overflow-hidden">
              {image ? (
                <img src={image} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-500">No image uploaded</p>
                </div>
              )}
           </div>
           <input 
             type="file" 
             ref={fileInputRef}
             onChange={handleFileChange} 
             accept="image/*"
             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
           />
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700">Edit Prompt</label>
             <input 
               type="text" 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="e.g., 'Add a crowd of people in the background' or 'Turn it into a sketch'"
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
             />
           </div>
           <button 
             onClick={handleGenerate}
             disabled={loading || !image}
             className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-semibold"
           >
             {loading ? 'Processing...' : 'Apply AI Edit'}
           </button>
           <p className="text-xs text-gray-500">
             Try asking to remove objects, change the weather, or change the artistic style.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
