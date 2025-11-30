export enum Mode {
  TIMED = 'TIMED',
  ORAL = 'ORAL',
}

export enum Operation {
  ADD_LESS = 'ADD_LESS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
}

export enum SumsType {
  ADDITION = 'Addition',
  ADD_LESS = 'Add Less',
}

export interface PracticeConfig {
  mode: Mode;
  operation: Operation;
  sumsType: SumsType;
  digits: string; // "1", "2", "2-1", etc.
  rows: number;
  timeLimit: number; // in minutes
  interval: number; // in seconds (for oral)
  numberOfSums: number; // for oral/multiply/divide count
  multiplicandDigits: number;
  multiplicatorDigits: number;
  dividendDigits: number;
  divisorDigits: number;
}

export interface SavedPreset {
  id: string;
  name: string;
  config: PracticeConfig;
}

export interface DrillProblem {
  id: string;
  numbers: number[]; // For addition: list of numbers. For mult: [a, b]. For div: [a, b]
  answer: number;
  displayString: string; // Helper for display (e.g. "34 x 5")
}

export interface DrillResult {
  correct: number;
  total: number;
  history: { problem: DrillProblem; userAnswer: number; isCorrect: boolean }[];
}