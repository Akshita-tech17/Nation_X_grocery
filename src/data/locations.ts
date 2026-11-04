export interface LocationInfo {
  city: string;
  area: string;
  pincode: string;
  eta: string;
}

export const POPULAR_LOCATIONS: LocationInfo[] = [
  { city: 'Bengaluru', area: 'Indiranagar 100ft Rd', pincode: '560038', eta: '18 mins' },
  { city: 'Bengaluru', area: 'Koramangala 4th Block', pincode: '560034', eta: '22 mins' },
  { city: 'Bengaluru', area: 'Jayanagar 4th T Block', pincode: '560011', eta: '25 mins' },
  { city: 'Bengaluru', area: 'Yeshwanthpur Wholesale Mandi', pincode: '560022', eta: '35 mins' },
  { city: 'Mumbai', area: 'Bandra West (Pali Hill)', pincode: '400050', eta: '20 mins' },
  { city: 'Delhi NCR', area: 'Connaught Place / CP', pincode: '110001', eta: '24 mins' }
];
