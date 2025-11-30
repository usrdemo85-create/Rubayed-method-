import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PracticeConfig, DrillProblem, Mode, Operation } from '../types';
import { generateProblem } from '../services/mathUtils';
import { generateOralDrillAudio } from '../services/geminiService';
import Keypad from './Keypad';

interface PracticeScreenProps {
  config: PracticeConfig;
  onFinish: (results: any) => void;
  onExit: () => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ config, onFinish, onExit }) => {
  const [currentProblem, setCurrentProblem] = useState<DrillProblem | null>(null);
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(0); // in seconds
  const [count, setCount] = useState(0); // number of problems solved
  const [correctCount, setCorrectCount] = useState(0);
  const [isOralPlaying, setIsOralPlaying] = useState(false);
  const [oralStatus, setOralStatus] = useState('');

  const [history, setHistory] = useState<any[]>([]);

  // Timer Ref
  const timerRef = useRef<number | null>(null);
  
  // Audio Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isTimed = config.mode === Mode.TIMED;
  const isOral = config.mode === Mode.ORAL;

  const loadNextProblem = useCallback(() => {
    const problem = generateProblem(config);
    setCurrentProblem(problem);
    setInput('');
    
    if (isOral) {
        playOralSequence(problem);
    }
  }, [config, isOral]);

  // Start logic
  useEffect(() => {
    loadNextProblem();
    
    if (isTimed) {
      const limitSeconds = config.timeLimit * 60;
      timerRef.current = window.setInterval(() => {
        setTimer((prev) => {
          if (prev >= limitSeconds) {
            finishSession();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const finishSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onFinish({ correct: correctCount, total: count, history });
  };

  const playOralSequence = async (problem: DrillProblem) => {
    setIsOralPlaying(true);
    setOralStatus('Generating Voice...');
    
    // Try Gemini TTS first
    if (process.env.API_KEY) {
        const audioUrl = await generateOralDrillAudio(problem.numbers, config.interval);
        if (audioUrl) {
            setOralStatus('Listen...');
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => {
                setIsOralPlaying(false);
                setOralStatus('');
            };
            audio.play();
            return;
        }
    }

    // Fallback to Web Speech API
    setOralStatus('Listen...');
    const nums = problem.numbers;
    let i = 0;
    
    const speakNext = () => {
      if (i >= nums.length) {
        setIsOralPlaying(false);
        setOralStatus('');
        // Speak "Answer"
        const u = new SpeechSynthesisUtterance("Answer");
        window.speechSynthesis.speak(u);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(nums[i].toString());
      utterance.rate = 0.9;
      utterance.onend = () => {
        i++;
        setTimeout(speakNext, config.interval * 1000);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleInput = (val: string) => {
    if (input.length < 8) setInput(prev => prev + val);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleNext = () => {
    if (!currentProblem) return;

    // Check Answer
    // Allow float answers just in case, though usually int
    const userVal = parseFloat(input);
    const isCorrect = Math.abs(userVal - currentProblem.answer) < 0.01;

    setHistory(prev => [...prev, { problem: currentProblem, userAnswer: userVal, isCorrect }]);
    if (isCorrect) setCorrectCount(prev => prev + 1);
    setCount(prev => prev + 1);

    // Check Drill Limits
    if (isOral && count + 1 >= config.numberOfSums) {
      finishSession();
    } else {
      loadNextProblem();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <button onClick={onExit} className="text-gray-400 font-bold">✕ Exit</button>
            <div className="text-yellow-500 font-mono text-xl tracking-widest">
                {isTimed ? formatTime(timer) : `Sum: ${count + 1}/${config.numberOfSums}`}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            
            {/* Answer Box Preview */}
            <div className={`
                flex items-center justify-between w-64 mb-12 p-4 rounded-xl border-2 
                ${input ? 'border-yellow-500 text-yellow-500' : 'border-slate-700 text-slate-700'}
            `}>
                <span className="text-sm text-gray-500 uppercase font-bold tracking-widest absolute -mt-10 bg-black px-2">Answer</span>
                <span className="text-4xl font-mono w-full text-right h-10">{input || '_'}</span>
            </div>

            {/* Problem Display */}
            {isOral && isOralPlaying ? (
                 <div className="animate-pulse flex flex-col items-center">
                    <div className="text-6xl mb-4">🎧</div>
                    <div className="text-yellow-500 font-bold text-xl">{oralStatus}</div>
                 </div>
            ) : (
                <div className={`font-mono text-right leading-tight tracking-wider
                    ${currentProblem?.numbers.length && currentProblem.numbers.length > 5 ? 'text-3xl' : 'text-5xl'} 
                    ${isOral ? 'hidden' : 'block'} 
                `}>
                    {/* Visual Mode: Show numbers */}
                    {!isOral && currentProblem && config.operation === Operation.ADD_LESS && (
                         <div className="flex flex-col items-end space-y-2">
                            {currentProblem.numbers.map((n, i) => (
                                <div key={i} className={n < 0 ? 'text-red-400' : 'text-white'}>{n}</div>
                            ))}
                         </div>
                    )}
                    
                    {!isOral && currentProblem && config.operation !== Operation.ADD_LESS && (
                         <div className="text-white text-6xl">
                            {currentProblem.displayString}
                         </div>
                    )}

                    {/* Oral Mode: Show placeholder only when not playing audio (waiting for answer) */}
                    {isOral && (
                        <div className="text-gray-500 text-sm">Enter Answer</div>
                    )}
                </div>
            )}
        </div>

        {/* Keypad */}
        <Keypad onInput={handleInput} onDelete={handleDelete} onNext={handleNext} />
    </div>
  );
};

export default PracticeScreen;