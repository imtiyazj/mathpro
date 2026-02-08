import type { LearningModule } from '../utils/modules';

interface CategorySelectionProps {
  modules: LearningModule[];
  onSelectModule: (moduleId: string) => void;
}

function CategorySelection({ modules, onSelectModule }: CategorySelectionProps) {
  return (
    <div className="category-selection">
      <h2>Select a Module</h2>
      <div className="category-buttons">
        {modules.map((module) => (
          <button key={module.id} onClick={() => onSelectModule(module.id)}>
            <span className="category-button-title">{module.title}</span>
            <span className="category-button-meta">{module.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelection;
