import React, { useState } from 'react';
import { evaluateWriting } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const WritingModule: React.FC = () => {
  const [step, setStep] = useState<'prompt' | 'write' | 'result'>('prompt');
  const [taskType, setTaskType] = useState('Task 2');
  const [question, setQuestion] = useState('Some people think that AI will replace teachers. To what extent do you agree?');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await evaluateWriting(taskType, question, essay);
      setResult(data);
      setStep('result');
    } catch (e) {
      alert("Error evaluating essay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Writing Practice</h2>
      
      {step === 'prompt' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Task</label>
            <select 
              value={taskType} onChange={(e) => setTaskType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option>Task 1 (Graph/Letter)</option>
              <option>Task 2 (Essay)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Prompt</label>
            <textarea 
              value={question} onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              rows={3}
            />
          </div>
          <button 
            onClick={() => setStep('write')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Start Writing
          </button>
        </div>
      )}

      {step === 'write' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-gray-700">Topic:</h3>
            <p>{question}</p>
          </div>
          <textarea 
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Write your essay here..."
          />
          <div className="flex justify-between items-center">
             <span className="text-sm text-gray-500">Word count: {essay.split(/\s+/).filter(w => w.length > 0).length}</span>
             <button 
                onClick={handleSubmit} disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
             >
                {loading ? 'Evaluating...' : 'Submit for Grading'}
             </button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-6">
           <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 p-4 rounded-full w-20 h-20 flex items-center justify-center font-bold text-3xl">
                  {result.bandScore}
              </div>
              <div>
                  <h3 className="text-xl font-bold">Estimated Band Score</h3>
                  <p className="text-gray-600">Based on official criteria</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border p-4 rounded bg-gray-50">
                  <h4 className="font-bold mb-2">Feedback</h4>
                  <div className="prose text-sm">
                      <ReactMarkdown>{result.feedback}</ReactMarkdown>
                  </div>
              </div>
              <div className="border p-4 rounded bg-green-50">
                  <h4 className="font-bold mb-2">Improved Version</h4>
                  <div className="prose text-sm text-gray-800 whitespace-pre-wrap">
                      {result.correctedVersion}
                  </div>
              </div>
           </div>
           <button onClick={() => setStep('prompt')} className="text-blue-600 hover:underline">Start New Task</button>
        </div>
      )}
    </div>
  );
};

export default WritingModule;
