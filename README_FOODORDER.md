# Food Order Frontend

Ứng dụng web đặt món ăn đơn giản với tính năng theo dõi vị trí realtime.

## Tính năng

- ✅ Hiển thị danh sách nhà hàng và món ăn
- ✅ Giỏ hàng với tính năng thêm/bớt/xóa món
- ✅ Tạo đơn hàng qua API
- ✅ Kết nối WebSocket để nhận cập nhật delivery
- ✅ Chia sẻ vị trí GPS realtime
- ✅ Giao diện màu vàng nhạt theo yêu cầu

## Cấu trúc dự án

```
src/
├── components/
│   ├── VenueList.tsx        # Component chính hiển thị venues và products
│   └── LocationDisplay.tsx  # Component hiển thị vị trí
├── services/
│   ├── venueService.ts      # Service gọi API venues và orders
│   └── websocketService.ts  # Service WebSocket với STOMP
├── types/
│   └── index.ts            # TypeScript types
├── config/
│   └── api.ts              # Cấu hình API endpoints
└── App.tsx                 # Component chính
```

## API Endpoints sử dụng

- `GET /api/v1/venues` - Lấy danh sách venues và products
- `POST /api/v1/orders/create` - Tạo đơn hàng mới

## WebSocket

- Kết nối: `ws://localhost:8080/ws` (SockJS)
- Subscribe: `/topic/delivery.{orderId}` - Nhận cập nhật delivery
- Publish: `/app/delivery` - Gửi vị trí GPS

## Cách chạy

1. Đảm bảo backend đã chạy trên port 8080
2. Cài dependencies: `npm install`
3. Chạy dev server: `npm run dev`
4. Mở browser: `http://localhost:5174`

## Luồng hoạt động

1. User vào trang chủ → Gọi API lấy venues
2. User chọn món → Thêm vào giỏ hàng
3. User nhấn "Đặt hàng" → Gọi API tạo order
4. Kết nối WebSocket → Subscribe channel delivery
5. Bắt đầu tracking GPS → Gửi vị trí realtime
6. Nhận cập nhật delivery từ backend qua WebSocket

## Công nghệ sử dụng

- **React 19** với TypeScript
- **Tailwind CSS** cho styling (màu vàng chủ đạo)
- **Vite** cho build tool
- **@stomp/stompjs** cho WebSocket communication
- **SockJS** cho WebSocket fallback
- **Navigator.geolocation** cho GPS tracking

## Lưu ý

- Cần cho phép truy cập vị trí trong browser
- Backend cần hỗ trợ CORS cho localhost:5174
- WebSocket endpoint cần cấu hình SockJS