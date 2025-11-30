import React, { useState, useEffect } from 'react';
import ConfigScreen from './components/ConfigScreen';
import PracticeScreen from './components/PracticeScreen';
import Navbar from './components/Navbar';
import { Mode, Operation, PracticeConfig, SumsType, SavedPreset } from './types';
import { getPerformanceAdvice } from './services/geminiService';

const defaultConfig: PracticeConfig = {
  mode: Mode.TIMED,
  operation: Operation.ADD_LESS,
  sumsType: SumsType.ADDITION,
  digits: '1',
  rows: 3,
  timeLimit: 1,
  interval: 2,
  numberOfSums: 5,
  multiplicandDigits: 2,
  multiplicatorDigits: 1,
  dividendDigits: 3,
  divisorDigits: 1,
};

const App: React.FC = () => {
  const [view, setView] = useState<'config' | 'practice' | 'results'>('config');
  const [config, setConfig] = useState<PracticeConfig>(defaultConfig);
  const [results, setResults] = useState<any>(null);
  const [aiTip, setAiTip] = useState<string>('');
  
  // Preset Management
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rubayed-method-presets');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  const handleSavePreset = (name: string) => {
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name,
      config: { ...config }
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('rubayed-method-presets', JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('rubayed-method-presets', JSON.stringify(updated));
  };

  const handleStart = () => {
    setView('practice');
  };

  const handleFinish = async (res: any) => {
    setResults(res);
    setView('results');
    
    // Get AI Feedback
    const accuracy = Math.round((res.correct / res.total) * 100) || 0;
    const timeSpent = config.mode === Mode.TIMED ? `${config.timeLimit} mins` : 'N/A';
    
    // Only fetch if enabled
    if (process.env.API_KEY) {
        setAiTip("Asking AI Coach...");
        const tip = await getPerformanceAdvice(accuracy, timeSpent);
        setAiTip(tip);
    } else {
        setAiTip(accuracy > 80 ? "Excellent work!" : "Keep practicing!");
    }
  };

  const handleExit = () => {
    setView('config');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-900">
      
      {/* View Switcher */}
      {view === 'config' && (
        <>
          <div className="p-4 pt-8 bg-slate-900 border-b border-slate-800 shadow-lg z-10">
             <h1 className="text-xl font-bold text-yellow-500 tracking-wider uppercase flex items-center gap-2">
                <span className="text-2xl">🧮</span> Rubayed Method
             </h1>
          </div>
          <ConfigScreen 
            config={config} 
            setConfig={setConfig} 
            onStart={handleStart} 
            onViewHistory={() => alert("History feature coming soon!")}
            savedPresets={savedPresets}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
          />
          <Navbar active="home" />
        </>
      )}

      {view === 'practice' && (
        <PracticeScreen 
          config={config} 
          onFinish={handleFinish} 
          onExit={handleExit} 
        />
      )}

      {view === 'results' && results && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Session Complete</h2>
                <div className="w-20 h-1 bg-yellow-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center border border-slate-700">
                    <span className="text-4xl font-bold text-green-400">{results.correct}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Correct</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center border border-slate-700">
                    <span className="text-4xl font-bold text-blue-400">{results.total}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Total</span>
                </div>
                <div className="col-span-2 bg-slate-800 p-6 rounded-2xl flex flex-col items-center border border-slate-700">
                    <span className="text-5xl font-bold text-yellow-500">
                        {Math.round((results.correct / results.total) * 100) || 0}%
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Accuracy</span>
                </div>
            </div>

            {/* AI Coach Section */}
            <div className="w-full bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                <h3 className="text-indigo-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <span>🤖</span> AI Coach Feedback
                </h3>
                <p className="text-indigo-100 text-sm italic leading-relaxed">
                    "{aiTip}"
                </p>
            </div>

            <button 
                onClick={handleExit}
                className="w-full py-4 rounded-xl bg-yellow-600 text-slate-900 font-bold uppercase tracking-widest hover:bg-yellow-500 transition-colors shadow-lg"
            >
                Back to Home
            </button>
        </div>
      )}
    </div>
  );
};

export default App;