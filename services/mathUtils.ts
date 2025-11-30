import { PracticeConfig, DrillProblem, Operation, SumsType } from '../types';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getNumberWithDigits = (digits: number): number => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return randomInt(min, max);
};

// Parses "2-1" into random 1 or 2, or "3" into just 3.
const getDigitsFromConfig = (configStr: string): number => {
  if (configStr.includes('-')) {
    const parts = configStr.split('-').map(Number);
    // Randomly pick one of the options
    return parts[Math.floor(Math.random() * parts.length)];
  }
  return Number(configStr);
};

export const generateProblem = (config: PracticeConfig): DrillProblem => {
  const id = Math.random().toString(36).substr(2, 9);
  let numbers: number[] = [];
  let answer = 0;
  let displayString = '';

  if (config.operation === Operation.ADD_LESS) {
    const rowCount = config.rows;
    let currentSum = 0;

    for (let i = 0; i < rowCount; i++) {
      const digits = getDigitsFromConfig(config.digits);
      let num = getNumberWithDigits(digits);

      // Handle Add Less logic (subtraction)
      if (config.sumsType === SumsType.ADD_LESS && i > 0) {
        // Simple logic: 40% chance of subtraction if result stays positive (simplified for abacus drills)
        // Or just allow negatives. Abacus drills often allow intermediate negatives or enforce non-negative.
        // Let's implement "try to keep positive" for beginner friendliness, but allow negative if needed.
        const isSubtraction = Math.random() > 0.6;
        if (isSubtraction) {
          num = -num;
        }
      }
      numbers.push(num);
      currentSum += num;
    }
    answer = currentSum;
    displayString = numbers.join('\n');

  } else if (config.operation === Operation.MULTIPLY) {
    const num1 = getNumberWithDigits(config.multiplicandDigits);
    const num2 = getNumberWithDigits(config.multiplicatorDigits);
    numbers = [num1, num2];
    answer = num1 * num2;
    displayString = `${num1} × ${num2}`;

  } else if (config.operation === Operation.DIVIDE) {
    // Generate logical division problems (integer results preferred for abacus)
    const divisor = getNumberWithDigits(config.divisorDigits);
    // Generate a quotient first to ensure clean division
    // The dividend digits setting is a constraint.
    // We try to generate an answer such that answer * divisor fits the dividend digits.
    
    // Fallback: Just generate random dividend and check if it divides? No, too hard.
    // Reverse: Generate answer (quotient) such that quotient * divisor has `dividendDigits` length.
    
    const minDividend = Math.pow(10, config.dividendDigits - 1);
    const maxDividend = Math.pow(10, config.dividendDigits) - 1;
    
    // It's possible no integer combination exists for strict digit constraints, so we approximate.
    // We'll prioritize the dividend length.
    const dividend = randomInt(minDividend, maxDividend);
    // Adjust dividend to be a multiple of divisor for clean integer arithmetic
    const cleanDividend = dividend - (dividend % divisor); 
    
    // Edge case: if cleanDividend is 0 or too small, bump it up
    const finalDividend = cleanDividend === 0 ? divisor * randomInt(1, 9) : cleanDividend;
    
    numbers = [finalDividend, divisor];
    answer = finalDividend / divisor;
    displayString = `${finalDividend} ÷ ${divisor}`;
  }

  return { id, numbers, answer, displayString };
};
