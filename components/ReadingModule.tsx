import React, { useState, useEffect } from 'react';
import { generateReadingTest } from '../services/geminiService';
import { Difficulty } from '../types';

const ReadingModule: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes for one passage

  useEffect(() => {
    generateReadingTest(difficulty).then(data => {
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

  if (loading) return <div className="text-center p-10 text-gray-500">Generating Reading Test (Passage & Questions)...</div>;
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
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-icons text-green-600">menu_book</span> Reading: {difficulty}
        </h2>
        <div className={`px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-800'}`}>
            Time Left: {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8 leading-relaxed border border-gray-200 font-serif text-lg shadow-inner max-h-[60vh] overflow-y-auto">
        {test.passage}
      </div>

      <div className="space-y-8">
        {test.questions.map((q: any) => (
            <div key={q.id} className="border-b border-gray-100 pb-6">
                <p className="font-medium mb-3 text-lg">{q.id}. {q.text}</p>
                {q.type === 'MCQ' ? (
                    <div className="space-y-2 pl-2">
                        {q.options.map((opt: string) => (
                            <label key={opt} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                                <input 
                                    type="radio" 
                                    name={`q-${q.id}`} 
                                    value={opt}
                                    onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                                    disabled={showResult}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <input 
                        type="text" 
                        className="border border-gray-300 p-2 rounded w-full max-w-md focus:ring-2 focus:ring-green-200 outline-none"
                        placeholder="Your answer"
                        onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                        disabled={showResult}
                    />
                )}
                {showResult && (
                    <div className="mt-3 text-sm p-3 bg-gray-50 rounded">
                        <span className="font-bold text-green-700">Correct: {q.correctAnswer}</span>
                        {answers[q.id]?.toLowerCase().trim() !== q.correctAnswer.toLowerCase().trim() && (
                            <span className="ml-4 font-bold text-red-600">You: {answers[q.id] || "No Answer"}</span>
                        )}
                    </div>
                )}
            </div>
        ))}
      </div>

      {!showResult ? (
          <button 
            onClick={() => setShowResult(true)}
            className="mt-8 bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 shadow-lg font-semibold transition"
          >
            Submit Reading Test
          </button>
      ) : (
          <div className="mt-8 p-6 bg-green-50 rounded-lg text-center border border-green-100">
              <h3 className="text-2xl font-bold text-green-900 mb-2">Your Score: {calculateScore()} / {test.questions.length}</h3>
              <p className="text-green-700">Good practice! Review your mistakes above.</p>
          </div>
      )}
    </div>
  );
};

export default ReadingModule;