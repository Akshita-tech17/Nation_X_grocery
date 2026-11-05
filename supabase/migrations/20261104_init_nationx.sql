-- ============================================================================
-- NationX Grocery (Project 02) — Comprehensive Relational Database Schema
-- Migration File: 20261104_init_nationx.sql
-- Conforming to Project 02 Specification (project_2.pdf)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Universal Product Catalog (Master Product Identity - Spec §3.1)
CREATE TABLE IF NOT EXISTS public.catalog_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_te TEXT, -- Telugu localization support (Spec §12)
    hindi_name TEXT,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    variant TEXT,
    pack_size TEXT NOT NULL,
    unit TEXT NOT NULL,
    image_url TEXT NOT NULL,
    barcode TEXT UNIQUE,
    description TEXT,
    nutrition JSONB,
    origin TEXT NOT NULL,
    is_organic BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_local_farm BOOLEAN DEFAULT FALSE,
    is_gi_tagged BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Merchants & Local Kirana Storefronts (Spec §2, §3.2)
CREATE TABLE IF NOT EXISTS public.merchants (
    id TEXT PRIMARY KEY,
    user_id UUID,
    name TEXT NOT NULL,
    tagline TEXT,
    owner_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('kirana', 'supermarket', 'organic_depot', 'wholesale_hub')),
    rating NUMERIC(3, 2) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    distance TEXT,
    delivery_time TEXT DEFAULT '20 mins',
    min_order NUMERIC(10, 2) DEFAULT 0.0,
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT NOT NULL,
    image TEXT NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT TRUE,
    features TEXT[] DEFAULT '{}',
    categories_offered TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shop-Specific Product Offerings (Spec §3.2, §4)
CREATE TABLE IF NOT EXISTS public.shop_offerings (
    id TEXT PRIMARY KEY,
    master_product_id TEXT NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
    merchant_id TEXT NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
    mrp NUMERIC(10, 2) NOT NULL CHECK (mrp >= selling_price),
    purchase_cost NUMERIC(10, 2) NOT NULL CHECK (purchase_cost >= 0), -- Confidential to merchant admin
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    stock_updated_at TIMESTAMPTZ DEFAULT NOW(),
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'low_stock', 'unavailable', 'unconfirmed')),
    freshness_hours_threshold INTEGER DEFAULT 72,
    wholesale_tiers JSONB DEFAULT '[]'::jsonb,
    min_wholesale_qty INTEGER DEFAULT 5,
    visibility_status TEXT NOT NULL DEFAULT 'active' CHECK (visibility_status IN ('active', 'hidden')),
    fulfilment_options TEXT[] DEFAULT ARRAY['express', 'standard'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_shop_offering UNIQUE (master_product_id, merchant_id)
);

-- 4. Draft Products & Receipt OCR Review Queue (Spec §3.3)
CREATE TABLE IF NOT EXISTS public.draft_products (
    id TEXT PRIMARY KEY DEFAULT ('DRAFT-' || gen_random_uuid()),
    merchant_id TEXT NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    scanned_raw_text TEXT,
    matched_master_product_id TEXT REFERENCES public.catalog_products(id),
    suggested_selling_price NUMERIC(10, 2),
    suggested_stock INTEGER,
    status TEXT NOT NULL DEFAULT 'DRAFT_PENDING_CONFIRMATION' CHECK (status IN ('DRAFT_PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED')),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Parent Orders (Spec §5.2)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    original_amount NUMERIC(10, 2) NOT NULL,
    savings NUMERIC(10, 2) DEFAULT 0.0,
    order_type TEXT NOT NULL CHECK (order_type IN ('retail', 'wholesale')),
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    estimated_delivery TEXT,
    delivery_otp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Merchant Suborders (Independent Store Dispatch - Spec §5.2, §5.6)
CREATE TABLE IF NOT EXISTS public.sub_orders (
    id TEXT PRIMARY KEY,
    parent_order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    merchant_id TEXT NOT NULL REFERENCES public.merchants(id) ON DELETE RESTRICT,
    store_name TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'awaiting_substitution_approval')),
    estimated_delivery TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Items with Immutable Price Snapshot (Spec §4.2, §5.6)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id TEXT NOT NULL REFERENCES public.sub_orders(id) ON DELETE CASCADE,
    master_product_id TEXT NOT NULL REFERENCES public.catalog_products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    mode TEXT NOT NULL CHECK (mode IN ('retail', 'wholesale')),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    price_snapshot JSONB NOT NULL, -- Preserves price, tier, and discount at moment of checkout
    is_unavailable BOOLEAN DEFAULT FALSE,
    substitution_item JSONB, -- Customer-confirmed replacement item
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Stock Reservations (5-Minute TTL, Zero Overselling - Spec §5.4)
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id TEXT PRIMARY KEY DEFAULT ('RES-' || gen_random_uuid()),
    offering_id TEXT NOT NULL REFERENCES public.shop_offerings(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMMITTED', 'RELEASED')),
    expires_at TIMESTAMPTZ NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BulkBuy Path B: Commercial RFQs & Merchant Quotations (Spec §7.2)
CREATE TABLE IF NOT EXISTS public.bulk_rfqs (
    id TEXT PRIMARY KEY,
    customer_id UUID,
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    gst_number TEXT,
    delivery_city TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'weekly', 'bi-weekly', 'monthly')),
    items JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'quoted', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bulk_quotations (
    id TEXT PRIMARY KEY,
    rfq_id TEXT NOT NULL REFERENCES public.bulk_rfqs(id) ON DELETE CASCADE,
    merchant_id TEXT NOT NULL REFERENCES public.merchants(id) ON DELETE RESTRICT,
    quoted_price NUMERIC(10, 2) NOT NULL,
    mandi_notes TEXT,
    valid_until TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'expired')),
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Digital Khata Credit Ledger (Spec §10)
CREATE TABLE IF NOT EXISTS public.khata_ledger (
    id TEXT PRIMARY KEY DEFAULT ('TX-KHATA-' || gen_random_uuid()),
    idempotency_key TEXT UNIQUE NOT NULL,
    merchant_id TEXT NOT NULL REFERENCES public.merchants(id),
    customer_id TEXT NOT NULL,
    parent_order_id TEXT REFERENCES public.orders(id),
    sub_order_id TEXT REFERENCES public.sub_orders(id),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT_PURCHASE', 'CREDIT_REPAYMENT', 'REFUND_CREDIT')),
    amount NUMERIC(10, 2) NOT NULL,
    running_balance NUMERIC(10, 2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'POSTED' CHECK (status IN ('POSTED', 'DISPUTED', 'CLEARED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row-Level Security (RLS) Policies (Spec §12)
-- ============================================================================

ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khata_ledger ENABLE ROW LEVEL SECURITY;

-- Catalog Products: Public read for customers and merchants
CREATE POLICY "catalog_products_public_read" ON public.catalog_products
    FOR SELECT USING (true);

-- Merchants: Public read
CREATE POLICY "merchants_public_read" ON public.merchants
    FOR SELECT USING (true);

-- Shop Offerings: Public read except purchase_cost is column-masked by view or app role
CREATE POLICY "shop_offerings_public_read" ON public.shop_offerings
    FOR SELECT USING (visibility_status = 'active');

CREATE POLICY "shop_offerings_merchant_all" ON public.shop_offerings
    FOR ALL USING (merchant_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Draft Products: Confined strictly to creating merchant
CREATE POLICY "draft_products_merchant_isolation" ON public.draft_products
    FOR ALL USING (merchant_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Suborders: Only assigned merchant can see and advance their suborders
CREATE POLICY "sub_orders_merchant_isolation" ON public.sub_orders
    FOR ALL USING (merchant_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Khata Ledger: Merchant can only access their ledger records
CREATE POLICY "khata_ledger_merchant_isolation" ON public.khata_ledger
    FOR ALL USING (merchant_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================================================
-- Atomic Functions: Stock Reservation with 5-Minute Expiry (Spec §5.4)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reserve_stock(
    p_offering_id TEXT,
    p_quantity INTEGER,
    p_idempotency_key TEXT,
    p_ttl_seconds INTEGER DEFAULT 300 -- 5 minutes
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_available INTEGER;
    v_reservation_id TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Idempotency check: return existing reservation if key matched
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, expires_at INTO v_reservation_id, v_expires_at
        FROM public.stock_reservations
        WHERE idempotency_key = p_idempotency_key AND status = 'PENDING';

        IF FOUND THEN
            RETURN jsonb_build_object('success', true, 'reservation_id', v_reservation_id, 'expires_at', v_expires_at, 'is_duplicate', true);
        END IF;
    END IF;

    -- Row-level locking to prevent concurrency race conditions
    SELECT stock_quantity INTO v_available
    FROM public.shop_offerings
    WHERE id = p_offering_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'OFFERING_NOT_FOUND');
    END IF;

    IF v_available < p_quantity THEN
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_STOCK', 'available', v_available);
    END IF;

    -- Decrement available stock atomically
    UPDATE public.shop_offerings
    SET stock_quantity = stock_quantity - p_quantity,
        stock_updated_at = NOW()
    WHERE id = p_offering_id;

    v_expires_at := NOW() + (p_ttl_seconds || ' seconds')::interval;
    v_reservation_id := 'RES-' || gen_random_uuid();

    INSERT INTO public.stock_reservations (id, offering_id, quantity, expires_at, status, idempotency_key)
    VALUES (v_reservation_id, p_offering_id, p_quantity, v_expires_at, 'PENDING', p_idempotency_key);

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id,
        'expires_at', v_expires_at,
        'remaining_stock', v_available - p_quantity
    );
END;
$$;

-- Release Expired Reservations
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR r IN
        SELECT id, offering_id, quantity
        FROM public.stock_reservations
        WHERE status = 'PENDING' AND expires_at < NOW()
        FOR UPDATE
    LOOP
        -- Return stock to shop offering
        UPDATE public.shop_offerings
        SET stock_quantity = stock_quantity + r.quantity,
            stock_updated_at = NOW()
        WHERE id = r.offering_id;

        UPDATE public.stock_reservations
        SET status = 'RELEASED'
        WHERE id = r.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;
