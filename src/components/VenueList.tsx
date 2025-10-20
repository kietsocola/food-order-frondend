import React, { useState, useEffect } from 'react';
import type { Venue, Product, OrderItem } from '../types';
import { venueService } from '../services/venueService';
import { wsService } from '../services/websocketService';
import InteractiveMap from './InteractiveMap';

interface CartItem extends Product {
  quantity: number;
}

const VenueList: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const data = await venueService.getVenues();
      setVenues(data);
      
      // Check if we're using mock data (when API is not available)
      if (data.length > 0 && data[0].id === "28e9a27c-6053-4dd2-91e0-193b855dc7f0") {
        setIsUsingMockData(true);
      }
    } catch (err) {
      setError('Không thể tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, venueId: string) => {
    setSelectedVenueId(venueId);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const generateOrderId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const startLocationTracking = (orderId: string) => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          wsService.sendLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      // Store watchId to clear later if needed
      return watchId;
    }
  };

  const createOrder = async () => {
    if (!selectedVenueId || cart.length === 0) {
      alert('Vui lòng chọn món ăn');
      return;
    }

    try {
      setOrderStatus('Đang tạo đơn hàng...');
      
      const orderItems: OrderItem[] = cart.map(item => ({
        orderItemId: generateOrderId(),
        productId: item.id || generateOrderId(),
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const order = {
        customerId: generateOrderId(), // In real app, this would be from user session
        venuesId: selectedVenueId,
        address: "123 Nguyen Trai, Ha Noi", // In real app, this would be user input
        orderItems
      };

      const result = await venueService.createOrder(order);
      const orderId = result.orderId || generateOrderId();
      setCurrentOrderId(orderId);
      
      setOrderStatus('Đơn hàng đã được tạo! Đang kết nối để theo dõi...');
      
      // Connect to WebSocket and start location tracking
      await wsService.connect(orderId);
      
      wsService.subscribeToDeliveryUpdates(orderId, (deliveryEvent) => {
        setDeliveryLocation({ lat: deliveryEvent.latitude, lng: deliveryEvent.longitude });
        setOrderStatus(`Đơn hàng đang được giao - Cập nhật từ tài xế`);
      });

      startLocationTracking(orderId);
      
      setOrderStatus('Đang theo dõi đơn hàng và chia sẻ vị trí...');
      setCart([]);
      
    } catch (err) {
      setError('Không thể tạo đơn hàng');
      setOrderStatus('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-yellow-50 px-4">
        <div className="text-xl text-yellow-800">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-yellow-50 px-4">
        <div className="text-xl text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 w-full">
      <div className="max-w-none mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-yellow-800 text-center mb-8">
          🍜 Food Order
        </h1>

        {isUsingMockData && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">ℹ️</span>
              <div>
                <div className="font-semibold">Đang sử dụng dữ liệu mẫu</div>
                <div className="text-sm">Backend chưa kết nối được. Ứng dụng đang hoạt động với dữ liệu demo.</div>
              </div>
            </div>
          </div>
        )}

        {orderStatus && (
          <div className="bg-yellow-200 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
            <div className="font-semibold">{orderStatus}</div>
            {currentLocation && (
              <div className="text-sm mt-2">
                📱 Vị trí của bạn: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
        )}

        {/* Interactive Map when order is active */}
        {currentOrderId && (deliveryLocation || currentLocation) && (
          <div className="mb-8">
            <InteractiveMap
              customerLocation={currentLocation || undefined}
              deliveryLocation={deliveryLocation || undefined}
              orderId={currentOrderId}
              height="500px"
            />
          </div>
        )}

        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-yellow-200 w-full">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">🛒 Giỏ hàng</h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-yellow-100 gap-3">
                  <div className="flex-1">
                    <span className="font-semibold text-yellow-900 block">{item.name}</span>
                    <span className="text-yellow-700 text-sm">{item.price.toLocaleString()}đ x {item.quantity}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id || '', item.quantity - 1)}
                      className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="text-yellow-900 min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id || '', item.quantity + 1)}
                      className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id || '')}
                      className="bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded ml-2"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <span className="text-xl font-bold text-yellow-900">
                  Tổng: {getTotalPrice().toLocaleString()}đ
                </span>
                <button
                  onClick={createOrder}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold w-full sm:w-auto"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Venues */}
        <div className="space-y-8 w-full">
          {venues.map(venue => (
            <div key={venue.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-200 w-full">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-yellow-800">{venue.venueName}</h2>
                <p className="text-yellow-600 text-lg">📍 {venue.venueAddress}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {venue.products.map(product => (
                  <div
                    key={product.name}
                    className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 hover:border-yellow-400 transition-colors w-full"
                  >
                    <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-yellow-700 text-sm mb-3">{product.description}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-2xl font-bold text-yellow-800">
                        {product.price.toLocaleString()}đ
                      </span>
                      <button
                        onClick={() => addToCart(product, venue.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VenueList;