import { useState, useEffect } from 'react';
import { supabase, Restaurant } from './lib/supabase';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetail } from './components/RestaurantDetail';
import { Cart } from './components/Cart';
import { CartProvider } from './contexts/CartContext';

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedFilter, restaurants]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...restaurants];

    if (searchQuery) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine_types.some((cuisine) =>
            cuisine.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    switch (selectedFilter) {
      case 'rating':
        filtered = filtered.filter((r) => r.rating >= 4.0);
        break;
      case 'fast':
        filtered = filtered.filter((r) => {
          const time = parseInt(r.delivery_time);
          return time <= 30;
        });
        break;
      case 'veg':
        filtered = filtered.filter((r) =>
          r.cuisine_types.some((c) =>
            c.toLowerCase().includes('veg') ||
            c.toLowerCase().includes('salad')
          )
        );
        break;
    }

    setFilteredRestaurants(filtered);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header
          onCartClick={() => setShowCart(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <FilterBar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Restaurants with online food delivery
            </h2>
            <p className="text-gray-600">
              {filteredRestaurants.length} restaurants found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No restaurants found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => setSelectedRestaurant(restaurant)}
                />
              ))}
            </div>
          )}
        </main>

        {selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}

        {showCart && <Cart onClose={() => setShowCart(false)} />}
      </div>
    </CartProvider>
  );
}

export default App;
