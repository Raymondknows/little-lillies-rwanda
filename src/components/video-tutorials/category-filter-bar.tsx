import { X } from "lucide-react";

interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
            selectedCategory === category
              ? "bg-brand text-white shadow-md scale-100"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {category === "all" ? "All Categories" : category}
        </button>
      ))}
    </div>
  );
}
