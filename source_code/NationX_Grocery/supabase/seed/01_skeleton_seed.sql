-- ============================================================================
-- NATIONX GROCERY — SEED DATA SKELETON (SUPABASE POSTGRESQL)
-- ============================================================================
-- HOW TO CUSTOMIZE WITH REAL DATA LATER:
-- 1. Replace the store records in SECTION 1 with your real shopkeeper names,
--    GSTINs, physical addresses, and coordinates.
-- 2. Add or update items in SECTION 2 with real barcodes, pack sizes, and brands.
-- 3. Adjust the pricing, purchase costs, and stock in SECTION 3 for each shop.
-- 4. Set real wholesale discount tiers in SECTION 4 for commercial buyers.
-- ============================================================================

-- SECTION 1: MERCHANT STORE PROFILES (Spec §1, §3.2)
-- Store 1: Local Neighborhood Kirana
INSERT INTO stores (
    id,
    merchant_owner_id,
    legal_name,
    trade_name,
    gstin,
    phone,
    email,
    store_type,
    address_line,
    area,
    city,
    pincode,
    latitude,
    longitude,
    operating_hours,
    is_open,
    is_delivery_enabled,
    is_pickup_enabled,
    is_khata_enabled
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Sharmaji Kirana Store Private Limited',
    'Sharmaji Kirana & Daily Needs',
    '07AAAAA0000A1Z5',
    '+91 98765 43210',
    'sharmaji.kirana@nationx.local',
    'KIRANA',
    'Shop No. 4, Block C Market, Green Park Extension',
    'Green Park',
    'New Delhi',
    '110016',
    28.5584,
    77.2023,
    '07:30 AM - 10:00 PM',
    true,
    true,
    true,
    true -- Khata explicitly enabled for verified loyal patrons (Spec §10)
);

-- Store 2: Regional APMC Mandi Wholesaler
INSERT INTO stores (
    id,
    merchant_owner_id,
    legal_name,
    trade_name,
    gstin,
    phone,
    email,
    store_type,
    address_line,
    area,
    city,
    pincode,
    latitude,
    longitude,
    operating_hours,
    is_open,
    is_delivery_enabled,
    is_pickup_enabled,
    is_khata_enabled
) VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Azadpur Agro Commodities Trading LLP',
    'Azadpur Mandi Wholesale Depo',
    '07BBBBB1111B2Z6',
    '+91 98111 22334',
    'mandi.orders@nationx.local',
    'MANDI_WHOLESALER',
    'Shed 12, Gate 3, APMC Fruit & Grain Mandi',
    'Azadpur',
    'New Delhi',
    '110033',
    28.7183,
    77.1772,
    '05:00 AM - 04:00 PM',
    true,
    true,
    true,
    false
);

-- Store 3: Certified Organic & Specialty Depot
INSERT INTO stores (
    id,
    merchant_owner_id,
    legal_name,
    trade_name,
    gstin,
    phone,
    email,
    store_type,
    address_line,
    area,
    city,
    pincode,
    latitude,
    longitude,
    operating_hours,
    is_open,
    is_delivery_enabled,
    is_pickup_enabled,
    is_khata_enabled
) VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'b3333333-3333-3333-3333-333333333333',
    'Prakriti Bio Organics Producers Co.',
    'Prakriti Organic Farm Store',
    '07CCCCC2222C3Z7',
    '+91 99999 88888',
    'prakriti.care@nationx.local',
    'ORGANIC_DEPOT',
    'Plot 18, Commercial Belt, Vasant Kunj Sector C',
    'Vasant Kunj',
    'New Delhi',
    '110070',
    28.5285,
    77.1517,
    '08:30 AM - 08:30 PM',
    true,
    true,
    true,
    false
);

-- SECTION 2: CATALOG PRODUCTS (Shared Master Product Identity - Spec §3.1, §13)
INSERT INTO catalog_products (
    id, name, telugu_name, brand, category, sub_category, variant, pack_size, unit, barcode, hsn_code, image_url, description
) VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'Sona Masoori Raw Rice',
    'సోనా మసూరి బియ్యం',
    'India Gate',
    'Rice & Grains',
    'Raw Rice',
    'Aged 12 Months',
    '5 kg',
    'kg',
    '8901234567011',
    '100630',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    'Premium lightweight aromatic Sona Masoori rice aged 12 months for fluffiness.'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'Sharbati Superior Whole Wheat Atta',
    'శర్బతి గోధుమ పిండి',
    'Aashirvaad',
    'Flours & Atta',
    'Wheat Flour',
    'MP Sharbati 100% Chakki Fresh',
    '5 kg',
    'kg',
    '8901234567022',
    '110100',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    'Stone ground traditional whole wheat flour from Sehore MP golden grains.'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'Desi Unpolished Toor Dal',
    'కంది పప్పు',
    'Tata Sampann',
    'Dals & Pulses',
    'Pigeon Pea',
    'Unpolished Rich Protein',
    '1 kg',
    'kg',
    '8901234567033',
    '071360',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'Naturally dry unpolished arhar/toor dal preserving natural dietary fibers.'
),
(
    'c4444444-4444-4444-4444-444444444444',
    'Kachi Ghani Pure Mustard Oil',
    'ఆవాల నూనె',
    'Fortune',
    'Oils & Ghee',
    'Mustard Oil',
    'Cold Pressed First Extraction',
    '1 L',
    'L',
    '8901234567044',
    '151491',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    'Pungent, cold-pressed raw mustard oil rich in omega-3 and natural antioxidants.'
),
(
    'c5555555-5555-5555-5555-555555555555',
    'Certified Organic Whole Moong Dal',
    'పెసలు',
    'Organic Tattva',
    'Dals & Pulses',
    'Green Gram',
    'NPOP Certified Organic',
    '1 kg',
    'kg',
    '8901234567055',
    '071331',
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    'Pesticide-free organic sabut moong cultivated under certified biodynamic practices.'
),
(
    'c6666666-6666-6666-6666-666666666666',
    'Iodized Crystal Salt',
    'ఉప్పు',
    'Tata Salt',
    'Spices & Seasoning',
    'Salt',
    'Vacuum Evaporated Iodine Enriched',
    '1 kg',
    'kg',
    '8901234567066',
    '250100',
    'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80',
    'India standard vacuum-evaporated pure edible iodized table salt.'
);

-- SECTION 3: MERCHANT OFFERS (Shop-Specific Pricing & Stock - Spec §3.2, §4.1)
-- Note: purchase_cost is protected under RLS and visible to merchant only.
INSERT INTO merchant_offers (
    id, store_id, product_id, selling_price, mrp, purchase_cost, available_stock, low_stock_threshold, min_order_qty, is_active, is_visible, retail_available, wholesale_available
) VALUES
-- Sharmaji Kirana offers:
(
    'd1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111', -- Rice 5kg
    375.00, 420.00, 310.00, 48.000, 10.000, 1.000, true, true, true, true
),
(
    'd1111111-1111-1111-1111-111111111112',
    'a1111111-1111-1111-1111-111111111111',
    'c2222222-2222-2222-2222-222222222222', -- Atta 5kg
    265.00, 290.00, 220.00, 60.000, 15.000, 1.000, true, true, true, true
),
(
    'd1111111-1111-1111-1111-111111111113',
    'a1111111-1111-1111-1111-111111111111',
    'c3333333-3333-3333-3333-333333333333', -- Toor Dal 1kg
    175.00, 195.00, 145.00, 35.000, 8.000, 1.000, true, true, true, false
),
(
    'd1111111-1111-1111-1111-111111111114',
    'a1111111-1111-1111-1111-111111111111',
    'c4444444-4444-4444-4444-444444444444', -- Mustard Oil 1L
    168.00, 190.00, 138.00, 28.000, 6.000, 1.000, true, true, true, false
),
(
    'd1111111-1111-1111-1111-111111111115',
    'a1111111-1111-1111-1111-111111111111',
    'c6666666-6666-6666-6666-666666666666', -- Salt 1kg
    28.00, 30.00, 22.00, 150.000, 25.000, 1.000, true, true, true, true
),

-- Azadpur Mandi Wholesaler offers (Competitive bulk prices, higher minimums):
(
    'd2222222-2222-2222-2222-222222222221',
    'a2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111', -- Rice 5kg
    340.00, 420.00, 295.00, 450.000, 50.000, 5.000, true, true, false, true
),
(
    'd2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222', -- Atta 5kg
    240.00, 290.00, 205.00, 500.000, 50.000, 5.000, true, true, false, true
),

-- Prakriti Organic Depot offers:
(
    'd3333333-3333-3333-3333-333333333331',
    'a3333333-3333-3333-3333-333333333333',
    'c5555555-5555-5555-5555-555555555555', -- Organic Moong 1kg
    195.00, 220.00, 155.00, 40.000, 10.000, 1.000, true, true, true, false
);

-- SECTION 4: WHOLESALE TIERS (Spec §4.1, §6, §7.1 Path A)
-- Sharmaji Kirana Volume Slabs on Rice:
INSERT INTO wholesale_tiers (offer_id, min_quantity, tier_price, discount_pct) VALUES
('d1111111-1111-1111-1111-111111111111', 5.000, 350.00, 6.67),
('d1111111-1111-1111-1111-111111111111', 15.000, 325.00, 13.33),
('d1111111-1111-1111-1111-111111111111', 50.000, 305.00, 18.67);

-- Azadpur Mandi Volume Slabs on Rice:
INSERT INTO wholesale_tiers (offer_id, min_quantity, tier_price, discount_pct) VALUES
('d2222222-2222-2222-2222-222222222221', 10.000, 325.00, 4.41),
('d2222222-2222-2222-2222-222222222221', 50.000, 300.00, 11.76),
('d2222222-2222-2222-2222-222222222221', 100.000, 285.00, 16.18);
