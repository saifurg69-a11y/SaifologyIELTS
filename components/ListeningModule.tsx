import React, { useState, useEffect } from 'react';
import { generateListeningTest } from '../services/geminiService';
import { Difficulty } from '../types';

const ListeningModule: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes for a section

  useEffect(() => {
    generateListeningTest(difficulty).then(data => {
        setTest(data);
        setLoading(false);
    });
  }, [difficulty]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !loading) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }
  }, [timeLeft, showResult, loading]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-gray-600">Simulating IELTS Listening Audio & Questions...</p>
        </div>
    </div>
  );

  if (!test) return <div>Error loading test.</div>;

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach((q: any) => {
        if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
            correct++;
        }
    });
    return correct;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-icons text-blue-500">headphones</span> 
            Listening Section ({difficulty})
         </h2>
         <div className={`px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
            Time Left: {formatTime(timeLeft)}
         </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-8">
         <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <span className="material-icons text-sm">info</span> Simulated Audio Transcript
         </h3>
         <p className="text-sm text-yellow-800 mb-3 italic">
            (In the real exam, you would hear this audio once. Read carefully as a simulation.)
         </p>
         <div className="bg-white p-4 rounded border border-yellow-100 h-64 overflow-y-auto font-serif text-gray-800 leading-relaxed shadow-inner">
             <p className="whitespace-pre-wrap">{test.script}</p>
         </div>
      </div>

      <div className="space-y-8">
        {test.questions.map((q: any) => (
            <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                <p className="font-medium text-lg mb-3 text-gray-800">{q.id}. {q.text}</p>
                {q.type === 'MCQ' ? (
                    <div className="space-y-3 pl-4">
                        {q.options.map((opt: string) => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name={`q-${q.id}`} 
                                    value={opt}
                                    onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                                    disabled={showResult}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="group-hover:text-blue-700 transition-colors">{opt}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="pl-4">
                        <input 
                            type="text" 
                            className="border border-gray-300 p-3 rounded-md w-full max-w-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                            placeholder="Type your answer..."
                            onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                            disabled={showResult}
                        />
                    </div>
                )}
                {showResult && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm flex items-start gap-2">
                        {answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim() ? (
                            <span className="material-icons text-green-500 text-lg">check_circle</span>
                        ) : (
                            <span className="material-icons text-red-500 text-lg">cancel</span>
                        )}
                        <div>
                            <p><span className="font-bold text-gray-700">Correct Answer:</span> {q.correctAnswer}</p>
                            {answers[q.id]?.toLowerCase().trim() !== q.correctAnswer.toLowerCase().trim() && (
                                <p className="text-red-600 mt-1">Your Answer: {answers[q.id] || "(No answer)"}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>

      {!showResult ? (
          <button 
            onClick={() => setShowResult(true)}
            className="mt-8 w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Submit Listening Test
          </button>
      ) : (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Score: {calculateScore()} / {test.questions.length}</h3>
              <p className="text-blue-700 mb-4">
                Estimated Band Score contribution: {Math.min(9, (calculateScore() / test.questions.length) * 9).toFixed(1)}
              </p>
              <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline font-medium">
                 Try Another Test
              </button>
          </div>
      )}
    </div>
  );
};

export default ListeningModule;