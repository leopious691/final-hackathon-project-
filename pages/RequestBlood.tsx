import React, { useState } from 'react';
import { BloodGroup, RequestUrgency } from '../types';
import { mockBackend } from '../services/mockBackend';
import { generateEmergencyMessage } from '../services/geminiService';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

interface RequestBloodProps {
  navigate: (path: string) => void;
}

const RequestBlood: React.FC<RequestBloodProps> = ({ navigate }) => {
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [hospital, setHospital] = useState('');
  const [units, setUnits] = useState(1);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.A_POS);
  const [urgency, setUrgency] = useState<RequestUrgency>(RequestUrgency.NORMAL);
  const [description, setDescription] = useState('');

  const handleAIHelp = async () => {
    if (!hospital) {
      alert("Please enter hospital name first.");
      return;
    }
    setGeneratingAI(true);
    const msg = await generateEmergencyMessage(bloodGroup, hospital, urgency, units);
    setDescription(msg);
    setGeneratingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the request
      await mockBackend.createRequest({
        requesterId: mockBackend.getCurrentUser()?.id || 'temp',
        requesterName: mockBackend.getCurrentUser()?.name || 'Unknown',
        bloodGroup,
        units,
        hospitalName: hospital,
        location: 'Current Location', // simplified
        urgency,
        description,
      });

      // 2. Add to history
      await mockBackend.addHistoryItem({
        userId: mockBackend.getCurrentUser()?.id || '',
        type: 'Request',
        date: new Date().toISOString().split('T')[0],
        location: hospital,
        units: units,
        status: 'Open'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/dashboard')} className="mr-4 text-gray-600 text-xl">←</button>
        <h1 className="text-2xl font-bold text-gray-900">Request Blood</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Blood Group Needed</label>
             <div className="grid grid-cols-4 gap-2">
                {Object.values(BloodGroup).map(bg => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-lg text-sm font-bold transition-all
                      ${bloodGroup === bg 
                        ? 'bg-red-600 text-white shadow-md shadow-red-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {bg}
                  </button>
                ))}
             </div>
          </div>

          <Input 
            label="Hospital Name" 
            placeholder="e.g. City General" 
            value={hospital} 
            onChange={e => setHospital(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Units</label>
               <input 
                 type="number" 
                 min="1" 
                 max="10"
                 value={units}
                 onChange={e => setUnits(parseInt(e.target.value))}
                 className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Urgency</label>
               <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as RequestUrgency)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black"
               >
                 {Object.values(RequestUrgency).map(u => <option key={u} value={u}>{u}</option>)}
               </select>
             </div>
          </div>
        </Card>

        <Card title="Description & Alert" className="relative overflow-hidden">
          <div className="mb-2 flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Message to Donors</label>
            <button 
              type="button"
              onClick={handleAIHelp}
              disabled={generatingAI}
              className="text-xs flex items-center text-purple-600 font-bold hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors"
            >
              ✨ {generatingAI ? 'Writing...' : 'Generate with AI'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 min-h-[100px] text-sm text-black"
            placeholder="Describe the situation or use AI to generate an urgent appeal..."
            required
          />
        </Card>

        <Button type="submit" isLoading={loading} className="mt-4">
          Post Request
        </Button>
      </form>
    </div>
  );
};

export default RequestBlood;