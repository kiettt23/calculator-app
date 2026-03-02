# Phiếu Cân Gas Petrolimex

Ứng dụng PWA mobile-first để số hóa phiếu cân gas LPG tại trạm nạp Gas Petrolimex. Hỗ trợ hoàn toàn offline.

## Tính Năng Chính

- **Cân gas**: Tính gas tồn = Cân toàn bộ - Trọng lượng vỏ
- **Bình mặc định**: 40 dòng bình, thêm/xóa động
- **Nhớ trọng lượng vỏ**: Auto-fill tare theo số seri
- **Chọn ngày**: Giao diện Việt Nam (Ngày, Tháng, Năm)
- **Tóm tắt động**: Sticky bar hiển thị tổng gas + số bình
- **Auto-save**: Lưu tự động 800ms debounce
- **Lịch sử phiếu**: Xem, tải, xóa phiếu cũ (max 50)
- **In phiếu**: Layout 2 cột, chữ ký 5 bên
- **Xuất Excel**: CSV UTF-8 BOM cho Excel
- **Offline**: PWA cache-first, hoàn toàn offline
- **Thập phân**: Hỗ trợ dấu phẩy hoặc chấm
- **Cảnh báo**: Nhất cảnh báo trùng số seri

## Tech Stack

- **Vanilla JS** - Không framework, không dependencies
- **HTML5 + CSS3** - Responsive design
- **Service Worker** - PWA offline
- **localStorage** - Data persistence
- **No build step** - Direct file execution

## Cấu Trúc Tệp

```
├── index.html         # HTML structure
├── app.js             # Main logic (638 LOC)
├── styles.css         # Styling (806 LOC)
├── sw.js              # Service worker
├── manifest.json      # PWA manifest
├── icon.svg           # Petrolimex logo
└── docs/              # Documentation
```

## Bắt Đầu

1. Mở `index.html` trong trình duyệt
2. Thêm vào Home screen (iOS: Share > Add to Home; Android: Menu > Install app)
3. Sử dụng offline mà không cần kết nối mạng

## Cấu Trúc localStorage

- `phieu-can-gas-data` - State hiện tại: `{ date, cylinders: [{ seri, total, tare }] }`
- `phieu-can-gas-tare-db` - DB tare weight theo seri: `{ [seri]: tare }`
- `phieu-can-gas-history` - Lịch sử phiếu (max 50)

## Ghi Chú Thiết Kế

- **Responsive**: Tối ưu iPhone 11 (414px), responsive đến 1440px+
- **Breakpoints**: 768px (1 col), 1024px (2 col), 1440px (3 col)
- **Font**: System font stack, 18px base
- **Brand Colors**: Petrolimex Blue (#5FCAEC), Orange (#F89420), Dark (#0d4f66)

## Quy Trình Phát Triển

Xem chi tiết tại [`docs/project-roadmap.md`](./docs/project-roadmap.md)

## Tài Liệu

- [`docs/project-overview-pdr.md`](./docs/project-overview-pdr.md) - Tổng quan & PDR
- [`docs/codebase-summary.md`](./docs/codebase-summary.md) - Tóm tắt codebase
- [`docs/code-standards.md`](./docs/code-standards.md) - Tiêu chuẩn code
- [`docs/system-architecture.md`](./docs/system-architecture.md) - Kiến trúc hệ thống
- [`docs/design-guidelines.md`](./docs/design-guidelines.md) - Hướng dẫn design

## Hỗ Trợ

Mỗi hàm chính được chia thành các section với comment rõ ràng. Xem `app.js` để hiểu flow.

---

**Tạo**: 02/03/2026 | **Framework**: Vanilla JS | **Phiên Bản**: 1.0.0
