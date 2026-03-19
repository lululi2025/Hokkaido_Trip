# CLAUDE.md — Hokkaido Trip App

> Last updated: 2026-03-19

## Project Overview

北海道 8 天 7 夜春季自駕旅遊行程 App。提供每日行程瀏覽、避坑指南、戰利品攻略、雲端記帳本等功能。
部署於 Cloudflare Pages，Firebase 提供後端（Auth + Firestore）。

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS 4（使用 `@tailwindcss/vite` plugin，**不需要** postcss.config 或 tailwind.config）
- Firebase Auth（Google 登入）+ Firestore（記帳資料）
- lucide-react（圖示）
- 部署：Cloudflare Pages（自動從 GitHub main 分支 build）

## Directory Structure

```
src/
  App.jsx    — App 邏輯、UI 元件（Firebase、登入、記帳、行程卡片等）
  data.js    — 純資料檔（行程、避坑指南、戰利品）← 更新行程只改這裡
  index.css  — Tailwind 入口
  main.jsx   — React 入口
public/
  icon-512.png   — PWA icon（手機主畫面圖示）
  manifest.json  — PWA manifest
index.html       — HTML 入口（含 PWA meta tags）
```

## Architecture Decisions

### 資料與邏輯分離
- `data.js` 只放行程資料（TRIP_TITLE, TRIP_DATES, INITIAL_ITINERARY, SURVIVAL_GUIDES, SHOPPING_ITEMS）
- `App.jsx` 只放 app 邏輯和 UI
- **更新行程時只改 data.js，絕對不動 App.jsx**

### Google 登入只在記帳頁
- 瀏覽行程、避坑指南、戰利品 → 不需登入
- 記帳本頁面 → 未登入顯示 Google 登入按鈕，登入後才能使用
- 登入後記帳資料存在 Firestore，跨裝置同步

### Firebase 設定
- 共用里斯本 travel-app 的 Firebase 專案 `trip-app-4d33c`
- Firestore 路徑：`artifacts/{FIREBASE_APP_ID}/users/{uid}/expenses`
- FIREBASE_APP_ID = `"hokkaido-spring-pro-2026"`
- Firebase Console 需確認已開啟：Authentication（Google provider）、Firestore Database

## Deployment

- GitHub repo：`lululi2025/Hokkaido_Trip`
- 線上網址：`https://hokkaido-trip-f50.pages.dev`
- Cloudflare Pages 設定：Build command = `npm run build`，Output = `dist`
- 本地 git branch 是 `master`，push 時用 `git push origin master:main`

```bash
npm run dev      # 本地開發 (localhost:5173)
npm run build    # 打包到 dist/
```

## 更新行程的流程

1. 用 Gemini 規劃行程，請它只輸出 data.js 格式的資料
2. 把 Gemini 輸出貼到 chat，AI 幫你更新 `src/data.js`
3. Push → Cloudflare 自動部署

## Current Status

### ✅ Completed
- React + Vite + Tailwind 專案建立
- 8 天 7 夜北海道行程資料
- 避坑指南（14 項）
- 戰利品攻略（17 項）
- Firebase Firestore 雲端記帳
- Google 登入（僅記帳頁）
- PWA icon + manifest（手機加到主畫面）
- 資料拆檔（data.js 獨立）

### ⚠️ Pending / Known Issues
- Firebase Authentication 需在 Console 開啟 Google provider
- Firestore 安全規則目前是測試模式（allow all），上線前要改
- 部署網址需加到 Firebase Auth 的授權網域清單
- PWA icon 在手機上是否正確顯示待確認

## Common Pitfalls

- **不要建立 postcss.config.cjs 或 tailwind.config.cjs**：Tailwind v4 用 `@tailwindcss/vite` plugin，不需要這些檔案，有的話會造成 build 失敗
- **Git branch 不一致**：本地是 `master`，GitHub 是 `main`，push 時要用 `git push origin master:main`
- **修改行程只改 data.js**：不要動 App.jsx，避免破壞登入、記帳等功能
- **data.js 裡的 icon 必須是 lucide-react 的元件名稱**（如 `Plane`, `Bed`, `Utensils`），不能用字串
