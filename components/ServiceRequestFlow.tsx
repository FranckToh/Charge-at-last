
import React, { useState } from 'react';
import { MapPin, Zap, Truck, Car, ChevronRight, CreditCard } from 'lucide-react';
import { Button } from './Button';
import { ServiceType } from '../types';
import { MOCK_VEHICLES, PRICE_PER_KWH, SERVICE_FEE } from '../constants';
import { playSuccessSound } from '../utils/soundEffects';

interface ServiceRequestFlowProps {
  onRequestSubmit: () => void;
}

export const ServiceRequestFlow: React.FC<ServiceRequestFlowProps> = ({ onRequestSubmit }) => {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(MOCK_VEHICLES[0].id);
  const [chargePercent, setChargePercent] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const vehicle = MOCK_VEHICLES.find(v => v.id === selectedVehicle) || MOCK_VEHICLES[0];
  const kwhNeeded = Math.round((vehicle.batteryCapacityKwh * chargePercent) / 100);
  const baseFee = serviceType ? SERVICE_FEE[serviceType] : 0;
  const energyCost = kwhNeeded * PRICE_PER_KWH;
  const totalCost = baseFee + energyCost;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      playSuccessSound();
      onRequestSubmit();
    }, 2000);
  };

  return (
    <div className="max-w-lg mx-auto pb-20">
      
      {/* Progress Bar */}
      <div className="flex justify-between mb-8 px-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1 flex-1 mx-1 rounded-full transition-colors ${s <= step ? 'bg-brand-orange' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* STEP 1: Service Type */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">How can we help?</h2>
          <p className="text-gray-500 mb-6">Choose the service that fits your needs.</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setServiceType(ServiceType.RESIDENTIAL)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center space-x-4 transition-all ${
                serviceType === ServiceType.RESIDENTIAL ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900">Residential Charging</h3>
                <p className="text-sm text-gray-500">We come to your driveway.</p>
              </div>
              <div className="font-bold text-gray-900">${SERVICE_FEE[ServiceType.RESIDENTIAL]} fee</div>
            </button>

            <button
              onClick={() => setServiceType(ServiceType.ROADSIDE)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center space-x-4 transition-all ${
                serviceType === ServiceType.ROADSIDE ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <Truck className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900">Roadside Emergency</h3>
                <p className="text-sm text-gray-500">Stranded? We'll get you moving.</p>
              </div>
              <div className="font-bold text-gray-900">${SERVICE_FEE[ServiceType.ROADSIDE]} fee</div>
            </button>

            <button
              onClick={() => setServiceType(ServiceType.FLEET)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center space-x-4 transition-all ${
                serviceType === ServiceType.FLEET ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="bg-brand-green/20 p-3 rounded-full text-brand-green">
                <Car className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900">Fleet Service</h3>
                <p className="text-sm text-gray-500">For corporate accounts.</p>
              </div>
              <div className="font-bold text-gray-900">${SERVICE_FEE[ServiceType.FLEET]} fee</div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location */}
      {step === 2 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Where are you?</h2>
          <p className="text-gray-500 mb-6">We need your location to send a truck.</p>

          <div className="aspect-video bg-gray-200 rounded-2xl mb-6 relative overflow-hidden group">
            <img 
              src="https://picsum.photos/800/400?grayscale&blur=2" 
              alt="Map Placeholder" 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-brand-orange/20 rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="w-6 h-6 text-brand-orange" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button variant="outline" fullWidth onClick={() => {}} className="justify-start">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              Use Current Location
            </Button>
            <input 
              type="text" 
              placeholder="Or enter address manually" 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Charge Details */}
      {step === 3 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Charge Amount</h2>
          <p className="text-gray-500 mb-6">Select vehicle and how much juice you need.</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
            <div className="grid gap-3">
              {MOCK_VEHICLES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center ${
                    selectedVehicle === v.id ? 'border-brand-orange bg-orange-50 ring-1 ring-brand-orange' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{v.make} {v.model}</div>
                    <div className="text-xs text-gray-400">{v.licensePlate}</div>
                  </div>
                  {selectedVehicle === v.id && <Zap className="w-4 h-4 text-brand-orange" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex justify-between mb-4">
              <span className="font-medium text-gray-700">Added Range</span>
              <span className="font-bold text-brand-green">+{kwhNeeded} kWh</span>
            </div>
            
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={chargePercent}
              onChange={(e) => setChargePercent(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-orange mb-4"
            />
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>10%</span>
              <span>50%</span>
              <span>100% Full</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Summary & Pay */}
      {step === 4 && (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>

          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="text-gray-500">Service Type</span>
              <span className="font-semibold capitalize text-gray-900">{serviceType}</span>
            </div>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="text-gray-500">Vehicle</span>
              <span className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</span>
            </div>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="text-gray-500">Energy ({kwhNeeded} kWh)</span>
              <span className="font-semibold text-gray-900">${energyCost.toFixed(2)}</span>
            </div>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="text-gray-500">Service Fee</span>
              <span className="font-semibold text-gray-900">${baseFee.toFixed(2)}</span>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-2xl text-brand-orange">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50">
              <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center text-xs font-bold"></div>
              <span className="font-semibold">Pay with Apple Pay</span>
            </button>
            <button className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50">
               <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-semibold">Credit Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-0 md:bg-transparent md:p-0 md:mt-8 z-20">
        <div className="max-w-lg mx-auto flex space-x-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          <Button 
            fullWidth 
            onClick={step === 4 ? handleSubmit : handleNext} 
            disabled={(step === 1 && !serviceType) || isSubmitting}
            isLoading={isSubmitting}
          >
            {step === 4 ? 'Confirm & Pay' : 'Continue'}
            {step < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
