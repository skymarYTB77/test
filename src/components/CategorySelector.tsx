import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory } from '../store/categorySlice';
import { RootState } from '../store/store';
import { ChevronDown, Building2, UtensilsCrossed } from 'lucide-react';

export function CategorySelector() {
  const dispatch = useDispatch();
  const currentCategory = useSelector((state: RootState) => state.category.currentCategory);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'Restaurants', icon: UtensilsCrossed },
    { id: 'Hôtels', icon: Building2 }
  ] as const;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: 'Restaurants' | 'Hôtels') => {
    dispatch(setCategory(category));
    setIsOpen(false);
  };

  const CategoryIcon = categories.find(cat => cat.id === currentCategory)?.icon || UtensilsCrossed;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <CategoryIcon size={16} />
        <span>{currentCategory}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          {categories.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors ${
                currentCategory === id ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
              }`}
            >
              <Icon size={16} />
              <span>{id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}