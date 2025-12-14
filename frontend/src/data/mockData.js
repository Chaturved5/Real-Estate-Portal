

export const properties = [
  {
    id: 'P-1001',
    title: 'Modern Downtown Apartment',
    city: 'Mumbai',
    location: 'Bandra West',
    type: 'apartment',
    price: 45000000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1650,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop'
    ],
    amenities: ['Swimming Pool', 'Gym', '24x7 Security', 'Power Backup'],
    ownerId: 'U-2001',
    agentId: 'A-3001',
    rating: 4.7,
    highlights: ['Sea-facing balcony', 'Smart home automation', 'Reserved parking'],
    reviews: [
      {
        id: 'R-5001',
        userId: 'BUY-4001',
        userName: 'Anita Sharma',
        rating: 5,
        comment: 'Loved the view and the society amenities. The agent was very responsive.',
        createdAt: '2025-08-18'
      },
      {
        id: 'R-5002',
        userId: 'U-4002',
        userName: 'Rahul Verma',
        rating: 4,
        comment: 'Great location, slightly premium pricing but worth it for the connectivity.',
        createdAt: '2025-07-02'
      }
    ]
  },
  {
    id: 'P-1002',
    title: 'Luxury Villa with Private Garden',
    city: 'Bangalore',
    location: 'Whitefield',
    type: 'villa',
    price: 85000000,
    bedrooms: 4,
    bathrooms: 5,
    area: 4200,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop'
    ],
    amenities: ['Private Garden', 'Home Theater', 'Security Cameras', 'Solar Panels'],
    ownerId: 'U-2002',
    agentId: 'A-3002',
    rating: 4.8,
    highlights: ['Corner plot', 'Pet-friendly community', 'Dedicated caretaker room'],
    reviews: [
      {
        id: 'R-5003',
        userId: 'U-4003',
        userName: 'Sneha Patil',
        rating: 5,
        comment: 'Spacious rooms and beautiful landscaping. The booking process felt very secure.',
        createdAt: '2025-09-30'
      }
    ]
  },
  {
    id: 'P-1003',
    title: 'Cozy Studio Apartment',
    city: 'Pune',
    location: 'Koregaon Park',
    type: 'studio',
    price: 25000000,
    bedrooms: 1,
    bathrooms: 1,
    area: 750,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop'
    ],
    amenities: ['High-speed Internet', 'Modular Kitchen', 'Housekeeping'],
    ownerId: 'U-2003',
    agentId: 'A-3003',
    rating: 4.2,
    highlights: ['Walkable to cafes', 'Fully furnished', 'Ideal for young professionals'],
    reviews: []
  },
  {
    id: 'P-1004',
    title: 'Penthouse with Skyline View',
    city: 'Delhi',
    location: 'Connaught Place',
    type: 'penthouse',
    price: 120000000,
    bedrooms: 5,
    bathrooms: 6,
    area: 5200,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1512914890250-353c63d6dc07?w=1200&h=800&fit=crop'
    ],
    amenities: ['Infinity Pool', 'Rooftop Deck', 'Concierge Service', 'Smart Security'],
    ownerId: 'U-2004',
    agentId: 'A-3004',
    rating: 4.9,
    highlights: ['360° skyline view', 'Private elevator', 'Luxury interiors'],
    reviews: []
  },
  {
    id: 'P-1005',
    title: 'Lakefront Family Home',
    city: 'Hyderabad',
    location: 'Gachibowli',
    type: 'villa',
    price: 68000000,
    bedrooms: 4,
    bathrooms: 4,
    area: 3800,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=800&fit=crop'
    ],
    amenities: ['Lake View', 'Clubhouse Access', 'Kids Play Area', 'EV Charging'],
    ownerId: 'U-2005',
    agentId: 'A-3002',
    rating: 4.5,
    highlights: ['Facing central lake', 'Community events', 'Energy-efficient design'],
    reviews: []
  },
  {
    id: 'P-1006',
    title: 'Corporate Lease Ready Office Floors',
    city: 'Mumbai',
    location: 'BKC',
    type: 'commercial',
    price: 220000000,
    bedrooms: 0,
    bathrooms: 8,
    area: 9800,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop'
    ],
    amenities: ['Work Café', 'Conference Suites', 'High-speed Elevators', 'Ample Parking'],
    ownerId: 'U-2006',
    agentId: 'A-3005',
    rating: 4.3,
    highlights: ['Grade A building', 'LEED Gold certified', 'Move-in ready'],
    reviews: []
  }
]

export const users = [
  { id: 'U-2001', name: 'Neeraj Mehta', role: 'owner', email: 'neeraj@estateportal.com' },
  { id: 'U-2002', name: 'Farah Qureshi', role: 'owner', email: 'farah@estateportal.com' },
  { id: 'U-2003', name: 'Jatin Rai', role: 'owner', email: 'jatin@estateportal.com' },
  { id: 'U-2004', name: 'Preeti Malhotra', role: 'owner', email: 'preeti@estateportal.com' },
  { id: 'U-2005', name: 'Kiran Thomas', role: 'owner', email: 'kiran@estateportal.com' },
  { id: 'U-2006', name: 'Divya Sajnani', role: 'owner', email: 'divya@estateportal.com' },
  { id: 'A-3001', name: 'Rohan Kapoor', role: 'agent', email: 'rohan@estateportal.com', phone: '+91 90000 12345' },
  { id: 'A-3002', name: 'Sana Varma', role: 'agent', email: 'sana@estateportal.com', phone: '+91 90000 67890' },
  { id: 'A-3003', name: 'Deepak Rao', role: 'agent', email: 'deepak@estateportal.com', phone: '+91 90000 34567' },
  { id: 'A-3004', name: 'Ishita Bose', role: 'agent', email: 'ishita@estateportal.com', phone: '+91 90000 98765' },
  { id: 'A-3005', name: 'Vikram Sinha', role: 'agent', email: 'vikram@estateportal.com', phone: '+91 90000 24680' }
]

export const bookings = [
  {
    id: 'B-7001',
    propertyId: 'P-1001',
    userId: 'BUY-4001',
    status: 'confirmed',
    startDate: '2025-11-12',
    endDate: '2025-11-15',
    amount: 250000,
    paymentId: 'PAY-9001'
  },
  {
    id: 'B-7002',
    propertyId: 'P-1002',
    userId: 'U-4003',
    status: 'pending',
    startDate: '2025-12-01',
    endDate: '2025-12-10',
    amount: 450000,
    paymentId: null
  }
]

export const payments = [
  {
    id: 'PAY-9001',
    bookingId: 'B-7001',
    amount: 250000,
    method: 'Razorpay',
    status: 'captured',
    createdAt: '2025-10-28'
  }
]
