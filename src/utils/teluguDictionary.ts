/**
 * NationX Project 02: Telugu Localization Dictionary (§12)
 * 
 * Provides bilingual support (English & Telugu) for grocery categories, 
 * staple commodities, units, order statuses, and common interface tokens.
 */

export const TELUGU_CATEGORY_MAP: Record<string, string> = {
  'Staples & Grains': 'దినుసులు మరియు ధాన్యాలు',
  'Staples': 'నిత్యావసర సరుకులు',
  'Fresh Vegetables': 'తాజా కూరగాయలు',
  'Fresh Fruits': 'తాజా పండ్లు',
  'Dairy, Bread & Eggs': 'పాల ఉత్పత్తులు, రొట్టె & గుడ్లు',
  'Edible Oils & Ghee': 'వంట నూనెలు & నెయ్యి',
  'Spices & Masalas': 'మసాలా దినుసులు',
  'Snacks & Beverages': 'స్నాక్స్ & పానీయాలు',
  'Organic Depot': 'సేంద్రీయ ఉత్పత్తులు',
  'Household & Cleaning': 'ఇంటి శుభ్రత సామగ్రి',
};

export const TELUGU_COMMODITY_MAP: Record<string, string> = {
  'Sona Masoori Rice': 'సోనా మసూరి బియ్యం',
  'Toor Dal': 'కందిపప్పు',
  'Moong Dal': 'పెసరపప్పు',
  'Urad Dal': 'మినప్పప్పు',
  'Chana Dal': 'శనగపప్పు',
  'Wheat Flour (Atta)': 'గోధుమ పిండి',
  'Sunflower Oil': 'సూర్యకాంతి నూనె',
  'Groundnut Oil': 'వేరుశనగ నూనె',
  'Pure Ghee': 'స్వచ్ఛమైన నెయ్యి',
  'Sugar': 'చక్కెర',
  'Jaggery': 'బెల్లం',
  'Turmeric Powder': 'పసుపు పొడి',
  'Red Chilli Powder': 'కారం పొడి',
  'Coriander Powder': 'ధనియాల పొడి',
  'Mustard Seeds': 'ఆవాలు',
  'Cumin Seeds': 'జీలకర్ర',
  'Onion': 'ఉల్లిపాయలు',
  'Tomato': 'టమాటాలు',
  'Potato': 'బంగాళాదుంపలు',
  'Ginger': 'అల్లం',
  'Garlic': 'వెల్లుల్లి',
};

export const TELUGU_UNIT_MAP: Record<string, string> = {
  kg: 'కిలో',
  g: 'గ్రాములు',
  L: 'లీటర్',
  ml: 'మి.లీ',
  packet: 'ప్యాకెట్',
  pack: 'ప్యాక్',
  bunch: 'కట్ట',
  piece: 'ముక్క / యూనిట్',
  box: 'పెట్టె',
};

export const TELUGU_ORDER_STATUS_MAP: Record<string, string> = {
  placed: 'ఆర్డర్ నమోదు చేయబడింది',
  confirmed: 'దుకాణదారుడు ఆమోదించారు',
  packing: 'సామగ్రి సిద్ధం చేస్తున్నారు',
  awaiting_substitution_approval: 'మార్పు కోసం మీ ఆమోదం కావాలి',
  ready_for_pickup: 'డెలివరీ కోసం సిద్ధంగా ఉంది',
  out_for_delivery: 'డెలివరీ బయలుదేరింది',
  delivered: 'విజయవంతంగా డెలివరీ పూర్తయింది',
  cancelled: 'ఆర్డర్ రద్దు చేయబడింది',
  rejected: 'దుకాణదారుడు తిరస్కరించారు',
};

/**
 * Returns Telugu translation or original text if unavailable
 */
export function getTeluguText(key: string, category: 'category' | 'commodity' | 'unit' | 'status'): string {
  switch (category) {
    case 'category':
      return TELUGU_CATEGORY_MAP[key] || key;
    case 'commodity':
      return TELUGU_COMMODITY_MAP[key] || key;
    case 'unit':
      return TELUGU_UNIT_MAP[key] || key;
    case 'status':
      return TELUGU_ORDER_STATUS_MAP[key] || key;
    default:
      return key;
  }
}
