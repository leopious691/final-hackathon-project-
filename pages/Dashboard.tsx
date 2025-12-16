import React, { useEffect, useState } from 'react';
import { User, BloodRequest, UserRole } from '../types';
import { mockBackend } from '../services/mockBackend';
import Card from '../components/Card';
import Button from '../components/Button';

// Mock Data for Recent Donors
const RECENT_DONORS = [
  { id: 1, name: 'Alex M.', group: 'O+', time: '2h ago', avatar: '👨‍🎓' },
  { id: 2, name: 'Sarah K.', group: 'A-', time: '5h ago', avatar: '👩‍⚕️' },
  { id: 3, name: 'Mike R.', group: 'B+', time: '1d ago', avatar: '🧑‍🏫' },
  { id: 4, name: 'Emily W.', group: 'AB+', time: '2d ago', avatar: '👩‍🎨' },
];

interface DashboardProps {
  user: User;
  navigate: (path: string) => void;
  onUserUpdate?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, navigate, onUserUpdate }) => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAllergies, setHasAllergies] = useState(user.hasAllergies || false);
  const [switching, setSwitching] = useState(false);
  
  // Track animation state for specific request IDs
  const [animationStates, setAnimationStates] = useState<Record<string, 'accepted' | 'ignored'>>({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await mockBackend.getRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAllergyToggle = async () => {
    const newState = !hasAllergies;
    setHasAllergies(newState);
    try {
        // When user has allergies, they also become unavailable
        await mockBackend.updateUserProfile(user.id, { 
            hasAllergies: newState, 
            isAvailable: newState ? false : user.isAvailable 
        });
    } catch(e) {
        console.error(e);
    }
  };

  const handleRoleSwitch = async () => {
    setSwitching(true);
    const newRole = user.role === UserRole.DONOR ? UserRole.REQUESTER : UserRole.DONOR;
    try {
        await mockBackend.updateUserProfile(user.id, { role: newRole });
        // Trigger a re-render in the parent App to reflect new role in Navbar/Layout
        if (onUserUpdate) onUserUpdate();
    } catch (e) {
        console.error(e);
    } finally {
        setSwitching(false);
    }
  };

  const handleRequestAction = async (id: string, action: 'accepted' | 'ignored') => {
    // 1. Set the animation state
    setAnimationStates(prev => ({ ...prev, [id]: action }));

    // 2. If accepted, add to history
    if (action === 'accepted') {
      const request = requests.find(r => r.id === id);
      if (request) {
        try {
          await mockBackend.addHistoryItem({
            userId: user.id,
            type: 'Donation',
            date: new Date().toISOString().split('T')[0],
            location: request.hospitalName,
            units: request.units,
            status: 'Accepted'
          });
        } catch (error) {
          console.error("Failed to update history", error);
        }
      }
    }

    // 3. Wait for animation to finish, then remove request from list
    setTimeout(() => {
      setRequests(prev => prev.filter(req => req.id !== id));
      // Cleanup animation state
      setAnimationStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }, 700); // 700ms matches the CSS transition duration
  };

  // Calculate Eligibility based on last donation date
  const calculateEligibility = (lastDate?: string) => {
    if (hasAllergies) return { daysRemaining: 0, isEligible: false, text: 'Medical Hold' };
    if (!lastDate) return { daysRemaining: 0, isEligible: true, text: 'You can donate today!' };
    
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(last.getDate() + 56); // 56 days cooldown standard
    const now = new Date();
    
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { daysRemaining: 0, isEligible: true, text: 'You can donate today!' };
    return { daysRemaining: diffDays, isEligible: false, text: `Eligible in ${diffDays} days` };
  };

  const eligibility = calculateEligibility(user.lastDonationDate);

  return (
    <div className="space-y-8 pb-24 pt-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
            Hello, <span className="text-red-600">{user.name.split(' ')[0]}</span>!
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
            {user.role === UserRole.DONOR 
                ? "Your kindness is someone's hope." 
                : "Manage your blood requests."}
            </p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* Role Switcher */}
            <button 
                onClick={handleRoleSwitch}
                disabled={switching}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-all text-xs font-bold active:scale-95 disabled:opacity-50"
            >
                <span className="text-base leading-none">⇄</span>
                <span>Switch to {user.role === UserRole.DONOR ? 'Requester' : 'Donor'}</span>
            </button>

            {/* Desktop Profile Option */}
            <button 
                onClick={() => navigate('/profile')}
                className="hidden md:flex flex-col items-center justify-center bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors group"
            >
                <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                <span className="text-[10px] font-bold text-gray-600 mt-1">Profile</span>
            </button>
        </div>
      </header>

      {/* Hero Section (Hidden if allergies active to focus on health msg) */}
      {!hasAllergies && user.role === UserRole.DONOR && (
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-xl shadow-red-100 transition-transform hover:scale-[1.01] duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 opacity-90 z-0"></div>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-red-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-4 border border-white/30">
                  Save a Life
                </span>
                <h2 className="text-3xl font-bold mb-2">Become a Hero</h2>
                <p className="text-red-100 mb-6 max-w-xs text-sm leading-relaxed">
                  Your donation can save up to 3 lives. Find a center near you and make a difference today.
                </p>
              </div>
              <span className="text-6xl animate-pulse">❤️</span>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="w-auto border-white text-white hover:bg-white/10 shadow-lg"
                onClick={() => navigate('/find-center')}
              >
                Find Center
              </Button>
              <Button 
                variant="outline"
                className="w-auto border-white text-white hover:bg-white/10 opacity-80"
                onClick={() => navigate('/assistant')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Requester Hero */}
      {user.role === UserRole.REQUESTER && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Need Blood Urgently?</h2>
            <p className="text-gray-300 mb-6 text-sm max-w-xs">Create an emergency request and we will notify all nearby eligible donors instantly.</p>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white border-none w-auto px-8"
              onClick={() => navigate('/request')} 
            >
              Request Now
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-8 translate-y-8">
            <span className="text-9xl">🚑</span>
          </div>
        </div>
      )}

      {/* Detailed User Stats Grid (For Donors) */}
      {user.role === UserRole.DONOR && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Impact Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-lg shadow-red-200 flex flex-col justify-between relative overflow-hidden min-h-[160px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">🌟</span>
                        <p className="text-red-100 text-sm font-bold uppercase tracking-wide">My Impact</p>
                    </div>
                    <h3 className="text-5xl font-bold">5 <span className="text-2xl font-normal opacity-80">Lives</span></h3>
                    <p className="text-sm opacity-90 mt-1">Impacted by your donations</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                     <span className="text-xs bg-white/20 px-2 py-1 rounded text-red-50">Last: {user.lastDonationDate || 'Never'}</span>
                     <button onClick={() => navigate('/history')} className="text-xs font-bold underline decoration-white/50 hover:decoration-white">View History</button>
                </div>
            </div>

            {/* Status & Eligibility Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Medical Allergy Toggle Card */}
                <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group
                    ${hasAllergies ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}
                >
                   <div className="flex justify-between items-start z-10">
                       <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Medical Allergies</span>
                       <button 
                         onClick={handleAllergyToggle} 
                         className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${hasAllergies ? 'bg-orange-500' : 'bg-gray-300'}`}
                       >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${hasAllergies ? 'translate-x-5' : 'translate-x-1'}`}/>
                       </button>
                   </div>
                   <div className="text-center my-1 z-10">
                       <span className="text-3xl">{hasAllergies ? '😷' : '🛡️'}</span>
                   </div>
                   <p className={`text-[10px] text-center font-bold z-10 ${hasAllergies ? 'text-orange-600' : 'text-gray-600'}`}>
                       {hasAllergies ? 'Requests Paused' : 'None Reported'}
                   </p>
                </div>

                {/* Eligibility */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Next Eligible</span>
                    <div className="flex flex-col items-center justify-center flex-1 my-1">
                        {hasAllergies ? (
                            <span className="text-3xl">🚫</span>
                        ) : eligibility.isEligible ? (
                             <span className="text-4xl animate-bounce">✅</span>
                        ) : (
                             <span className="text-3xl font-bold text-gray-800">{eligibility.daysRemaining} <span className="text-xs font-normal text-gray-500 block">days left</span></span>
                        )}
                    </div>
                     <p className={`text-[10px] text-center font-bold ${eligibility.isEligible && !hasAllergies ? 'text-green-600' : 'text-gray-400'}`}>
                        {eligibility.text}
                     </p>
                </div>
            </div>
          </div>
      )}

      {/* Content Area */}
      {hasAllergies ? (
        // Medical Hold View
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center animate-fade-in mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                🩺
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Medical Safety Pause</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                We have temporarily paused all blood donation requests because you reported medical allergies. 
                Your health is our priority.
            </p>
            <div className="mt-6 p-4 bg-white/60 rounded-xl text-sm text-gray-500 max-w-sm mx-auto border border-orange-100">
                ⚠️ Please consult a doctor if you are having a severe reaction. Uncheck the status above when you are fully recovered.
            </div>
        </div>
      ) : (
        // Normal Dashboard Flow
        <>
            {/* Urgent Requests List */}
            <section>
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="mr-2 relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Urgent Requests
                </h2>
                <button onClick={() => navigate('/requests')} className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors">
                    See All
                </button>
                </div>

                {loading ? (
                <div className="space-y-4">
                    {[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                </div>
                ) : (
                <div className="space-y-4">
                    {requests.slice(0, 3).map((req) => {
                        const status = animationStates[req.id];
                        const isAccepted = status === 'accepted';
                        const isIgnored = status === 'ignored';

                        return (
                        <Card 
                            key={req.id} 
                            className={`group transition-all duration-700 ease-in-out cursor-pointer relative overflow-hidden transform
                                ${isAccepted ? '!bg-green-50 !border-green-400 scale-95 shadow-none' : ''}
                                ${isIgnored ? '!bg-yellow-50 !border-yellow-400 translate-x-[120%] opacity-0' : 'hover:border-red-200'}
                            `}
                        >
                            {/* Overlay for Accepted State */}
                            {isAccepted && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-green-50/95 transition-opacity duration-300">
                                <div className="flex flex-col items-center animate-bounce">
                                    <span className="text-5xl mb-2">✅</span>
                                    <span className="text-green-700 font-bold text-lg">Accepted!</span>
                                    <span className="text-green-600 text-xs">Thank you for helping.</span>
                                </div>
                                </div>
                            )}

                             {/* Overlay for Ignored State (Optional visual cue before slide out) */}
                             {isIgnored && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-yellow-50/50">
                                </div>
                            )}

                            <div className={`transition-opacity duration-300 ${isAccepted || isIgnored ? 'opacity-20' : 'opacity-100'}`}>
                                <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105
                                    ${req.urgency === 'Critical' ? 'bg-red-600 text-white shadow-red-200' : 'bg-gray-100 text-gray-700'}
                                    `}>
                                    <span>{req.bloodGroup}</span>
                                    <span className="text-[10px] font-normal opacity-80">Blood</span>
                                    </div>
                                    <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{req.hospitalName}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{req.description}</p>
                                    
                                    <div className="flex items-center space-x-4 mt-3">
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        <span className="mr-1">📍</span> {req.distance}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        <span className="mr-1">🩸</span> {req.units} Units
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${req.urgency === 'Critical' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}
                                `}>
                                    {req.urgency}
                                </span>
                                </div>
                                {user.role === UserRole.DONOR && (
                                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="py-2 text-sm flex-1 border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequestAction(req.id, 'ignored');
                                        }}
                                    >
                                        Ignore
                                    </Button>
                                    <Button 
                                        className="py-2 text-sm flex-1 bg-gray-900 text-white hover:bg-green-600 hover:shadow-green-200 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequestAction(req.id, 'accepted');
                                        }}
                                    >
                                        Accept Request
                                    </Button>
                                </div>
                                )}
                            </div>
                        </Card>
                    )})}
                </div>
                )}
            </section>

            {/* Recent Donors Section */}
            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Campus Donors</h2>
                <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                    {RECENT_DONORS.map(donor => (
                        <div key={donor.id} className="min-w-[130px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center snap-center hover:shadow-md transition-all cursor-pointer">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                                {donor.avatar}
                            </div>
                            <h3 className="font-bold text-sm text-gray-900">{donor.name}</h3>
                            <div className="flex items-center mt-1 space-x-1">
                                <span className="text-xs bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded">{donor.group}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                                {donor.time}
                            </p>
                        </div>
                    ))}
                    <div className="min-w-[100px] flex flex-col items-center justify-center text-gray-400 text-xs font-medium cursor-pointer hover:text-red-600 transition-colors group">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 group-hover:border-red-400 group-hover:bg-red-50 transition-colors">
                            ➔
                        </div>
                        View All
                    </div>
                </div>
            </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;