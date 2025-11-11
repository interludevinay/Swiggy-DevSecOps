import { useState, useEffect } from 'react';
import { X, Star, Clock, IndianRupee, Plus, Minus } from 'lucide-react';
import { supabase, Restaurant, MenuItem } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export const RestaurantDetail = ({ restaurant, onClose }: RestaurantDetailProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, [restaurant.id]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          <div className="sticky top-0 bg-white z-10 border-b">
            <div className="flex items-start justify-between p-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
                <p className="text-gray-600 mb-3">{restaurant.cuisine_types.join(', ')}</p>
                <p className="text-sm text-gray-500 mb-4">{restaurant.address}</p>

                <div className="flex items-center space-x-6 text-sm">
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

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 pb-4 overflow-x-auto">
              <div className="flex space-x-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All Items' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading menu...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const quantity = getItemQuantity(item.id);

                  return (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-4 h-4 border-2 flex items-center justify-center ${
                            item.is_veg ? 'border-green-600' : 'border-red-600'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              item.is_veg ? 'bg-green-600' : 'bg-red-600'
                            }`}></div>
                          </div>
                          {item.is_bestseller && (
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              BESTSELLER
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                        <div className="flex items-center space-x-1 text-gray-900 font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          <span>{item.price}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        )}

                        {quantity === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-white border-2 border-orange-500 text-orange-500 font-bold px-8 py-2 rounded-lg hover:bg-orange-50 transition"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center space-x-3 bg-orange-500 text-white font-bold px-3 py-2 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              className="hover:bg-orange-600 p-1 rounded transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              className="hover:bg-orange-600 p-1 rounded transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
