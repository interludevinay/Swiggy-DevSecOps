import { SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterBar = ({ selectedFilter, onFilterChange }: FilterBarProps) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'rating', label: 'Rating 4.0+' },
    { id: 'fast', label: 'Fast Delivery' },
    { id: 'veg', label: 'Pure Veg' },
    { id: 'offers', label: 'Offers' },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-500 transition">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>

          <div className="flex items-center space-x-3 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedFilter === filter.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
