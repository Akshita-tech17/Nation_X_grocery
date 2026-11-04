import { MasterProduct, ShopProductOffering, Product, AvailabilityStatus } from '../types';

export const DEFAULT_FRESHNESS_HOURS_THRESHOLD = 72; // Configurable freshness threshold (3 days)

/**
 * Canonical Master Products (Shared across the platform)
 */
export const MASTER_PRODUCTS: MasterProduct[] = [
  {
    id: 'prod-aashirvaad-sharbati',
    name: 'Aashirvaad Select 100% MP Sharbati Whole Wheat Atta',
    hindiName: 'आशीर्वाद सेलेक्ट शरबती गेहूं आटा',
    brand: 'Aashirvaad',
    category: 'staples-atta',
    subCategory: 'Whole Wheat Atta',
    variant: '100% Sharbati Chakki Fresh',
    unit: '5 kg',
    packSize: '5 kg pouch',
    barcode: '8901725131012',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop&q=80',
    origin: 'Sehore, Madhya Pradesh',
    isBestseller: true,
    isGiTagged: true,
    description: 'Made from the golden grains of Sehore, Madhya Pradesh, known for its sweet taste and extra soft rotis that stay tender for hours.',
    nutrition: {
      energy: '364 kcal / 100g',
      protein: '11.8 g',
      carbs: '74.2 g',
      fat: '1.7 g'
    },
    tags: ['Rotis', '100% Sharbati', 'Preservative Free', 'Chakki Fresh']
  },
  {
    id: 'prod-india-gate-classic',
    name: 'India Gate Classic Aged Basmati Rice',
    hindiName: 'इंडिया गेट क्लासिक बासमती चावल (2 वर्ष पुराना)',
    brand: 'India Gate',
    category: 'rice-pulses',
    subCategory: 'Basmati Rice',
    variant: 'Aged 2 Years Slender Grain',
    unit: '5 kg',
    packSize: '5 kg Zip Bag',
    barcode: '8901463112040',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80',
    origin: 'Terai Foothills, Punjab',
    isBestseller: true,
    description: 'Extra-long pearl slender grains, aged for two full years to perfection. Perfect for dum biryanis, pulao and royal feasts.',
    nutrition: {
      energy: '350 kcal / 100g',
      protein: '8.4 g',
      carbs: '78.0 g',
      fat: '0.5 g'
    },
    tags: ['Aged 2 Years', 'Biryani Special', 'Non-Sticky', 'Export Quality']
  },
  {
    id: 'prod-tata-sampann-toor',
    name: 'Tata Sampann Unpolished High-Protein Toor Dal',
    hindiName: 'टाटा सम्पन्न अनपॉलिश्ड अरहर / तुवर दाल',
    brand: 'Tata Sampann',
    category: 'rice-pulses',
    subCategory: 'Dals & Pulses',
    variant: 'Unpolished Natural Grain',
    unit: '1 kg',
    packSize: '1 kg Standup Pouch',
    barcode: '8901058852309',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
    origin: 'Latur, Maharashtra',
    isOrganic: true,
    description: 'Unpolished grains that do not undergo artificial water, oil or stone polish, retaining natural wholesome nutrition and rich protein content.',
    nutrition: {
      energy: '343 kcal / 100g',
      protein: '22.0 g',
      carbs: '62.0 g',
      fat: '1.5 g'
    },
    tags: ['Unpolished', 'Chef Sanjeev Kapoor Certified', 'High Protein']
  },
  {
    id: 'prod-organic-bilona-ghee',
    name: 'Pure Desi Gir Cow A2 Vedic Bilona Ghee',
    hindiName: 'शुद्ध देसी गिर गाय ए2 वैदिक बिलोना घी',
    brand: 'Vedic Sattva',
    category: 'oils-ghee',
    subCategory: 'Pure Ghee',
    variant: 'A2 Vedic Bilona Curd Churned',
    unit: '1 L',
    packSize: '1000 ml Glass Jar',
    barcode: '8908012398401',
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=700&auto=format&fit=crop&q=80',
    origin: 'Gir Sanctuary Pastures, Gujarat',
    isOrganic: true,
    isLocalFarm: true,
    description: 'Traditional curd-churned Bilona method using wooden churners from free-grazing indigenous Gir cows. Golden granular aroma rich in Omega-3.',
    nutrition: {
      energy: '900 kcal / 100g',
      protein: '0 g',
      carbs: '0 g',
      fat: '99.8 g'
    },
    tags: ['A2 Gir Cow', 'Vedic Bilona', 'Glass Jar', 'Granular Danedar']
  },
  {
    id: 'prod-fortune-mustard-oil',
    name: 'Fortune Kachi Ghani Pure Mustard Oil Tin',
    hindiName: 'फॉर्च्यून कच्ची घानी सरसों का तेल (टिन)',
    brand: 'Fortune',
    category: 'oils-ghee',
    subCategory: 'Cooking Oils',
    variant: 'Cold Pressed First Press',
    unit: '5 L',
    packSize: '5 Litre Metal Canister',
    barcode: '8906007281093',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&auto=format&fit=crop&q=80',
    origin: 'Alwar, Rajasthan',
    description: 'First press pungent mustard oil extracted from the finest mustard seeds. Enhances taste of pickles, curries and traditional frying.',
    nutrition: {
      energy: '900 kcal / 100g',
      protein: '0 g',
      carbs: '0 g',
      fat: '100 g'
    },
    tags: ['Cold Pressed', 'Natural Antioxidants', 'Pungent Taste']
  },
  {
    id: 'prod-malabar-black-pepper',
    name: 'Wayand Estate Handpicked Tellicherry Garbled Extra Bold Pepper (TGSEB)',
    hindiName: 'वायनाड काली मिर्च (बोल्ड दाना)',
    brand: 'Malabar Spices',
    category: 'spices-masala',
    subCategory: 'Whole Spices',
    variant: 'TGSEB 4.75mm Extra Bold',
    unit: '500 g',
    packSize: '500 g Airtight Pouch',
    barcode: '8909012384912',
    image: 'https://images.unsplash.com/photo-1599909682705-7f9185a539eb?w=700&auto=format&fit=crop&q=80',
    origin: 'Wayanad, Kerala',
    isGiTagged: true,
    description: 'The highest grade of black pepper in the world: berry diameter > 4.75mm with intense piperine pungency and citrus undertones.',
    nutrition: {
      energy: '255 kcal / 100g',
      protein: '10.9 g',
      carbs: '64.8 g',
      fat: '3.3 g'
    },
    tags: ['Tellicherry Bold', 'GI Tagged', 'Direct from Planter']
  },
  {
    id: 'prod-california-almonds',
    name: 'Premium California Inshell / Non-Pareil Almonds',
    hindiName: 'कैलिफ़ोर्निया बादाम गिरी (सुपर क्रंची)',
    brand: 'Royal Dry Fruit Co.',
    category: 'dry-fruits',
    subCategory: 'Almonds',
    variant: 'Non-Pareil 23/25 Grade',
    unit: '1 kg',
    packSize: '1 kg Vacuum Pack',
    barcode: '8904018239014',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=700&auto=format&fit=crop&q=80',
    origin: 'Central Valley, California',
    isBestseller: true,
    description: 'Evenly sized, 100% natural raw whole almonds with crisp crunch and high dietary fiber and Vitamin E.',
    nutrition: {
      energy: '579 kcal / 100g',
      protein: '21.2 g',
      carbs: '21.6 g',
      fat: '49.9 g'
    },
    tags: ['High Protein', 'Zero Cholesterol', 'Vacuum Sealed']
  },
  {
    id: 'prod-farm-shimla-apples',
    name: 'Orchard Fresh Crisp Royal Delicious Shimla Apples',
    hindiName: 'ताज़ा सेब (शिमला बागानों से)',
    brand: 'Himalayan Orchards',
    category: 'farm-produce',
    subCategory: 'Fresh Fruits',
    variant: 'Grade A Royal Delicious',
    unit: '1 kg',
    packSize: '4-5 pcs per kg tray',
    barcode: '8907812903810',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=700&auto=format&fit=crop&q=80',
    origin: 'Kotgarh Valley, Himachal Pradesh',
    isLocalFarm: true,
    description: 'Hand-plucked crispy apples from 7,000 feet altitude orchards, unwaxed, sweet, juicy and naturally blushing red.',
    tags: ['Unwaxed', 'Direct Orchard', 'Rich Antioxidants']
  },
  {
    id: 'prod-amul-malai-paneer',
    name: 'Amul Fresh Malai Paneer Block',
    hindiName: 'अमुल फ्रेश मलाई पनीर ब्लॉक',
    brand: 'Amul',
    category: 'dairy-bakery',
    subCategory: 'Paneer & Dairy',
    variant: 'Fresh Dairy Vacuum Block',
    unit: '1 kg',
    packSize: '1 kg Vacuum Brick',
    barcode: '8901262010214',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80',
    origin: 'Anand, Gujarat',
    description: 'Soft, succulent paneer made from pure cow and buffalo milk curd. Ideal for tikka grills, shahi gravies and salads.',
    nutrition: {
      energy: '314 kcal / 100g',
      protein: '19.5 g',
      carbs: '4.5 g',
      fat: '25.0 g'
    },
    tags: ['Fresh Daily', 'Pure Milk', 'High Calcium']
  },
  {
    id: 'prod-wholesale-sugar-50kg',
    name: 'Dhampur Pure Crystal Refined Sugar Commercial Gunny Sack',
    hindiName: 'धामपुर शुद्ध सल्फर-मुक्त चीनी बोरी (50 किलो)',
    brand: 'Dhampur Sugar',
    category: 'wholesale-sacks',
    subCategory: 'Sugar & Sweeteners',
    variant: 'M-30 Crystal Sulphur Free',
    unit: '50 kg',
    packSize: '50 kg Jute / HDPE Gunny Sack',
    barcode: '8903829104820',
    image: 'https://images.unsplash.com/photo-1622484212850-cab596d63c5a?w=700&auto=format&fit=crop&q=80',
    origin: 'Bijnor Sugarcane Belt, Uttar Pradesh',
    description: 'Sulphur-free double-refined sparkling white sugar crystals, standardized for commercial bakeries, halwai sweetshops, and kirana bulk retail.',
    nutrition: {
      energy: '398 kcal / 100g',
      protein: '0 g',
      carbs: '99.8 g',
      fat: '0 g'
    },
    tags: ['50kg Gunny', 'Sulphur Free', 'Commercial Sweetshop Grade']
  },
  {
    id: 'prod-sona-masoori-25kg',
    name: 'BPT 5204 Andhra Sona Masoori Raw Rice Sack',
    hindiName: 'आंध्र सोना मसूरी चावल बोरी (25 किलो)',
    brand: 'Kaveri Harvest',
    category: 'wholesale-sacks',
    subCategory: 'Raw Rice Sacks',
    variant: 'BPT 5204 Aged 12 Months',
    unit: '25 kg',
    packSize: '25 kg Woven Sack',
    barcode: '8906918239019',
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=700&auto=format&fit=crop&q=80',
    origin: 'Kurnool / Guntur, Andhra Pradesh',
    description: 'Lightweight, aromatic medium grain rice aged 12+ months. Easy to digest and the everyday staple of South Indian households and messes.',
    nutrition: {
      energy: '356 kcal / 100g',
      protein: '7.1 g',
      carbs: '79.2 g',
      fat: '0.6 g'
    },
    tags: ['Aged 12 Months', '25kg Sack', 'Everyday Rice']
  },
  {
    id: 'prod-kashmiri-kesar',
    name: 'Pampore Grade-1 Mogra Saffron (Kashmiri Kesar)',
    hindiName: 'कश्मीरी मुंगरा केसर (पंपोर ग्रेड-1)',
    brand: 'Kashmir Valley Organic',
    category: 'spices-masala',
    subCategory: 'Exotic Spices',
    variant: 'Grade 1 Red Mogra Stigma',
    unit: '2 g',
    packSize: '2 g Acrylic Safety Box',
    barcode: '8901829384910',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=700&auto=format&fit=crop&q=80',
    origin: 'Pampore Plateau, Kashmir',
    isGiTagged: true,
    description: '100% pure thick red stigma threads with high crocin content, delivering radiant saffron hue and deep royal aroma.',
    tags: ['GI Tagged Mogra', 'Lab Certified', 'Pampore Origin']
  },
  {
    id: 'prod-tata-salt-iodized',
    name: 'Tata Salt Vacuum Evaporated Iodized Salt',
    hindiName: 'टाटा नमक (देश का नमक)',
    brand: 'Tata Salt',
    category: 'staples-atta',
    subCategory: 'Salt & Minerals',
    variant: 'Vacuum Evaporated Iodized',
    unit: '1 kg',
    packSize: '1 kg Pouch',
    barcode: '8901058000106',
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=700&auto=format&fit=crop&q=80',
    origin: 'Mithapur, Gujarat',
    description: 'Purity guaranteed with vacuum evaporation technology. Wholesome iodine enrichment for cognitive health and everyday seasoning.',
    nutrition: {
      energy: '0 kcal',
      protein: '0 g',
      carbs: '0 g',
      fat: '0 g'
    },
    tags: ['Vacuum Evaporated', 'Iodized', 'Purity Assured']
  },
  {
    id: 'prod-royal-cashews-w240',
    name: 'Royal Mangalore W240 King Size Whole Cashews',
    hindiName: 'शाही काजू डब्ल्यू 240 (बड़ा दाना)',
    brand: 'Royal Dry Fruit Co.',
    category: 'dry-fruits',
    subCategory: 'Cashews',
    variant: 'W240 Jumbo Roasted',
    unit: '1 kg',
    packSize: '1 kg Nitrogen Flush Tin',
    barcode: '8904819203819',
    image: 'https://images.unsplash.com/photo-1536591375315-1b836814d609?w=700&auto=format&fit=crop&q=80',
    origin: 'Mangalore Coastal Belt, Karnataka',
    description: 'Jumbo W240 grade whole cashew kernels, sweet, buttery, and crunch roasted without artificial additives.',
    nutrition: {
      energy: '553 kcal / 100g',
      protein: '18.2 g',
      carbs: '30.1 g',
      fat: '43.8 g'
    },
    tags: ['W240 Jumbo', 'Mangalore Origin', 'Nitrogen Flushed']
  }
];

/**
 * Shop-Specific Product Offerings
 * Multiple independent shops offering master products with separate pricing, inventory, and wholesale tiers.
 */
export const SHOP_OFFERINGS: ShopProductOffering[] = [
  // 1. Aashirvaad Atta: Offered by Sharmaji Kirana, Mandi Direct Wholesale, and Sri Lakshmi
  {
    id: 'off-sharma-atta',
    masterProductId: 'prod-aashirvaad-sharbati',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 345,
    mrp: 385,
    purchaseCost: 305, // Merchant authorized
    stockQuantity: 48,
    stockUpdatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 315, discountPercent: 8, label: 'Small Kirana / Family Pack (5+ bags)' },
      { minQty: 15, pricePerUnit: 295, discountPercent: 14, label: 'Restaurant & Catering Tier (15+ bags)' },
      { minQty: 40, pricePerUnit: 275, discountPercent: 20, label: 'Wholesale Pallet Tier (40+ bags)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.8,
    reviewCount: 1420
  },
  {
    id: 'off-mandi-atta',
    masterProductId: 'prod-aashirvaad-sharbati',
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    sellingPrice: 325,
    mrp: 385,
    purchaseCost: 285,
    stockQuantity: 240,
    stockUpdatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 10,
    wholesaleTiers: [
      { minQty: 10, pricePerUnit: 290, discountPercent: 10, label: 'Commercial Lot (10+ bags)' },
      { minQty: 30, pricePerUnit: 270, discountPercent: 17, label: 'Mandi Pallet (30+ bags)' }
    ],
    fulfilmentOptions: ['standard', 'truck_freight', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.7,
    reviewCount: 310
  },
  {
    id: 'off-lakshmi-atta',
    masterProductId: 'prod-aashirvaad-sharbati',
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    sellingPrice: 340,
    mrp: 385,
    purchaseCost: 300,
    stockQuantity: 6,
    stockUpdatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    availabilityStatus: 'low_stock',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 320, discountPercent: 6, label: 'Bulk Neighborhood Pack (5+ bags)' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.6,
    reviewCount: 88
  },

  // 2. India Gate Basmati: Offered by Mandi Direct and Sharmaji Kirana
  {
    id: 'off-mandi-basmati',
    masterProductId: 'prod-india-gate-classic',
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    sellingPrice: 790,
    mrp: 920,
    purchaseCost: 680,
    stockQuantity: 65,
    stockUpdatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 4,
    wholesaleTiers: [
      { minQty: 4, pricePerUnit: 730, discountPercent: 7, label: 'Bulk Caterer (4+ packs)' },
      { minQty: 10, pricePerUnit: 685, discountPercent: 13, label: 'Commercial Kitchen (10+ packs)' },
      { minQty: 25, pricePerUnit: 640, discountPercent: 19, label: 'Mandi Wholesale (25+ packs)' }
    ],
    fulfilmentOptions: ['standard', 'truck_freight', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.9,
    reviewCount: 980
  },
  {
    id: 'off-sharma-basmati',
    masterProductId: 'prod-india-gate-classic',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 820,
    mrp: 920,
    purchaseCost: 735,
    stockQuantity: 9,
    stockUpdatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    availabilityStatus: 'low_stock',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 760, discountPercent: 7, label: 'Indiranagar Family Pack (5+ packs)' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.8,
    reviewCount: 240
  },

  // 3. Tata Sampann Toor Dal: Offered by Sharmaji Kirana, Annapurna Organic & Sri Lakshmi (stale data example)
  {
    id: 'off-sharma-toor',
    masterProductId: 'prod-tata-sampann-toor',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 172,
    mrp: 195,
    purchaseCost: 145,
    stockQuantity: 90,
    stockUpdatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 10,
    wholesaleTiers: [
      { minQty: 10, pricePerUnit: 155, discountPercent: 10, label: 'Kirana Carton (10x 1kg)' },
      { minQty: 30, pricePerUnit: 142, discountPercent: 17, label: 'Hostel & Mess Bulk (30x 1kg)' },
      { minQty: 60, pricePerUnit: 135, discountPercent: 21, label: 'Wholesale Depot (60x 1kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.7,
    reviewCount: 650
  },
  {
    id: 'off-annapurna-toor',
    masterProductId: 'prod-tata-sampann-toor',
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    sellingPrice: 180,
    mrp: 195,
    purchaseCost: 155,
    stockQuantity: 35,
    stockUpdatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 10,
    wholesaleTiers: [
      { minQty: 10, pricePerUnit: 165, discountPercent: 8, label: 'Organic Food Club (10x 1kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.8,
    reviewCount: 190
  },
  {
    id: 'off-lakshmi-toor',
    masterProductId: 'prod-tata-sampann-toor',
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    sellingPrice: 175,
    mrp: 195,
    purchaseCost: 150,
    stockQuantity: 12,
    stockUpdatedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(), // 4 days ago (>72h, stale/unconfirmed)
    availabilityStatus: 'unconfirmed',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 10,
    wholesaleTiers: [
      { minQty: 10, pricePerUnit: 160, discountPercent: 8, label: 'Neighborhood 10-Pack' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.5,
    reviewCount: 72
  },

  // 4. Vedic Bilona Ghee: Offered by Annapurna Organic
  {
    id: 'off-annapurna-ghee',
    masterProductId: 'prod-organic-bilona-ghee',
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    sellingPrice: 1450,
    mrp: 1750,
    purchaseCost: 1150,
    stockQuantity: 24,
    stockUpdatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 3,
    wholesaleTiers: [
      { minQty: 3, pricePerUnit: 1320, discountPercent: 9, label: 'Ayurvedic Practitioner Tier (3+ jars)' },
      { minQty: 8, pricePerUnit: 1220, discountPercent: 16, label: 'Wellness Center Pack (8+ jars)' },
      { minQty: 20, pricePerUnit: 1100, discountPercent: 24, label: 'Direct Dairy Partner (20+ jars)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.95,
    reviewCount: 410
  },

  // 5. Fortune Mustard Oil: Offered by Mandi Direct and Sharmaji Kirana
  {
    id: 'off-mandi-mustard-oil',
    masterProductId: 'prod-fortune-mustard-oil',
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    sellingPrice: 760,
    mrp: 850,
    purchaseCost: 650,
    stockQuantity: 38,
    stockUpdatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 4,
    wholesaleTiers: [
      { minQty: 4, pricePerUnit: 710, discountPercent: 6, label: 'Case of 4 Tins (20 L)' },
      { minQty: 10, pricePerUnit: 670, discountPercent: 12, label: 'Halwai / Restaurant Box (50 L)' },
      { minQty: 25, pricePerUnit: 630, discountPercent: 17, label: 'Commercial Wholesale Mandi (125 L)' }
    ],
    fulfilmentOptions: ['standard', 'truck_freight', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.7,
    reviewCount: 830
  },
  {
    id: 'off-sharma-mustard-oil',
    masterProductId: 'prod-fortune-mustard-oil',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 785,
    mrp: 850,
    purchaseCost: 710,
    stockQuantity: 14,
    stockUpdatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 4,
    wholesaleTiers: [
      { minQty: 4, pricePerUnit: 740, discountPercent: 5, label: 'Halwai 4-Tin Pack' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.8,
    reviewCount: 160
  },

  // 6. Black Pepper: Offered by Sri Lakshmi Provision & Spice Corner
  {
    id: 'off-lakshmi-pepper',
    masterProductId: 'prod-malabar-black-pepper',
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    sellingPrice: 520,
    mrp: 620,
    purchaseCost: 410,
    stockQuantity: 45,
    stockUpdatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 6,
    wholesaleTiers: [
      { minQty: 6, pricePerUnit: 460, discountPercent: 11, label: 'Gourmet Caterer (3 kg)' },
      { minQty: 15, pricePerUnit: 420, discountPercent: 19, label: 'Spice Blending Workshop (7.5 kg)' },
      { minQty: 30, pricePerUnit: 380, discountPercent: 27, label: 'Exporter & Trader Sacks (15 kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.9,
    reviewCount: 310
  },

  // 7. California Almonds: Offered by Annapurna Organic and Sharmaji Kirana
  {
    id: 'off-annapurna-almonds',
    masterProductId: 'prod-california-almonds',
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    sellingPrice: 890,
    mrp: 1050,
    purchaseCost: 740,
    stockQuantity: 50,
    stockUpdatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 810, discountPercent: 9, label: 'Sweet Maker Mini Pack (5 kg)' },
      { minQty: 12, pricePerUnit: 750, discountPercent: 15, label: 'Bakery & Mithai Bulk (12 kg carton)' },
      { minQty: 30, pricePerUnit: 690, discountPercent: 22, label: 'Dry Fruit Trader Pallet (30 kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.85,
    reviewCount: 520
  },
  {
    id: 'off-sharma-almonds',
    masterProductId: 'prod-california-almonds',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 920,
    mrp: 1050,
    purchaseCost: 790,
    stockQuantity: 0,
    stockUpdatedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    availabilityStatus: 'unavailable',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 840, discountPercent: 8, label: '5kg Carton' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.7,
    reviewCount: 140
  },

  // 8. Shimla Apples: Offered by Annapurna Organic
  {
    id: 'off-annapurna-apples',
    masterProductId: 'prod-farm-shimla-apples',
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    sellingPrice: 190,
    mrp: 240,
    purchaseCost: 140,
    stockQuantity: 70,
    stockUpdatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 10,
    wholesaleTiers: [
      { minQty: 10, pricePerUnit: 165, discountPercent: 13, label: 'Juice Bar / Fresh Cart (10 kg crate)' },
      { minQty: 25, pricePerUnit: 145, discountPercent: 23, label: 'Fruit Retailer Wooden Crate (25 kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.6,
    reviewCount: 390
  },

  // 9. Amul Malai Paneer: Offered by Sharmaji Kirana and Sri Lakshmi
  {
    id: 'off-sharma-paneer',
    masterProductId: 'prod-amul-malai-paneer',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 420,
    mrp: 460,
    purchaseCost: 360,
    stockQuantity: 40,
    stockUpdatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 380, discountPercent: 9, label: 'Restaurant Daily Kitchen (5 kg)' },
      { minQty: 15, pricePerUnit: 350, discountPercent: 16, label: 'Banquet & Party Catering (15 kg)' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.9,
    reviewCount: 1100
  },
  {
    id: 'off-lakshmi-paneer',
    masterProductId: 'prod-amul-malai-paneer',
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    sellingPrice: 430,
    mrp: 460,
    purchaseCost: 375,
    stockQuantity: 8,
    stockUpdatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    availabilityStatus: 'low_stock',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 390, discountPercent: 9, label: 'Catering 5kg' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.7,
    reviewCount: 180
  },

  // 10. Dhampur Sugar 50kg: Offered by Mandi Direct Wholesale
  {
    id: 'off-mandi-sugar-50kg',
    masterProductId: 'prod-wholesale-sugar-50kg',
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    sellingPrice: 2250,
    mrp: 2450,
    purchaseCost: 1950,
    stockQuantity: 120,
    stockUpdatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 2,
    wholesaleTiers: [
      { minQty: 2, pricePerUnit: 2150, discountPercent: 4, label: 'Small Bakery Tier (2-4 bags)' },
      { minQty: 5, pricePerUnit: 2040, discountPercent: 9, label: 'Sweet Mart Restock (5-10 bags)' },
      { minQty: 20, pricePerUnit: 1950, discountPercent: 13, label: 'Truckload Mandi Rate (20+ bags)' }
    ],
    fulfilmentOptions: ['standard', 'truck_freight', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.8,
    reviewCount: 290
  },

  // 11. Sona Masoori 25kg: Offered by Mandi Direct and Sri Lakshmi
  {
    id: 'off-mandi-sona-masoori',
    masterProductId: 'prod-sona-masoori-25kg',
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    sellingPrice: 1550,
    mrp: 1750,
    purchaseCost: 1350,
    stockQuantity: 85,
    stockUpdatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 2,
    wholesaleTiers: [
      { minQty: 2, pricePerUnit: 1470, discountPercent: 5, label: 'Hostel / Joint Family (2-4 bags)' },
      { minQty: 8, pricePerUnit: 1390, discountPercent: 10, label: 'Corporate Canteen Tier (8-19 bags)' },
      { minQty: 20, pricePerUnit: 1310, discountPercent: 15, label: 'Mandi Pallet Tier (20+ bags)' }
    ],
    fulfilmentOptions: ['standard', 'truck_freight', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.75,
    reviewCount: 380
  },
  {
    id: 'off-lakshmi-sona-masoori',
    masterProductId: 'prod-sona-masoori-25kg',
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    sellingPrice: 1600,
    mrp: 1750,
    purchaseCost: 1420,
    stockQuantity: 18,
    stockUpdatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 2,
    wholesaleTiers: [
      { minQty: 2, pricePerUnit: 1520, discountPercent: 5, label: 'Family 2-Sack Pack' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.7,
    reviewCount: 95
  },

  // 12. Kashmiri Kesar: Offered by Annapurna Organic
  {
    id: 'off-annapurna-kesar',
    masterProductId: 'prod-kashmiri-kesar',
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    sellingPrice: 650,
    mrp: 800,
    purchaseCost: 480,
    stockQuantity: 30,
    stockUpdatedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 580, discountPercent: 10, label: 'Mithai Chef Pack (5 boxes)' },
      { minQty: 15, pricePerUnit: 510, discountPercent: 21, label: 'Wedding Caterer Tier (15 boxes)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.95,
    reviewCount: 210
  },

  // 13. Tata Salt: Offered by Sharmaji Kirana and Sri Lakshmi
  {
    id: 'off-sharma-salt',
    masterProductId: 'prod-tata-salt-iodized',
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    sellingPrice: 28,
    mrp: 30,
    purchaseCost: 22,
    stockQuantity: 200,
    stockUpdatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 25,
    wholesaleTiers: [
      { minQty: 25, pricePerUnit: 24, discountPercent: 14, label: 'Carton of 25kg (25x 1kg)' },
      { minQty: 100, pricePerUnit: 21, discountPercent: 25, label: 'Wholesale Depot Pallet (100x 1kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.9,
    reviewCount: 2400
  },
  {
    id: 'off-lakshmi-salt',
    masterProductId: 'prod-tata-salt-iodized',
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    sellingPrice: 28,
    mrp: 30,
    purchaseCost: 23,
    stockQuantity: 80,
    stockUpdatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 25,
    wholesaleTiers: [
      { minQty: 25, pricePerUnit: 25, discountPercent: 10, label: '25kg Bulk Box' }
    ],
    fulfilmentOptions: ['express', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.8,
    reviewCount: 310
  },

  // 14. Royal Cashews: Offered by Annapurna Organic
  {
    id: 'off-annapurna-cashews',
    masterProductId: 'prod-royal-cashews-w240',
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    sellingPrice: 1150,
    mrp: 1350,
    purchaseCost: 920,
    stockQuantity: 40,
    stockUpdatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    availabilityStatus: 'available',
    freshnessHoursThreshold: 72,
    minWholesaleQty: 5,
    wholesaleTiers: [
      { minQty: 5, pricePerUnit: 1040, discountPercent: 10, label: 'Mithai Restock (5x 1kg)' },
      { minQty: 20, pricePerUnit: 940, discountPercent: 18, label: 'Commercial Sweetmaker Master Box (20 kg)' }
    ],
    fulfilmentOptions: ['express', 'standard', 'pickup'],
    visibilityStatus: 'active',
    rating: 4.9,
    reviewCount: 420
  }
];

/**
 * Checks if stock information is older than threshold hours.
 */
export function isStockStale(stockUpdatedAt?: string, thresholdHours = DEFAULT_FRESHNESS_HOURS_THRESHOLD): boolean {
  if (!stockUpdatedAt) return true;
  const updated = new Date(stockUpdatedAt).getTime();
  if (isNaN(updated)) return false;
  const elapsedHours = (Date.now() - updated) / (1000 * 3600);
  return elapsedHours > thresholdHours;
}

/**
 * Resolves availability status accounting for stock quantity and freshness.
 */
export function resolveAvailabilityStatus(
  offering: ShopProductOffering,
  thresholdHours = DEFAULT_FRESHNESS_HOURS_THRESHOLD
): AvailabilityStatus {
  if (isStockStale(offering.stockUpdatedAt, thresholdHours)) {
    return 'unconfirmed';
  }
  if (offering.stockQuantity <= 0) {
    return 'unavailable';
  }
  if (offering.stockQuantity < 10) {
    return 'low_stock';
  }
  return offering.availabilityStatus || 'available';
}

/**
 * Helper to enrich a MasterProduct with a specific ShopProductOffering into the backward-compatible Product model.
 */
export function enrichProductFromOffering(
  master: MasterProduct,
  offering: ShopProductOffering,
  allOfferingsForMaster: ShopProductOffering[] = []
): Product {
  const status = resolveAvailabilityStatus(offering);
  const stale = isStockStale(offering.stockUpdatedAt);

  return {
    ...master,
    offeringId: offering.id,
    retailPrice: offering.sellingPrice,
    originalPrice: offering.mrp,
    purchaseCost: offering.purchaseCost,
    inStock: status === 'available' || status === 'low_stock',
    stockQuantity: offering.stockQuantity,
    availabilityStatus: status,
    stockUpdatedAt: offering.stockUpdatedAt,
    isStaleInventory: stale,
    merchantId: offering.merchantId,
    merchantName: offering.merchantName,
    minWholesaleQty: offering.minWholesaleQty,
    bulkTiers: offering.wholesaleTiers,
    rating: offering.rating,
    reviewCount: offering.reviewCount,
    allOfferings: allOfferingsForMaster.filter(o => o.id !== offering.id)
  };
}

/**
 * Composite PRODUCTS list for default browsing.
 * For each master product, resolves the default offering (or matches store filter if specified).
 */
export function buildCompositeProducts(selectedStoreId?: string): Product[] {
  return MASTER_PRODUCTS.map(master => {
    const offerings = SHOP_OFFERINGS.filter(o => o.masterProductId === master.id && o.visibilityStatus === 'active');
    
    // If a store is selected, prefer its offering; otherwise take the first offering
    let selectedOffering = offerings[0];
    if (selectedStoreId) {
      const match = offerings.find(o => o.merchantId === selectedStoreId);
      if (match) selectedOffering = match;
    }

    if (!selectedOffering) {
      // Fallback empty offering if none defined
      selectedOffering = {
        id: `off-default-${master.id}`,
        masterProductId: master.id,
        merchantId: 'store-sharma-kirana',
        merchantName: 'Sharmaji Kirana & Superstore',
        sellingPrice: 100,
        mrp: 100,
        stockQuantity: 0,
        stockUpdatedAt: new Date().toISOString(),
        availabilityStatus: 'unavailable',
        fulfilmentOptions: ['standard'],
        visibilityStatus: 'active',
        rating: 4.5,
        reviewCount: 10
      };
    }

    return enrichProductFromOffering(master, selectedOffering, offerings);
  });
}

/**
 * Global default products array (preserves exact backward compatibility with existing code)
 */
export const PRODUCTS: Product[] = buildCompositeProducts();
