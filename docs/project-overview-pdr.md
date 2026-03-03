# Tổng Quan Project & PDR

## Tổng Quan

**Repository**: Petrolimex Calculator
**Mô Tả**: Bộ PWA cho Petrolimex gồm 2 ứng dụng độc lập: Phiếu Cân Gas + Sổ Doanh Thu
**Loại**: Web Progressive Apps (Multi-app PWA repository)
**Target**: Nhân viên trạm nạp gas Petrolimex (Gas app) + Quản lý doanh thu (Revenue app)
**Phiên Bản**: 1.3.0
**Ngày Tạo**: 02/03/2026 | **Cập Nhật**: 03/03/2026

## Mục Tiêu

1. **Số hóa quy trình kinh doanh** - Thay thế phiếu giấy bằng app di động
2. **Offline-first** - Hoạt động offline hoàn toàn, không phụ thuộc internet
3. **Tối ưu mobile** - Design mobile-first, responsive desktop
4. **Dễ sử dụng** - Giao diện đơn giản, nhanh chóng
5. **Lưu trữ dữ liệu** - Auto-save, lịch sử, nhớ dữ liệu trước đó
6. **Multi-app** - Hỗ trợ nhiều công cụ trong cùng 1 ecosystem

## Đặc Tính Chính

### Gas App (Phiếu Cân Gas)

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|-------|-----------|
| Tính gas tồn | Cân toàn bộ - Trọng lượng vỏ | ✓ Hoàn tất |
| 40 dòng bình | Mặc định 40 bình, thêm/xóa động | ✓ Hoàn tất |
| Nhớ tare | Auto-fill trọng lượng vỏ theo seri | ✓ Hoàn tất |
| Ngày Việt Nam | 3 dropdown Ngày/Tháng/Năm | ✓ Hoàn tất |
| Sticky summary | Bar hiển thị tổng gas + số bình | ✓ Hoàn tất |
| Auto-save | Debounce 800ms | ✓ Hoàn tất |
| Lịch sử | Xem/load/xóa phiếu (max 50) | ✓ Hoàn tất |
| In phiếu | Layout 2 cột, 5 chữ ký | ✓ Hoàn tất |
| Xuất CSV | CSV UTF-8 BOM | ✓ Hoàn tất |
| PWA offline | Service worker cache-first | ✓ Hoàn tất |
| Toast notify | Thông báo hành động | ✓ Hoàn tất |
| Dismiss iOS | Tap ngoài để đóng bàn phím | ✓ Hoàn tất |
| Cảnh báo seri | Nhất cảnh báo trùng số seri | ✓ Hoàn tất |
| Thập phân | Hỗ trợ dấu phẩy, chấm | ✓ Hoàn tất |

### Revenue App (Sổ Doanh Thu)

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|-------|-----------|
| Nhập CK/TM | Nhập doanh thu CK (Card) + TM (Tiền mặt) hàng ngày | ✓ Hoàn tất |
| Ghi chú | Thêm ghi chú cho mỗi entry | ✓ Hoàn tất |
| Tổng tháng | Tính tổng CK/TM theo tháng | ✓ Hoàn tast |
| Auto-save | Debounce 800ms | ✓ Hoàn tất |
| In sổ | Layout A4 với summary tháng | ✓ Hoàn tất |
| Xuất Excel | .xlsx via SheetJS | ✓ Hoàn tast |
| PWA offline | Network-first SW, xlsx cached | ✓ Hoàn tast |
| Teal design | Be Vietnam Pro font, WCAG AAA | ✓ Hoàn tast |
| Toast notify | Thông báo hành động | ✓ Hoàn tất |
| Responsive | Mobile-first, 768px/1024px breakpoints | ✓ Hoàn tast |

## Kiến Trúc Repository

```
petrolimex-calculator/
├── / (root)              # Gas App (Phiếu Cân Gas)
│   ├── index.html
│   ├── js/               # 9 modules ES
│   ├── css/              # 8 stylesheets
│   ├── sw.js             # Service worker
│   └── docs/
├── /revenue/             # Revenue App (Sổ Doanh Thu)
│   ├── index.html
│   ├── js/               # 9 modules ES
│   ├── css/              # 5 stylesheets
│   ├── sw.js             # Service worker
│   ├── manifest.json
│   └── lib/xlsx.full.min.js
└── /docs/                # Shared documentation
```

**Hai app hoàn toàn độc lập:**
- Khác domain path (`/` vs `/revenue/`)
- Khác localStorage keys
- Khác Service Worker caches
- Có thể deploy riêng
- Không share code/state

## PDR - Yêu Cầu Phát Triển

### Gas App - Yêu Cầu Chức Năng (FR)

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

### Revenue App - Yêu Cầu Chức Năng (FR)

#### FR-R01: Nhập Doanh Thu
- Cấp độ ưu tiên: **P1 (Critical)**
- Nhập CK (Card), TM (Tiền mặt) hàng ngày
- Ghi chú tự do (optional)
- Lưu ngay khi nhập

#### FR-R02: Xem Tổng Tháng
- Cấp độ ưu tiên: **P1 (Critical)**
- Tổng CK + TM theo tháng
- Thay đổi tháng dễ dàng (tabs)
- Hiển thị ngày hôm nay tự động

#### FR-R03: In & Xuất
- Cấp độ ưu tiên: **P2 (High)**
- In: Layout A4 với summary tháng
- Xuất Excel .xlsx via SheetJS
- Tên file: "So-Doanh-Thu-MM-YYYY.xlsx"

#### FR-R04: PWA & Offline
- Cấp độ ưu tiên: **P1 (Critical)**
- Service worker network-first
- Hoạt động offline hoàn toàn
- SheetJS vendored cho offline export

### Yêu Cầu Phi Chức Năng (NFR)

#### NFR-001: Hiệu Suất
- Thời gian tải trang < 500ms
- Auto-save không chặn UI
- Render không lag (60fps)

#### NFR-002: Lưu Trữ
- Dùng localStorage (giới hạn ~5MB)
- Gas app: tự động xóa phiếu cũ nếu quota đầy
- Revenue app: entries nhỏ, unlikely to overflow
- Thông báo lỗi lưu trữ

#### NFR-003: Khả Dụng
- Hoạt động offline hoàn toàn
- Tương thích iOS 12+, Android 4.4+
- Responsive 320px - 1440px+

#### NFR-004: Bảo Mật
- Không gửi dữ liệu mạng
- Không cookie tracking
- Dữ liệu chỉ trong localStorage
- Revenue app: dữ liệu tài chính local-only

#### NFR-005: UX
- Auto-save không cần bấm
- Toast thông báo rõ
- Dismiss bàn phím iOS tự động
- Be Vietnam Pro font cho typography

#### NFR-006: Design
- Gas app: Blue palette (#1B2469, #E85820)
- Revenue app: Teal palette (#0891B2)
- WCAG AAA contrast (7:1)
- Consistent component library

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
- Gas app: Số hóa phiếu cân gas
- Revenue app: Quản lý doanh thu hàng ngày
- Lưu, in, xuất cho cả 2 app
- Offline-first PWA (cả 2 app độc lập)
- WCAG AAA accessibility

### Ngoài Phạm Vi
- Sync lên server
- Authentication/multi-user
- Printer driver integration
- Cloud backup
- Real-time collaboration

## Timeline

| Giai Đoạn | Mô Tả | Trạng Thái |
|-----------|-------|-----------|
| **v1.0** | Gas app MVP | ✓ Hoàn tất (02/03/2026) |
| **v1.1** | Gas app: UX, bug fixes | ✓ Hoàn tất |
| **v1.2** | Gas app: History archiving | ✓ Hoàn tất |
| **v1.3** | **Revenue app launch** | ✓ Hoàn tất (03/03/2026) |
| **v1.4** | Polish & optimization | Planning |
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

### Gas App Risks

| Rủi Ro | Xác Suất | Tác Động | Giảm Thiểu |
|--------|----------|----------|-----------|
| localStorage full | Cao | Data loss | Xóa history auto |
| iOS caching issue | Trung | Stale data | Clear cache guide |
| Seri duplicate | Thấp | Confusion | Warn duplicate |
| Input error | Trung | Wrong gas | Validation hint |

### Revenue App Risks

| Rủi Ro | Xác Suất | Tác Động | Giảm Thiểu |
|--------|----------|----------|-----------|
| Financial data loss | Trung | Business impact | Auto-save debounce |
| Accidental delete | Trung | Data recovery needed | Confirm dialog |
| Export format issue | Thấp | Incompatible xlsx | Test with Excel |
| Two apps conflict | Rất Thấp | Cache issue | Separate cache names |

---

**Phiên Bản**: 1.3 | **Cập Nhật**: 03/03/2026
