// Mock data for Al-Shat Al-Aqari real estate platform

export interface Listing {
  id: string;
  office_id: string;
  city_id: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  description: string;
  images: string[];
  quality_score: number;
  status: 'active' | 'pending' | 'sold';
  source_site: string;
  address: string;
  features: string[];
  created_at: string;
}

export interface Office {
  id: string;
  name: string;
  city_id: string;
  subscription_id: string;
  slug: string;
  verified: boolean;
  phone: string;
  email: string;
  logo_url: string;
  rating: number;
  total_listings: number;
}

export interface DemandRequest {
  id: string;
  buyer_id: string;
  buyer_name: string;
  city_id: string;
  budget_min: number;
  budget_max: number;
  property_type: string;
  bedrooms_min: number;
  intent_level: 'browsing' | 'serious' | 'urgent';
  validation_status: 'pending' | 'validated' | 'rejected';
  created_at: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  // listings use a flexible shape — backend returns { license, short_title, summary, description }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listings?: any[];
  hasNoDemandCTA?: boolean;
}

export interface Negotiation {
  id: string;
  listing_id: string;
  buyer_id: string;
  office_id: string;
  status: 'active' | 'accepted' | 'rejected' | 'countered';
  current_offer: number;
  listing_price: number;
  history: {
    offer: number;
    party: 'buyer' | 'seller';
    timestamp: string;
    message?: string;
  }[];
}

export interface VisitRequest {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  office_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmed_at?: string;
  notes?: string;
}

export interface Campaign {
  id: string;
  office_id: string;
  listing_id: string;
  name: string;
  audience_filter: string;
  scheduled_at: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sent_count: number;
  click_count: number;
  lead_count: number;
}

export const mockCities = [
  { id: '1', name: 'Riyadh' },
  { id: '2', name: 'Jeddah' },
  { id: '3', name: 'Dammam' },
  { id: '4', name: 'Mecca' },
  { id: '5', name: 'Medina' },
];

export const mockOffices: Office[] = [
  {
    id: 'office-1',
    name: 'Prime Real Estate',
    city_id: '1',
    subscription_id: 'sub-1',
    slug: 'prime-real-estate',
    verified: true,
    phone: '+966 50 123 4567',
    email: 'contact@primerealestate.sa',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    rating: 4.8,
    total_listings: 45,
  },
  {
    id: 'office-2',
    name: 'Golden Key Properties',
    city_id: '2',
    subscription_id: 'sub-2',
    slug: 'golden-key-properties',
    verified: true,
    phone: '+966 50 987 6543',
    email: 'info@goldenkey.sa',
    logo_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=200',
    rating: 4.6,
    total_listings: 32,
  },
  {
    id: 'office-3',
    name: 'Elite Homes',
    city_id: '1',
    subscription_id: 'sub-3',
    slug: 'elite-homes',
    verified: true,
    phone: '+966 50 555 7890',
    email: 'sales@elitehomes.sa',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    rating: 4.9,
    total_listings: 28,
  },
];

export const mockListings: Listing[] = [
  {
    id: 'listing-1',
    office_id: 'office-1',
    city_id: '1',
    price: 1250000,
    area: 350,
    bedrooms: 4,
    bathrooms: 3,
    property_type: 'Villa',
    description: 'Luxury villa in North Riyadh with modern design, spacious living areas, private garden, and state-of-the-art amenities. Perfect for families seeking comfort and elegance.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    quality_score: 95,
    status: 'active',
    source_site: 'aqar.com',
    address: 'Al Yasmin District, North Riyadh',
    features: ['Private Garden', 'Maid Room', 'Driver Room', 'Central AC', 'Smart Home'],
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'listing-2',
    office_id: 'office-1',
    city_id: '1',
    price: 850000,
    area: 280,
    bedrooms: 3,
    bathrooms: 2,
    property_type: 'Apartment',
    description: 'Modern apartment in prestigious area with stunning city views, high-quality finishes, and excellent location near schools and shopping centers.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    quality_score: 88,
    status: 'active',
    source_site: 'bayut.com',
    address: 'King Fahd Road, Riyadh',
    features: ['City View', 'Gym', 'Pool', 'Security', 'Parking'],
    created_at: '2026-03-12T14:30:00Z',
  },
  {
    id: 'listing-3',
    office_id: 'office-2',
    city_id: '2',
    price: 2100000,
    area: 450,
    bedrooms: 5,
    bathrooms: 4,
    property_type: 'Villa',
    description: 'Spectacular waterfront villa in North Jeddah with panoramic sea views, private beach access, infinity pool, and luxury finishes throughout.',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    ],
    quality_score: 98,
    status: 'active',
    source_site: 'aqar.com',
    address: 'Al Shati District, North Jeddah',
    features: ['Sea View', 'Private Beach', 'Pool', 'Garden', 'Elevator', 'Smart Home'],
    created_at: '2026-03-08T09:15:00Z',
  },
  {
    id: 'listing-4',
    office_id: 'office-3',
    city_id: '1',
    price: 650000,
    area: 200,
    bedrooms: 2,
    bathrooms: 2,
    property_type: 'Apartment',
    description: 'Cozy apartment ideal for young professionals or small families. Features modern kitchen, balcony, and close proximity to public transportation.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ],
    quality_score: 82,
    status: 'active',
    source_site: 'bayut.com',
    address: 'Al Malqa District, Riyadh',
    features: ['Balcony', 'Parking', 'Near Metro', 'Security'],
    created_at: '2026-03-13T11:00:00Z',
  },
  {
    id: 'listing-5',
    office_id: 'office-2',
    city_id: '2',
    price: 1450000,
    area: 320,
    bedrooms: 4,
    bathrooms: 3,
    property_type: 'Duplex',
    description: 'Elegant duplex with contemporary design, spacious rooms, and premium location. Features include rooftop terrace and modern amenities.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    quality_score: 91,
    status: 'active',
    source_site: 'aqar.com',
    address: 'Al Rawdah District, Jeddah',
    features: ['Rooftop', 'Central AC', 'Parking', 'Storage', 'Security'],
    created_at: '2026-03-11T16:45:00Z',
  },
];

export const mockDemandRequests: DemandRequest[] = [
  {
    id: 'demand-1',
    buyer_id: 'buyer-1',
    buyer_name: 'Ahmed Al-Rashid',
    city_id: '1',
    budget_min: 800000,
    budget_max: 1500000,
    property_type: 'Villa',
    bedrooms_min: 3,
    intent_level: 'serious',
    validation_status: 'validated',
    created_at: '2026-03-13T10:30:00Z',
    notes: 'Looking for a villa in North Riyadh with a garden for my family',
  },
  {
    id: 'demand-2',
    buyer_id: 'buyer-2',
    buyer_name: 'Sara Mohammed',
    city_id: '2',
    budget_min: 600000,
    budget_max: 900000,
    property_type: 'Apartment',
    bedrooms_min: 2,
    intent_level: 'urgent',
    validation_status: 'validated',
    created_at: '2026-03-14T09:15:00Z',
    notes: 'Need to relocate soon, prefer near corniche area',
  },
];

export const mockVisitRequests: VisitRequest[] = [
  {
    id: 'visit-1',
    listing_id: 'listing-1',
    buyer_id: 'buyer-1',
    buyer_name: 'Ahmed Al-Rashid',
    office_id: 'office-1',
    scheduled_at: '2026-03-16T15:00:00Z',
    status: 'confirmed',
    confirmed_at: '2026-03-14T12:00:00Z',
    notes: 'Interested in the garden size',
  },
  {
    id: 'visit-2',
    listing_id: 'listing-3',
    buyer_id: 'buyer-3',
    buyer_name: 'Khalid Bin Salman',
    office_id: 'office-2',
    scheduled_at: '2026-03-17T10:00:00Z',
    status: 'pending',
  },
];

export const mockNegotiations: Negotiation[] = [
  {
    id: 'neg-1',
    listing_id: 'listing-1',
    buyer_id: 'buyer-1',
    office_id: 'office-1',
    status: 'active',
    current_offer: 1150000,
    listing_price: 1250000,
    history: [
      {
        offer: 1100000,
        party: 'buyer',
        timestamp: '2026-03-13T14:00:00Z',
        message: 'Initial offer',
      },
      {
        offer: 1200000,
        party: 'seller',
        timestamp: '2026-03-13T16:30:00Z',
        message: 'Counter offer - can go down a bit',
      },
      {
        offer: 1150000,
        party: 'buyer',
        timestamp: '2026-03-14T09:00:00Z',
        message: 'Final offer',
      },
    ],
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    office_id: 'office-1',
    listing_id: 'listing-1',
    name: 'Luxury Villa Campaign',
    audience_filter: 'budget: 1M-2M, city: Riyadh',
    scheduled_at: '2026-03-15T08:00:00Z',
    status: 'active',
    sent_count: 245,
    click_count: 78,
    lead_count: 12,
  },
  {
    id: 'camp-2',
    office_id: 'office-1',
    listing_id: 'listing-2',
    name: 'Modern Apartment Promotion',
    audience_filter: 'budget: 600K-1M, property: Apartment',
    scheduled_at: '2026-03-16T10:00:00Z',
    status: 'draft',
    sent_count: 0,
    click_count: 0,
    lead_count: 0,
  },
];

// Helper functions for mock API responses
export const formatPrice = (price: number): string => {
  return `${(price / 1000).toFixed(0)}K SAR`;
};

export const getCityName = (cityId: string): string => {
  return mockCities.find(c => c.id === cityId)?.name || 'Unknown';
};

export const getOfficeName = (officeId: string): string => {
  return mockOffices.find(o => o.id === officeId)?.name || 'Unknown Office';
};
