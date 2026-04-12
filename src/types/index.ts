export type UserRole = 'customer' | 'provider';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
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
  providerEmail?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: 'service' | 'product';
  imageUrl?: string;
  createdAt: number;
}

export interface Task {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatarUrl?: string;
  customerPhone?: string;
  customerEmail?: string;
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
