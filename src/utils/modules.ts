import {
  type MathProblem,
  generateAdditionSubtractionProblem,
  generateBaseTenBlocksProblem,
  generateDragAndDropProblem,
  generateNumberBondProblem,
} from './problemGenerators';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  generator: () => MathProblem;
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
  },
];

export const getModuleById = (id: string): LearningModule | undefined => {
  return LEARNING_MODULES.find((module) => module.id === id);
};
