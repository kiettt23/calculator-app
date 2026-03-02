# Lộ Trình Phát Triển

## Tổng Quan

Lộ trình phát triển dài hạn cho ứng dụng Phiếu Cân Gas Petrolimex, bao gồm các giai đoạn hiện tại, lên kế hoạch, và tương lai.

**Phiên Bản Hiện Tại**: 1.0.0 (MVP)
**Trạng Thái**: ✓ Hoàn tất
**Cập Nhật**: 02/03/2026

## Giai Đoạn & Milestone

### Phase 1: MVP (v1.0) ✓ Hoàn Tất
**Timeline**: Hoàn tất
**Status**: ✓ Release

#### Tính Năng
- [x] Tính gas tồn (total - tare)
- [x] 40 dòng bình mặc định
- [x] Thêm/xóa bình động
- [x] Nhớ trọng lượng vỏ theo seri
- [x] Chọn ngày (3 dropdown Việt Nam)
- [x] Sticky summary bar
- [x] Auto-save 800ms debounce
- [x] Lịch sử phiếu (max 50)
- [x] In phiếu (layout 2 cột, 5 chữ ký)
- [x] Xuất CSV UTF-8
- [x] PWA offline
- [x] Dismiss bàn phím iOS
- [x] Cảnh báo seri trùng
- [x] Hỗ trợ dấu phẩy, chấm thập phân

#### Acceptance Criteria
- [x] Tất cả tính năng hoạt động
- [x] Offline hoàn toàn
- [x] Data persist 100%
- [x] iOS/Android compatible
- [x] No errors on console

#### Lessons Learned
- localStorage quota handling important
- User expects auto-save (no save button)
- Print layout needs 5 signature boxes
- Tare memory saves ~50% input time

---

### Phase 2: Polish & Optimization (v1.1) 📋 Planned
**Timeline**: Q2 2026
**Status**: Planned

#### Tính Năng
- [ ] Dark mode toggle
- [ ] Language selection (EN/VI)
- [ ] Improved UX (haptic feedback)
- [ ] Better error messages
- [ ] Keyboard shortcuts (Ctrl+P print, Ctrl+E export)
- [ ] Batch history delete
- [ ] Duplicate phiếu
- [ ] Search history
- [ ] PDF export (instead of print)

#### Dependencies
- None - standalone features

#### Success Criteria
- [ ] 0 bugs reported
- [ ] Load time < 300ms
- [ ] 95% user satisfaction

#### Effort Estimate
- Dev: 2 weeks
- QA: 1 week
- Total: 3 weeks

---

### Phase 3: Analytics & Reporting (v1.2) 📋 Planned
**Timeline**: Q3 2026
**Status**: Backlog

#### Tính Năng
- [ ] Daily summary report
- [ ] Weekly gas consumption stats
- [ ] Trend charts (Chart.js)
- [ ] Export monthly report
- [ ] Performance metrics
- [ ] Usage dashboard

#### Dependencies
- Phase 2 completed
- Chart library (Chart.js ~100KB)

#### Effort Estimate
- Dev: 3 weeks
- QA: 1 week
- Total: 4 weeks

---

### Phase 4: Server Sync (v2.0) 💡 Backlog
**Timeline**: Q4 2026+
**Status**: Backlog

#### Tính Năng
- [ ] Backend API (Node/Express)
- [ ] Authentication (JWT)
- [ ] Cloud sync
- [ ] Multi-device support
- [ ] Real-time collaboration
- [ ] Backup/restore

#### Architecture Changes
- Add Vue.js framework
- Replace localStorage with API
- Implement auth layer
- Add database (PostgreSQL)
- CI/CD pipeline

#### Effort Estimate
- Planning: 2 weeks
- Dev: 8 weeks
- QA: 2 weeks
- Deployment: 1 week
- Total: 13 weeks

#### Risks
- Breaking existing offline usage
- User migration complexity
- Backend maintenance cost

---

### Phase 5: Advanced Features (v2.1+) 💡 Backlog
**Timeline**: TBD
**Status**: Backlog

#### Potential Features
- [ ] Photo capture (cylinder weight)
- [ ] OCR number recognition
- [ ] Barcode scanning
- [ ] Offline sync queue
- [ ] Conflict resolution
- [ ] Audit trail
- [ ] Role-based access
- [ ] Bulk operations

---

## Quarter Planning

### Q1 2026 (Jan - Mar)
**Focus**: MVP stability & bug fixes
- [x] v1.0 release
- [x] Initial documentation
- [x] User feedback gathering

**Status**: ✓ Complete

### Q2 2026 (Apr - Jun)
**Focus**: UX polish & performance
- [ ] v1.1 release (dark mode, i18n, optimization)
- [ ] User training program
- [ ] Gather feedback from 50+ users

**Target Start**: April 2026

### Q3 2026 (Jul - Sep)
**Focus**: Analytics & reporting
- [ ] v1.2 release (reporting, stats)
- [ ] Integration with Petrolimex HQ

**Target Start**: July 2026

### Q4 2026 (Oct - Dec)
**Focus**: Planning v2.0
- [ ] Requirements gathering
- [ ] Architecture design
- [ ] Start v2.0 development

**Target Start**: October 2026

---

## Feature Backlog (Prioritized)

### High Priority (P1)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Duplicate phiếu | 2h | High | Backlog |
| Search history | 4h | Medium | Backlog |
| Batch delete history | 2h | Low | Backlog |
| Dark mode | 8h | High | Planned v1.1 |
| PDF export | 6h | High | Planned v1.1 |

### Medium Priority (P2)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Language selection | 4h | Medium | Planned v1.1 |
| Keyboard shortcuts | 4h | Medium | Planned v1.1 |
| Better error messages | 6h | Medium | Planned v1.1 |
| Daily summary | 8h | High | Planned v1.2 |

### Low Priority (P3)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Haptic feedback | 2h | Low | Backlog |
| Animations | 4h | Low | Backlog |
| Offline notification | 2h | Low | Backlog |

---

## Known Issues & Debt

### Technical Debt
| Issue | Severity | Plan |
|-------|----------|------|
| app.js 638 LOC | Medium | Split modules in v2.0 |
| Inline HTML strings | Medium | Component library in v2.0 |
| No unit tests | High | Add in v1.1 |
| No CI/CD | Medium | Setup in v2.0 |

### Bug Backlog
| Bug | Severity | Status |
|-----|----------|--------|
| None reported | - | ✓ Clean |

### Performance
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Load time | ~200ms | < 300ms | ✓ Good |
| JS size | ~21KB | < 30KB | ✓ Good |
| CSS size | ~17KB | < 25KB | ✓ Good |
| Offline cache | ~58KB | < 100KB | ✓ Good |

---

## Resource Planning

### Team
- 1 Full-stack Developer
- 1 QA Tester (part-time)
- 1 Product Manager (part-time)

### Infrastructure
- GitHub (code)
- Vercel (free hosting for future versions)
- Google Drive (documentation)

### Budget
- Development: In-house
- Hosting: Free tier
- Design: Internal

---

## Dependency Graph

```
v1.0 (MVP) ✓
    ├─ Core features
    ├─ Offline support
    └─ Mobile responsive
       ↓
v1.1 (Polish)
    ├─ Dark mode
    ├─ i18n
    ├─ Performance
    └─ Unit tests
       ↓
v1.2 (Analytics)
    ├─ Reporting
    ├─ Stats
    └─ Trending
       ↓
v2.0 (Cloud)
    ├─ Auth
    ├─ Backend API
    ├─ Multi-device
    └─ Real-time sync
       ↓
v2.1+ (Advanced)
    ├─ Photo/OCR
    ├─ Barcode scan
    └─ Audit trail
```

---

## Success Metrics

### User Adoption
- Target: 80% of Petrolimex staff using app
- Measure: Active users / total staff
- Timeline: 6 months

### Data Quality
- Target: 99.9% data integrity
- Measure: Sync errors / total transactions
- Timeline: Ongoing

### Performance
- Target: < 300ms load time
- Measure: Real User Monitoring
- Timeline: Ongoing

### Satisfaction
- Target: 4.5+ / 5.0 rating
- Measure: In-app survey
- Timeline: Quarterly

---

## Communication Plan

**Stakeholders**:
- Petrolimex management
- Trạm nạp gas staff
- IT team

**Status Updates**:
- Weekly: Dev progress
- Monthly: Feature updates
- Quarterly: Roadmap review

**Feedback Channels**:
- In-app feedback form
- Email: feedback@petrolimex.app
- Monthly user meetings

---

## Risk & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| localStorage quota limit | Medium | High | Implement history cleanup, plan v2.0 backend |
| iOS caching issues | Low | High | Version assets, manual cache clear docs |
| User adoption slow | Medium | High | Hands-on training, document benefits |
| Breaking change in v2.0 | High | High | Gradual migration, parallel support |
| Server costs in v2.0 | Medium | High | Estimate infrastructure costs early |

---

## Version History

### v1.0.0 (Released 02/03/2026)
- MVP all core features
- Offline-first PWA
- iOS/Android support
- localStorage persistence
- Print & export

### v1.1.0 (Planned Q2 2026)
- Dark mode
- i18n (EN/VI)
- Performance optimization
- Unit tests
- Better UX

### v1.2.0 (Planned Q3 2026)
- Analytics & reporting
- Trending stats
- Monthly export

### v2.0.0 (Planned Q4 2026+)
- Server sync
- Authentication
- Multi-device
- Real-time collaboration

---

**Last Updated**: 02/03/2026
**Owner**: Dev Team
**Next Review**: 30/04/2026
