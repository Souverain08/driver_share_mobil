
export type UserRole = 'client' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance: number;
}

export type CarType = 'SUV' | 'Berline' | 'Pickup' | 'Citadine' | 'Sport' | 'Luxe';
export type RentalType = 'classic' | 'marketplace';

export interface Car {
  id: string;
  ownerId: string;
  type: RentalType;
  category: CarType;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  city: string;
  description: string;
  images: string[];
  available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  carId: string;
  clientId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  carId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
