import { useEffect, useState } from 'react';
import CategorySelection from './components/CategorySelection';
import ProblemDisplay from './components/ProblemDisplay';
import SettingsPanel, { type AppSettings } from './components/SettingsPanel';
import { LEARNING_MODULES, getModuleById } from './utils/modules';

interface RewardsData {
  points: number;
  medals: number;
  trophies: number;
}

const REWARDS_STORAGE_KEY = 'mathpro_rewards_v1';
const SETTINGS_STORAGE_KEY = 'mathpro_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  timedDrillDurationSec: 60,
  pointsPerMedal: 5,
  medalsPerTrophy: 5,
  dragDropPoints: 2,
  voiceFeedbackEnabled: true,
};

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

const getSavedSettings = (): AppSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      timedDrillDurationSec: Number.isFinite(parsed.timedDrillDurationSec)
        ? Math.max(15, Math.floor(parsed.timedDrillDurationSec as number))
        : DEFAULT_SETTINGS.timedDrillDurationSec,
      pointsPerMedal: Number.isFinite(parsed.pointsPerMedal)
        ? Math.max(1, Math.floor(parsed.pointsPerMedal as number))
        : DEFAULT_SETTINGS.pointsPerMedal,
      medalsPerTrophy: Number.isFinite(parsed.medalsPerTrophy)
        ? Math.max(1, Math.floor(parsed.medalsPerTrophy as number))
        : DEFAULT_SETTINGS.medalsPerTrophy,
      dragDropPoints: Number.isFinite(parsed.dragDropPoints)
        ? Math.max(1, Math.floor(parsed.dragDropPoints as number))
        : DEFAULT_SETTINGS.dragDropPoints,
      voiceFeedbackEnabled: parsed.voiceFeedbackEnabled ?? DEFAULT_SETTINGS.voiceFeedbackEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

function App() {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RewardsData>(() => getSavedRewards());
  const [settings, setSettings] = useState<AppSettings>(() => getSavedSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  const handleCorrectAnswer = (pointsEarned: number) => {
    setRewards((current) => {
      let points = current.points + pointsEarned;
      let medals = current.medals;
      let trophies = current.trophies;

      while (points >= settings.pointsPerMedal) {
        points -= settings.pointsPerMedal;
        medals += 1;
      }

      while (medals >= settings.medalsPerTrophy) {
        medals -= settings.medalsPerTrophy;
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

  const renderTrack = (count: number, icon: string, label: string, target: number) => {
    const trackLength = Math.max(1, Math.min(target, 10));
    return (
      <div className="reward-track" aria-label={`${label} progress`}>
        {Array.from({ length: trackLength }).map((_, index) => (
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
          {renderTrack(rewards.points, '⭐', 'points', settings.pointsPerMedal)}
          <span className="reward-value">{rewards.points}/{settings.pointsPerMedal}</span>
        </div>
        <div className="reward-card">
          <span className="reward-label">Medals</span>
          {renderTrack(rewards.medals, '🥇', 'medals', settings.medalsPerTrophy)}
          <span className="reward-value">{rewards.medals}/{settings.medalsPerTrophy}</span>
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
      <button type="button" className="settings-open-button" onClick={() => setIsSettingsOpen(true)}>
        Settings
      </button>
      {!selectedModule ? (
        <CategorySelection modules={LEARNING_MODULES} onSelectModule={handleSelectModule} />
      ) : (
        <>
          <button className="back-button" onClick={() => setSelectedModuleId(null)}>Back to Categories</button>
          <ProblemDisplay key={selectedModule.id} module={selectedModule} settings={settings} onCorrectAnswer={handleCorrectAnswer} />
        </>
      )}
      {isSettingsOpen && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

export default App;
