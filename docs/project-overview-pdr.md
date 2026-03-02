# Tổng Quan Project & PDR

## Tổng Quan

**Tên**: Phiếu Cân Gas Petrolimex
**Mô Tả**: PWA mobile-first để số hóa phiếu cân gas LPG tại trạm nạp Gas Petrolimex.
**Loại**: Web Progressive App (PWA)
**Target**: Nhân viên trạm nạp gas Petrolimex
**Phiên Bản**: 1.0.0
**Ngày Tạo**: 02/03/2026

## Mục Tiêu

1. **Số hóa phiếu cân gas** - Thay thế phiếu giấy bằng app di động
2. **Offline-first** - Hoạt động offline hoàn toàn, không phụ thuộc internet
3. **Tối ưu mobile** - Design mobile-first, responsive desktop
4. **Dễ sử dụng** - Giao diện đơn giản, nhanh chóng
5. **Lưu trữ dữ liệu** - Auto-save, lịch sử phiếu, nhớ trọng lượng vỏ

## Đặc Tính Chính

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|-------|-----------|
| Tính gas tồn | Cân toàn bộ - Trọng lượng vỏ | ✓ Hoàn tất |
| 40 dòng bình | Mặc định 40 bình, thêm/xóa động | ✓ Hoàn tất |
| Nhớ tare | Auto-fill trọng lượng vỏ theo seri | ✓ Hoàn tát |
| Ngày Việt Nam | 3 dropdown Ngày/Tháng/Năm | ✓ Hoàn tất |
| Sticky summary | Bar hiển thị tổng gas + số bình | ✓ Hoàn tất |
| Auto-save | Debounce 800ms | ✓ Hoàn tất |
| Lịch sử | Xem/load/xóa phiếu (max 50) | ✓ Hoàn tất |
| In phiếu | Layout 2 cột, 5 chữ ký | ✓ Hoàn tất |
| Xuất Excel | CSV UTF-8 BOM | ✓ Hoàn tất |
| PWA offline | Service worker cache-first | ✓ Hoàn tất |
| Toast notify | Thông báo hành động | ✓ Hoàn tất |
| Dismiss iOS | Tap ngoài để đóng bàn phím | ✓ Hoàn tất |
| Cảnh báo seri | Nhất cảnh báo trùng số seri | ✓ Hoàn tất |
| Thập phân | Hỗ trợ dấu phẩy, chấm | ✓ Hoàn tất |

## PDR - Yêu Cầu Phát Triển

### Yêu Cầu Chức Năng (FR)

#### FR-001: Tính Toán Gas
- Cấp độ ưu tiên: **P1 (Critical)**
- Gas tồn = Cân toàn bộ - Trọng lượng vỏ
- Hỗ trợ input dấu phẩy hoặc chấm làm thập phân
- Tự động tính và cập nhật tóm tắt
- Hiển thị giá trị 0 nếu input trống

#### FR-002: Quản Lý Bình
- Cấp độ ưu tiên: **P1 (Critical)**
- Mặc định 40 dòng
- Thêm bình mới (max 100)
- Xóa bình (min 1)
- Phát cảnh báo nếu trùng seri
- Xóa hết làm phiếu mới

#### FR-003: Nhớ Trọng Lượng Vỏ
- Cấp độ ưu tiên: **P2 (High)**
- Lưu tare theo seri
- Auto-fill tare khi nhập seri trùng
- Cho phép edit tare nếu cần

#### FR-004: Chọn Ngày
- Cấp độ ưu tiên: **P1 (Critical)**
- Giao diện 3 dropdown (Ngày, Tháng, Năm)
- Ngôn ngữ Việt Nam
- Lưu ngày vào state

#### FR-005: Lịch Sử Phiếu
- Cấp độ ưu tiên: **P2 (High)**
- Lưu tối đa 50 phiếu
- Xem chi tiết phiếu cũ
- Tải lại phiếu cũ
- Xóa phiếu

#### FR-006: In & Xuất
- Cấp độ ưu tiên: **P2 (High)**
- In: Layout 2 cột, chữ ký 5 bên
- Xuất CSV UTF-8 BOM (Excel)
- Ẩn nút in/xuất khi print

#### FR-007: PWA & Offline
- Cấp độ ưu tiên: **P1 (Critical)**
- Service worker cache-first
- Hoạt động offline
- Add to home screen

### Yêu Cầu Phi Chức Năng (NFR)

#### NFR-001: Hiệu Suất
- Thời gian tải trang < 500ms
- Auto-save không chặn UI
- Render card < 16ms (60fps)

#### NFR-002: Lưu Trữ
- Dùng localStorage (giới hạn ~5MB)
- Tự động xóa phiếu cũ nếu quota đầy
- Thông báo lỗi lưu trữ

#### NFR-003: Khả Dụng
- Hoạt động offline hoàn toàn
- Tương thích iOS 12+, Android 4.4+
- Responsive 320px - 1440px+

#### NFR-004: Bảo Mật
- Không gửi dữ liệu mạng
- Không cookie tracking
- Dữ liệu chỉ trong localStorage

#### NFR-004: UX
- Auto-save không cần bấm
- Toast thông báo rõ
- Dismiss bàn phím iOS tự động

## Tiêu Chí Chấp Nhận

- **Tính Toán**: Kết quả gas tồn chính xác = tổng (total - tare)
- **Lưu Trữ**: Tất cả dữ liệu persist sau reload
- **Offline**: Hoạt động không cần mạng
- **Performance**: Không lag, 60fps
- **Compatibility**: Chạy iOS/Android

## Ràng Buộc Kỹ Thuật

- Vanilla JS (không framework)
- Không dependencies
- Không build step
- Không Node.js
- CSS Grid + Flexbox
- Service Worker

## Kiến Trúc Tổng Quan

```
User Interface (HTML/CSS)
         ↓
  Render Logic (JS)
         ↓
  State Management
         ↓
  localStorage
  (Data Persistence)
         ↓
  Service Worker
  (Offline Cache)
```

## Phạm Vi & Giới Hạn

### Trong Phạm Vi
- Số hóa phiếu cân gas
- Lưu, in, xuất phiếu
- Offline-first PWA

### Ngoài Phạm Vi
- Sync lên server
- Authentication
- Multi-user
- Printer driver

## Timeline

| Giai Đoạn | Mô Tả | Trạng Thái |
|-----------|-------|-----------|
| **v1.0** | MVP core features | ✓ Hoàn tất |
| **v1.1** | Tối ưu UX, bug fixes | Planed |
| **v2.0** | Sync server, auth | Backlog |

## Nhân Lực

| Vai Trò | Mô Tả |
|---------|-------|
| Developer | Phát triển & maintain |
| Tester | QA trên iOS/Android |
| PM | Định hướng feature |

## Đánh Giá Thành Công

- Phiếu được tạo nhanh (< 2 phút)
- Dữ liệu persist 100%
- Offline hoạt động tốt
- 0 crash trên iOS/Android
- User adoption > 80%

## Rủi Ro & Giảm Thiểu

| Rủi Ro | Xác Suất | Tác Động | Giảm Thiểu |
|--------|----------|----------|-----------|
| localStorage full | Cao | Data loss | Xóa history auto |
| iOS caching issue | Trung | Stale data | Clear cache guide |
| Seri duplicate | Thấp | Confusion | Warn duplicate |
| Input error | Trung | Wrong gas | Validation hint |

---

**Phiên Bản**: 1.0 | **Cập Nhật**: 02/03/2026
