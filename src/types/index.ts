export type UserRole = 'customer' | 'provider';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  neighborhood?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  createdAt: number;
  // Provider specific fields
  businessName?: string;
  businessType?: string;
  industry?: string;
  businessLogoUrl?: string;
  isProviderSetupComplete?: boolean;
}

export interface ProductService {
  id: string;
  providerId: string;
  providerName?: string;
  providerPhone?: string;
  providerWhatsApp?: string;
  providerEmail?: string;
  providerLocation?: string;
  providerHood?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  customCategory?: string;
  type: 'service' | 'product';
  imageUrl?: string;
  createdAt: number;
  updatedAt?: number;
  ratingAvg?: number;
  ratingCount?: number;
  latitude?: number;
  longitude?: number;
  sharesCount?: number;
}

export interface ServiceRating {
  id?: string;
  serviceId: string;
  providerId: string;
  rating: number; // 1 - 5
  reviewerName: string;
  reviewerId?: string;
  reviewerIsGuest: boolean;
  comment?: string;
  createdAt: number;
}

export interface Task {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatarUrl?: string;
  customerPhone?: string;
  customerWhatsApp?: string;
  customerEmail?: string;
  neighborhood?: string;
  providerId?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: 'open' | 'pending_approval' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  date: number;
  createdAt: number;
  updatedAt: number;
  // Connection fields
  acceptedByProviderId?: string;
  acceptedByProviderName?: string;
  isAccepted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Review {
  id: string;
  taskId: string;
  fromId: string;
  toId: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  timestamp: number;
}

export interface WhatsAppOrder {
  id?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  servicePrice: number;
  providerId: string;
  providerName: string;
  providerWhatsApp: string;
  customerName: string;
  customerWhatsApp: string;
  customerHood: string;
  customerNotes?: string;
  urgency?: string;
  timestamp: number;
}
