import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import {
  type BaseTenRepresentation,
  type MathProblem,
  type TimedDrillProblemData,
  type TwoWaysProblemData,
} from '../utils/problemGenerators';
import type { AppSettings } from './SettingsPanel';
import type { LearningModule } from '../utils/modules';
import { playFeedbackVoice } from '../utils/feedbackVoice';

interface ProblemDisplayProps {
  module: LearningModule;
  settings: AppSettings;
  onCorrectAnswer: (pointsEarned: number) => void;
}

interface PersonState {
  draggedTens: number;
  draggedOnes: number;
  enteredTens: string;
  enteredOnes: string;
}

interface TwoWaysState {
  first: PersonState;
  second: PersonState;
}

const parseEnteredCount = (value: string): number | null => {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return Math.floor(parsed);
};

const getInitialTwoWaysState = (problem: MathProblem): TwoWaysState | null => {
  if (problem.interactiveType !== 'two-ways') {
    return null;
  }

  const emptyPerson: PersonState = {
    draggedTens: 0,
    draggedOnes: 0,
    enteredTens: '',
    enteredOnes: '',
  };

  return {
    first: { ...emptyPerson },
    second: { ...emptyPerson },
  };
};

function ProblemDisplay({ module, settings, onCorrectAnswer }: ProblemDisplayProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => module.generator());
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [twoWaysState, setTwoWaysState] = useState<TwoWaysState | null>(() => getInitialTwoWaysState(currentProblem));
  const [timedAnswers, setTimedAnswers] = useState<Record<string, string>>({});
  const [timedRunning, setTimedRunning] = useState(false);
  const [timedDone, setTimedDone] = useState(false);
  const [timedScored, setTimedScored] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(settings.timedDrillDurationSec);
  const timedAnswersRef = useRef<Record<string, string>>({});
  const isTwoWaysSubmitDisabled = currentProblem.interactiveType === 'two-ways'
    && twoWaysState !== null
    && (
      parseEnteredCount(twoWaysState.first.enteredTens) === null
      || parseEnteredCount(twoWaysState.first.enteredOnes) === null
      || parseEnteredCount(twoWaysState.second.enteredTens) === null
      || parseEnteredCount(twoWaysState.second.enteredOnes) === null
    );
  const isTimedDrill = currentProblem.interactiveType === 'timed-drill' && !!currentProblem.timedDrillData;

  useEffect(() => {
    timedAnswersRef.current = timedAnswers;
  }, [timedAnswers]);

  const finalizeTimedDrill = useCallback(() => {
    if (!isTimedDrill || timedScored || !currentProblem.timedDrillData) {
      return;
    }

    const total = currentProblem.timedDrillData.items.length;
    const correct = currentProblem.timedDrillData.items.reduce((count, item) => {
      const entered = Number.parseInt((timedAnswersRef.current[item.id] ?? '').trim(), 10);
      return entered === item.answer ? count + 1 : count;
    }, 0);

    setFeedback(`Time up! You got ${correct} out of ${total} correct.`);
    if (settings.voiceFeedbackEnabled) {
      playFeedbackVoice(correct > 0);
    }
    if (!answeredCorrectly && correct > 0) {
      setAnsweredCorrectly(true);
      onCorrectAnswer(correct);
    }
    setTimedScored(true);
  }, [answeredCorrectly, currentProblem.timedDrillData, isTimedDrill, onCorrectAnswer, settings.voiceFeedbackEnabled, timedScored]);

  useEffect(() => {
    if (!isTimedDrill || !timedRunning || timedDone) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeftSec((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimedRunning(false);
          setTimedDone(true);
          finalizeTimedDrill();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finalizeTimedDrill, isTimedDrill, timedRunning, timedDone]);

  const generateNewProblem = () => {
    const nextProblem = module.generator();
    setCurrentProblem(nextProblem);
    setUserAnswer('');
    setFeedback('');
    setAnsweredCorrectly(false);
    setTwoWaysState(getInitialTwoWaysState(nextProblem));
    setTimedAnswers({});
    setTimedRunning(false);
    setTimedDone(false);
    setTimedScored(false);
    setTimeLeftSec(settings.timedDrillDurationSec);
  };

  const handleCorrect = (pointsEarned?: number) => {
    setFeedback('Correct!');
    if (settings.voiceFeedbackEnabled) {
      playFeedbackVoice(true);
    }
    if (!answeredCorrectly) {
      setAnsweredCorrectly(true);
      onCorrectAnswer(pointsEarned ?? module.pointsPerSolve ?? 1);
    }
  };

  const handleIncorrect = (message: string) => {
    setFeedback(message);
    if (settings.voiceFeedbackEnabled) {
      playFeedbackVoice(false);
    }
  };

  const handleSubmitAnswer = (selectedOption?: number) => {
    if (currentProblem.interactiveType === 'two-ways' && currentProblem.twoWaysData && twoWaysState) {
      const { firstName, secondName, target } = currentProblem.twoWaysData;

      const firstTens = parseEnteredCount(twoWaysState.first.enteredTens);
      const firstOnes = parseEnteredCount(twoWaysState.first.enteredOnes);
      const secondTens = parseEnteredCount(twoWaysState.second.enteredTens);
      const secondOnes = parseEnteredCount(twoWaysState.second.enteredOnes);

      if (firstTens === null || firstOnes === null || secondTens === null || secondOnes === null) {
        handleIncorrect(`Enter tens and ones numbers for ${firstName} and ${secondName}.`);
        return;
      }

      const firstTotal = firstTens * 10 + firstOnes;
      const secondTotal = secondTens * 10 + secondOnes;
      const isDifferent = firstTens !== secondTens || firstOnes !== secondOnes;

      if (firstTotal === target && secondTotal === target && isDifferent) {
        const dragDropPoints = module.id === 'two-ways-tens-ones'
          ? settings.dragDropPoints
          : module.pointsPerSolve ?? 1;
        handleCorrect(dragDropPoints);
        return;
      }

      if (!isDifferent) {
        handleIncorrect('Both ways are the same. Enter two different tens/ones combinations.');
        return;
      }

      handleIncorrect(`${firstName} makes ${firstTotal} and ${secondName} makes ${secondTotal}. Both totals must be ${target}.`);
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

  const handleStartTimedDrill = () => {
    setTimedAnswers({});
    setTimeLeftSec(settings.timedDrillDurationSec);
    setTimedDone(false);
    setTimedScored(false);
    setTimedRunning(true);
    setFeedback('');
  };

  const handleTimedAnswerChange = (id: string, value: string) => {
    setTimedAnswers((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="problem-display">
      <h2>{module.title} Problems</h2>
      <>
        <p className="problem-question">{currentProblem.question}</p>
        {isTimedDrill && currentProblem.timedDrillData && (
          <TimedDrillBoard
            data={currentProblem.timedDrillData}
            timeLeftSec={timeLeftSec}
            timedRunning={timedRunning}
            timedDone={timedDone}
            answers={timedAnswers}
            onStart={handleStartTimedDrill}
            onChangeAnswer={handleTimedAnswerChange}
          />
        )}
        {currentProblem.baseTen && (
          <BaseTenBlocks representation={currentProblem.baseTen} />
        )}
        {currentProblem.interactiveType === 'two-ways' && currentProblem.twoWaysData && twoWaysState ? (
          <TwoWaysBuilder
            data={currentProblem.twoWaysData}
            value={twoWaysState}
            onChange={setTwoWaysState}
          />
        ) : isTimedDrill ? null : currentProblem.format === 'multiple-choice' && currentProblem.options ? (
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
          {currentProblem.format !== 'multiple-choice' && !isTimedDrill && (
            <button
              onClick={() => handleSubmitAnswer()}
              className="submit-button"
              disabled={isTwoWaysSubmitDisabled}
            >
              Submit Answer
            </button>
          )}
          <button onClick={generateNewProblem} className="new-problem-button">New Problem</button>
        </div>
        {feedback && <p className={`feedback ${feedback === 'Correct!' ? 'correct' : 'incorrect'}`}>{feedback}</p>}
      </>
    </div>
  );
}

interface TimedDrillBoardProps {
  data: TimedDrillProblemData;
  timeLeftSec: number;
  timedRunning: boolean;
  timedDone: boolean;
  answers: Record<string, string>;
  onStart: () => void;
  onChangeAnswer: (id: string, value: string) => void;
}

function TimedDrillBoard({
  data,
  timeLeftSec,
  timedRunning,
  timedDone,
  answers,
  onStart,
  onChangeAnswer,
}: TimedDrillBoardProps) {
  return (
    <div className="timed-drill-board" aria-label="Timed arithmetic drill">
      <div className="timed-drill-header">
        <div>
          <p className="timed-drill-title">{data.title}</p>
          <p className="timed-drill-instructions">{data.instructions}</p>
        </div>
        <div className={`timed-drill-timer ${timedDone ? 'is-done' : ''}`}>
          {timeLeftSec}s
        </div>
      </div>
      <button
        type="button"
        className="timed-drill-start"
        onClick={onStart}
        disabled={timedRunning}
      >
        {timedRunning ? 'Running...' : 'Start / Restart Drill'}
      </button>
      <div className="timed-drill-grid">
        {data.items.map((item) => (
          <label key={item.id} className="timed-drill-item">
            <span>{item.prompt}</span>
            <input
              type="number"
              value={answers[item.id] ?? ''}
              onChange={(event) => onChangeAnswer(item.id, event.target.value)}
              disabled={!timedRunning || timedDone}
              inputMode="numeric"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

interface TwoWaysBuilderProps {
  data: TwoWaysProblemData;
  value: TwoWaysState;
  onChange: (next: TwoWaysState) => void;
}

function TwoWaysBuilder({ data, value, onChange }: TwoWaysBuilderProps) {
  const updatePerson = (person: 'first' | 'second', patch: Partial<PersonState>) => {
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
      updatePerson(person, { draggedTens: value[person].draggedTens + 1 });
      return;
    }

    updatePerson(person, { draggedOnes: value[person].draggedOnes + 1 });
  };

  const adjustToken = (person: 'first' | 'second', token: 'ten' | 'one', delta: 1 | -1) => {
    if (token === 'ten') {
      updatePerson(person, { draggedTens: Math.max(0, value[person].draggedTens + delta) });
      return;
    }

    updatePerson(person, { draggedOnes: Math.max(0, value[person].draggedOnes + delta) });
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
    const enteredTens = parseEnteredCount(value[person].enteredTens) ?? 0;
    const enteredOnes = parseEnteredCount(value[person].enteredOnes) ?? 0;
    const totals = enteredTens * 10 + enteredOnes;
    const hasEnteredBoth = parseEnteredCount(value[person].enteredTens) !== null
      && parseEnteredCount(value[person].enteredOnes) !== null;
    const difference = data.target - totals;
    const statusClass = !hasEnteredBoth ? 'is-pending' : difference === 0 ? 'is-correct' : 'is-off';
    const statusText = !hasEnteredBoth
      ? `Enter both numbers to make ${data.target}.`
      : difference === 0
        ? `Great job. ${name} makes ${data.target}.`
        : difference > 0
          ? `Need ${difference} more to reach ${data.target}.`
          : `${Math.abs(difference)} too many.`;

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
              {Array.from({ length: value[person].draggedTens }).map((_, index) => (
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
              {Array.from({ length: value[person].draggedOnes }).map((_, index) => (
                <span key={`dot-${person}-${index}`} className="dot-token">•</span>
              ))}
            </div>
          </div>
        </div>

        <div className="quick-token-actions" aria-label={`${name} quick model controls`}>
          <button
            type="button"
            className="quick-token-button"
            onClick={() => addToken(person, 'ten')}
          >
            + Stick
          </button>
          <button
            type="button"
            className="quick-token-button"
            onClick={() => addToken(person, 'one')}
          >
            + Dot
          </button>
          <button
            type="button"
            className="quick-token-button quick-token-button-secondary"
            onClick={() => adjustToken(person, 'ten', -1)}
            disabled={value[person].draggedTens === 0}
          >
            - Stick
          </button>
          <button
            type="button"
            className="quick-token-button quick-token-button-secondary"
            onClick={() => adjustToken(person, 'one', -1)}
            disabled={value[person].draggedOnes === 0}
          >
            - Dot
          </button>
        </div>

        <button
          type="button"
          className="use-dragged-button"
          onClick={() => updatePerson(person, {
            enteredTens: String(value[person].draggedTens),
            enteredOnes: String(value[person].draggedOnes),
          })}
        >
          Use Dragged Counts
        </button>

        <div className="count-inputs">
          <label>
            Tens
            <input
              type="number"
              min={0}
              value={value[person].enteredTens}
              onChange={(event) => updatePerson(person, { enteredTens: event.target.value })}
              placeholder="Type"
            />
          </label>
          <label>
            Ones
            <input
              type="number"
              min={0}
              value={value[person].enteredOnes}
              onChange={(event) => updatePerson(person, { enteredOnes: event.target.value })}
              placeholder="Type"
            />
          </label>
          <button
            type="button"
            className="clear-board-button"
            onClick={() => updatePerson(person, {
              draggedTens: 0,
              draggedOnes: 0,
              enteredTens: '',
              enteredOnes: '',
            })}
          >
            Clear
          </button>
        </div>

        <p className={`person-total ${statusClass}`}>Entered total: {totals} / {data.target}</p>
        <p className={`person-status ${statusClass}`}>{statusText}</p>
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
      <p className="two-ways-hint">
        Build each model with dragged blocks, then enter tens and ones for each person.
      </p>
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
