import React, { useState } from 'react';
import { User } from '../types';
import { mockBackend } from '../services/mockBackend';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  navigate: (path: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, navigate }) => {
  const [isAvailable, setIsAvailable] = useState(user.isAvailable || false);
  const [saving, setSaving] = useState(false);

  const toggleAvailability = async () => {
    setSaving(true);
    try {
      await mockBackend.updateUserProfile(user.id, { isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-red-500 to-red-600"></div>
        
        <div className="relative flex flex-col items-center -mt-4">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
             <div className="w-full h-full bg-red-50 rounded-full flex items-center justify-center text-3xl font-bold text-red-600">
                {user.bloodGroup || user.name[0]}
             </div>
           </div>
           
           <h2 className="text-xl font-bold text-gray-900 mt-3">{user.name}</h2>
           <p className="text-gray-500 text-sm">{user.email}</p>
           
           <div className="mt-4 flex gap-2">
             <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
               {user.role}
             </span>
             <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full font-mono">
               {user.collegeId}
             </span>
           </div>
        </div>
      </div>

      {/* Status Toggle */}
      {user.role === 'DONOR' && (
        <Card className="flex items-center justify-between py-4">
            <div>
              <p className="font-bold text-gray-900">Available to Donate</p>
              <p className="text-xs text-gray-500 mt-0.5">Visible for emergency alerts</p>
            </div>
            <button 
              onClick={toggleAvailability}
              disabled={saving}
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 focus:outline-none ${isAvailable ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-200'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${isAvailable ? 'translate-x-6' : ''}`}></div>
            </button>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/history')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left hover:bg-gray-50 transition-colors">
          <span className="text-2xl">📜</span>
          <p className="font-bold text-gray-900 mt-2">History</p>
          <p className="text-xs text-gray-500">Past donations</p>
        </button>
        <button onClick={() => navigate('/assistant')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left hover:bg-gray-50 transition-colors">
          <span className="text-2xl">❓</span>
          <p className="font-bold text-gray-900 mt-2">Help</p>
          <p className="text-xs text-gray-500">FAQ & Support</p>
        </button>
      </div>

      <Card title="Account Details">
           <div className="space-y-4">
             <Input label="Phone Number" defaultValue={user.phone} />
             <Input label="Location" defaultValue={user.location || ''} placeholder="e.g. North Campus Hostel" />
             <Button variant="secondary" className="mt-2 text-sm">Save Changes</Button>
           </div>
      </Card>

      <Button 
        variant="danger" 
        onClick={onLogout} 
        className="w-full mt-8 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none"
      >
        Sign Out
      </Button>
    </div>
  );
};

export default Profile;