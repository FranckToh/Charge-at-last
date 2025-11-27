import React, { useEffect, useState } from 'react';
import { Phone, MessageSquare, Star, Shield, MapPin, Navigation, BatteryCharging, Clock, Edit2 } from 'lucide-react';
import { Job, JobStatus, Technician } from '../types';
import { Button } from './Button';
import { MOCK_VEHICLES } from '../constants';
import { calculateEtaMinutes } from '../services/etaService';

interface LiveTrackingProps {
  job: Job;
  technician: Technician;
  className?: string; // Allow overriding height/styles
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({ job, technician, className }) => {
  // Initialize ETA based on real calculations, default to 0 until calc done
  const [eta, setEta] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isEditingEta, setIsEditingEta] = useState(false);

  // Calculate Initial ETA
  useEffect(() => {
    if (job && technician) {
      const calculatedEta = calculateEtaMinutes(
        technician.currentLocation.lat,
        technician.currentLocation.lng,
        job.location.lat,
        job.location.lng
      );
      setEta(calculatedEta);
    }
  }, [job, technician]);

  useEffect(() => {
    // Simulate time passing / truck moving
    const timer = setInterval(() => {
      // Only auto-decrement if not being edited to avoid fighting the user
      if (!isEditingEta) {
        setEta((prev) => (prev > 1 ? prev - 1 : 1));
      }
      setProgress((prev) => (prev < 100 ? prev + 1 : 0));
    }, 10000); // Decrement every 10s for demo purposes (slower than real time)

    // Check if Google Maps is actually loaded (simulated check)
    if ((window as any).google && (window as any).google.maps) {
      setMapLoaded(true);
    }

    return () => clearInterval(timer);
  }, [isEditingEta]);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.CHARGING: return 'text-brand-green';
      case JobStatus.EN_ROUTE: return 'text-brand-orange';
      default: return 'text-gray-900';
    }
  };

  const getStatusMessage = (status: JobStatus) => {
    switch (status) {
      case JobStatus.ASSIGNED: return 'Technician Assigned';
      case JobStatus.EN_ROUTE: return 'Technician is on the way';
      case JobStatus.CHARGING: return 'Charging in progress...';
      case JobStatus.COMPLETED: return 'Service Completed';
      default: return 'Looking for a charger...';
    }
  };

  return (
    <div className={`relative w-full overflow-hidden bg-gray-100 rounded-3xl border border-gray-200 shadow-inner ${className || 'h-[calc(100vh-140px)] md:h-[600px]'}`}>
      
      {/* MAP LAYER */}
      <div className="absolute inset-0 w-full h-full">
        {mapLoaded ? (
          <div id="google-map" className="w-full h-full bg-gray-200 flex items-center justify-center">
             {/* Real map would go here via Ref */}
             <span className="text-gray-500">Map Active</span>
          </div>
        ) : (
          // Fallback "Mock" Map UI for Demo purposes
          <div className="relative w-full h-full">
            <img 
              src="https://picsum.photos/1000/1000?grayscale" 
              alt="Map Background" 
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Mock Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d="M 50% 50% Q 60% 40% 70% 30%" 
                stroke="#FF6B00" 
                strokeWidth="4" 
                fill="none" 
                strokeDasharray="10 5"
                className="animate-pulse"
              />
            </svg>

            {/* User Location Pin */}
            <div className="absolute top-[30%] right-[30%] transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-16 h-16 bg-brand-orange/20 rounded-full animate-ping absolute inset-0"></div>
                <div className="relative z-10 w-10 h-10 bg-brand-orange border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                   <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                  You
                </div>
              </div>
            </div>

            {/* Technician Truck Pin - Moving Simulation */}
            <div 
              className="absolute transition-all duration-[3000ms] ease-linear"
              style={{ 
                top: '50%', 
                left: '50%',
                transform: `translate(${progress}px, ${-progress}px)` 
              }}
            >
              <div className="relative">
                 <div className="w-12 h-12 bg-brand-dark border-2 border-white rounded-full flex items-center justify-center shadow-xl transform -rotate-45">
                   <Navigation className="w-6 h-6 text-brand-green fill-current" />
                 </div>
                 <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                   {technician.name}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOP FLOATING STATUS */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide flex items-center gap-1">
              Estimated Arrival
              <button 
                onClick={() => setIsEditingEta(!isEditingEta)}
                className="text-gray-400 hover:text-brand-orange"
                title="Admin Override: Set ETA"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </p>
            <div className="flex items-baseline space-x-1">
               {isEditingEta ? (
                 <input 
                    type="number" 
                    value={eta} 
                    onChange={(e) => setEta(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded px-1 focus:ring-2 focus:ring-brand-orange outline-none"
                    autoFocus
                    onBlur={() => setIsEditingEta(false)}
                 />
               ) : (
                 <span 
                   onClick={() => setIsEditingEta(true)}
                   className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-brand-orange transition-colors"
                   title="Click to edit ETA"
                 >
                   {eta}
                 </span>
               )}
               <span className="text-sm text-gray-600">mins</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-brand-orange" />
          </div>
        </div>
      </div>

      {/* BOTTOM SHEET / DRIVER CARD */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-6 z-20 transform transition-transform duration-300">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {/* Status Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-full bg-opacity-10 ${job.status === JobStatus.CHARGING ? 'bg-green-500' : 'bg-orange-500'}`}>
             {job.status === JobStatus.CHARGING ? (
                <BatteryCharging className={`w-6 h-6 ${getStatusColor(job.status)} animate-pulse`} />
             ) : (
                <Navigation className={`w-6 h-6 ${getStatusColor(job.status)}`} />
             )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{getStatusMessage(job.status)}</h3>
            <p className="text-sm text-gray-500">Job #{job.id.split('-')[1]}</p>
          </div>
        </div>

        {/* Technician Info */}
        <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                 <img src={`https://ui-avatars.com/api/?name=${technician.name}&background=0D8ABC&color=fff`} alt="Tech" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <Shield className="w-4 h-4 text-brand-green fill-current" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{technician.name}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                <span>4.9</span>
                <span className="mx-1">•</span>
                <span>Ford F-150 Lightning</span>
              </div>
              <div className="text-xs bg-gray-100 inline-block px-2 py-0.5 rounded text-gray-600 mt-1">
                {MOCK_VEHICLES[0].licensePlate}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
             <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                <MessageSquare className="w-5 h-5" />
             </button>
             <button className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white hover:bg-green-600 shadow-lg shadow-green-200 transition-colors">
                <Phone className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Service Type</p>
              <p className="font-semibold text-gray-900">{job.serviceType}</p>
           </div>
           <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Requested</p>
              <p className="font-semibold text-gray-900">{job.requestedEnergyKwh} kWh</p>
           </div>
        </div>

        <div className="mt-6">
          <Button variant="outline" fullWidth className="text-red-500 border-red-100 hover:border-red-200 hover:bg-red-50">
            Cancel Service
          </Button>
        </div>

      </div>
    </div>
  );
};