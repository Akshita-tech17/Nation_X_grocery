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
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
            Explore Categories
          </h2>
          <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
            Daily chakki flours, unpolished pulses, Vedic cow ghee & mandi gunny sacks
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            navigate('/browse');
          }}
          className="text-xs sm:text-sm font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group cursor-pointer rounded-2xl p-2.5 sm:p-3 text-center border transition-all duration-200 flex flex-col items-center justify-between ${
                isSelected
                  ? 'bg-forest-900 text-white border-forest-900 shadow-soft-md'
                  : 'bg-white hover:bg-warm-50/80 border-warm-200/90 hover:border-forest-300 shadow-soft hover:shadow-soft-md'
              }`}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mb-2 bg-warm-100 shrink-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="space-y-0.5 w-full">
                <h3
                  className={`text-xs font-bold leading-tight line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-warm-900 group-hover:text-forest-900'
                  }`}
                >
                  {cat.name}
                </h3>
                {cat.hindiName && (
                  <p
                    className={`text-[10px] truncate ${
                      isSelected ? 'text-forest-200' : 'text-warm-400'
                    }`}
                  >
                    {cat.hindiName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

