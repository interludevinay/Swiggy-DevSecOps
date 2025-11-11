import { useState } from 'react';
import { X, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  onClose: () => void;
}

export const Checkout = ({ onClose }: CheckoutProps) => {
  const { cart, getTotalAmount, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);
  const grandTotal = getTotalAmount() + deliveryFee + platformFee + gst;

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      alert('Please fill in all delivery details');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error } = await supabase.from('orders').insert({
        user_id: crypto.randomUUID(),
        restaurant_id: cart[0]?.restaurant_id || null,
        items: orderItems,
        total_amount: grandTotal,
        delivery_address: address,
        status: 'pending',
      });

      if (error) throw error;

      setOrderPlaced(true);
      setTimeout(() => {
        clearCart();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Your order will be delivered in 30-40 mins</p>
          <div className="animate-pulse text-orange-500 font-medium">
            Redirecting to home...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-3">
                <MapPin className="w-5 h-5" />
                <span>Delivery Address</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete delivery address"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Item Total</span>
                    <span>₹{getTotalAmount()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-800 mt-2 pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-orange-50">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600">Cash on Delivery</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${grandTotal}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
