import React, { useState } from 'react';
import { AppMode, Difficulty } from './types';
import WritingModule from './components/WritingModule';
import ReadingModule from './components/ReadingModule';
import ListeningModule from './components/ListeningModule';
import VocabModule from './components/VocabModule';
import LiveSpeaking from './components/LiveSpeaking';
import ImageEditor from './components/ImageEditor';
import VeoStudio from './components/VeoStudio';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INTERMEDIATE);

  const renderContent = () => {
    switch (mode) {
      case AppMode.WRITING:
        return <WritingModule />;
      case AppMode.READING:
        return <ReadingModule difficulty={difficulty} />;
      case AppMode.LISTENING:
        return <ListeningModule difficulty={difficulty} />;
      case AppMode.VOCAB_GRAMMAR:
        return <VocabModule difficulty={difficulty} />;
      case AppMode.SPEAKING:
        return <LiveSpeaking />;
      case AppMode.IMAGE_TOOLS:
        return <ImageEditor />;
      case AppMode.VEO_STUDIO:
        return <VeoStudio />;
      default:
        return (
          <div className="animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Difficulty Level</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.values(Difficulty).map((lvl) => (
                        <button 
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                                difficulty === lvl 
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Standard IELTS Modules */}
                <MenuCard 
                title="Listening Test" 
                icon="🎧" 
                desc="Part 1-4 practice with AI simulated audio scripts and questions."
                onClick={() => setMode(AppMode.LISTENING)} 
                />
                <MenuCard 
                title="Reading Test" 
                icon="📖" 
                desc="Full passages with timed MCQ, Matching, and True/False questions."
                onClick={() => setMode(AppMode.READING)} 
                />
                <MenuCard 
                title="Writing Test" 
                icon="✍️" 
                desc="Task 1 & 2 practice with instant AI grading & feedback."
                onClick={() => setMode(AppMode.WRITING)} 
                />
                <MenuCard 
                title="Speaking Test (Live)" 
                icon="🎙️" 
                desc="Real-time conversation with an AI Examiner using Gemini Live."
                onClick={() => setMode(AppMode.SPEAKING)} 
                highlight
                />
                <MenuCard 
                title="Vocab & Grammar" 
                icon="📚" 
                desc="Topic-based word lists and grammar quizzes tailored to your level."
                onClick={() => setMode(AppMode.VOCAB_GRAMMAR)} 
                />

                {/* Experimental/AI Tools */}
                <MenuCard 
                title="Visual Vocab Builder" 
                icon="🎨" 
                desc="Edit images with text prompts to create custom description tasks."
                onClick={() => setMode(AppMode.IMAGE_TOOLS)} 
                />
                <MenuCard 
                title="Veo Dynamic Study" 
                icon="🎬" 
                desc="Animate static images into videos for advanced description practice."
                onClick={() => setMode(AppMode.VEO_STUDIO)} 
                />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
       {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer group" onClick={() => setMode(AppMode.MENU)}>
             <div className="bg-blue-600 text-white p-2 rounded-lg mr-3 group-hover:bg-blue-700 transition">
               <span className="font-bold text-xl">IELTS</span>
             </div>
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">GenAI Master</h1>
          </div>
          {mode !== AppMode.MENU && (
             <button 
                onClick={() => setMode(AppMode.MENU)}
                className="text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center transition"
             >
                <span className="material-icons text-lg mr-1">arrow_back</span> Back to Menu
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          Powered by Gemini 2.5 Flash, Pro & Veo. Unofficial Practice Tool.
        </div>
      </footer>
    </div>
  );
};

const MenuCard: React.FC<{ title: string; icon: string; desc: string; onClick: () => void; highlight?: boolean }> = ({ 
    title, icon, desc, onClick, highlight 
}) => (
    <div 
        onClick={onClick}
        className={`bg-white p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 flex flex-col h-full ${
            highlight ? 'border-blue-300 ring-4 ring-blue-50' : 'border-gray-200'
        }`}
    >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed flex-grow">{desc}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 text-blue-600 text-sm font-semibold flex items-center">
            Start Practice <span className="material-icons text-sm ml-1">arrow_forward</span>
        </div>
    </div>
);

export default App;