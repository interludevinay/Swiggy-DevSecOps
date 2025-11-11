import { Star, Clock } from 'lucide-react';
import { Restaurant } from '../lib/supabase';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard = ({ restaurant, onClick }: RestaurantCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Currently Closed</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 mb-2 truncate">{restaurant.cuisine_types.join(', ')}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-green-600 text-green-600" />
            <span className="font-semibold">{restaurant.rating}</span>
          </div>

          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{restaurant.delivery_time}</span>
          </div>

          <div className="text-gray-600">
            ₹{restaurant.cost_for_two} for two
          </div>
        </div>
      </div>
    </div>
  );
};
