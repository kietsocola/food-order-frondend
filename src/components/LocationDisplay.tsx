import React from 'react';

interface LocationDisplayProps {
  latitude: number;
  longitude: number;
  orderId: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ latitude, longitude, orderId }) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=15`;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-yellow-200 w-full">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        📍 Vị trí đơn hàng #{orderId.slice(-6)}
      </h3>
      
      {/* Map Display */}
      <div className="mb-4">
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-gray-600 font-semibold">Bản đồ vị trí</div>
            <div className="text-sm text-gray-500 mt-1">
              Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
            </div>
            <div className="mt-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Xem trên Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Location Details */}
      <div className="space-y-2">
        <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
          <span className="font-semibold">📍 Latitude:</span> {latitude.toFixed(6)}
        </div>
        <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
          <span className="font-semibold">📍 Longitude:</span> {longitude.toFixed(6)}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
        <div className="text-xs text-green-700 flex items-center">
          <span className="text-green-500 mr-2">🟢</span>
          Vị trí được cập nhật realtime qua WebSocket
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;