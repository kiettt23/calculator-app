---
title: "So Doanh Thu - Revenue Ledger PWA"
description: "Standalone PWA at /revenue/ for daily revenue tracking (CK+TM) with print and Excel export"
status: completed
priority: P1
effort: 8h
branch: main
tags: [pwa, revenue, vanilla-js, localStorage]
created: 2026-03-03
---

# So Doanh Thu - Revenue Ledger PWA

## Overview
Standalone PWA at `/revenue/` for elderly Vietnamese pharmacy owners to track daily revenue (CK bank transfer + TM cash), view monthly summaries, print A4 reports, and export Excel.

## Phase Overview

| Phase | Name | Effort | Parallel | Status |
|-------|------|--------|----------|--------|
| 01 | Foundation (PWA + CSS tokens + base) | 1.5h | Yes | completed |
| 02 | Core Logic (constants, utils, storage, state) | 1.5h | Yes | completed |
| 03 | UI & Rendering (HTML, render, handlers, components CSS) | 2h | Yes | completed |
| 04 | Print & Export (print.js, export.js, print CSS, SheetJS) | 1.5h | Yes | completed |
| 05 | Responsive & Polish (responsive CSS, modal, toast, integration) | 1.5h | No | completed |

## Dependency Graph
```
Phase 01 ──┐
Phase 02 ──┤
Phase 03 ──├──► Phase 05 (integration + polish)
Phase 04 ──┘
```
Phases 01-04 run in parallel (zero file overlap). Phase 05 wires everything together.

## File Ownership Matrix

| File | Ph01 | Ph02 | Ph03 | Ph04 | Ph05 |
|------|------|------|------|------|------|
| `revenue/manifest.json` | X | | | | |
| `revenue/sw.js` | X | | | | |
| `revenue/assets/icon-*.png` | X | | | | |
| `revenue/css/variables.css` | X | | | | |
| `revenue/css/base.css` | X | | | | |
| `revenue/js/constants.js` | | X | | | |
| `revenue/js/utils.js` | | X | | | |
| `revenue/js/storage.js` | | X | | | |
| `revenue/js/state.js` | | X | | | |
| `revenue/index.html` | | | X | | |
| `revenue/js/render.js` | | | X | | |
| `revenue/js/handlers.js` | | | X | | |
| `revenue/css/components.css` | | | X | | |
| `revenue/js/print.js` | | | | X | |
| `revenue/js/export.js` | | | | X | |
| `revenue/css/print.css` | | | | X | |
| `revenue/lib/xlsx.full.min.js` | | | | X | |
| `revenue/css/responsive.css` | | | | | X |
| `revenue/js/main.js` | | | | | X |

## Key Constraints
- No build step, no framework — vanilla JS ES modules
- localStorage key prefix: `so-doanh-thu-`
- 1 entry per day (date is unique key)
- All files < 200 lines
- WCAG AAA contrast, 44px+ touch targets
- Network-first SW strategy with app-specific cache name
