import { useState } from 'react';
import CategorySelection from './components/CategorySelection';
import ProblemDisplay from './components/ProblemDisplay';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="mathpro-container">
      <h1>MathPro</h1>
      {!selectedCategory ? (
        <CategorySelection onSelectCategory={handleSelectCategory} />
      ) : (
        <>
          <button onClick={() => setSelectedCategory(null)}>Back to Categories</button>
          <ProblemDisplay category={selectedCategory} />
        </>
      )}
    </div>
  );
}

export default App;
