export interface Product {
  id?: string;
  name: string;
  description: string;
  venueId: string;
  price: number;
}

export interface Venue {
  id: string;
  venueName: string;
  venueAddress: string;
  products: Product[];
}

export interface OrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  customerId: string;
  venuesId: string;
  address: string;
  orderItems: OrderItem[];
}

export interface LocationMessage {
  orderId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface DeliveryEvent {
  orderId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status?: string;
}