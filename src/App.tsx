import { useState } from 'react';
import CategorySelection from './components/CategorySelection';
import ProblemDisplay from './components/ProblemDisplay';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [medals, setMedals] = useState(0);
  const [trophies, setTrophies] = useState(0);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const handleCorrectAnswer = () => {
    setPoints((currentPoints) => {
      const nextPoints = currentPoints + 1;
      if (nextPoints < 5) {
        return nextPoints;
      }

      setMedals((currentMedals) => {
        const nextMedals = currentMedals + 1;
        if (nextMedals < 5) {
          return nextMedals;
        }

        setTrophies((currentTrophies) => currentTrophies + 1);
        return 0;
      });

      return 0;
    });
  };

  return (
    <div className="mathpro-container">
      <h1>MathPro</h1>
      <div className="rewards-panel" aria-label="Rewards progress">
        <div className="reward-card">
          <span className="reward-label">Points</span>
          <span className="reward-value">{points}/5</span>
        </div>
        <div className="reward-card">
          <span className="reward-label">Medals</span>
          <span className="reward-value">{medals}/5</span>
        </div>
        <div className="reward-card reward-card-trophy">
          <span className="reward-label">Trophies</span>
          <span className="reward-value">{trophies}</span>
        </div>
      </div>
      {!selectedCategory ? (
        <CategorySelection onSelectCategory={handleSelectCategory} />
      ) : (
        <>
          <button onClick={() => setSelectedCategory(null)}>Back to Categories</button>
          <ProblemDisplay category={selectedCategory} onCorrectAnswer={handleCorrectAnswer} />
        </>
      )}
    </div>
  );
}

export default App;
