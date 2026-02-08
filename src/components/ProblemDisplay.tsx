import { useState, type DragEvent } from 'react';
import {
  type BaseTenRepresentation,
  type MathProblem,
  type TwoWaysProblemData,
  generateAdditionSubtractionProblem,
  generateBaseTenBlocksProblem,
  generateDragAndDropProblem,
  generateNumberBondProblem,
} from '../utils/problemGenerators';
import { playFeedbackVoice } from '../utils/feedbackVoice';

interface ProblemDisplayProps {
  category: string;
  onCorrectAnswer: () => void;
}

interface PersonCounts {
  tens: number;
  ones: number;
}

interface TwoWaysState {
  first: PersonCounts;
  second: PersonCounts;
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
  if (category === 'Drag and Drop') {
    return generateDragAndDropProblem();
  }
  return { question: 'Coming Soon!', answer: 0 };
};

const clampToWhole = (value: number): number => {
  if (Number.isNaN(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
};

const getInitialTwoWaysState = (problem: MathProblem): TwoWaysState | null => {
  if (problem.interactiveType !== 'two-ways') {
    return null;
  }

  return {
    first: { tens: 0, ones: 0 },
    second: { tens: 0, ones: 0 },
  };
};

function ProblemDisplay({ category, onCorrectAnswer }: ProblemDisplayProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => buildProblemForCategory(category));
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [twoWaysState, setTwoWaysState] = useState<TwoWaysState | null>(() => getInitialTwoWaysState(currentProblem));

  const generateNewProblem = () => {
    const nextProblem = buildProblemForCategory(category);
    setCurrentProblem(nextProblem);
    setUserAnswer('');
    setFeedback('');
    setAnsweredCorrectly(false);
    setTwoWaysState(getInitialTwoWaysState(nextProblem));
  };

  const handleCorrect = () => {
    setFeedback('Correct!');
    playFeedbackVoice(true);
    if (!answeredCorrectly) {
      setAnsweredCorrectly(true);
      onCorrectAnswer();
    }
  };

  const handleIncorrect = (message: string) => {
    setFeedback(message);
    playFeedbackVoice(false);
  };

  const handleSubmitAnswer = (selectedOption?: number) => {
    if (currentProblem.interactiveType === 'two-ways' && currentProblem.twoWaysData && twoWaysState) {
      const target = currentProblem.twoWaysData.target;
      const firstTotal = twoWaysState.first.tens * 10 + twoWaysState.first.ones;
      const secondTotal = twoWaysState.second.tens * 10 + twoWaysState.second.ones;
      const isDifferent = twoWaysState.first.tens !== twoWaysState.second.tens
        || twoWaysState.first.ones !== twoWaysState.second.ones;

      if (firstTotal === target && secondTotal === target && isDifferent) {
        handleCorrect();
        return;
      }

      if (!isDifferent) {
        handleIncorrect('Both ways are the same. Make two different tens/ones combinations.');
        return;
      }

      handleIncorrect(`Each person must make ${target}. Check the tens and ones totals.`);
      return;
    }

    const answerToCheck = selectedOption ?? parseInt(userAnswer, 10);
    if (Number.isNaN(answerToCheck)) {
      return;
    }

    if (answerToCheck === currentProblem.answer) {
      handleCorrect();
    } else {
      handleIncorrect(`Incorrect. The answer was ${currentProblem.answer}.`);
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
        {currentProblem.interactiveType === 'two-ways' && currentProblem.twoWaysData && twoWaysState ? (
          <TwoWaysBuilder
            data={currentProblem.twoWaysData}
            value={twoWaysState}
            onChange={setTwoWaysState}
          />
        ) : currentProblem.format === 'multiple-choice' && currentProblem.options ? (
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

interface TwoWaysBuilderProps {
  data: TwoWaysProblemData;
  value: TwoWaysState;
  onChange: (next: TwoWaysState) => void;
}

function TwoWaysBuilder({ data, value, onChange }: TwoWaysBuilderProps) {
  const updatePerson = (person: 'first' | 'second', patch: Partial<PersonCounts>) => {
    onChange({
      ...value,
      [person]: {
        ...value[person],
        ...patch,
      },
    });
  };

  const addToken = (person: 'first' | 'second', token: 'ten' | 'one') => {
    if (token === 'ten') {
      updatePerson(person, { tens: value[person].tens + 1 });
      return;
    }

    updatePerson(person, { ones: value[person].ones + 1 });
  };

  const handleDrop = (person: 'first' | 'second', token: 'ten' | 'one') => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.getData('text/plain');
    if (dropped === token) {
      addToken(person, token);
    }
  };

  const handleDragStart = (token: 'ten' | 'one') => (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('text/plain', token);
    event.dataTransfer.effectAllowed = 'copy';
  };

  const renderPersonBoard = (person: 'first' | 'second', name: string) => {
    const totals = value[person].tens * 10 + value[person].ones;

    return (
      <div className="two-ways-person" key={person}>
        <h3>{name}</h3>
        <div className="drop-zones">
          <div
            className="drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop(person, 'ten')}
          >
            <span className="drop-label">Tens (sticks)</span>
            <div className="token-canvas">
              {Array.from({ length: value[person].tens }).map((_, index) => (
                <span key={`stick-${person}-${index}`} className="stick-token">|</span>
              ))}
            </div>
          </div>
          <div
            className="drop-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop(person, 'one')}
          >
            <span className="drop-label">Ones (dots)</span>
            <div className="token-canvas">
              {Array.from({ length: value[person].ones }).map((_, index) => (
                <span key={`dot-${person}-${index}`} className="dot-token">•</span>
              ))}
            </div>
          </div>
        </div>

        <div className="count-inputs">
          <label>
            Tens
            <input
              type="number"
              min={0}
              value={value[person].tens}
              onChange={(event) => updatePerson(person, { tens: clampToWhole(parseInt(event.target.value, 10)) })}
            />
          </label>
          <label>
            Ones
            <input
              type="number"
              min={0}
              value={value[person].ones}
              onChange={(event) => updatePerson(person, { ones: clampToWhole(parseInt(event.target.value, 10)) })}
            />
          </label>
          <button
            type="button"
            className="clear-board-button"
            onClick={() => updatePerson(person, { tens: 0, ones: 0 })}
          >
            Clear
          </button>
        </div>

        <p className="person-total">Total: {totals} / {data.target}</p>
      </div>
    );
  };

  return (
    <div className="two-ways-builder" aria-label="Drag and drop tens and ones builder">
      <div className="token-palette">
        <button type="button" draggable onDragStart={handleDragStart('ten')}>
          Drag Stick (Ten)
        </button>
        <button type="button" draggable onDragStart={handleDragStart('one')}>
          Drag Dot (One)
        </button>
      </div>
      <div className="two-ways-grid">
        {renderPersonBoard('first', data.firstName)}
        {renderPersonBoard('second', data.secondName)}
      </div>
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
