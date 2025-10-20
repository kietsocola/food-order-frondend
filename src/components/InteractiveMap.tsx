import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to auto-center map when locations change
function MapUpdater({ customerLocation, deliveryLocation }: {
  customerLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (customerLocation && deliveryLocation) {
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [customerLocation.lat, customerLocation.lng],
        [deliveryLocation.lat, deliveryLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (customerLocation) {
      map.setView([customerLocation.lat, customerLocation.lng], 15);
    } else if (deliveryLocation) {
      map.setView([deliveryLocation.lat, deliveryLocation.lng], 15);
    }
  }, [map, customerLocation, deliveryLocation]);

  return null;
}

interface InteractiveMapProps {
  customerLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
  orderId: string;
  height?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  customerLocation, 
  deliveryLocation, 
  orderId,
  height = '400px'
}) => {
  // Default center (Ho Chi Minh City)
  const defaultCenter: [number, number] = [10.7769, 106.6955];
  
  // Calculate center based on available locations
  const mapCenter: [number, number] = customerLocation 
    ? [customerLocation.lat, customerLocation.lng]
    : deliveryLocation 
    ? [deliveryLocation.lat, deliveryLocation.lng]
    : defaultCenter;

  return (
    <div className="bg-white rounded-lg shadow-md border border-yellow-200 overflow-hidden">
      <div className="p-4 bg-yellow-50 border-b border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
          🗺️ Bản đồ theo dõi đơn hàng #{orderId.slice(-6)}
          <span className="ml-2 text-sm text-green-600">● Live</span>
        </h3>
      </div>
      
      <div style={{ height }} className="relative">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater 
            customerLocation={customerLocation} 
            deliveryLocation={deliveryLocation}
          />
          
          {/* Customer location marker */}
          {customerLocation && (
            <Marker 
              position={[customerLocation.lat, customerLocation.lng]} 
              icon={customerIcon}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-blue-700">📱 Vị trí của bạn</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {customerLocation.lat.toFixed(6)}, {customerLocation.lng.toFixed(6)}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Đang chia sẻ vị trí realtime
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Delivery location marker */}
          {deliveryLocation && (
            <Marker 
              position={[deliveryLocation.lat, deliveryLocation.lng]} 
              icon={deliveryIcon}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-red-700">🛵 Tài xế giao hàng</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {deliveryLocation.lat.toFixed(6)}, {deliveryLocation.lng.toFixed(6)}
                  </div>
                  <div className="text-xs text-red-600 mt-2">
                    Cập nhật từ hệ thống
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {/* Map legend */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          {customerLocation && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-700">Vị trí của bạn</span>
            </div>
          )}
          {deliveryLocation && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-700">Tài xế giao hàng</span>
            </div>
          )}
          <div className="flex items-center text-xs text-gray-500">
            <span className="text-green-500 mr-1">●</span>
            Cập nhật realtime
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;