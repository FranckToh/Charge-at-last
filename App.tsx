import React, { useState, useEffect } from 'react';
import { LayoutGrid, Zap, History, Phone, Download, Menu, X, User, LogOut, Car } from 'lucide-react';
import { ServiceRequestFlow } from './components/ServiceRequestFlow';
import { AdminDashboard } from './components/AdminDashboard';
import { AIAssistant } from './components/AIAssistant';
import { LiveTracking } from './components/LiveTracking';
import { VoiceAgentOverlay } from './components/VoiceAgentOverlay';
import { CarDashboard } from './components/CarDashboard';
import { UserRole, JobStatus } from './types';
import { MOCK_JOBS, MOCK_TECHS } from './constants';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CLIENT);
  const [activeTab, setActiveTab] = useState('request'); // request, tracking, history
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Voice Agent State
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  // Car Mode State
  const [isCarMode, setIsCarMode] = useState(false);
  
  // Mock active job for demo purposes
  const activeJob = MOCK_JOBS.find(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELLED) || MOCK_JOBS[0];
  const activeTech = MOCK_TECHS.find(t => t.id === activeJob.technicianId) || MOCK_TECHS[0];

  // PWA Install Prompt Handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Hardware Back Button Handling (Android Support)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        if (activeTab !== 'request') {
           setActiveTab('request');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    // Initialize state
    try {
      window.history.replaceState({ tab: 'request' }, '');
    } catch (e) {
      console.warn('History API not available:', e);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  const navigateToTab = (tab: string) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      try {
        window.history.pushState({ tab }, '', `?tab=${tab}`);
      } catch (e) {
        // Fallback for environments where pushState is restricted
        console.warn('History pushState failed, navigation handled by state only.');
      }
    }
    setMobileMenuOpen(false);
  };

  const handleRequestSubmit = () => {
    setShowSuccess(true);
    
    // 1. Show success banner briefly
    setTimeout(() => {
      setShowSuccess(false);
      navigateToTab('tracking'); // Auto-navigate to tracking
    }, 3000);

    // 2. Trigger an incoming "Dispatcher" call after 5 seconds
    setTimeout(() => {
      setIsIncomingCall(true);
      setIsVoiceAgentOpen(true);
    }, 5000);
  };

  const openSupportCall = () => {
    setIsIncomingCall(false); // Outgoing call
    setIsVoiceAgentOpen(true);
    setMobileMenuOpen(false);
  };

  const toggleRole = () => {
    setCurrentRole(prev => prev === UserRole.CLIENT ? UserRole.ADMIN : UserRole.CLIENT);
    setMobileMenuOpen(false);
  };

  // Admin View
  if (currentRole === UserRole.ADMIN) {
    return (
      <div className="relative animate-fadeIn">
        <AdminDashboard />
        <button 
          onClick={toggleRole}
          className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 hover:bg-gray-700 transition-transform hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <LogOut className="w-3 h-3" />
          <span>Exit Admin</span>
        </button>
        
        {/* Global Voice Overlay even in Admin mode if needed */}
        <VoiceAgentOverlay 
          isOpen={isVoiceAgentOpen} 
          isIncoming={isIncomingCall}
          onClose={() => setIsVoiceAgentOpen(false)}
          context={activeTab === 'request' ? "User is on the request screen." : "User is tracking their charge."}
        />
      </div>
    );
  }

  // Car Mode View
  if (isCarMode) {
    return (
      <>
        <CarDashboard 
          activeJob={activeJob} 
          activeTech={activeTech} 
          onExit={() => setIsCarMode(false)} 
          onVoiceAssistant={openSupportCall}
        />
        <VoiceAgentOverlay 
          isOpen={isVoiceAgentOpen} 
          isIncoming={isIncomingCall}
          onClose={() => setIsVoiceAgentOpen(false)}
          context="User is driving in Car Mode. Keep responses short and hands-free."
        />
      </>
    );
  }

  // Client View
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white h-screen sticky top-0 z-40 shadow-xl">
        <div className="p-6 flex items-center space-x-2 border-b border-gray-800">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/50">
             <Zap className="text-white w-5 h-5" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">CHARGE@LAST</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6">
          <button 
            onClick={() => navigateToTab('request')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'request' ? 'bg-brand-orange text-white shadow-md shadow-orange-900/20 translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'}`}
          >
            <Zap className="w-5 h-5" />
            <span>Request Charge</span>
          </button>
          <button 
             onClick={() => navigateToTab('tracking')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'tracking' ? 'bg-brand-orange text-white shadow-md shadow-orange-900/20 translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Live Activity</span>
          </button>
          <button 
            onClick={() => navigateToTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'history' ? 'bg-brand-orange text-white shadow-md shadow-orange-900/20 translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'}`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
          
          <div className="pt-6 mt-4 border-t border-gray-800 space-y-3">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Support</p>
            <button 
              onClick={openSupportCall}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-brand-green hover:bg-gray-800 transition-all duration-200 hover:translate-x-1 group"
            >
              <div className="p-1.5 bg-gray-800 rounded-full group-hover:bg-brand-green group-hover:text-white transition-colors">
                 <Phone className="w-4 h-4" />
              </div>
              <span>Call Support</span>
            </button>
            
            <button 
              onClick={() => setIsCarMode(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-blue-400 hover:bg-gray-800 transition-all duration-200 hover:translate-x-1"
            >
              <Car className="w-5 h-5" />
              <span>Car Mode</span>
            </button>

            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 transition-all duration-200 hover:translate-x-1"
              >
                <Download className="w-5 h-5" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </nav>

        <div className="p-4 bg-gray-900 border-t border-gray-800">
           <button 
            onClick={toggleRole}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
           >
             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
               <User className="w-4 h-4" />
             </div>
             <div className="text-left">
               <p className="text-sm font-medium text-white">Client Mode</p>
               <p className="text-xs">Switch to Admin</p>
             </div>
           </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 safe-area-top">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
             <Zap className="text-white w-5 h-5" fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">Charge@Last</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900/95 z-50 flex flex-col p-6 animate-fadeIn">
          <div className="flex justify-end mb-8">
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white bg-gray-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 text-center">
             <button onClick={() => navigateToTab('request')} className="block w-full py-4 text-xl text-white font-medium border-b border-gray-800">New Request</button>
             <button onClick={() => navigateToTab('tracking')} className="block w-full py-4 text-xl text-white font-medium border-b border-gray-800">Live Activity</button>
             <button onClick={() => navigateToTab('history')} className="block w-full py-4 text-xl text-white font-medium border-b border-gray-800">History</button>
             <button onClick={openSupportCall} className="block w-full py-4 text-xl text-brand-green font-bold">Call Support</button>
             
             <button onClick={() => { setIsCarMode(true); setMobileMenuOpen(false); }} className="block w-full py-4 text-xl text-blue-400 font-bold flex items-center justify-center gap-2 border-b border-gray-800">
               <Car className="w-6 h-6" /> Enter Car Mode
             </button>

             <button onClick={toggleRole} className="block w-full py-4 text-sm text-gray-500 mt-8">Switch to Admin View</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto bg-gray-50 pb-safe-bottom">
        {showSuccess && (
          <div className="bg-green-500 text-white px-4 py-3 text-center font-medium shadow-md animate-slideUp absolute top-4 left-4 right-4 rounded-xl z-20">
            ⚡ Service Requested! Dispatching truck...
          </div>
        )}

        <div className="h-full max-w-4xl mx-auto p-4 md:p-8">
          {activeTab === 'request' && (
            <div key="request" className="animate-slideUp">
              <ServiceRequestFlow onRequestSubmit={handleRequestSubmit} />
            </div>
          )}
          
          {activeTab === 'tracking' && (
            <div key="tracking" className="animate-slideUp">
              <LiveTracking job={activeJob} technician={activeTech} />
            </div>
          )}

          {activeTab === 'history' && (
            <div key="history" className="animate-slideUp flex flex-col items-center justify-center h-[60vh] text-gray-400">
               <History className="w-16 h-16 mb-4 opacity-20" />
               <p>No past charges yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Global AI Chatbot (Only in standard mode) */}
      {!isCarMode && <AIAssistant />}

      {/* Voice Agent Overlay */}
      <VoiceAgentOverlay 
        isOpen={isVoiceAgentOpen} 
        isIncoming={isIncomingCall}
        onClose={() => setIsVoiceAgentOpen(false)}
        context={activeTab === 'request' ? "User is on the request screen." : "User is tracking their charge."}
      />
    </div>
  );
};

export default App;