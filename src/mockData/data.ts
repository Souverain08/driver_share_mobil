import { User, Car, Booking, Review } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    role: 'client',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    balance: 1000,
  },
  {
    id: 'u2',
    name: 'Marie Lavoie',
    email: 'marie@example.com',
    role: 'owner',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    balance: 2500,
  },
  {
    id: 'u3',
    name: 'Admin DriveShare',
    email: 'admin@driveshare.com',
    role: 'owner', // Platform acts as owner for classic cars
    avatar: 'https://i.pravatar.cc/150?u=u3',
    balance: 50000,
  }
];

export const mockCars: Car[] = [
  {
    id: 'c1',
    ownerId: 'u3',
    type: 'classic',
    category: 'SUV',
    brand: 'Tesla',
    model: 'Model Y',
    year: 2023,
    pricePerDay: 120,
    city: 'Paris',
    description: 'SUV électrique spacieux et performant, idéal pour les longs trajets en famille.',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'
    ],
    available: true,
  },
  {
    id: 'c2',
    ownerId: 'u2',
    type: 'marketplace',
    category: 'Berline',
    brand: 'BMW',
    model: 'Série 3',
    year: 2021,
    pricePerDay: 85,
    city: 'Lyon',
    description: 'Berline élégante et dynamique, parfaite pour vos rendez-vous professionnels.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'
    ],
    available: true,
  },
  {
    id: 'c3',
    ownerId: 'u2',
    type: 'marketplace',
    category: 'Citadine',
    brand: 'Mini',
    model: 'Cooper',
    year: 2022,
    pricePerDay: 55,
    city: 'Paris',
    description: 'Petite voiture agile, idéale pour se garer facilement en centre-ville.',
    images: [
      'https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800'
    ],
    available: true,
  },
  {
    id: 'c4',
    ownerId: 'u3',
    type: 'classic',
    category: 'Pickup',
    brand: 'Ford',
    model: 'F-150 Lightning',
    year: 2023,
    pricePerDay: 150,
    city: 'Marseille',
    description: 'Puissant pickup électrique pour vos besoins de transport volumineux.',
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800'
    ],
    available: false,
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    carId: 'c1',
    clientId: 'u1',
    ownerId: 'u3',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    totalPrice: 240,
    status: 'completed',
    createdAt: '2024-02-15T10:00:00Z',
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    carId: 'c1',
    userId: 'u1',
    userName: 'Jean Dupont',
    rating: 5,
    comment: 'Superbe voiture, très propre et autonomie excellente !',
    date: '2024-03-04',
  }
];
