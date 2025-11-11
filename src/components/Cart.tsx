import { X, Plus, Minus, IndianRupee, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import { Checkout } from './Checkout';

interface CartProps {
  onClose: () => void;
}

export const Cart = ({ onClose }: CartProps) => {
  const { cart, updateQuantity, getTotalAmount, getTotalItems } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);

  const grandTotal = getTotalAmount() + deliveryFee + platformFee + gst;

  if (showCheckout) {
    return <Checkout onClose={() => setShowCheckout(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-2xl font-bold text-gray-800">Cart ({getTotalItems()})</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 text-center">
              Add items from a restaurant to start a new order
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 pb-4 border-b">
                  <div className={`w-4 h-4 border-2 flex items-center justify-center mt-1 ${
                    item.is_veg ? 'border-green-600' : 'border-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.is_veg ? 'bg-green-600' : 'bg-red-600'
                    }`}></div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
                    <div className="flex items-center space-x-1 text-gray-900 font-medium">
                      <IndianRupee className="w-4 h-4" />
                      <span>{item.price * item.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-100 px-3 py-2 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="hover:bg-gray-200 p-1 rounded transition"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="hover:bg-gray-200 p-1 rounded transition"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t bg-gray-50 p-6 space-y-3">
              <h3 className="font-semibold text-gray-800 mb-4">Bill Details</h3>

              <div className="flex justify-between text-gray-700">
                <span>Item Total</span>
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  <span>{getTotalAmount()}</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  <span>{deliveryFee}</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Platform Fee</span>
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  <span>{platformFee}</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>GST (5%)</span>
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  <span>{gst}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>TO PAY</span>
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5" />
                  <span>{grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white">
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg hover:bg-orange-600 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
