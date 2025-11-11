import { ShoppingCart, MapPin, Search, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header = ({ onCartClick, searchQuery, onSearchChange }: HeaderProps) => {
  const { getTotalItems } = useCart();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-orange-500">Swiggy</h1>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition">
              <MapPin className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-semibold">Bangalore</div>
                <div className="text-xs text-gray-500">Koramangala, Bangalore</div>
              </div>
            </button>
          </div>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for restaurants and food"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition">
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
            <button
              onClick={onCartClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
