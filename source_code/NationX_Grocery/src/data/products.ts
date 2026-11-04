import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-aashirvaad-sharbati',
    name: 'Aashirvaad Select 100% MP Sharbati Whole Wheat Atta',
    hindiName: 'आशीर्वाद सेलेक्ट शरबती गेहूं आटा',
    brand: 'Aashirvaad',
    category: 'staples-atta',
    subCategory: 'Whole Wheat Atta',
    unit: '5 kg',
    packSize: '5 kg pouch',
    retailPrice: 345,
    originalPrice: 385,
    // Real wheat flour & golden grain sack
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 1420,
    inStock: true,
    stockQuantity: 48,
    isBestseller: true,
    isGiTagged: true,
    origin: 'Sehore, Madhya Pradesh',
    description: 'Made from the golden grains of Sehore, Madhya Pradesh, known for its sweet taste and extra soft rotis that stay tender for hours.',
    nutrition: {
      energy: '364 kcal / 100g',
      protein: '11.8 g',
      carbs: '74.2 g',
      fat: '1.7 g'
    },
    tags: ['Rotis', '100% Sharbati', 'Preservative Free', 'Chakki Fresh'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    minWholesaleQty: 5,
    bulkTiers: [
      { minQty: 5, pricePerUnit: 315, discountPercent: 8, label: 'Small Kirana / Family Pack (5+ bags)' },
      { minQty: 15, pricePerUnit: 295, discountPercent: 14, label: 'Restaurant & Catering Tier (15+ bags)' },
      { minQty: 40, pricePerUnit: 275, discountPercent: 20, label: 'Wholesale Pallet Tier (40+ bags)' }
    ],
    badge: 'Bestseller'
  },
  {
    id: 'prod-india-gate-classic',
    name: 'India Gate Classic Aged Basmati Rice',
    hindiName: 'इंडिया गेट क्लासिक बासमती चावल (2 वर्ष पुराना)',
    brand: 'India Gate',
    category: 'rice-pulses',
    subCategory: 'Basmati Rice',
    unit: '5 kg',
    packSize: '5 kg Zip Bag',
    retailPrice: 790,
    originalPrice: 920,
    // Real extra-long slender basmati grains
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 980,
    inStock: true,
    stockQuantity: 65,
    isBestseller: true,
    origin: 'Terai Foothills, Punjab',
    description: 'Extra-long pearl slender grains, aged for two full years to perfection. Perfect for dum biryanis, pulao and royal feasts.',
    nutrition: {
      energy: '350 kcal / 100g',
      protein: '8.4 g',
      carbs: '78.0 g',
      fat: '0.5 g'
    },
    tags: ['Aged 2 Years', 'Biryani Special', 'Non-Sticky', 'Export Quality'],
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    minWholesaleQty: 4,
    bulkTiers: [
      { minQty: 4, pricePerUnit: 730, discountPercent: 7, label: 'Bulk Caterer (4+ packs)' },
      { minQty: 10, pricePerUnit: 685, discountPercent: 13, label: 'Commercial Kitchen (10+ packs)' },
      { minQty: 25, pricePerUnit: 640, discountPercent: 19, label: 'Mandi Wholesale (25+ packs)' }
    ],
    badge: 'Chef Choice'
  },
  {
    id: 'prod-tata-sampann-toor',
    name: 'Tata Sampann Unpolished High-Protein Toor Dal',
    hindiName: 'टाटा सम्पन्न अनपॉलिश्ड अरहर / तुवर दाल',
    brand: 'Tata Sampann',
    category: 'rice-pulses',
    subCategory: 'Dals & Pulses',
    unit: '1 kg',
    packSize: '1 kg Standup Pouch',
    retailPrice: 172,
    originalPrice: 195,
    // Real yellow toor lentils / pulses
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 650,
    inStock: true,
    stockQuantity: 90,
    isOrganic: true,
    origin: 'Latur, Maharashtra',
    description: 'Unpolished grains that do not undergo artificial water, oil or stone polish, retaining natural wholesome nutrition and rich protein content.',
    nutrition: {
      energy: '343 kcal / 100g',
      protein: '22.0 g',
      carbs: '62.0 g',
      fat: '1.5 g'
    },
    tags: ['Unpolished', 'Chef Sanjeev Kapoor Certified', 'High Protein'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    minWholesaleQty: 10,
    bulkTiers: [
      { minQty: 10, pricePerUnit: 155, discountPercent: 10, label: 'Kirana Carton (10x 1kg)' },
      { minQty: 30, pricePerUnit: 142, discountPercent: 17, label: 'Hostel & Mess Bulk (30x 1kg)' },
      { minQty: 60, pricePerUnit: 135, discountPercent: 21, label: 'Wholesale Depot (60x 1kg)' }
    ]
  },
  {
    id: 'prod-organic-bilona-ghee',
    name: 'Pure Desi Gir Cow A2 Vedic Bilona Ghee',
    hindiName: 'शुद्ध देसी गिर गाय ए2 वैदिक बिलोना घी',
    brand: 'Vedic Sattva',
    category: 'oils-ghee',
    subCategory: 'Pure Ghee',
    unit: '1 L',
    packSize: '1000 ml Glass Jar',
    retailPrice: 1450,
    originalPrice: 1750,
    // Real golden clarified butter / desi ghee in glass jar
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=700&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 410,
    inStock: true,
    stockQuantity: 24,
    isOrganic: true,
    isLocalFarm: true,
    origin: 'Gir Sanctuary Pastures, Gujarat',
    description: 'Traditional curd-churned Bilona method using wooden churners from free-grazing indigenous Gir cows. Golden granular aroma rich in Omega-3.',
    nutrition: {
      energy: '900 kcal / 100g',
      protein: '0 g',
      carbs: '0 g',
      fat: '99.8 g'
    },
    tags: ['A2 Gir Cow', 'Vedic Bilona', 'Glass Jar', 'Granular Danedar'],
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    minWholesaleQty: 3,
    bulkTiers: [
      { minQty: 3, pricePerUnit: 1320, discountPercent: 9, label: 'Ayurvedic Practitioner Tier (3+ jars)' },
      { minQty: 8, pricePerUnit: 1220, discountPercent: 16, label: 'Wellness Center Pack (8+ jars)' },
      { minQty: 20, pricePerUnit: 1100, discountPercent: 24, label: 'Direct Dairy Partner (20+ jars)' }
    ],
    badge: 'Super Premium'
  },
  {
    id: 'prod-fortune-mustard-oil',
    name: 'Fortune Kachi Ghani Pure Mustard Oil Tin',
    hindiName: 'फॉर्च्यून कच्ची घानी सरसों का तेल (टिन)',
    brand: 'Fortune',
    category: 'oils-ghee',
    subCategory: 'Cooking Oils',
    unit: '5 L',
    packSize: '5 Litre Metal Canister',
    retailPrice: 760,
    originalPrice: 850,
    // Real edible mustard oil
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 830,
    inStock: true,
    stockQuantity: 38,
    origin: 'Alwar, Rajasthan',
    description: 'First press pungent mustard oil extracted from the finest mustard seeds. Enhances taste of pickles, curries and traditional frying.',
    nutrition: {
      energy: '900 kcal / 100g',
      protein: '0 g',
      carbs: '0 g',
      fat: '100 g'
    },
    tags: ['Cold Pressed', 'Natural Antioxidants', 'Pungent Taste'],
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    minWholesaleQty: 4,
    bulkTiers: [
      { minQty: 4, pricePerUnit: 710, discountPercent: 6, label: 'Case of 4 Tins (20 L)' },
      { minQty: 10, pricePerUnit: 670, discountPercent: 12, label: 'Halwai / Restaurant Box (50 L)' },
      { minQty: 25, pricePerUnit: 630, discountPercent: 17, label: 'Commercial Wholesale Mandi (125 L)' }
    ]
  },
  {
    id: 'prod-malabar-black-pepper',
    name: 'Wayand Estate Handpicked Tellicherry Garbled Extra Bold Pepper (TGSEB)',
    hindiName: 'वायनाड काली मिर्च (बोल्ड दाना)',
    brand: 'Malabar Spices',
    category: 'spices-masala',
    subCategory: 'Whole Spices',
    unit: '500 g',
    packSize: '500 g Airtight Pouch',
    retailPrice: 520,
    originalPrice: 620,
    // Real bold black peppercorns
    image: 'https://images.unsplash.com/photo-1599909682705-7f9185a539eb?w=700&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 310,
    inStock: true,
    stockQuantity: 45,
    isGiTagged: true,
    origin: 'Wayanad, Kerala',
    description: 'The highest grade of black pepper in the world: berry diameter > 4.75mm with intense piperine pungency and citrus undertones.',
    nutrition: {
      energy: '255 kcal / 100g',
      protein: '10.9 g',
      carbs: '64.8 g',
      fat: '3.3 g'
    },
    tags: ['Tellicherry Bold', 'GI Tagged', 'Direct from Planter'],
    merchantId: 'store-lakshmi-kirana',
    merchantName: 'Sri Lakshmi Provision & Spice Corner',
    minWholesaleQty: 6,
    bulkTiers: [
      { minQty: 6, pricePerUnit: 460, discountPercent: 11, label: 'Gourmet Caterer (3 kg)' },
      { minQty: 15, pricePerUnit: 420, discountPercent: 19, label: 'Spice Blending Workshop (7.5 kg)' },
      { minQty: 30, pricePerUnit: 380, discountPercent: 27, label: 'Exporter & Trader Sacks (15 kg)' }
    ],
    badge: 'Export Grade'
  },
  {
    id: 'prod-california-almonds',
    name: 'Premium California Inshell / Non-Pareil Almonds',
    hindiName: 'कैलिफ़ोर्निया बादाम गिरी (सुपर क्रंची)',
    brand: 'Royal Dry Fruit Co.',
    category: 'dry-fruits',
    subCategory: 'Almonds',
    unit: '1 kg',
    packSize: '1 kg Vacuum Pack',
    retailPrice: 890,
    originalPrice: 1050,
    // Real whole raw almonds
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=700&auto=format&fit=crop&q=80',
    rating: 4.85,
    reviewCount: 520,
    inStock: true,
    stockQuantity: 50,
    isBestseller: true,
    origin: 'Central Valley, California',
    description: 'Evenly sized, 100% natural raw whole almonds with crisp crunch and high dietary fiber and Vitamin E.',
    nutrition: {
      energy: '579 kcal / 100g',
      protein: '21.2 g',
      carbs: '21.6 g',
      fat: '49.9 g'
    },
    tags: ['High Protein', 'Zero Cholesterol', 'Vacuum Sealed'],
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    minWholesaleQty: 5,
    bulkTiers: [
      { minQty: 5, pricePerUnit: 810, discountPercent: 9, label: 'Sweet Maker Mini Pack (5 kg)' },
      { minQty: 12, pricePerUnit: 750, discountPercent: 15, label: 'Bakery & Mithai Bulk (12 kg carton)' },
      { minQty: 30, pricePerUnit: 690, discountPercent: 22, label: 'Dry Fruit Trader Pallet (30 kg)' }
    ]
  },
  {
    id: 'prod-farm-shimla-apples',
    name: 'Orchard Fresh Crisp Royal Delicious Shimla Apples',
    hindiName: 'ताज़ा सेब (शिमला बागानों से)',
    brand: 'Himalayan Orchards',
    category: 'farm-produce',
    subCategory: 'Fresh Fruits',
    unit: '1 kg',
    packSize: '4-5 pcs per kg tray',
    retailPrice: 190,
    originalPrice: 240,
    // Real red crisp apples
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=700&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewCount: 390,
    inStock: true,
    stockQuantity: 70,
    isLocalFarm: true,
    origin: 'Kotgarh Valley, Himachal Pradesh',
    description: 'Hand-plucked crispy apples from 7,000 feet altitude orchards, unwaxed, sweet, juicy and naturally blushing red.',
    tags: ['Unwaxed', 'Direct Orchard', 'Rich Antioxidants'],
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    minWholesaleQty: 10,
    bulkTiers: [
      { minQty: 10, pricePerUnit: 165, discountPercent: 13, label: 'Juice Bar / Fresh Cart (10 kg crate)' },
      { minQty: 25, pricePerUnit: 145, discountPercent: 23, label: 'Fruit Retailer Wooden Crate (25 kg)' }
    ]
  },
  {
    id: 'prod-amul-malai-paneer',
    name: 'Amul Fresh Malai Paneer Block',
    hindiName: 'अमुल फ्रेश मलाई पनीर ब्लॉक',
    brand: 'Amul',
    category: 'dairy-bakery',
    subCategory: 'Paneer & Dairy',
    unit: '1 kg',
    packSize: '1 kg Vacuum Brick',
    retailPrice: 420,
    originalPrice: 460,
    // Real fresh paneer / cottage cheese block
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 1100,
    inStock: true,
    stockQuantity: 40,
    origin: 'Anand, Gujarat',
    description: 'Soft, succulent paneer made from pure cow and buffalo milk curd. Ideal for tikka grills, shahi gravies and salads.',
    nutrition: {
      energy: '314 kcal / 100g',
      protein: '19.5 g',
      carbs: '4.5 g',
      fat: '25.0 g'
    },
    tags: ['Fresh Daily', 'Pure Milk', 'High Calcium'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    minWholesaleQty: 5,
    bulkTiers: [
      { minQty: 5, pricePerUnit: 380, discountPercent: 9, label: 'Restaurant Daily Kitchen (5 kg)' },
      { minQty: 15, pricePerUnit: 350, discountPercent: 16, label: 'Banquet & Party Catering (15 kg)' }
    ]
  },
  {
    id: 'prod-wholesale-sugar-50kg',
    name: 'Dhampur Pure Crystal Refined Sugar Commercial Gunny Sack',
    hindiName: 'धामपुर शुद्ध सल्फर-मुक्त चीनी बोरी (50 किलो)',
    brand: 'Dhampur Sugar',
    category: 'wholesale-sacks',
    subCategory: 'Sugar & Sweeteners',
    unit: '50 kg',
    packSize: '50 kg Jute / HDPE Gunny Sack',
    retailPrice: 2250,
    originalPrice: 2450,
    // Real white refined crystal sugar
    image: 'https://images.unsplash.com/photo-1622484212850-cab596d63c5a?w=700&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 290,
    inStock: true,
    stockQuantity: 120,
    origin: 'Bijnor Sugarcane Belt, Uttar Pradesh',
    description: 'Sulphur-free double-refined sparkling white sugar crystals, standardized for commercial bakeries, halwai sweetshops, and kirana bulk retail.',
    nutrition: {
      energy: '398 kcal / 100g',
      protein: '0 g',
      carbs: '99.8 g',
      fat: '0 g'
    },
    tags: ['50kg Gunny', 'Sulphur Free', 'Commercial Sweetshop Grade'],
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    minWholesaleQty: 2,
    bulkTiers: [
      { minQty: 2, pricePerUnit: 2150, discountPercent: 4, label: 'Small Bakery Tier (2-4 bags)' },
      { minQty: 5, pricePerUnit: 2040, discountPercent: 9, label: 'Sweet Mart Restock (5-10 bags)' },
      { minQty: 20, pricePerUnit: 1950, discountPercent: 13, label: 'Truckload Mandi Rate (20+ bags)' }
    ],
    badge: 'Wholesale Only'
  },
  {
    id: 'prod-sona-masoori-25kg',
    name: 'BPT 5204 Andhra Sona Masoori Raw Rice Sack',
    hindiName: 'आंध्र सोना मसूरी चावल बोरी (25 किलो)',
    brand: 'Kaveri Harvest',
    category: 'wholesale-sacks',
    subCategory: 'Raw Rice Sacks',
    unit: '25 kg',
    packSize: '25 kg Woven Sack',
    retailPrice: 1550,
    originalPrice: 1750,
    // Real rice grain sack
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=700&auto=format&fit=crop&q=80',
    rating: 4.75,
    reviewCount: 380,
    inStock: true,
    stockQuantity: 85,
    origin: 'Kurnool / Guntur, Andhra Pradesh',
    description: 'Lightweight, aromatic medium grain rice aged 12+ months. Easy to digest and the everyday staple of South Indian households and messes.',
    nutrition: {
      energy: '356 kcal / 100g',
      protein: '7.1 g',
      carbs: '79.2 g',
      fat: '0.6 g'
    },
    tags: ['Aged 12 Months', '25kg Sack', 'Everyday Rice'],
    merchantId: 'store-yeshwanthpur-wholesale',
    merchantName: 'Mandi Direct Wholesale Traders',
    minWholesaleQty: 2,
    bulkTiers: [
      { minQty: 2, pricePerUnit: 1470, discountPercent: 5, label: 'Hostel / Joint Family (2-4 bags)' },
      { minQty: 8, pricePerUnit: 1390, discountPercent: 10, label: 'Corporate Canteen Tier (8-19 bags)' },
      { minQty: 20, pricePerUnit: 1310, discountPercent: 15, label: 'Mandi Pallet Tier (20+ bags)' }
    ],
    badge: 'Wholesale Only'
  },
  {
    id: 'prod-kashmiri-kesar',
    name: 'Pampore Grade-1 Mogra Saffron (Kashmiri Kesar)',
    hindiName: 'कश्मीरी मुंगरा केसर (पंपोर ग्रेड-1)',
    brand: 'Kashmir Valley Organic',
    category: 'spices-masala',
    subCategory: 'Exotic Spices',
    unit: '2 g',
    packSize: '2 g Acrylic Safety Box',
    retailPrice: 650,
    originalPrice: 800,
    // Real crimson saffron threads
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=700&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 210,
    inStock: true,
    stockQuantity: 30,
    isGiTagged: true,
    origin: 'Pampore Plateau, Kashmir',
    description: '100% pure thick red stigma threads with high crocin content, delivering radiant saffron hue and deep royal aroma.',
    tags: ['GI Tagged Mogra', 'Lab Certified', 'Pampore Origin'],
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    minWholesaleQty: 5,
    bulkTiers: [
      { minQty: 5, pricePerUnit: 580, discountPercent: 10, label: 'Mithai Chef Pack (5 boxes)' },
      { minQty: 15, pricePerUnit: 510, discountPercent: 21, label: 'Wedding Caterer Tier (15 boxes)' }
    ]
  },
  {
    id: 'prod-tata-salt-iodized',
    name: 'Tata Salt Vacuum Evaporated Iodized Salt',
    hindiName: 'टाटा नमक (देश का नमक)',
    brand: 'Tata Salt',
    category: 'staples-atta',
    subCategory: 'Salt & Minerals',
    unit: '1 kg',
    packSize: '1 kg Pouch',
    retailPrice: 28,
    originalPrice: 30,
    // Real white table / sea salt
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=700&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 2400,
    inStock: true,
    stockQuantity: 200,
    origin: 'Mithapur, Gujarat',
    description: 'Purity guaranteed with vacuum evaporation technology. Wholesome iodine enrichment for cognitive health and everyday seasoning.',
    nutrition: {
      energy: '0 kcal',
      protein: '0 g',
      carbs: '0 g',
      fat: '0 g'
    },
    tags: ['Vacuum Evaporated', 'Iodized', 'Purity Assured'],
    merchantId: 'store-sharma-kirana',
    merchantName: 'Sharmaji Kirana & Superstore',
    minWholesaleQty: 25,
    bulkTiers: [
      { minQty: 25, pricePerUnit: 24, discountPercent: 14, label: 'Carton of 25kg (25x 1kg)' },
      { minQty: 100, pricePerUnit: 21, discountPercent: 25, label: 'Wholesale Depot Pallet (100x 1kg)' }
    ]
  },
  {
    id: 'prod-royal-cashews-w240',
    name: 'Royal Mangalore W240 King Size Whole Cashews',
    hindiName: 'शाही काजू डब्ल्यू 240 (बड़ा दाना)',
    brand: 'Royal Dry Fruit Co.',
    category: 'dry-fruits',
    subCategory: 'Cashews',
    unit: '1 kg',
    packSize: '1 kg Nitrogen Flush Tin',
    retailPrice: 1150,
    originalPrice: 1350,
    // Real white cashew nuts
    image: 'https://images.unsplash.com/photo-1536591375315-1b836814d609?w=700&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 420,
    inStock: true,
    stockQuantity: 40,
    origin: 'Mangalore Coastal Belt, Karnataka',
    description: 'Jumbo W240 grade whole cashew kernels, sweet, buttery, and crunch roasted without artificial additives.',
    nutrition: {
      energy: '553 kcal / 100g',
      protein: '18.2 g',
      carbs: '30.1 g',
      fat: '43.8 g'
    },
    tags: ['W240 Jumbo', 'Mangalore Origin', 'Nitrogen Flushed'],
    merchantId: 'store-annapurna-organic',
    merchantName: 'Annapurna Organic Depot & Farm Fresh',
    minWholesaleQty: 5,
    bulkTiers: [
      { minQty: 5, pricePerUnit: 1040, discountPercent: 10, label: 'Mithai Restock (5x 1kg)' },
      { minQty: 20, pricePerUnit: 940, discountPercent: 18, label: 'Commercial Sweetmaker Master Box (20 kg)' }
    ],
    badge: 'Royal Grade'
  }
];
