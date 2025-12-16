import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const MOCK_CENTERS = [
  { id: 1, name: 'University Medical Center', distance: '0.5 km', open: '24/7', type: 'Hospital', address: '123 College Ave' },
  { id: 2, name: 'Red Cross Campus Hub', distance: '1.2 km', open: '9 AM - 5 PM', type: 'Donation Camp', address: 'Student Center, Block B' },
  { id: 3, name: 'City General Hospital', distance: '3.5 km', open: '24/7', type: 'Hospital', address: '45 Main St, Downtown' },
  { id: 4, name: 'Community Health Clinic', distance: '5.0 km', open: '8 AM - 8 PM', type: 'Clinic', address: '88 North Road' },
];

const FindCenter: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredCenters = MOCK_CENTERS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Find a Donation Center</h1>
        <p className="text-gray-500 text-sm">Locate the nearest hospital or blood donation camp.</p>
      </header>

      {/* Map Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-3xl overflow-hidden relative shadow-inner">
        <img 
          src="https://picsum.photos/800/400?blur=1" 
          alt="Map" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
            <span className="animate-pulse text-red-600">📍</span>
            <span className="font-bold text-gray-700 text-sm">You are here</span>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div>
        <Input 
          label="Search Centers" 
          placeholder="Search by name or type..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-4 mt-4">
          {filteredCenters.map(center => (
            <Card key={center.id} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm
                    ${center.type === 'Hospital' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                    {center.type === 'Hospital' ? '🏥' : '⛺'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{center.name}</h3>
                    <p className="text-sm text-gray-500">{center.address}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md flex items-center">
                        📍 {center.distance}
                      </span>
                      <span className="text-xs text-green-600 font-medium flex items-center">
                        🕒 {center.open}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                  ➡️
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindCenter;