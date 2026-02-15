import {
  type MathProblem,
  generateAdditionSubtractionProblem,
  generateBaseTenBlocksProblem,
  generateCompareNumbersProblem,
  generateDragAndDropProblem,
  generateNumberBondProblem,
  generateTimedNoCarryNoBorrowProblem,
} from './problemGenerators';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  generator: () => MathProblem;
  pointsPerSolve?: number;
}

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'add-sub-within-20',
    title: 'Addition and Subtraction',
    description: 'Fluency and story problems within 20.',
    generator: generateAdditionSubtractionProblem,
  },
  {
    id: 'number-bonds-within-20',
    title: 'Number Bonds',
    description: 'Missing-part and total-part reasoning.',
    generator: generateNumberBondProblem,
  },
  {
    id: 'base-ten-place-value',
    title: 'Base Ten Blocks',
    description: 'Represent tens and ones and read numbers.',
    generator: generateBaseTenBlocksProblem,
  },
  {
    id: 'two-ways-tens-ones',
    title: 'Drag and Drop',
    description: 'Build two different tens/ones models.',
    generator: generateDragAndDropProblem,
    pointsPerSolve: 2,
  },
  {
    id: 'timed-no-regrouping-drill',
    title: 'Timed Add/Sub Drill',
    description: '1-digit and 2-digit, no carry or borrowing.',
    generator: generateTimedNoCarryNoBorrowProblem,
  },
  {
    id: 'compare-numbers',
    title: 'Compare Numbers',
    description: 'Practice greater than, less than, and in-between numbers.',
    generator: generateCompareNumbersProblem,
  },
];

export const getModuleById = (id: string): LearningModule | undefined => {
  return LEARNING_MODULES.find((module) => module.id === id);
};
