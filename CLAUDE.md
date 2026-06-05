```
{
  "name": "app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "catalog:",
    "@radix-ui/react-alert-dialog": "catalog:",
    "@radix-ui/react-checkbox": "catalog:",
    "@radix-ui/react-dialog": "catalog:",
    "@radix-ui/react-dropdown-menu": "catalog:",
    "@radix-ui/react-label": "catalog:",
    "@radix-ui/react-popover": "catalog:",
    "@radix-ui/react-progress": "catalog:",
    "@radix-ui/react-radio-group": "catalog:",
    "@radix-ui/react-select": "catalog:",
    "@radix-ui/react-separator": "catalog:",
    "@radix-ui/react-slot": "catalog:",
    "@radix-ui/react-switch": "catalog:",
    "@radix-ui/react-tabs": "catalog:",
    "@radix-ui/react-tooltip": "catalog:",
    "@radix-ui/react-visually-hidden": "catalog:",
    "@svgr/plugin-svgo": "^8.1.0",
    "@tailwindcss/vite": "catalog:",
    "@tanstack/react-query": "catalog:",
    "@tanstack/react-router": "catalog:",
    "@types/dompurify": "^3.2.0",
    "axios": "catalog:",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "cmdk": "catalog:",
    "date-fns": "^4.4.0",
    "dompurify": "^3.4.8",
    "lucide-react": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:",
    "react-mobile-picker": "^1.2.0",
    "sonner": "catalog:",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "catalog:",
    "zod": "catalog:",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@tanstack/react-router-devtools": "catalog:",
    "@tanstack/router-plugin": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "sass-embedded": "^1.100.0",
    "typescript": "catalog:",
    "vite": "catalog:",
    "vite-plugin-svgr": "catalog:"
  },
  "packageManager": "pnpm@10.28.0"
}
```



---pnpm-workspace.yaml---
```
packages:
  - "."

catalog:
  react: ^19.2.0
  react-dom: ^19.2.0
  "@types/react": ^19.0.0
  "@types/react-dom": ^19.0.0

  vite: ^6.0.0
  "@vitejs/plugin-react": ^5.0.0
  "vite-plugin-svgr": ^4.3.0

  "@tanstack/react-router": ^1.170.0
  "@tanstack/router-plugin": ^1.131.0
  "@tanstack/react-router-devtools": ^1.167.0
  "@tanstack/react-query": ^5.62.0

  zod: ^3.24.1
  axios: ^1.7.9

  tailwindcss: ^4.0.0
  "@tailwindcss/vite": ^4.0.0
  "tw-animate-css": ^1.2.0

  "class-variance-authority": ^0.7.1
  clsx: ^2.1.1
  "tailwind-merge": ^3.6.0
  "lucide-react": ^0.511.0
  "@radix-ui/react-slot": ^1.2.3
  "@radix-ui/react-dialog": ^1.1.14
  "@radix-ui/react-alert-dialog": ^1.1.14
  "@radix-ui/react-tabs": ^1.1.12
  "@radix-ui/react-accordion": ^1.2.11
  "@radix-ui/react-checkbox": ^1.3.2
  "@radix-ui/react-switch": ^1.2.5
  "@radix-ui/react-select": ^2.2.5
  "@radix-ui/react-label": ^2.1.7
  "@radix-ui/react-separator": ^1.1.7
  "@radix-ui/react-tooltip": ^1.2.7
  "@radix-ui/react-popover": ^1.1.14
  "@radix-ui/react-dropdown-menu": ^2.1.15
  "@radix-ui/react-radio-group": ^1.3.7
  "@radix-ui/react-progress": ^1.1.7
  "@radix-ui/react-visually-hidden": ^1.2.3
  "sonner": ^2.0.3
  "cmdk": ^1.1.1

  typescript: ^5.7.2
  "@types/node": ^22.10.0

```

--vite.config.ts
```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

/**
 * pine-app Vite 6 config
 *  - WebView에서 동작하는 SPA (CSR) — 하이브리드 앱
 *  - Tailwind v4: @tailwindcss/vite 플러그인
 *  - shadcn/ui (Radix UI 기반) 컴포넌트 시스템
 *  - SVGR: SVG → React 컴포넌트 자동 변환
 *  - FSD 계층 alias
 */
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      quoteStyle: "double",
    }),
    react(),
    tailwindcss(),
    // SVG를 React 컴포넌트로 import 가능하게 (기존 코드 호환)     
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          plugins: [
            { name: "preset-default", params: { overrides: { removeViewBox: false } } },
          ],
        },
      },
    }),
  ],

  resolve: {
    alias: {
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/feature": path.resolve(__dirname, "./src/feature"),
      "@/domain": path.resolve(__dirname, "./src/domain"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/routes": path.resolve(__dirname, "./src/routes"),
      "@/": path.resolve(__dirname, "./src/"),
    },
  },

  server: {
    port: 3001,
    host: true,
    // WebView에서 로컬 개발 서버 접근 허용
    cors: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    // 하이브리드 앱: WebView는 대부분 최신 엔진 — ES2020 안전
    target: "es2020",
    // 에셋 인라인 임계값 높임: WebView에서 추가 요청 최소화
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-accordion",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-switch",
            "@radix-ui/react-select",
            "@radix-ui/react-dropdown-menu",
          ],
        },
      },
    },
  },

  // Vite 환경변수 prefix — VITE_로 통일
  envPrefix: "VITE_",
});

```

---file---
```

```
pine-app
├─ .env.dev
├─ .tanstack
│  └─ tmp
├─ eslint.config.js
├─ index.html
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ prettier.config.mjs
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ App.tsx
│  │  ├─ providers
│  │  │  ├─ BridgeProvider.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ QueryProvider.tsx
│  │  │  └─ RouterProvider.tsx
│  │  └─ router
│  │     ├─ index.ts
│  │     └─ router.ts
│  ├─ app.css
│  ├─ domain
│  │  ├─ contents
│  │  │  └─ model.ts
│  │  ├─ event
│  │  │  ├─ api.ts
│  │  │  ├─ index.ts
│  │  │  ├─ model.ts
│  │  │  └─ query.ts
│  │  └─ trade
│  │     └─ model.ts
│  ├─ feature
│  │  ├─ event
│  │  │  ├─ hooks
│  │  │  └─ ui
│  │  │     └─ EventListPage.tsx
│  │  └─ publish
│  │     └─ ui
│  │        ├─ ComponentPreview.module.scss
│  │        ├─ ComponentPreview.tsx
│  │        ├─ GuideLayout.module.scss
│  │        ├─ GuideLayout.tsx
│  │        ├─ index.ts
│  │        └─ sections
│  │           ├─ AccordionGuide.tsx
│  │           ├─ AlertGuide.tsx
│  │           ├─ ButtonGuide.tsx
│  │           ├─ CardFormGuide.tsx
│  │           ├─ CheckRadioGuide.tsx
│  │           ├─ FeedbackGuide.tsx
│  │           ├─ index.ts
│  │           ├─ InputGuide.tsx
│  │           ├─ ProgressGuide.tsx
│  │           ├─ SwitchGuide.tsx
│  │           └─ TabsGuide.tsx
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ biz
│  │  │  ├─ index.ts
│  │  │  └─ page.tsx
│  │  ├─ home
│  │  │  ├─ index.ts
│  │  │  └─ page.tsx
│  │  ├─ mkt-events
│  │  │  ├─ index.ts
│  │  │  └─ MktEventsPage.tsx
│  │  └─ publish
│  │     ├─ components
│  │     │  └─ page.tsx
│  │     ├─ index.ts
│  │     ├─ page.module.scss
│  │     └─ page.tsx
│  ├─ routes
│  │  ├─ biz
│  │  │  └─ route.tsx
│  │  ├─ index.tsx
│  │  ├─ mkt
│  │  │  ├─ events.tsx
│  │  │  └─ route.tsx
│  │  ├─ publish
│  │  │  ├─ components
│  │  │  │  └─ route.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ route.tsx
│  │  └─ __root.tsx
│  ├─ routeTree.gen.ts
│  ├─ shared
│  │  ├─ api
│  │  │  ├─ auth-events.ts
│  │  │  ├─ client.ts
│  │  │  ├─ error.ts
│  │  │  ├─ query.d.ts
│  │  │  ├─ types.ts
│  │  │  └─ _helpers.ts
│  │  ├─ assets
│  │  │  ├─ fonts
│  │  │  │  ├─ fonts.ts
│  │  │  │  ├─ PretendardVariable.woff2
│  │  │  │  └─ SUITE-Variable.woff2
│  │  │  └─ styles
│  │  │     ├─ abstracts
│  │  │     │  ├─ variables
│  │  │     │  │  ├─ _color.scss
│  │  │     │  │  ├─ _index.scss
│  │  │     │  │  └─ _layout.scss
│  │  │     │  ├─ _index.scss
│  │  │     │  └─ _mixins.scss
│  │  │     ├─ base
│  │  │     │  ├─ _index.scss
│  │  │     │  ├─ _mobile.scss
│  │  │     │  ├─ _normalize.scss
│  │  │     │  └─ _preflight.scss
│  │  │     ├─ globals.css
│  │  │     ├─ index.scss
│  │  │     └─ utilities
│  │  │        ├─ _index.scss
│  │  │        └─ _utilities.scss
│  │  ├─ config
│  │  │  ├─ constants.ts
│  │  │  └─ env.ts
│  │  ├─ hooks
│  │  │  ├─ index.ts
│  │  │  ├─ useAlert.ts
│  │  │  ├─ useBottomSheet.ts
│  │  │  ├─ useHistory.ts
│  │  │  ├─ useIntersectionObserver.ts
│  │  │  ├─ useNativeMessage.ts
│  │  │  ├─ useNavigateBack.ts
│  │  │  ├─ usePicker.tsx
│  │  │  ├─ usePopup.ts
│  │  │  ├─ useSafeArea.ts
│  │  │  └─ useScrollRestore.ts
│  │  ├─ providers
│  │  │  ├─ AlertProvider.tsx
│  │  │  ├─ BottomSheetProvider.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ PopupProvider.tsx
│  │  │  ├─ RootFontSyncProvider.tsx
│  │  │  └─ ToastProvider.tsx
│  │  ├─ stores
│  │  │  ├─ alert.store.ts
│  │  │  ├─ bottom-sheet.store.ts
│  │  │  ├─ device.store.ts
│  │  │  ├─ go-back.store.ts
│  │  │  ├─ index.ts
│  │  │  ├─ popup.store.ts
│  │  │  └─ qr-popup.store.ts
│  │  ├─ types
│  │  │  ├─ bridge.types.ts
│  │  │  └─ index.ts
│  │  ├─ ui
│  │  │  ├─ accordion
│  │  │  │  ├─ Accordion.module.scss
│  │  │  │  ├─ Accordion.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ alert
│  │  │  │  ├─ Alert.module.scss
│  │  │  │  ├─ Alert.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ bottom-sheet
│  │  │  │  ├─ BottomSheet.module.scss
│  │  │  │  ├─ BottomSheet.tsx
│  │  │  │  ├─ BottomSheet.types.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ TooltipBottomSheet.module.scss
│  │  │  │  ├─ TooltipBottomSheet.tsx
│  │  │  │  └─ useDragToClose.ts
│  │  │  ├─ button
│  │  │  │  ├─ Button.module.scss
│  │  │  │  ├─ Button.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ chip
│  │  │  │  ├─ Chip.module.scss
│  │  │  │  ├─ Chip.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ dialog
│  │  │  │  ├─ Dialog.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ empty
│  │  │  │  ├─ Empty.module.scss
│  │  │  │  ├─ Empty.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ form
│  │  │  │  ├─ Check.module.scss
│  │  │  │  ├─ Check.tsx
│  │  │  │  ├─ CheckCard.module.scss
│  │  │  │  ├─ CheckCard.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Input.module.scss
│  │  │  │  ├─ Input.tsx
│  │  │  │  ├─ Radio.module.scss
│  │  │  │  ├─ Radio.tsx
│  │  │  │  ├─ RadioCard.module.scss
│  │  │  │  ├─ RadioCard.tsx
│  │  │  │  ├─ Select.module.scss
│  │  │  │  ├─ Select.tsx
│  │  │  │  ├─ Switch.module.scss
│  │  │  │  └─ Switch.tsx
│  │  │  ├─ header
│  │  │  │  ├─ Header.module.scss
│  │  │  │  ├─ Header.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ layout
│  │  │  │  ├─ HeadingLayout.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Layout.module.scss
│  │  │  │  ├─ Layout.tsx
│  │  │  │  ├─ TabBar.module.scss
│  │  │  │  └─ TabBar.tsx
│  │  │  ├─ loading
│  │  │  │  ├─ Global.module.scss
│  │  │  │  ├─ Global.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Loading.module.scss
│  │  │  │  ├─ Loading.tsx
│  │  │  │  ├─ Spinner.module.scss
│  │  │  │  └─ Spinner.tsx
│  │  │  ├─ picker
│  │  │  │  ├─ DatePicker.module.scss
│  │  │  │  ├─ DatePicker.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Picker.module.scss
│  │  │  │  ├─ WeightPicker.module.scss
│  │  │  │  └─ WeightPicker.tsx
│  │  │  ├─ popup
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Popup.module.scss
│  │  │  │  └─ Popup.tsx
│  │  │  ├─ progress
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ ProgressBar.module.scss
│  │  │  │  ├─ ProgressBar.stories.tsx
│  │  │  │  └─ ProgressBar.tsx
│  │  │  ├─ skeleton
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Skeleton.module.scss
│  │  │  │  ├─ Skeleton.stories.tsx
│  │  │  │  └─ Skeleton.tsx
│  │  │  ├─ tabs
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Tabs.module.scss
│  │  │  │  ├─ Tabs.stories.tsx
│  │  │  │  └─ Tabs.tsx
│  │  │  └─ toast
│  │  │     ├─ index.ts
│  │  │     ├─ Toast.module.scss
│  │  │     ├─ Toast.stories.tsx
│  │  │     └─ Toast.tsx
│  │  └─ utils
│  │     ├─ api-code.ts
│  │     ├─ cn.ts
│  │     ├─ date.ts
│  │     ├─ dom.ts
│  │     ├─ fn.ts
│  │     ├─ history-marker.ts
│  │     ├─ index.ts
│  │     ├─ judge-code.ts
│  │     ├─ logger.ts
│  │     ├─ native-bridge.ts
│  │     ├─ overlayStack.ts
│  │     ├─ platform.ts
│  │     ├─ query-client.ts
│  │     ├─ sanitize.ts
│  │     ├─ server-query.ts
│  │     └─ toast.ts
│  └─ vite-env.d.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```






