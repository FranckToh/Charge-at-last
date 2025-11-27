import { Job, JobStatus, ServiceType, Technician, Vehicle } from "./types";

export const PRICE_PER_KWH = 0.45; // Base price
export const SERVICE_FEE = {
  [ServiceType.RESIDENTIAL]: 25,
  [ServiceType.ROADSIDE]: 50,
  [ServiceType.FLEET]: 15,
};

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', make: 'Tesla', model: 'Model Y', year: 2023, licensePlate: 'J0E-GWK', batteryCapacityKwh: 75 },
  { id: 'v2', make: 'Hyundai', model: 'Ioniq 5', year: 2022, licensePlate: 'JKU-R20', batteryCapacityKwh: 77 },
  { id: 'v3', make: 'Ford', model: 'Mustang Mach-E', year: 2023, licensePlate: 'ABC-123', batteryCapacityKwh: 88 },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-101',
    userId: 'u1',
    serviceType: ServiceType.RESIDENTIAL,
    status: JobStatus.CHARGING,
    location: { lat: 32.7765, lng: -79.9311, address: '123 Battery St, Charleston, SC' },
    requestedEnergyKwh: 40,
    estimatedCost: 43.00,
    technicianId: 'tech-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'job-102',
    userId: 'u2',
    serviceType: ServiceType.ROADSIDE,
    status: JobStatus.PENDING,
    location: { lat: 32.82, lng: -79.95, address: 'I-26 Mile Marker 20' },
    requestedEnergyKwh: 20,
    estimatedCost: 59.00,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  }
];

export const MOCK_TECHS: Technician[] = [
  {
    id: 'tech-1',
    name: 'Mike "Sparky" Jones',
    status: 'Busy',
    currentLocation: { lat: 32.7765, lng: -79.9311 },
    vehicleId: 'truck-01',
    batteryLevel: 65,
  },
  {
    id: 'tech-2',
    name: 'Sarah Voltage',
    status: 'Available',
    currentLocation: { lat: 32.80, lng: -79.90 },
    vehicleId: 'truck-02',
    batteryLevel: 90,
  }
];
