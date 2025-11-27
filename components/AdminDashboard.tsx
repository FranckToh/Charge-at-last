import React from 'react';
import { Users, Battery, Map as MapIcon, DollarSign, Bell, Search, Truck } from 'lucide-react';
import { MOCK_JOBS, MOCK_TECHS } from '../constants';
import { JobStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Command</h1>
          <p className="text-gray-500">Welcome back, Admin</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-50"></span>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src="https://picsum.photos/100" alt="Admin" />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl text-brand-orange">
              <Battery className="w-6 h-6" />
            </div>
            <span className="text-sm text-gray-400 font-medium">+12%</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">1,240 kWh</div>
          <div className="text-sm text-gray-500 mt-1">Delivered Today</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-sm text-gray-400 font-medium">+5%</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">$8,420</div>
          <div className="text-sm text-gray-500 mt-1">Revenue Today</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm text-green-500 font-medium">2 Active</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">8</div>
          <div className="text-sm text-gray-500 mt-1">Total Techs</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
              <MapIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">Charleston</div>
          <div className="text-sm text-gray-500 mt-1">Primary Zone</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg">Live Requests</h2>
            <button className="text-brand-orange text-sm font-semibold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Service</th>
                  <th className="px-6 py-4 text-left">Location</th>
                  <th className="px-6 py-4 text-left">Tech</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_JOBS.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{job.id.split('-')[1]}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === JobStatus.CHARGING ? 'bg-brand-orange/10 text-brand-orange' :
                        job.status === JobStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.serviceType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">{job.location.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {MOCK_TECHS.find(t => t.id === job.technicianId)?.name || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Map / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
           <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg">Technician Status</h2>
          </div>
          <div className="flex-1 relative bg-gray-100 overflow-hidden">
             {/* Fake Map Background */}
             <img 
               src="https://picsum.photos/600/800?grayscale" 
               alt="Map" 
               className="absolute inset-0 w-full h-full object-cover opacity-30 hover:opacity-40 transition-opacity duration-700"
             />
             
             {/* Mike "Sparky" Jones (Busy) */}
             <div className="absolute top-1/4 left-1/4">
                <div className="relative group cursor-pointer">
                    {/* Ping Animation for Activity */}
                    <div className="absolute -inset-3 bg-brand-orange/50 rounded-full animate-ping opacity-75"></div>
                    
                    <div className="relative z-10 w-8 h-8 bg-brand-orange rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                        <Truck className="w-4 h-4" />
                    </div>
                    
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        Mike (65%) - En Route
                    </div>
                </div>
             </div>

             {/* Sarah Voltage (Available) */}
             <div className="absolute bottom-1/3 right-1/3">
                <div className="relative group cursor-pointer">
                    {/* Pulse Animation for Availability */}
                    <div className="absolute -inset-3 bg-green-400/40 rounded-full animate-pulse"></div>
                    
                    <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                        <Truck className="w-4 h-4" />
                    </div>
                    
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        Sarah (90%) - Available
                    </div>
                </div>
             </div>
          </div>
          <div className="bg-white p-4 border-t border-gray-100">
             {MOCK_TECHS.map(tech => (
                 <div key={tech.id} className="flex items-center justify-between mb-3 last:mb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                     <div className="flex items-center space-x-3">
                         <div className={`w-2 h-2 rounded-full ${tech.status === 'Available' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                         <span className="text-sm font-medium text-gray-700">{tech.name}</span>
                     </div>
                     <div className="text-xs text-gray-500 flex items-center">
                         <Battery className="w-3 h-3 mr-1" /> {tech.batteryLevel}%
                     </div>
                 </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};