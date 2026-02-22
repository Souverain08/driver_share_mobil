import { useState, useEffect } from 'react';
import { User, Car, Booking, Review, UserRole } from '../types';
import { mockUsers, mockCars, mockBookings, mockReviews } from '../mockData/data';

class MockService {
  private users: User[] = [...mockUsers];
  private cars: Car[] = [...mockCars];
  private bookings: Booking[] = [...mockBookings];
  private reviews: Review[] = [...mockReviews];
  private currentUser: User | null = null;

  // Auth
  login(email: string): User | null {
    const user = this.users.find(u => u.email === email);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  register(name: string, email: string, role: UserRole): User {
    const newUser: User = {
      id: `u${this.users.length + 1}`,
      name,
      email,
      role,
      balance: 0,
      avatar: `https://i.pravatar.cc/150?u=u${this.users.length + 1}`
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  getCurrentUser() { return this.currentUser; }
  logout() { this.currentUser = null; }

  // Cars
  getCars(filters?: { city?: string; category?: string; availableOnly?: boolean }) {
    let results = [...this.cars];
    if (filters?.city) {
      results = results.filter(c => c.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters?.category) {
      results = results.filter(c => c.category === filters.category);
    }
    if (filters?.availableOnly) {
      results = results.filter(c => c.available);
    }
    return results;
  }

  getCarById(id: string) {
    return this.cars.find(c => c.id === id);
  }

  getOwnerCars(ownerId: string) {
    return this.cars.filter(c => c.ownerId === ownerId);
  }

  addCar(carData: Omit<Car, 'id' | 'available'>) {
    const newCar: Car = {
      ...carData,
      id: `c${this.cars.length + 1}`,
      available: true
    };
    this.cars.push(newCar);
    return newCar;
  }

  updateCar(id: string, updates: Partial<Car>) {
    const index = this.cars.findIndex(c => c.id === id);
    if (index !== -1) {
      this.cars[index] = { ...this.cars[index], ...updates };
      return this.cars[index];
    }
    return null;
  }

  deleteCar(id: string) {
    this.cars = this.cars.filter(c => c.id !== id);
  }

  // Bookings
  createBooking(bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) {
    const newBooking: Booking = {
      ...bookingData,
      id: `b${this.bookings.length + 1}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  getUserBookings(userId: string) {
    return this.bookings.filter(b => b.clientId === userId);
  }

  getOwnerBookings(ownerId: string) {
    return this.bookings.filter(b => b.ownerId === ownerId);
  }

  updateBookingStatus(id: string, status: Booking['status']) {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings[index].status = status;
      return this.bookings[index];
    }
    return null;
  }

  // Reviews
  getCarReviews(carId: string) {
    return this.reviews.filter(r => r.carId === carId);
  }

  addReview(reviewData: Omit<Review, 'id' | 'date'>) {
    const newReview: Review = {
      ...reviewData,
      id: `r${this.reviews.length + 1}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.reviews.push(newReview);
    return newReview;
  }
}

export const mockService = new MockService();
