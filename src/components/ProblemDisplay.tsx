import { useState } from 'react';
import {
  type BaseTenRepresentation,
  type MathProblem,
  generateAdditionSubtractionProblem,
  generateBaseTenBlocksProblem,
  generateNumberBondProblem,
} from '../utils/problemGenerators';
import { playFeedbackVoice } from '../utils/feedbackVoice';

interface ProblemDisplayProps {
  category: string;
  onCorrectAnswer: () => void;
}

const buildProblemForCategory = (category: string): MathProblem => {
  if (category === 'Addition and Subtraction') {
    return generateAdditionSubtractionProblem();
  }
  if (category === 'Number Bonds') {
    return generateNumberBondProblem();
  }
  if (category === 'Base Ten Blocks') {
    return generateBaseTenBlocksProblem();
  }
  return { question: 'Coming Soon!', answer: 0 };
};

function ProblemDisplay({ category, onCorrectAnswer }: ProblemDisplayProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => buildProblemForCategory(category));
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  const generateNewProblem = () => {
    setCurrentProblem(buildProblemForCategory(category));
    setUserAnswer('');
    setFeedback('');
    setAnsweredCorrectly(false);
  };

  const handleSubmitAnswer = (selectedOption?: number) => {
    const answerToCheck = selectedOption ?? parseInt(userAnswer, 10);
    if (Number.isNaN(answerToCheck)) {
      return;
    }

    if (answerToCheck === currentProblem.answer) {
      setFeedback('Correct!');
      playFeedbackVoice(true);
      if (!answeredCorrectly) {
        setAnsweredCorrectly(true);
        onCorrectAnswer();
      }
    } else {
      setFeedback(`Incorrect. The answer was ${currentProblem.answer}.`);
      playFeedbackVoice(false);
    }
  };

  return (
    <div className="problem-display">
      <h2>{category} Problems</h2>
      <>
        <p className="problem-question">{currentProblem.question}</p>
        {currentProblem.baseTen && (
          <BaseTenBlocks representation={currentProblem.baseTen} />
        )}
        {currentProblem.format === 'multiple-choice' && currentProblem.options ? (
          <div className="choice-options">
            {currentProblem.options.map((option) => (
              <button
                key={option}
                type="button"
                className="choice-button"
                onClick={() => handleSubmitAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="problem-input"
            placeholder="Your answer"
          />
        )}
        <div className="problem-actions">
          {currentProblem.format !== 'multiple-choice' && (
            <button onClick={() => handleSubmitAnswer()} className="submit-button">Submit Answer</button>
          )}
          <button onClick={generateNewProblem} className="new-problem-button">New Problem</button>
        </div>
        {feedback && <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'incorrect'}`}>{feedback}</p>}
      </>
    </div>
  );
}

interface BaseTenBlocksProps {
  representation: BaseTenRepresentation;
}

function BaseTenBlocks({ representation }: BaseTenBlocksProps) {
  return (
    <div className="base-ten-visual" aria-label="Base ten blocks visual">
      <div className="hundreds-group">
        {Array.from({ length: representation.hundreds }).map((_, index) => (
          <div key={`hundred-${index}`} className="hundred-block" />
        ))}
      </div>
      <div className="tens-group">
        {Array.from({ length: representation.tens }).map((_, index) => (
          <div key={`ten-${index}`} className="ten-rod">
            {Array.from({ length: 10 }).map((__, cellIndex) => (
              <span key={`ten-${index}-cell-${cellIndex}`} className="unit-cell" />
            ))}
          </div>
        ))}
      </div>
      <div className="ones-group">
        {Array.from({ length: representation.ones }).map((_, index) => (
          <span key={`one-${index}`} className="one-cube" />
        ))}
      </div>
    </div>
  );
}

export default ProblemDisplay;
