export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws';

export const API_ENDPOINTS = {
  VENUES: `${API_BASE_URL}/venues`,
  CREATE_ORDER: `${API_BASE_URL}/orders/create`,
};