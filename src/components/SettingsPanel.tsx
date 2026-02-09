export interface AppSettings {
  timedDrillDurationSec: number;
  pointsPerMedal: number;
  medalsPerTrophy: number;
  dragDropPoints: number;
  voiceFeedbackEnabled: boolean;
}

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  onClose: () => void;
}

const parsePositiveInt = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(1, parsed);
};

function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="App settings">
      <div className="settings-panel">
        <h2>Settings</h2>
        <div className="settings-grid">
          <label>
            Timed drill duration (seconds)
            <input
              type="number"
              min={15}
              step={5}
              value={settings.timedDrillDurationSec}
              onChange={(event) => onChange({
                ...settings,
                timedDrillDurationSec: parsePositiveInt(event.target.value, settings.timedDrillDurationSec),
              })}
            />
          </label>
          <label>
            Points needed per medal
            <input
              type="number"
              min={1}
              value={settings.pointsPerMedal}
              onChange={(event) => onChange({
                ...settings,
                pointsPerMedal: parsePositiveInt(event.target.value, settings.pointsPerMedal),
              })}
            />
          </label>
          <label>
            Medals needed per trophy
            <input
              type="number"
              min={1}
              value={settings.medalsPerTrophy}
              onChange={(event) => onChange({
                ...settings,
                medalsPerTrophy: parsePositiveInt(event.target.value, settings.medalsPerTrophy),
              })}
            />
          </label>
          <label>
            Points for drag-and-drop solve
            <input
              type="number"
              min={1}
              value={settings.dragDropPoints}
              onChange={(event) => onChange({
                ...settings,
                dragDropPoints: parsePositiveInt(event.target.value, settings.dragDropPoints),
              })}
            />
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.voiceFeedbackEnabled}
              onChange={(event) => onChange({
                ...settings,
                voiceFeedbackEnabled: event.target.checked,
              })}
            />
            Enable voice feedback
          </label>
        </div>
        <button type="button" className="settings-close-button" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default SettingsPanel;
