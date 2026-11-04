import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CategoryRail: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const navigate = useNavigate();

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
    navigate('/browse');
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fresh flours, aged rice, cold-pressed oils and verified organic staples
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            navigate('/browse');
          }}
          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All ({CATEGORIES.length})</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group cursor-pointer rounded-xl p-3 text-center border transition-all duration-200 flex flex-col items-center justify-between ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-card'
                  : 'bg-card hover:bg-muted border-border hover:border-primary/40 shadow-card'
              }`}
            >
              <div className="w-14 h-14 rounded-full overflow-hidden mb-2.5 bg-muted shrink-0 border border-border">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-0.5 w-full">
                <h3
                  className={`text-xs font-semibold leading-tight line-clamp-2 ${
                    isSelected ? 'text-primary-foreground' : 'text-foreground group-hover:text-primary'
                  }`}
                >
                  {cat.name}
                </h3>
                <span
                  className={`text-[10px] block font-medium ${
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {cat.itemCount} items
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
