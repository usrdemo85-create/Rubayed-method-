import React from 'react';

interface KeypadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onNext: () => void;
  onSubmit?: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ onInput, onDelete, onNext }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="grid grid-cols-4 gap-2 p-2 bg-slate-900 pb-6">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onInput(k)}
          className="h-16 rounded-lg bg-slate-800 border border-yellow-600/30 text-2xl font-bold text-yellow-500 active:bg-yellow-600/20 transition-colors shadow-lg"
        >
          {k}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="h-16 rounded-lg bg-slate-800 border border-red-900/30 text-2xl font-bold text-red-500 active:bg-red-900/20 flex items-center justify-center transition-colors"
      >
        ⌫
      </button>
      <button
        onClick={onNext}
        className="col-span-4 h-16 rounded-lg bg-yellow-600 text-slate-900 text-xl font-bold active:bg-yellow-500 transition-colors mt-2 shadow-yellow-900/20 shadow-lg uppercase tracking-wider"
      >
        Next
      </button>
    </div>
  );
};

export default Keypad;
