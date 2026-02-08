import { useEffect, useState } from 'react';
import CategorySelection from './components/CategorySelection';
import ProblemDisplay from './components/ProblemDisplay';
import { LEARNING_MODULES, getModuleById } from './utils/modules';

interface RewardsData {
  points: number;
  medals: number;
  trophies: number;
}

const REWARDS_STORAGE_KEY = 'mathpro_rewards_v1';

const getSavedRewards = (): RewardsData => {
  if (typeof window === 'undefined') {
    return { points: 0, medals: 0, trophies: 0 };
  }

  const raw = window.localStorage.getItem(REWARDS_STORAGE_KEY);
  if (!raw) {
    return { points: 0, medals: 0, trophies: 0 };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<RewardsData>;
    return {
      points: Number.isFinite(parsed.points) ? Math.max(0, Math.floor(parsed.points as number)) : 0,
      medals: Number.isFinite(parsed.medals) ? Math.max(0, Math.floor(parsed.medals as number)) : 0,
      trophies: Number.isFinite(parsed.trophies) ? Math.max(0, Math.floor(parsed.trophies as number)) : 0,
    };
  } catch {
    return { points: 0, medals: 0, trophies: 0 };
  }
};

function App() {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RewardsData>(() => getSavedRewards());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
  }, [rewards]);

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  const handleCorrectAnswer = () => {
    setRewards((current) => {
      let points = current.points + 1;
      let medals = current.medals;
      let trophies = current.trophies;

      if (points >= 5) {
        points = 0;
        medals += 1;
      }

      if (medals >= 5) {
        medals = 0;
        trophies += 1;
      }

      return { points, medals, trophies };
    });
  };

  const handleResetRewards = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Reset all points, medals, and trophies?');
      if (!confirmed) {
        return;
      }
    }

    setRewards({ points: 0, medals: 0, trophies: 0 });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REWARDS_STORAGE_KEY);
    }
  };

  const renderTrack = (count: number, icon: string, label: string) => {
    return (
      <div className="reward-track" aria-label={`${label} progress`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={`${label}-${index}`}
            className={`reward-icon ${index < count ? 'active' : 'inactive'}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        ))}
      </div>
    );
  };

  const selectedModule = selectedModuleId ? getModuleById(selectedModuleId) ?? null : null;

  return (
    <div className="mathpro-container">
      <h1>MathPro</h1>
      <div className="rewards-panel" aria-label="Rewards progress">
        <div className="reward-card">
          <span className="reward-label">Points</span>
          {renderTrack(rewards.points, '⭐', 'points')}
          <span className="reward-value">{rewards.points}/5</span>
        </div>
        <div className="reward-card">
          <span className="reward-label">Medals</span>
          {renderTrack(rewards.medals, '🥇', 'medals')}
          <span className="reward-value">{rewards.medals}/5</span>
        </div>
        <div className="reward-card reward-card-trophy">
          <span className="reward-label">Trophies</span>
          <div className="trophy-display" aria-label="Trophy count">
            <span className="trophy-icon" aria-hidden="true">🏆</span>
            <span className="trophy-count">x {rewards.trophies}</span>
          </div>
        </div>
      </div>
      <button type="button" className="reward-reset-button" onClick={handleResetRewards}>
        Reset Rewards
      </button>
      {!selectedModule ? (
        <CategorySelection modules={LEARNING_MODULES} onSelectModule={handleSelectModule} />
      ) : (
        <>
          <button className="back-button" onClick={() => setSelectedModuleId(null)}>Back to Categories</button>
          <ProblemDisplay module={selectedModule} onCorrectAnswer={handleCorrectAnswer} />
        </>
      )}
    </div>
  );
}

export default App;
