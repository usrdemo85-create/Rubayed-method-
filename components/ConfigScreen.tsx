import React, { useState } from 'react';
import { Mode, Operation, PracticeConfig, SumsType, SavedPreset } from '../types';

interface ConfigScreenProps {
  config: PracticeConfig;
  setConfig: React.Dispatch<React.SetStateAction<PracticeConfig>>;
  onStart: () => void;
  onViewHistory: () => void;
  savedPresets: SavedPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ 
  config, 
  setConfig, 
  onStart, 
  onViewHistory,
  savedPresets,
  onSavePreset,
  onDeletePreset
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleChange = (key: keyof PracticeConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveClick = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim());
      setNewPresetName('');
      setIsSaving(false);
    }
  };

  const renderSelect = (label: string, value: any, options: (string | number)[], onChange: (val: any) => void) => (
    <div className="flex flex-col mb-4">
      <label className="text-gray-300 mb-2 font-medium ml-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl p-4 appearance-none focus:outline-none focus:border-yellow-500 transition-colors text-lg"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          ▼
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
      
      {/* Presets Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">Quick Presets</label>
        </div>
        
        <div className="flex overflow-x-auto pb-2 no-scrollbar gap-2">
          {/* Save New Button */}
          <button 
            onClick={() => setIsSaving(true)}
            className="flex-none bg-yellow-600/10 border border-yellow-600/40 text-yellow-500 rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap hover:bg-yellow-600/20 transition-all flex items-center"
          >
            <span>+ Save Current</span>
          </button>

          {savedPresets.map(preset => (
             <div key={preset.id} className="flex-none flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden group hover:border-slate-500 transition-colors">
                <button
                    onClick={() => setConfig(preset.config)}
                    className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white border-r border-slate-700/50"
                >
                    {preset.name}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDeletePreset(preset.id); }}
                    className="px-2 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Preset"
                >
                    ×
                </button>
            </div>
          ))}
        </div>

        {/* Save Input Form */}
        {isSaving && (
            <div className="flex gap-2 mt-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
                <input 
                    type="text" 
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Name this preset..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveClick()}
                />
                <button 
                    onClick={handleSaveClick}
                    className="bg-yellow-600 text-slate-900 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-yellow-500"
                >
                    Save
                </button>
                <button 
                    onClick={() => setIsSaving(false)}
                    className="text-gray-400 px-2 text-xs hover:text-white"
                >
                    Cancel
                </button>
            </div>
        )}
      </div>

      {/* Top Tabs: Timed vs Oral */}
      <div className="flex bg-slate-800 p-1 rounded-2xl mb-6">
        <button
          onClick={() => handleChange('mode', Mode.TIMED)}
          className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold transition-all ${
            config.mode === Mode.TIMED ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-gray-400'
          }`}
        >
          <span className="mr-2">⏱</span> Timed
        </button>
        <button
          onClick={() => handleChange('mode', Mode.ORAL)}
          className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold transition-all ${
            config.mode === Mode.ORAL ? 'bg-yellow-500 text-slate-900 shadow-md' : 'text-gray-400'
          }`}
        >
          <span className="mr-2">🎧</span> Oral
        </button>
      </div>

      {/* Sub Tabs: Operation */}
      <div className="flex justify-between mb-8 space-x-2">
        {[
            { id: Operation.ADD_LESS, label: 'Add Less', icon: '±' },
            { id: Operation.MULTIPLY, label: 'Multiply', icon: '×' },
            { id: Operation.DIVIDE, label: 'Divide', icon: '÷' }
        ].map((op) => (
            <button
            key={op.id}
            onClick={() => handleChange('operation', op.id)}
            className={`flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
                config.operation === op.id
                ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                : 'bg-slate-800 border-transparent text-gray-400 hover:bg-slate-700'
            }`}
            >
            <span className="text-2xl font-bold mb-1">{op.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">{op.label}</span>
            </button>
        ))}
      </div>

      {/* Configuration Form */}
      <div className="space-y-2">
        {config.operation === Operation.ADD_LESS && (
          <>
            {renderSelect('Sums Type', config.sumsType, [SumsType.ADDITION, SumsType.ADD_LESS], (v) => handleChange('sumsType', v))}
            {renderSelect('No of Digits', config.digits, ['1', '2', '2-1', '3', '3-2', '4', '4-3', '5', '5-4'], (v) => handleChange('digits', v))}
            {renderSelect('No of Rows', config.rows, [3, 5, 7, 10, 12, 15], (v) => handleChange('rows', Number(v)))}
          </>
        )}

        {config.operation === Operation.MULTIPLY && (
          <>
            {renderSelect('Multiplicand Digits', config.multiplicandDigits, [1, 2, 3, 4, 5], (v) => handleChange('multiplicandDigits', Number(v)))}
            {renderSelect('Multiplicator Digits', config.multiplicatorDigits, [1, 2, 3, 4, 5], (v) => handleChange('multiplicatorDigits', Number(v)))}
          </>
        )}

        {config.operation === Operation.DIVIDE && (
          <>
            {renderSelect('Dividend Digits', config.dividendDigits, [2, 3, 4, 5, 6], (v) => handleChange('dividendDigits', Number(v)))}
            {renderSelect('Divisor Digits', config.divisorDigits, [1, 2, 3], (v) => handleChange('divisorDigits', Number(v)))}
          </>
        )}

        {/* Mode Specific Configs */}
        {config.mode === Mode.TIMED ? (
          renderSelect('Time to Practice', `${config.timeLimit} Min`, ['1 Min', '2 Mins', '3 Mins', '5 Mins'], (v) => handleChange('timeLimit', parseInt(v)))
        ) : (
          <>
            {renderSelect('No of Sums', config.numberOfSums, [5, 10, 15, 20], (v) => handleChange('numberOfSums', Number(v)))}
            
            <div className="flex flex-col mb-4">
              <label className="text-gray-300 mb-2 font-medium ml-1">Wait Time Interval: {config.interval}s</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5" 
                value={config.interval}
                onChange={(e) => handleChange('interval', Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                 <span>Fast (1s)</span>
                 <span>Slow (10s)</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-transparent border-2 border-yellow-600 text-yellow-500 text-lg font-bold hover:bg-yellow-600 hover:text-slate-900 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.2)]"
        >
          Start Practice
        </button>
        <button
            onClick={onViewHistory}
          className="w-full py-4 rounded-xl bg-slate-800 text-yellow-600/80 text-lg font-bold border border-transparent hover:border-yellow-900/50 transition-all uppercase tracking-widest"
        >
          View Performance History
        </button>
      </div>
    </div>
  );
};

export default ConfigScreen;