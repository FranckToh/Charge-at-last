export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum ServiceType {
  RESIDENTIAL = 'Residential',
  ROADSIDE = 'Roadside',
  FLEET = 'Fleet'
}

export enum JobStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  EN_ROUTE = 'En Route',
  CHARGING = 'Charging',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  batteryCapacityKwh: number;
}

export interface Job {
  id: string;
  userId: string;
  serviceType: ServiceType;
  status: JobStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  requestedEnergyKwh: number; // e.g. 40kWh
  estimatedCost: number;
  technicianId?: string;
  createdAt: string;
  scheduledTime?: string; // If null, it's on-demand
}

export interface Technician {
  id: string;
  name: string;
  status: 'Available' | 'Busy' | 'Offline';
  currentLocation: {
    lat: number;
    lng: number;
  };
  vehicleId: string;
  batteryLevel: number; // The truck's charging capacity level
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: number;
}

export interface DashboardNotification {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  summary?: string;
  smartReplies?: string[];
}