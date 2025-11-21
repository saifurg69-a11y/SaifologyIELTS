import React, { useState, useEffect } from 'react';
import { generateVocabQuiz } from '../services/geminiService';
import { Difficulty } from '../types';

const VocabModule: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const fetchQuiz = () => {
      setLoading(true);
      setShowResult(false);
      setAnswers({});
      generateVocabQuiz(difficulty).then(data => {
          setQuestions(data.questions || []);
          setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuiz();
  }, [difficulty]);

  if (loading) return (
      <div className="flex items-center justify-center min-h-[300px]">
         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
  );

  const score = questions.filter(q => answers[q.id] === q.correctAnswer).length;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Vocab & Grammar</h2>
            <p className="text-gray-500 text-sm">{difficulty} Level Challenge</p>
        </div>
        <button onClick={fetchQuiz} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-semibold">
            <span className="material-icons text-sm">refresh</span> New Quiz
        </button>
      </div>

      <div className="space-y-8">
          {questions.map((q, index) => (
              <div key={q.id} className="bg-gray-50 p-6 rounded-lg transition hover:shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                      <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {index + 1}
                      </span>
                      <p className="font-medium text-gray-800 pt-1">{q.text}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                      {q.options.map((opt: string) => (
                          <button 
                            key={opt}
                            onClick={() => !showResult && setAnswers(prev => ({...prev, [q.id]: opt}))}
                            disabled={showResult}
                            className={`p-3 rounded-md text-left text-sm transition border ${
                                answers[q.id] === opt 
                                ? 'bg-purple-600 text-white border-purple-600' 
                                : 'bg-white hover:bg-purple-50 border-gray-200 text-gray-700'
                            } ${showResult && opt === q.correctAnswer ? '!bg-green-100 !text-green-800 !border-green-300 font-bold' : ''}
                               ${showResult && answers[q.id] === opt && opt !== q.correctAnswer ? '!bg-red-100 !text-red-800 !border-red-300' : ''}
                            `}
                          >
                              {opt}
                          </button>
                      ))}
                  </div>
                  
                  {showResult && (
                      <div className="ml-11 mt-4 text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                          <strong className="text-purple-700">Explanation:</strong> {q.explanation || "No explanation provided."}
                      </div>
                  )}
              </div>
          ))}
      </div>

      {!showResult ? (
          <button 
            onClick={() => setShowResult(true)}
            disabled={Object.keys(answers).length !== questions.length}
            className="w-full mt-8 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Check Answers
          </button>
      ) : (
          <div className="mt-8 text-center bg-purple-50 p-6 rounded-lg">
              <p className="text-2xl font-bold text-purple-900 mb-2">You got {score} out of {questions.length}!</p>
              <button 
                onClick={fetchQuiz}
                className="px-6 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 shadow-sm"
              >
                Next Quiz
              </button>
          </div>
      )}
    </div>
  );
};

export default VocabModule;