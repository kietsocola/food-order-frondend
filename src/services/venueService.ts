import { API_ENDPOINTS } from '../config/api';
import type { Venue, Order } from '../types';

// Mock data for fallback
const mockVenues: Venue[] = [
  {
    id: "28e9a27c-6053-4dd2-91e0-193b855dc7f0",
    venueName: "Tuấn Kiệt của Tuyết Mai",
    venueAddress: "Quận 6, TP HCM",
    products: [
      {
        id: "product-1",
        name: "Một cái ôm",
        description: "Món ăn đặc biệt với tình yêu thương",
        venueId: "28e9a27c-6053-4dd2-91e0-193b855dc7f0",
        price: 10500
      },
      {
        id: "product-2", 
        name: "Một cái hun",
        description: "Ngọt ngào như nụ hôn đầu tiên",
        venueId: "28e9a27c-6053-4dd2-91e0-193b855dc7f0",
        price: 12000
      },
      {
        id: "product-3",
        name: "Một cái véo má",
        description: "Tinh nghịch và đáng yêu",
        venueId: "28e9a27c-6053-4dd2-91e0-193b855dc7f0",
        price: 8750
      },
      {
        id: "product-4",
        name: "Một buổi đi chơi",
        description: "Kỷ niệm không thể nào quên",
        venueId: "28e9a27c-6053-4dd2-91e0-193b855dc7f0",
        price: 15000
      },
      {
        id: "product-5",
        name: "Một bữa ăn tối",
        description: "Lãng mạn dưới ánh nến",
        venueId: "28e9a27c-6053-4dd2-91e0-193b855dc7f0",
        price: 20000
      }
    ]
  },
  {
    id: "venue-2",
    venueName: "Quán Phở Hà Nội",
    venueAddress: "Quận 1, TP HCM",
    products: [
      {
        id: "product-6",
        name: "Phở Bò Tái",
        description: "Phở bò truyền thống Hà Nội",
        venueId: "venue-2",
        price: 45000
      },
      {
        id: "product-7",
        name: "Phở Gà",
        description: "Phở gà thơm ngon, thanh đạm",
        venueId: "venue-2", 
        price: 40000
      },
      {
        id: "product-8",
        name: "Trà Đá",
        description: "Trà đá mát lạnh giải khát",
        venueId: "venue-2",
        price: 5000
      },
      {
        id: "product-9",
        name: "Chả Cá Lã Vọng",
        description: "Đặc sản Hà Nội nổi tiếng",
        venueId: "venue-2",
        price: 85000
      }
    ]
  },
  {
    id: "venue-3",
    venueName: "Bánh Mì Sài Gòn",
    venueAddress: "Quận 3, TP HCM",
    products: [
      {
        id: "product-10",
        name: "Bánh Mì Thịt Nướng",
        description: "Bánh mì giòn với thịt nướng thơm lừng",
        venueId: "venue-3",
        price: 25000
      },
      {
        id: "product-11",
        name: "Bánh Mì Pate",
        description: "Bánh mì pate truyền thống",
        venueId: "venue-3",
        price: 20000
      },
      {
        id: "product-12",
        name: "Cà Phê Sữa Đá",
        description: "Cà phê Việt Nam đậm đà",
        venueId: "venue-3",
        price: 18000
      }
    ]
  }
];

export const venueService = {
  async getVenues(): Promise<Venue[]> {
    try {
      console.log('Attempting to fetch venues from API...');
      const response = await fetch(API_ENDPOINTS.VENUES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched venues from API');
      return data;
    } catch (error) {
      console.warn('Failed to fetch venues from API, using mock data:', error);
      // Return mock data as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockVenues);
        }, 500); // Simulate network delay
      });
    }
  },

  async createOrder(order: Order): Promise<any> {
    try {
      console.log('Attempting to create order via API...');
      const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Successfully created order via API');
      return result;
    } catch (error) {
      console.warn('Failed to create order via API, using mock response:', error);
      // Return mock response as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            orderId: `mock-order-${Date.now()}`,
            status: 'created',
            message: 'Order created successfully (mock)',
            ...order
          });
        }, 1000); // Simulate network delay
      });
    }
  },
};