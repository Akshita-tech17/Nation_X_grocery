# NationX Grocery 🛒

> **Integrated Indian Grocery Commerce Platform**  
> Unifying Retail Express Delivery, Wholesale / BulkBuy (B2B), and Hyperlocal Kirana Storefronts in a modern, spacious, and decluttered web application.

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.18-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-orange)](https://oxc.rs/)

---

## 🌟 Overview

**NationX Grocery** is designed to bridge the gap between neighborhood kirana stores, regional agricultural mandi traders, and everyday Indian consumers. It replaces crowded, noisy e-commerce interfaces with a clean, minimal, warm-stone aesthetic accented by deep forest green.

The platform provides two seamlessly connected experiences with shared reactive state:
1. **Customer Experience**: Hyperlocal grocery shopping, store comparison, 3 distinct B2B procurement paths, and real-time delivery tracking.
2. **Merchant Experience**: Complete merchant portal for order fulfillment, inventory toggles, wholesale slab configuration, and mandi RFQ quotations.

---

## 📱 Core Screens & Architecture

### 🛍️ Customer Experience (6 Main Screens)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| **1** | **Home & Browse** | `/` & `/browse` | Spacious hero, circular category rail, curated pantry essentials, search suggestions, and verified local storefronts. |
| **2** | **Product Details** | `/product/:id` | High-resolution commodity photography, Hindi localized subtitles, origin tracing, nutritional breakdown, and pack unit quantity steppers. |
| **3** | **Store Comparison** | `/compare` | Side-by-side matrix comparing local kiranas, APMC mandi hubs, and organic depots on delivery time, distance, ratings, and credit facilities. |
| **4** | **Cart & Checkout** | Sliding Drawer & Modal | Multi-item basket with wholesale tier discount breakdown. 3-step checkout with address selection, delivery slot preferences, and simulated UPI/COD payment. |
| **5** | **BulkBuy (B2B)** | `/wholesale` | Dedicated procurement portal with **3 pathways**: <br>• **Path A**: Direct Bulk Ordering (Volume tier calculator with automated slab discounts)<br>• **Path B**: Merchant Quotation Requests (RFQ builder for caterers & restaurants)<br>• **Path C**: Assisted Purchase-List Entry (WhatsApp list parser, SKU matrix, CSV upload) |
| **6** | **Order Tracking** | `/orders` | Visual fulfillment timeline (`Placed` ➔ `Confirmed` ➔ `Packing` ➔ `Out for Delivery` ➔ `Delivered`), rider details, delivery OTP, and live simulation controls. |

---

### 🏪 Merchant Experience (5 Main Screens)

Accessible under the `/merchant` portal with quick tab navigation:

| # | Screen | Tab / Subview | Features |
|---|--------|---------------|----------|
| **1** | **Merchant Dashboard** | `Dashboard` | Real-time gross sales, active orders queue, low-stock alerts, store open/closed toggle, and **"Simulate Incoming Order"** button. |
| **2** | **Product Management** | `Products` | Catalog table with search and category filters. Modal form to **Add New Product** (specifications, pack units, selling price, MRP, origin, and image URL) or edit/delete existing items. |
| **3** | **Inventory & Pricing** | `Inventory` | Instant In-Stock / Out-of-Stock toggles, stock quantity steppers with low-stock alerts, inline retail price editor, and **Wholesale Slabs modal** (5+, 15+, 50+ volume break-points). |
| **4** | **Order Management** | `Orders` | Live fulfillment pipeline with status filter pills (`Incoming`, `Packing`, `On Route`, `Delivered`). Action buttons to accept orders, start packing, handover to rider, and mark delivered. |
| **5** | **BulkBuy Quotations** | `Quotations` | Dedicated mandi RFQ inbox for incoming commercial orders. View requested lots, target prices, and submit binding quotations with custom mandi notes. |

---

## 🎨 Design System & UI/UX Principles

- **Color Palette**:
  - **Backgrounds**: Warm off-white / light stone (`#fdfbf7`, `bg-stone-50/60`).
  - **Primary Brand**: Deep Forest Green (`#0f4c2d`, `bg-forest-900`) and fresh Emerald accents (`#15803d`, `text-emerald-700`).
  - **Text & Hierarchy**: Slate stone neutrals (`text-stone-900`, `text-stone-600`) for high readability and contrast.
- **Decluttering**:
  - Max **1 subtle tag** per product card (e.g. *Organic*, *GI Tagged*, *Bestseller*).
  - Clean tactile steppers and buttons rather than noisy card badges.
  - Eliminated stacked duplicate headers; replaced with a single streamlined header bar.
- **Verified Photography**: Realistic, authentic photography for every grocery commodity (Basmati rice sacks, Sharbati whole wheat atta, Gir cow bilona ghee, unpolished pulses, spices).

---

## 📁 Project Structure

```
NationXgrocery/
├── src/
│   ├── assets/                 # Brand assets & logos
│   ├── components/
│   │   ├── common/             # Reusable UI primitives (Badge, Button, Modal, DemoBanner)
│   │   ├── layout/             # Header, Footer, CartDrawer, LocationModal
│   │   ├── retail/             # ProductCard, CategoryRail, CheckoutModal, QuickViewModal
│   │   ├── storefronts/        # MerchantCard
│   │   ├── merchant/           # MetricsBar, ProductManagementTable, InventoryTable, OrderPipeline, BulkBuyQuotationsTable
│   │   └── wholesale/          # BulkTierCalculator (Path A), MerchantQuotationSection (Path B), AssistedPurchaseListSection (Path C)
│   ├── context/
│   │   ├── CartContext.tsx     # Cart items, subtotal, savings, toast notifications
│   │   ├── StoreContext.tsx    # Delivery location, active mode, wishlist, selected store
│   │   └── MerchantContext.tsx # Live products, orders, merchants, and quotation RFQs
│   ├── data/
│   │   ├── categories.ts       # Grocery taxonomy & verified images
│   │   ├── merchants.ts        # Kirana stores & wholesale hub profiles
│   │   ├── mockOrders.ts       # Seed orders for live pipeline
│   │   └── products.ts         # Authentic grocery SKUs with wholesale tier slabs
│   ├── pages/
│   │   ├── HomePage.tsx               # Customer Screen 1: Home
│   │   ├── RetailBrowsePage.tsx       # Customer Screen 1: Browse
│   │   ├── ProductDetailPage.tsx      # Customer Screen 2: Product Details
│   │   ├── StoreComparisonPage.tsx    # Customer Screen 3: Store Comparison
│   │   ├── WholesalePage.tsx          # Customer Screen 5: BulkBuy Hub
│   │   ├── OrderTrackingPage.tsx      # Customer Screen 6: Live Order Tracking
│   │   ├── MerchantStoresPage.tsx     # Storefronts Directory
│   │   └── MerchantDashboardPage.tsx  # Merchant Screens 1-5 Hub
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces (Product, Order, Store, QuotationRequest, etc.)
│   ├── App.tsx                 # Main routes and modal providers
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind CSS theme setup
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- [pnpm](https://pnpm.io/) (or `npm`)

### 1. Installation

```bash
git clone https://github.com/Akshita-tech17/Nation_X_grocery.git
cd Nation_X_grocery
pnpm install
```

### 2. Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 3. Build for Production

```bash
pnpm run build
```

Runs TypeScript validation (`tsc -b`) and generates production-ready minified bundles in `dist/`.

### 4. Code Linting

```bash
pnpm run lint
```

Runs Oxlint for high-speed, zero-error linting across all components and pages.

---

## 🔄 End-to-End Interactive Simulation Guide

Follow this quick walkthrough to test the connected reactive workflows:

1. **Place a Retail Order**:
   - Navigate to **Shop Groceries** (`/browse`) or click any item to see **Product Details** (`/product/:id`).
   - Add items to your basket and click **Checkout** in the Cart drawer.
   - Complete the 3-step checkout and click **"Track Order Live"**.
2. **Track the Order in Real-Time**:
   - On the **Order Tracking** page (`/orders`), view the timeline and click **"Simulate Next Stage"** to advance the order from `Placed` ➔ `Confirmed` ➔ `Packing` ➔ `Out for Delivery` ➔ `Delivered`.
3. **Fulfill Orders as a Merchant**:
   - Open **Merchant Hub** (`/merchant`) from the top navigation.
   - Under the **Order Management** tab, see incoming orders and advance fulfillment stages.
   - Under **Product Management**, add a new grocery SKU or update prices in **Inventory & Pricing**.
4. **B2B BulkBuy & Mandi RFQ Flow**:
   - Visit **BulkBuy (B2B)** (`/wholesale`) and go to **Path B (Merchant Quotation Requests)**.
   - Submit an RFQ for catering sacks or commercial spices.
   - Switch to **Merchant Hub** ➔ **BulkBuy Quotations** tab to inspect the RFQ, enter an all-inclusive mandi price, and send a quotation back.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
