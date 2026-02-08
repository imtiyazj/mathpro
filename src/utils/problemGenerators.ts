export interface MathProblem {
  question: string;
  answer: number;
  format?: 'input' | 'multiple-choice';
  options?: number[];
  baseTen?: BaseTenRepresentation;
}

export interface BaseTenRepresentation {
  hundreds: number;
  tens: number;
  ones: number;
}

export const generateAdditionSubtractionProblem = (): MathProblem => {
  const num1 = Math.floor(Math.random() * 10) + 1; // Numbers between 1 and 10
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operation = Math.random() < 0.5 ? '+' : '-';

  let question: string;
  let answer: number;

  if (operation === '+') {
    question = `${num1} + ${num2} = ?`;
    answer = num1 + num2;
  } else {
    // Ensure subtraction doesn't result in negative numbers for 1st graders
    if (num1 >= num2) {
      question = `${num1} - ${num2} = ?`;
      answer = num1 - num2;
    } else {
      question = `${num2} - ${num1} = ?`;
      answer = num2 - num1;
    }
  }

  return { question, answer };
};

export const generateNumberBondProblem = (): MathProblem => {
  const total = Math.floor(Math.random() * 10) + 5; // Total between 5 and 15
  const part1 = Math.floor(Math.random() * total); // Part1 between 0 and total-1
  const part2 = total - part1;

  // Randomly decide which part to make the unknown
  if (Math.random() < 0.5) {
    return { question: `${part1} + ? = ${total}`, answer: part2 };
  } else {
    return { question: `? + ${part2} = ${total}`, answer: part1 };
  }
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleNumbers = (numbers: number[]): number[] => {
  const shuffled = [...numbers];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
};

const buildMultipleChoiceOptions = (answer: number): number[] => {
  const candidates = [
    answer - 10,
    answer + 10,
    answer - 1,
    answer + 1,
    answer - 5,
    answer + 5,
    answer - 20,
    answer + 20,
  ].filter((value) => value >= 0 && value <= 199 && value !== answer);

  const uniqueCandidates = Array.from(new Set(candidates));
  const selected = shuffleNumbers(uniqueCandidates).slice(0, 2);

  while (selected.length < 2) {
    const fallback = randomInt(0, 199);
    if (fallback !== answer && !selected.includes(fallback)) {
      selected.push(fallback);
    }
  }

  return shuffleNumbers([answer, ...selected]);
};

export const generateBaseTenBlocksProblem = (): MathProblem => {
  const generateTypeOneProblem = (): MathProblem => {
    const hundreds = Math.random() < 0.65 ? 0 : 1;
    const tens = randomInt(1, 9);
    const ones = randomInt(0, 9);
    const answer = hundreds * 100 + tens * 10 + ones;
    const baseTen: BaseTenRepresentation = { hundreds, tens, ones };

    return {
      question: 'Write the number shown by the quick picture.',
      answer,
      format: 'input',
      baseTen,
    };
  };

  const generateTypeTwoProblem = (): MathProblem => {
    const hundreds = Math.random() < 0.65 ? 0 : 1;
    const tens = randomInt(1, 9);
    const ones = randomInt(0, 9);
    const answer = hundreds * 100 + tens * 10 + ones;
    const baseTen: BaseTenRepresentation = { hundreds, tens, ones };

    return {
      question: 'Which number does the quick picture show?',
      answer,
      format: 'multiple-choice',
      options: buildMultipleChoiceOptions(answer),
      baseTen,
    };
  };

  const generateTypeFiveProblem = (): MathProblem => {
    const patterns = [1, 2, 5, 10];
    const step = patterns[randomInt(0, patterns.length - 1)];
    const start = randomInt(10, 99 - step * 3);
    const terms = [start, start + step, start + step * 2];
    const answer = start + step * 3;

    return {
      question: `Find the next number: ${terms.join(', ')}, __`,
      answer,
      format: 'input',
    };
  };

  const generateTypeSixProblem = (): MathProblem => {
    const names = ['Ava', 'Noah', 'Mia', 'Leo', 'Liam', 'Emma'];
    const items = ['beads', 'stickers', 'coins', 'blocks', 'marbles'];
    const name = names[randomInt(0, names.length - 1)];
    const item = items[randomInt(0, items.length - 1)];
    const tens = randomInt(1, 9);
    const ones = randomInt(0, 9);
    const answer = tens * 10 + ones;

    return {
      question: `${name} has ${tens} tens and ${ones} ones ${item}. How many ${item} does ${name} have in all?`,
      answer,
      format: 'input',
    };
  };

  const generators = [
    generateTypeOneProblem,
    generateTypeTwoProblem,
    generateTypeFiveProblem,
    generateTypeSixProblem,
  ];

  return generators[randomInt(0, generators.length - 1)]();
};
