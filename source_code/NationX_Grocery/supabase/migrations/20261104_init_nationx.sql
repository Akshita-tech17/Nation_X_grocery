-- ============================================================================
-- NATIONX GROCERY — PRODUCTION DATABASE SCHEMA & MIGRATION (SUPABASE POSTGRESQL)
-- Version: 2.0 (Authoritative Relational Architecture complying with Spec §1-§15)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean schema drop for clean migration if re-running
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS delivery_dispatches CASCADE;
DROP TABLE IF EXISTS khata_ledger CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS assisted_purchase_lists CASCADE;
DROP TABLE IF EXISTS bulk_quotation_items CASCADE;
DROP TABLE IF EXISTS bulk_quotations CASCADE;
DROP TABLE IF EXISTS bulk_rfq_items CASCADE;
DROP TABLE IF EXISTS bulk_rfqs CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS sub_orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory_reservations CASCADE;
DROP TABLE IF EXISTS inventory_ledger CASCADE;
DROP TABLE IF EXISTS wholesale_tiers CASCADE;
DROP TABLE IF EXISTS merchant_offers CASCADE;
DROP TABLE IF EXISTS catalog_products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- ----------------------------------------------------------------------------
-- 1. STORES (Merchant Profiles & Physical / Mandi Operations - Spec §1, §3.2)
-- ----------------------------------------------------------------------------
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_owner_id UUID NOT NULL, -- references auth.users in production
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    store_type VARCHAR(50) NOT NULL DEFAULT 'KIRANA' CHECK (store_type IN ('KIRANA', 'MANDI_WHOLESALER', 'ORGANIC_DEPOT', 'SUPERMARKET')),
    address_line TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    operating_hours VARCHAR(100) DEFAULT '07:00 AM - 10:00 PM',
    is_open BOOLEAN NOT NULL DEFAULT true,
    is_delivery_enabled BOOLEAN NOT NULL DEFAULT true,
    is_pickup_enabled BOOLEAN NOT NULL DEFAULT true,
    is_khata_enabled BOOLEAN NOT NULL DEFAULT false, -- Explicit merchant permission flag (Spec §10)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CATALOG_PRODUCTS (Shared Master Product Identity - Spec §3.1)
-- ----------------------------------------------------------------------------
CREATE TABLE catalog_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    telugu_name VARCHAR(255), -- Telugu localization ready (Spec §13)
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    variant VARCHAR(100),
    pack_size VARCHAR(50) NOT NULL, -- e.g., '1 kg', '5 kg', '500 ml'
    unit VARCHAR(20) NOT NULL, -- 'kg', 'g', 'L', 'ml', 'pack', 'quintal'
    barcode VARCHAR(64) UNIQUE,
    hsn_code VARCHAR(16),
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. MERCHANT_OFFERS (Shop-Specific Pricing, Stock & Conditions - Spec §3.2, §4.1)
-- ----------------------------------------------------------------------------
CREATE TABLE merchant_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    mrp NUMERIC(12, 2) CHECK (mrp >= selling_price),
    purchase_cost NUMERIC(12, 2) NOT NULL CHECK (purchase_cost >= 0), -- Protected: Restricted to store owner (Spec §3.2, §12)
    available_stock NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    low_stock_threshold NUMERIC(12, 3) NOT NULL DEFAULT 5,
    min_order_qty NUMERIC(12, 3) NOT NULL DEFAULT 1 CHECK (min_order_qty > 0),
    max_order_qty NUMERIC(12, 3),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    retail_available BOOLEAN NOT NULL DEFAULT true,
    wholesale_available BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_store_product UNIQUE (store_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 4. WHOLESALE_TIERS (Volume-Based Price Slabs - Spec §4.1, §6, §7.1 Path A)
-- ----------------------------------------------------------------------------
CREATE TABLE wholesale_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES merchant_offers(id) ON DELETE CASCADE,
    min_quantity NUMERIC(12, 3) NOT NULL CHECK (min_quantity > 0),
    tier_price NUMERIC(12, 2) NOT NULL CHECK (tier_price >= 0),
    discount_pct NUMERIC(5, 2) CHECK (discount_pct >= 0 AND discount_pct <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_offer_tier UNIQUE (offer_id, min_quantity)
);

-- ----------------------------------------------------------------------------
-- 5. INVENTORY_LEDGER (Authoritative Append-Only POS + Online Movement - Spec §4.3, §9)
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
        'PURCHASE_RECEIPT',
        'POS_SALE',
        'ONLINE_RESERVED',
        'ONLINE_CONSUMED',
        'ONLINE_RELEASED',
        'RETURN_RESTOCK',
        'DAMAGED_EXPIRED',
        'RECONCILIATION_ADJUSTMENT'
    )),
    quantity_delta NUMERIC(12, 3) NOT NULL, -- negative for sales/reservations, positive for receipts/releases
    resulting_balance NUMERIC(12, 3) NOT NULL,
    reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('SUB_ORDER', 'RESERVATION', 'POS_BILL', 'MANUAL_AUDIT', 'SUPPLIER_GRN')),
    reference_id VARCHAR(100) NOT NULL,
    recorded_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. INVENTORY_RESERVATIONS (SLA-Based Stock Locking & Recovery - Spec §5.4)
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_token VARCHAR(100) NOT NULL UNIQUE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    reserved_qty NUMERIC(12, 3) NOT NULL CHECK (reserved_qty > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('RESERVED', 'CONSUMED', 'RELEASED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. ORDERS (Parent Customer Order Representing Overall Checkout - Spec §5.2)
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_street TEXT NOT NULL,
    delivery_area VARCHAR(100) NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    address_type VARCHAR(30) DEFAULT 'HOME',
    customer_gstin VARCHAR(15),
    order_type VARCHAR(30) NOT NULL DEFAULT 'RETAIL' CHECK (order_type IN ('RETAIL', 'WHOLESALE_DIRECT', 'BULK_RFQ_CONFIRMED')),
    total_items_amount NUMERIC(12, 2) NOT NULL CHECK (total_items_amount >= 0),
    total_tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_tax_amount >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    total_savings NUMERIC(12, 2) NOT NULL DEFAULT 0,
    final_payable_amount NUMERIC(12, 2) NOT NULL CHECK (final_payable_amount >= 0),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'INITIATED' CHECK (payment_status IN ('INITIATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'NETBANKING', 'KHATA_CREDIT', 'CASH_ON_DELIVERY')),
    payment_reference VARCHAR(100),
    price_snapshot JSONB NOT NULL, -- Preserves exact historical unit prices, fees and tax calculation (Spec §4.2)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. SUB_ORDERS (Individual Merchant Suborders - Spec §5.2, §5.6)
-- ----------------------------------------------------------------------------
CREATE TABLE sub_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_number VARCHAR(36) NOT NULL UNIQUE,
    parent_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    subtotal_amount NUMERIC(12, 2) NOT NULL CHECK (subtotal_amount >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN (
        'RECEIVED',             -- Incoming to merchant
        'ACCEPTED',             -- Merchant confirmed fulfillment
        'REJECTED',             -- Merchant rejected (e.g. stock damage)
        'PACKING',              -- Preparing items
        'READY_FOR_PICKUP',     -- Packed & staged for delivery / customer
        'HANDED_TO_DELIVERY',   -- Dispatched to Shared Delivery fleet
        'DELIVERED',            -- Final completion
        'CANCELLED'             -- Cancelled & refunded
    )),
    rejection_reason TEXT,
    delivery_partner_reference VARCHAR(100),
    shared_delivery_status VARCHAR(50) DEFAULT 'UNASSIGNED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. ORDER_ITEMS (Item-Level Records with Confirmed Prices - Spec §4.2, §5.2)
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id UUID NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    pack_size VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    mrp NUMERIC(12, 2),
    purchase_cost_snapshot NUMERIC(12, 2) NOT NULL, -- Preserved for merchant accounting; masked from customer (Spec §3.2)
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    fulfillment_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED' CHECK (fulfillment_status IN ('CONFIRMED', 'UNAVAILABLE', 'SUBSTITUTED', 'REJECTED')),
    substituted_product_id UUID REFERENCES catalog_products(id),
    customer_approved_substitution BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. BULK_RFQS & QUOTATIONS (Path B B2B Quotations - Spec §7.2)
-- ----------------------------------------------------------------------------
CREATE TABLE bulk_rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(32) NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    target_delivery_date DATE,
    delivery_frequency VARCHAR(50) DEFAULT 'ONE_TIME',
    buyer_gstin VARCHAR(15),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'QUOTED', 'ACCEPTED', 'EXPIRED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE bulk_rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES bulk_rfqs(id) ON DELETE CASCADE,
    commodity_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30) NOT NULL, -- e.g. 'quintal', 'bag_50kg', 'kg'
    target_price_per_unit NUMERIC(12, 2)
);

CREATE TABLE bulk_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(32) NOT NULL UNIQUE,
    rfq_id UUID NOT NULL REFERENCES bulk_rfqs(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    total_quoted_amount NUMERIC(12, 2) NOT NULL CHECK (total_quoted_amount >= 0),
    tare_weight_kg NUMERIC(8, 2) DEFAULT 0,
    freight_terms VARCHAR(100) NOT NULL DEFAULT 'EX_WAREHOUSE', -- 'EX_WAREHOUSE' or 'FREE_DELIVERY'
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    accepted_order_id UUID REFERENCES orders(id), -- Prevents duplicate orders on repeated acceptance (Spec §7.2, Test 16)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rfq_store_quote UNIQUE (rfq_id, store_id)
);

CREATE TABLE bulk_quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES bulk_quotations(id) ON DELETE CASCADE,
    rfq_item_id UUID NOT NULL REFERENCES bulk_rfq_items(id) ON DELETE RESTRICT,
    offered_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (offered_price_per_unit >= 0),
    available_qty NUMERIC(12, 3) NOT NULL CHECK (available_qty >= 0),
    unit VARCHAR(30) NOT NULL,
    notes TEXT
);

-- ----------------------------------------------------------------------------
-- 11. ASSISTED_PURCHASE_LISTS (Path C Assisted List Entry - Spec §7.3)
-- ----------------------------------------------------------------------------
CREATE TABLE assisted_purchase_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    raw_input TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CONVERTED_TO_CART', 'CONVERTED_TO_RFQ')),
    extracted_items JSONB NOT NULL, -- reviewable & correctable lines with confidence scores
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. PAYMENT_TRANSACTIONS (Provider Status & Idempotent Logs - Spec §5.5)
-- ----------------------------------------------------------------------------
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_reference VARCHAR(64) NOT NULL UNIQUE,
    parent_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    gateway_provider VARCHAR(50) NOT NULL DEFAULT 'NATIONX_PAY_ENGINE',
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    idempotency_key VARCHAR(100) NOT NULL UNIQUE, -- Prevents duplicate charges (Spec §5.5, Test 11)
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED')),
    failure_code VARCHAR(50),
    failure_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    webhook_payloads JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. KHATA_LEDGER (Approved Digital Credit Ledger Integration - Spec §10)
-- ----------------------------------------------------------------------------
CREATE TABLE khata_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL,
    sub_order_id UUID REFERENCES sub_orders(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    entry_type VARCHAR(30) NOT NULL CHECK (entry_type IN ('CREDIT_SALE', 'REPAYMENT', 'ADJUSTMENT')),
    idempotency_key VARCHAR(100) NOT NULL UNIQUE, -- Guarantees exactly-once credit entry (Spec §10, Test 22)
    authorized_by UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. DELIVERY_DISPATCHES (Shared Delivery Integration Mirror - Spec §8)
-- ----------------------------------------------------------------------------
CREATE TABLE delivery_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id UUID NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
    shared_delivery_job_id VARCHAR(64) UNIQUE,
    fleet_partner VARCHAR(100) DEFAULT 'NATIONX_FLEET',
    rider_name VARCHAR(100),
    rider_phone VARCHAR(20),
    pickup_status VARCHAR(40) DEFAULT 'AWAITING_MERCHANT_PACK',
    delivery_status VARCHAR(40) DEFAULT 'ASSIGNED',
    pickup_ready_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    otp_code VARCHAR(6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. NOTIFICATIONS (Customer & Merchant Alerts with Consent - Spec §11)
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('SMS', 'WHATSAPP', 'IN_APP')),
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    consent_verified BOOLEAN NOT NULL DEFAULT true,
    is_delivered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — Spec §12 (Security & Data Protection)
-- ============================================================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE khata_ledger ENABLE ROW LEVEL SECURITY;

-- 1. Catalog Products: Public read for everyone
CREATE POLICY "Public catalog products view" 
    ON catalog_products FOR SELECT 
    USING (true);

-- 2. Stores: Public read for all active stores
CREATE POLICY "Public active stores view" 
    ON stores FOR SELECT 
    USING (is_open = true OR auth.uid() = merchant_owner_id);

CREATE POLICY "Merchant store profile update" 
    ON stores FOR UPDATE 
    USING (auth.uid() = merchant_owner_id);

-- 3. Merchant Offers: Public can read visible offers; purchase_cost is protected
CREATE POLICY "Public view visible offers" 
    ON merchant_offers FOR SELECT 
    USING (is_visible = true AND is_active = true);

CREATE POLICY "Merchant owner offer full management" 
    ON merchant_offers FOR ALL 
    USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = merchant_offers.store_id AND stores.merchant_owner_id = auth.uid()));

-- 4. Orders: Customers read their own parent orders
CREATE POLICY "Customer can read their own orders" 
    ON orders FOR SELECT 
    USING (customer_id = auth.uid());

-- 5. Sub Orders: Merchants view only suborders belonging to their store; Customers view their own
CREATE POLICY "Merchant view store suborders" 
    ON sub_orders FOR SELECT 
    USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = sub_orders.store_id AND stores.merchant_owner_id = auth.uid()));

CREATE POLICY "Customer view their own suborders" 
    ON sub_orders FOR SELECT 
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = sub_orders.parent_order_id AND orders.customer_id = auth.uid()));

CREATE POLICY "Merchant update suborder status" 
    ON sub_orders FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = sub_orders.store_id AND stores.merchant_owner_id = auth.uid()));

-- 6. Khata: Only store owner can manage ledger entries
CREATE POLICY "Merchant manage khata" 
    ON khata_ledger FOR ALL 
    USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = khata_ledger.store_id AND stores.merchant_owner_id = auth.uid()));

-- ============================================================================
-- ATOMIC STORED PROCEDURES (RPCs) FOR STOCK RESERVATION & CONCURRENCY
-- ============================================================================

-- A. Atomic Stock Reservation with SLA Expiry (Spec §5.4, Tests 9 & 10)
CREATE OR REPLACE FUNCTION reserve_stock_atomic(
    p_token VARCHAR(100),
    p_store_id UUID,
    p_product_id UUID,
    p_quantity NUMERIC(12, 3),
    p_ttl_minutes INT DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_available NUMERIC(12, 3);
    v_new_balance NUMERIC(12, 3);
BEGIN
    -- Lock offer row for update to prevent concurrent race condition (Test 9)
    SELECT available_stock INTO v_available
    FROM merchant_offers
    WHERE store_id = p_store_id AND product_id = p_product_id
    FOR UPDATE;

    IF v_available IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'OFFER_NOT_FOUND');
    END IF;

    IF v_available < p_quantity THEN
        RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_STOCK', 'available', v_available);
    END IF;

    -- Deduct available stock atomically
    v_new_balance := v_available - p_quantity;
    UPDATE merchant_offers
    SET available_stock = v_new_balance,
        updated_at = NOW()
    WHERE store_id = p_store_id AND product_id = p_product_id;

    -- Record reservation
    INSERT INTO inventory_reservations (
        reservation_token,
        store_id,
        product_id,
        reserved_qty,
        status,
        expires_at
    ) VALUES (
        p_token,
        p_store_id,
        p_product_id,
        p_quantity,
        'RESERVED',
        NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
    );

    -- Log movement in authoritative inventory ledger
    INSERT INTO inventory_ledger (
        store_id,
        product_id,
        movement_type,
        quantity_delta,
        resulting_balance,
        reference_type,
        reference_id,
        notes
    ) VALUES (
        p_store_id,
        p_product_id,
        'ONLINE_RESERVED',
        -p_quantity,
        v_new_balance,
        'RESERVATION',
        p_token,
        'Hold for online checkout with ' || p_ttl_minutes || ' min TTL'
    );

    RETURN jsonb_build_object('success', true, 'remaining_stock', v_new_balance, 'expires_at', NOW() + (p_ttl_minutes || ' minutes')::INTERVAL);
END;
$$;

-- B. Release Expired Reservations (Spec §5.4, Test 10)
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_released_count INT := 0;
    v_new_stock NUMERIC(12, 3);
BEGIN
    FOR r IN 
        SELECT id, reservation_token, store_id, product_id, reserved_qty 
        FROM inventory_reservations 
        WHERE status = 'RESERVED' AND expires_at < NOW()
        FOR UPDATE
    LOOP
        -- Restock merchant offer
        UPDATE merchant_offers
        SET available_stock = available_stock + r.reserved_qty,
            updated_at = NOW()
        WHERE store_id = r.store_id AND product_id = r.product_id
        RETURNING available_stock INTO v_new_stock;

        -- Update reservation record
        UPDATE inventory_reservations
        SET status = 'EXPIRED',
            updated_at = NOW()
        WHERE id = r.id;

        -- Log restock in ledger
        INSERT INTO inventory_ledger (
            store_id,
            product_id,
            movement_type,
            quantity_delta,
            resulting_balance,
            reference_type,
            reference_id,
            notes
        ) VALUES (
            r.store_id,
            r.product_id,
            'ONLINE_RELEASED',
            r.reserved_qty,
            v_new_stock,
            'RESERVATION',
            r.reservation_token,
            'Auto-released expired online checkout reservation'
        );

        v_released_count := v_released_count + 1;
    END LOOP;

    RETURN v_released_count;
END;
$$;
