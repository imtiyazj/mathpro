interface CategorySelectionProps {
  onSelectCategory: (category: string) => void;
}

function CategorySelection({ onSelectCategory }: CategorySelectionProps) {
  const categories = ['Addition and Subtraction', 'Number Bonds', 'Base Ten Blocks'];

  return (
    <div className="category-selection">
      <h2>Select a Category</h2>
      <div className="category-buttons">
        {categories.map((category) => (
          <button key={category} onClick={() => onSelectCategory(category)}>
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelection;
