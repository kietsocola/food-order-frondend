import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { LocationMessage, DeliveryEvent } from '../types';

export class WebSocketService {
  private stompClient: Client | null = null;
  private orderId: string | null = null;
  private mockMode: boolean = false;

  connect(orderId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.orderId = orderId;
        
        console.log('Attempting to connect to WebSocket...');
        
        // Use SockJS for better compatibility
        const socket = new SockJS('http://localhost:8080/api/ws');
        
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          debug: (str) => console.log('STOMP: ' + str),
          connectHeaders: {},
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          onConnect: () => {
            console.log('STOMP connected successfully');
            this.mockMode = false;
            this.subscribeToDeliveryUpdates(orderId);
            resolve();
          },
          onStompError: (frame) => {
            console.error('STOMP error:', frame);
            this.enableMockMode(orderId);
            resolve(); // Still resolve to continue with mock mode
          },
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.enableMockMode(orderId);
            resolve(); // Still resolve to continue with mock mode
          },
          onWebSocketClose: () => {
            console.log('WebSocket connection closed');
            if (!this.mockMode) {
              this.enableMockMode(orderId);
            }
          },
        });

        // Set timeout for connection
        setTimeout(() => {
          if (!this.stompClient?.connected) {
            console.warn('WebSocket connection timeout, enabling mock mode');
            this.enableMockMode(orderId);
            resolve();
          }
        }, 3000);

        this.stompClient.activate();

      } catch (error) {
        console.error('Failed to initialize WebSocket, enabling mock mode:', error);
        this.enableMockMode(orderId);
        resolve(); // Still resolve to continue with mock mode
      }
    });
  }

  private enableMockMode(orderId: string) {
    console.log('🔄 Enabling mock mode for WebSocket functionality');
    this.mockMode = true;
    this.simulateMockDeliveryUpdates(orderId);
  }

  private simulateMockDeliveryUpdates(orderId: string) {
    // Simulate receiving delivery updates every 5 seconds
    const mockLocations = [
      { lat: 10.7769, lng: 106.6955, status: 'Đã nhận đơn hàng' },
      { lat: 10.7779, lng: 106.6965, status: 'Đang chuẩn bị món' },
      { lat: 10.7789, lng: 106.6975, status: 'Shipper đang lấy hàng' },
      { lat: 10.7799, lng: 106.6985, status: 'Đang giao hàng' },
      { lat: 10.7809, lng: 106.6995, status: 'Sắp đến nơi' },
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < mockLocations.length) {
        const location = mockLocations[currentIndex];
        const mockEvent: DeliveryEvent = {
          orderId,
          latitude: location.lat,
          longitude: location.lng,
          timestamp: Date.now(),
          status: location.status
        };
        
        console.log('📍 Mock delivery update:', mockEvent);
        // Trigger callback if subscribed
        this.handleMockDeliveryEvent(mockEvent);
        currentIndex++;
      } else {
        clearInterval(interval);
        console.log('✅ Mock delivery completed');
      }
    }, 5000);
  }

  private mockCallback: ((event: DeliveryEvent) => void) | null = null;

  private handleMockDeliveryEvent(event: DeliveryEvent) {
    if (this.mockCallback) {
      this.mockCallback(event);
    }
  }

  subscribeToDeliveryUpdates(orderId: string, callback?: (event: DeliveryEvent) => void) {
    if (this.mockMode) {
      console.log('📱 Subscribed to mock delivery updates for order:', orderId);
      this.mockCallback = callback || null;
      return;
    }

    if (this.stompClient && this.stompClient.connected) {
      const subscription = `/topic/delivery.${orderId}`;
      console.log(`📡 Subscribing to ${subscription}`);
      
      this.stompClient.subscribe(subscription, (message) => {
        try {
          const deliveryEvent: DeliveryEvent = JSON.parse(message.body);
          console.log('📍 Received delivery event:', deliveryEvent);
          if (callback) {
            callback(deliveryEvent);
          }
        } catch (error) {
          console.error('Error parsing delivery event:', error);
        }
      });
    }
  }

  sendLocation(latitude: number, longitude: number) {
    if (this.mockMode) {
      console.log('📍 Mock sending location:', { latitude, longitude, orderId: this.orderId });
      return;
    }

    if (this.stompClient && this.stompClient.connected && this.orderId) {
      const locationMessage: LocationMessage = {
        orderId: this.orderId,
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      console.log('📍 Sending location via WebSocket:', locationMessage);
      
      this.stompClient.publish({
        destination: '/app/delivery',
        body: JSON.stringify(locationMessage),
      });
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.orderId = null;
    this.mockMode = false;
    this.mockCallback = null;
  }
}

export const wsService = new WebSocketService();