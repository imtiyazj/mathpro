export interface TwoWaysProblemData {
  target: number;
  firstName: string;
  secondName: string;
}

export interface MathProblem {
  question: string;
  answer: number;
  format?: 'input' | 'multiple-choice';
  options?: number[];
  baseTen?: BaseTenRepresentation;
  interactiveType?: 'two-ways';
  twoWaysData?: TwoWaysProblemData;
}

export interface BaseTenRepresentation {
  hundreds: number;
  tens: number;
  ones: number;
}

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomChoice = <T>(values: T[]): T => {
  return values[randomInt(0, values.length - 1)];
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

const buildSmallMultipleChoiceOptions = (answer: number, max: number): number[] => {
  const candidates = [
    answer - 1,
    answer + 1,
    answer - 2,
    answer + 2,
    answer - 3,
    answer + 3,
    answer - 5,
    answer + 5,
  ].filter((value) => value >= 0 && value <= max && value !== answer);

  const uniqueCandidates = Array.from(new Set(candidates));
  const selected = shuffleNumbers(uniqueCandidates).slice(0, 2);

  while (selected.length < 2) {
    const fallback = randomInt(0, max);
    if (fallback !== answer && !selected.includes(fallback)) {
      selected.push(fallback);
    }
  }

  return shuffleNumbers([answer, ...selected]);
};

const buildTwoWaysProblemData = (): TwoWaysProblemData => {
  const names = ['Ava', 'Noah', 'Mia', 'Leo', 'Liam', 'Emma', 'Jane', 'Liz'];
  const firstName = randomChoice(names);
  const secondName = randomChoice(names.filter((person) => person !== firstName));

  return {
    target: randomInt(22, 68),
    firstName,
    secondName,
  };
};

export const generateDragAndDropProblem = (): MathProblem => {
  const items = ['beads', 'stickers', 'coins', 'blocks', 'marbles'];
  const item = randomChoice(items);
  const twoWays = buildTwoWaysProblemData();

  return {
    question: `${twoWays.firstName} and ${twoWays.secondName} each use ${twoWays.target} ${item} to make necklaces. Show two different ways they can each use ${twoWays.target} ${item} with tens and ones. Drag sticks and dots, then write tens and ones for each.`,
    answer: twoWays.target,
    format: 'input',
    interactiveType: 'two-ways',
    twoWaysData: twoWays,
  };
};

export const generateAdditionSubtractionProblem = (): MathProblem => {
  const names = ['Ava', 'Noah', 'Mia', 'Leo', 'Liam', 'Emma'];
  const items = ['stickers', 'apples', 'blocks', 'coins', 'marbles'];

  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const sum = a + b;

  const minuend = randomInt(6, 20);
  const subtrahend = randomInt(1, minuend - 1);
  const difference = minuend - subtrahend;

  const bigger = randomInt(6, 20);
  const smaller = randomInt(1, bigger - 1);
  const nameA = randomChoice(names);
  const nameB = randomChoice(names.filter((name) => name !== nameA));
  const item = randomChoice(items);

  const templates: MathProblem[] = [
    { question: `${a} + ${b} = ?`, answer: sum, format: 'input' },
    { question: `? + ${b} = ${sum}`, answer: a, format: 'input' },
    { question: `${a} + ? = ${sum}`, answer: b, format: 'input' },
    { question: `${sum} - ${a} = ?`, answer: b, format: 'input' },
    { question: `${sum} - ? = ${a}`, answer: b, format: 'input' },
    { question: `${minuend} - ${subtrahend} = ?`, answer: difference, format: 'input' },
    { question: `${nameA} has ${a} ${item}. ${nameA} gets ${b} more. How many ${item} now?`, answer: sum, format: 'input' },
    { question: `${nameA} has ${minuend} ${item}. ${nameA} gives away ${subtrahend}. How many left?`, answer: difference, format: 'input' },
    {
      question: `${nameA} has ${bigger} ${item}. ${nameB} has ${smaller} ${item}. How many more does ${nameA} have?`,
      answer: bigger - smaller,
      format: 'input',
    },
  ];

  return randomChoice(templates);
};

export const generateNumberBondProblem = (): MathProblem => {
  const total = randomInt(6, 20);
  const part1 = randomInt(0, total);
  const part2 = total - part1;

  const templates: MathProblem[] = [
    { question: `${part1} + ? = ${total}`, answer: part2, format: 'input' },
    { question: `? + ${part2} = ${total}`, answer: part1, format: 'input' },
    { question: `${total} = ${part1} + ?`, answer: part2, format: 'input' },
    { question: `${total} = ? + ${part2}`, answer: part1, format: 'input' },
    { question: `${total} - ${part1} = ?`, answer: part2, format: 'input' },
    { question: `${total} - ? = ${part1}`, answer: part2, format: 'input' },
    {
      question: `Pick the missing part: ${part1} + ? = ${total}`,
      answer: part2,
      format: 'multiple-choice',
      options: buildSmallMultipleChoiceOptions(part2, 25),
    },
  ];

  return randomChoice(templates);
};

export const generateBaseTenBlocksProblem = (): MathProblem => {
  const buildBaseTen = (): { baseTen: BaseTenRepresentation; value: number } => {
    const hundreds = Math.random() < 0.65 ? 0 : 1;
    const tens = randomInt(1, 9);
    const ones = randomInt(0, 9);

    return {
      baseTen: { hundreds, tens, ones },
      value: hundreds * 100 + tens * 10 + ones,
    };
  };

  const generateTypeOneProblem = (): MathProblem => {
    const { baseTen, value } = buildBaseTen();

    return {
      question: randomChoice([
        'Write the number shown by the quick picture.',
        'What number is shown by the base-ten picture?',
        'Count the blocks and write the number.',
      ]),
      answer: value,
      format: 'input',
      baseTen,
    };
  };

  const generateTypeTwoProblem = (): MathProblem => {
    const { baseTen, value } = buildBaseTen();

    return {
      question: randomChoice([
        'Which number does the quick picture show?',
        'Choose the number shown by the base-ten picture.',
      ]),
      answer: value,
      format: 'multiple-choice',
      options: buildMultipleChoiceOptions(value),
      baseTen,
    };
  };

  const generateTypeFiveProblem = (): MathProblem => {
    const step = randomChoice([1, 2, 5, 10]);
    const start = randomInt(10, 99 - step * 4);

    return randomChoice([
      {
        question: `Find the next number: ${start}, ${start + step}, ${start + step * 2}, __`,
        answer: start + step * 3,
        format: 'input',
      },
      {
        question: `Find the missing number: ${start}, __, ${start + step * 2}, ${start + step * 3}`,
        answer: start + step,
        format: 'input',
      },
      {
        question: `Skip-count by ${step}: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, __`,
        answer: start + step * 4,
        format: 'input',
      },
    ]);
  };

  const generateTypeSixProblem = (): MathProblem => {
    const names = ['Ava', 'Noah', 'Mia', 'Leo', 'Liam', 'Emma', 'Jane', 'Liz'];
    const items = ['beads', 'stickers', 'coins', 'blocks', 'marbles'];
    const name = randomChoice(names);
    const item = randomChoice(items);
    const tens = randomInt(1, 9);
    const ones = randomInt(0, 9);
    const total = tens * 10 + ones;

    return randomChoice([
      {
        question: `${name} has ${tens} tens and ${ones} ones ${item}. How many ${item} does ${name} have in all?`,
        answer: total,
        format: 'input',
      },
      {
        question: `${name} has ${tens} packs of 10 ${item} and ${ones} extra ${item}. How many ${item} does ${name} have?`,
        answer: total,
        format: 'input',
      },
      {
        question: `A box has ${tens} groups of 10 ${item} and ${ones} single ${item}. What number is shown?`,
        answer: total,
        format: 'input',
      },
      {
        question: `There are ${total} ${item}. How many tens are in ${total}?`,
        answer: tens,
        format: 'input',
      },
      {
        question: `There are ${total} ${item}. How many ones are left after making tens?`,
        answer: ones,
        format: 'input',
      },
      {
        question: `${name} made the number ${total} with base-ten blocks. How many tens did ${name} use?`,
        answer: tens,
        format: 'input',
      },
      {
        question: `${name} made the number ${total} with base-ten blocks. How many ones did ${name} use?`,
        answer: ones,
        format: 'input',
      },
    ]);
  };

  return randomChoice([
    generateTypeOneProblem,
    generateTypeTwoProblem,
    generateTypeFiveProblem,
    generateTypeSixProblem,
  ])();
};
