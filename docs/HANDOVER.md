# Project Handover: Borisao Wiki (Antigravity Migration)

This document provides a comprehensive overview of the current status, standards, and recent changes for the **BorisaoBlois Wiki** project as of the migration to `antigravity-cli`.

## 1. Project Overview
- **Objective:** Official Wiki and Landing Page for the narrative universes of BorisaoBlois.
- **Atmosphere:** "Abyssal Submarine" / "Liquid Glass". Deep blue depths, refractive glass interfaces, bioluminescent orange accents.
- **Tech Stack:** 
  - Next.js 16 (App Router) + React 19.
  - Tailwind CSS v4 (with `@import 'tailwindcss'`).
  - Prisma v7 + PostgreSQL.
  - Auth.js v5 (NextAuth).
  - MDX (next-mdx-remote-client/rsc).

## 2. Current Status (Handover Points)

### ✅ Recent Visual Overhaul
- **MDX Headers:** `h2` and `h3` redesigned with "Premium Abyssal" styling. `h2` uses a 10px primary border and gradient background. `h3` features a status-indicator dot. Both use `clear-both` to prevent float overlaps.
- **WikiQuote:** Simplified aesthetic with a 3px left vertical line and compact Lucide icons.
- **WikiImage "Nuclear Fix":** Resolved a persistent gap issue. The component now uses `not-prose` to avoid global style interference and forces edge-to-edge alignment using `!important` flags (e.g., `!top-0 !inset-0`).
- **Interactive Effects:** The `BubbleTrail` (crystal-style bubbles on click) is fully restored and active in the Wiki layout.

### 📂 Asset Organization
- **Refactor Completed:** Every file and folder in `public/assets/` and root `assets/` has been renamed to remove spaces (replaced with `_`).
- **Structure:** Assets are organized by lore entity:
  - `/The_Bloop`, `/El_Gran_Maja`, `/Phillip_Forte`, `/Naves`, `/Fotos_Campo`, etc.
- **References:** All MDX files and components have been updated to reflect these new paths.

## 3. Design Standards (The "Abyssal" Law)

### Color Palette (Abyssal Submarine Celestito)
- **Primary:** `#FF7300` (Orange - Deep Sea Flare).
- **Background:** `#00122E` (Deep Cyan-Blue).
- **Gradients:** `#00203F` (Mid) to `#00162D` (Dark) with `#0064A0` (Bright Cyan) caustics.
- **Text/UI:** White/70% (Refractive Glass White).

### Liquid Glass Principles (Apple HIG 2025)
- **Backdrop Blur:** 40px - 50px for deep lensing.
- **Saturate:** 180% - 200% to keep background colors vivid under the glass.
- **Borders:** Refractive/chromatic aberration style (using pseudo-elements or specific gradients).
- **Typography:** Bold, left-aligned, high contrast (`font-black` for headers).

## 4. Discovered Facts & Constants
- **WikiHeaders:** MUST use `clear-both`.
- **Images:** MUST fill their containers edge-to-edge (no internal padding/gaps).
- **Global `img`:** In `MdxRenderer.tsx`, the global `img` override has been cleaned of background colors to avoid "ghost gaps".
- **Interactive:** `BubbleTrail` must be present in the root layout or specific feature layouts to maintain the "Submarine" feel.

## 5. Pending / Future Roadmap
- **Fase 5 Development:** The Dashboard/Control Center inspired by iPadOS.
- **Advanced Lensing:** Implementing more dynamic refracion effects using `plus-lighter` blend modes as per the Advanced HIG docs.
- **MDX Expansion:** Continuing the migration of remaining lore documents to the new MDX standard.

## 6. Critical Instructions for the New Agent
1. **Always use `context7`:** Consult official docs for Next.js 16 and Prisma v7 before making architectural changes.
2. **Protect the Aesthetic:** Any new component must adhere to the `glass-liquid` utility and the Abyssal color palette.
3. **No Spaces in Paths:** Maintain the underscores-only naming convention for all physical assets.
4. **Validation:** Always run `npm run build` after changes to ensure MDX parsing and TypeScript types remain intact.

---
*Signed: Gemini CLI (Handover to Antigravity)*
